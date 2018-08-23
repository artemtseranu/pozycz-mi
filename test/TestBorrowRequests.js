const BorrowRequests = artifacts.require("BorrowRequests");
const Offers = artifacts.require("Offers");

const assertTransaction = require("./support/assertTransaction");

contract("BorrowRequests", (accounts) => {
  let instance;
  let offersInstance;

  before(async () => {
    instance = await BorrowRequests.deployed();
    offersInstance = await Offers.deployed();
  });

  contract("create", () => {
    before(async () => {
      await offersInstance.createOffer.sendTransaction("Offer 1", "0x1", {from: accounts[0]});
      await offersInstance.lockOffer.sendTransaction(1, {from: accounts[0]});
      await offersInstance.unlockOffer.sendTransaction(1, {from: accounts[0]});
      await offersInstance.createOffer.sendTransaction("Offer 2", "0x2", {from: accounts[0]});
      await offersInstance.lockOffer.sendTransaction(2, {from: accounts[0]});
      await offersInstance.createOffer.sendTransaction("Offer 3", "0x3", {from: accounts[0]});
      await offersInstance.deleteOffer.sendTransaction(3, {from: accounts[0]});
      await offersInstance.createOffer.sendTransaction("Offer 4", "0x4", {from: accounts[0]});
    });

    it("creates new request", async () => {
      await instance.create.sendTransaction(1, 100, 1, 720, 2160, 2, {from: accounts[1]});

      const [
        borrower, guarantee, payPerHour, minHours, maxHours, hoursToConfirm, offerNonce
      ] = await instance.requests(1);

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
            hoursToConfirm: 24
          }
        }],
        instance,
        "create",
        [4, 1000, 11, 720, 2160, 24, {from: accounts[1]}]
      );
    });
  });
});
