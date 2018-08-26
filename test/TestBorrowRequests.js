const BorrowRequests = artifacts.require("BorrowRequests");
const Offers = artifacts.require("Offers");
const FakeClock = artifacts.require("FakeClock");
const OfferLocks = artifacts.require("OfferLocks");

const assertTransaction = require("./support/assertTransaction");

contract("BorrowRequests", (accounts) => {
  let instance;
  let offers;
  let fakeClock;
  let offerLocks;

  before(async () => {
    instance = await BorrowRequests.deployed();
    offers = await Offers.deployed();
    fakeClock = await FakeClock.deployed();
    offerLocks = await OfferLocks.deployed();
  });

  contract("create", () => {
    before(async () => {
      await offers.createOffer.sendTransaction("Offer 1", "0x1", {from: accounts[0]});
      await offerLocks.lockOffer.sendTransaction(1, {from: accounts[0]});
      await offerLocks.unlockOffer.sendTransaction(1, {from: accounts[0]});

      await offers.createOffer.sendTransaction("Offer 2", "0x2", {from: accounts[0]});
      await offerLocks.lockOffer.sendTransaction(2, {from: accounts[0]});

      await offers.createOffer.sendTransaction("Offer 3", "0x3", {from: accounts[0]});
      await offers.deleteOffer.sendTransaction(3, {from: accounts[0]});

      await offers.createOffer.sendTransaction("Offer 4", "0x4", {from: accounts[0]});
    });

    it("creates new request", async () => {
      await instance.create.sendTransaction(1, 100, 1, 720, 2160, 2, {from: accounts[1]});

      const [
        offerId, borrower, guarantee, payPerHour, minHours, maxHours, hoursToConfirm, offerNonce
      ] = await instance.requests(1);

      assert.equal(offerId, 1);
      assert.equal(borrower, accounts[1], "Sets borrower to message sender");
      assert.equal(guarantee, 100);
      assert.equal(payPerHour, 1);
      assert.equal(minHours, 720);
      assert.equal(maxHours, 2160);
      assert.equal(hoursToConfirm, 2);
      assert.equal(offerNonce, 1, "Sets offerNonce to offer's current nonce");
    });

    it("is not allowed for locked offers", async () => {
      await assertTransaction.isReverted(
        instance.create,
        [2, 100, 1, 720, 2160, 2, {from: accounts[1]}],
        "Not allowed for locked offers"
      );
    });

    it("is not allowed for deleted offers", async () => {
      await assertTransaction.isReverted(
        instance.create,
        [3, 100, 1, 720, 2160, 2, {from: accounts[1]}],
        "Not allowed for deleted offers"
      );
    });

    it("emits BorrowRequestCreated event", async () => {
      await assertTransaction.emitsEvents(
        [{
          event: "BorrowRequestCreated",
          args: {
            id: 2,
            borrower: accounts[1],
            offerId: 4,
            guarantee: 1000,
            payPerHour: 11,
            minHours: 720,
            maxHours: 2160,
            hoursToConfirm: 24,
            offerNonce: 0
          }
        }],
        instance,
        "create",
        [4, 1000, 11, 720, 2160, 24, {from: accounts[1]}]
      );
    });
  });

  contract("approve", () => {
    const time1 = 1535226900000; // 2018-08-25T22:55

    before(async () => {
      await fakeClock.setTime.sendTransaction(time1, {from: accounts[0]});

      // Offer (1) is created, and then requested (1)
      await offers.createOffer.sendTransaction("Offer 1", "0x1", {from: accounts[0]});
      await instance.create.sendTransaction(1, 100, 1, 720, 2160, 2, {from: accounts[1]});

      // Offer (2) is created, and then requested (2)
      await offers.createOffer.sendTransaction("Offer 2", "0x2", {from: accounts[0]});
      await instance.create.sendTransaction(1, 100, 1, 720, 2160, 2, {from: accounts[1]});

      // Offer (3) is created, requested (3), and then locked
      await offers.createOffer.sendTransaction("Offer 3", "0x3", {from: accounts[0]});
      await instance.create.sendTransaction(3, 100, 1, 720, 2160, 2, {from: accounts[1]});
      await offerLocks.lockOffer.sendTransaction(3, {from: accounts[0]});

      // Offer (4) is created, requested (4), and then deleted
      await offers.createOffer.sendTransaction("Offer 4", "0x4", {from: accounts[0]});
      await instance.create.sendTransaction(4, 100, 1, 720, 2160, 2, {from: accounts[1]});
      await offers.deleteOffer.sendTransaction(4, {from: accounts[0]});

      // Offer (5) is created, requested (5), locked, and then unlocked incrementing its nonce
      await offers.createOffer.sendTransaction("Offer 5", "0x5", {from: accounts[0]});
      await instance.create.sendTransaction(5, 100, 1, 720, 2160, 2, {from: accounts[1]});
      await offerLocks.lockOffer.sendTransaction(5, {from: accounts[0]});
      await offerLocks.unlockOffer.sendTransaction(5, {from: accounts[0]});

      // Offer6 is created, requested 2 times (6, 7) with hoursToConfirm set to 2,
      // and request6 is approved at time1
      await offers.createOffer.sendTransaction("Offer 6", "0x6", {from: accounts[0]});
      await instance.create.sendTransaction(6, 100, 1, 720, 2160, 2, {from: accounts[1]});
      await instance.create.sendTransaction(6, 100, 1, 720, 2160, 2, {from: accounts[2]});
      await instance.approve.sendTransaction(6, {from: accounts[0]});

      // Offer7 is created, requested 2 times (8, 9) with hoursToConfirm set to 2,
      // and request8 is approved at time1
      await offers.createOffer.sendTransaction("Offer 7", "0x7", {from: accounts[0]});
      await instance.create.sendTransaction(7, 100, 1, 720, 2160, 2, {from: accounts[1]});
      await instance.create.sendTransaction(7, 100, 1, 720, 2160, 2, {from: accounts[1]});
      await instance.approve.sendTransaction(8, {from: accounts[0]});

      // Offer8 is created, request10 is created
      await offers.createOffer.sendTransaction("Offer 8", "0x8", {from: accounts[0]});
      await instance.create.sendTransaction(8, 100, 1, 720, 2160, 2, {from: accounts[1]});
    });

    it("creates approval", async () => {
      await instance.approve(1, {from: accounts[0]});
      const [requestId, expiresAt] = await instance.approvals(1);
      assert.equal(requestId, 1);
      assert.equal(expiresAt, time1 + 3600000 * 2);
    });

    it("is restricted to the offer's owner", async () => {
      await assertTransaction.isReverted(
        instance.approve,
        [2, {from: accounts[2]}],
        "Restricted to offer's owner"
      );
    });

    it("is not allowed for locked offers", async () => {
      await assertTransaction.isReverted(
        instance.approve,
        [3, {from: accounts[0]}],
        "Not allowed for locked offers"
      );
    });

    it("is not allowed for deleted offers", async () => {
      await assertTransaction.isReverted(
        instance.approve,
        [4, {from: accounts[0]}],
        "Not allowed for deleted offers"
      );
    });

    it("is not allowed if request's offerNonce doesn't match offer's current nonce", async () => {
      await assertTransaction.isReverted(
        instance.approve,
        [5, {from: accounts[0]}],
        "Request's offerNonce doesn't match offer's current nonce"
      );
    });

    it("is not allowed when there already is not expired approval for a given offer", async () => {
      await fakeClock.setTime(time1 + 3600000); // set current time to time1 + 1 hour

      await assertTransaction.isReverted(
        instance.approve,
        [7, {from: accounts[0]}],
        "Not allowed until previous approve expires"
      );
    });

    it("replaces approval for an offer that already has approval which is expired", async () => {
      // set current time to time1 + 3 hours
      const time2 = time1 + 3600000 * 3;
      await fakeClock.setTime(time2);

      await instance.approve(9, {from: accounts[0]});
      const [requestId, expiresAt] = await instance.approvals(7);
      assert.equal(requestId, 9);
      assert.equal(expiresAt, time2 + 3600000 * 2);
    });

    it("emits BorrowRequestApproved event", async () => {
      const time3 = time1 + 3600000 * 6;
      await fakeClock.setTime(time3);

      await assertTransaction.emitsEvents(
        [{
          event: "BorrowRequestApproved",
          args: {
            offerId: 8,
            requestId: 10,
            expiresAt: time3 + 3600000 * 2
          }
        }],
        instance,
        "approve",
        [10, {from: accounts[0]}]
      );
    });
  });
});
