const BorrowRequests = artifacts.require("BorrowRequests");
const Offers = artifacts.require("Offers");
const FakeClock = artifacts.require("FakeClock");
const OfferLocks = artifacts.require("OfferLocks");
const SharingAgreement = artifacts.require("SharingAgreement");
const SharingToken = artifacts.require("SharingToken");

const assertTransaction = require("./support/assertTransaction");

contract("BorrowRequests", (accounts) => {
  let borrowRequests;
  let offers;
  let fakeClock;
  let offerLocks;
  let sharingToken;

  before(async () => {
    borrowRequests = await BorrowRequests.deployed();
    offers = await Offers.deployed();
    fakeClock = await FakeClock.deployed();
    offerLocks = await OfferLocks.deployed();
    sharingToken = await SharingToken.deployed();
  });

  contract("stop", () => {
    contract("when sender is contract's owner", () => {
      it("sets stopped flag", async () => {
        await borrowRequests.stop({from: accounts[0]});

        assert(await borrowRequests.stopped());
      });
    });

    contract("when sender is not contract's owner", () => {
      it("is reverted", async () => {
        await assertTransaction.isReverted(
          borrowRequests.stop,
          [{from: accounts[1]}],
          "Sender must be contract's owner"
        );
      });
    });
  });

  contract("resume", () => {
    contract("when sender is contract's owner", () => {
      before(async () => {
        await borrowRequests.stop({from: accounts[0]});
      });

      it("unsets stopped flag", async () => {
        await borrowRequests.resume({from: accounts[0]});

        assert(!await borrowRequests.stopped());
      });
    });

    contract("when sender is not contract's owner", () => {
      before(async () => {
        await borrowRequests.stop({from: accounts[0]});
      });

      it("is reverted", async () => {
        await assertTransaction.isReverted(
          borrowRequests.resume,
          [{from: accounts[1]}],
          "Sender must be contract's owner"
        );
      });
    });
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
      await borrowRequests.create.sendTransaction(1, 100, 1, 720, 2160, 2, {from: accounts[1]});

      const [
        offerId, borrower, guarantee, payPerHour, minHours, maxHours, hoursToConfirm, offerNonce
      ] = await borrowRequests.requests(1);

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
        borrowRequests.create,
        [2, 100, 1, 720, 2160, 2, {from: accounts[1]}],
        "Not allowed for locked offers"
      );
    });

    it("is not allowed for deleted offers", async () => {
      await assertTransaction.isReverted(
        borrowRequests.create,
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
        borrowRequests,
        "create",
        [4, 1000, 11, 720, 2160, 24, {from: accounts[1]}]
      );
    });

    contract("when contract is stopped", () => {
      it("is reverted", async () => {
        await offers.createOffer.sendTransaction("Offer 1", "0x1", {from: accounts[0]});
        await borrowRequests.stop({from: accounts[0]});

        await assertTransaction.isReverted(
          borrowRequests.create,
          [1, 200, 5, 720, 2160, 6, {from: accounts[1]}],
          "The contract is stopped"
        );
      });
    });
  });

  contract("approve", () => {
    const time1 = 1535226900000; // 2018-08-25T22:55

    before(async () => {
      await fakeClock.setTime.sendTransaction(time1, {from: accounts[0]});

      // Offer (1) is created, and then requested (1)
      await offers.createOffer.sendTransaction("Offer 1", "0x1", {from: accounts[0]});
      await borrowRequests.create.sendTransaction(1, 100, 1, 720, 2160, 2, {from: accounts[1]});

      // Offer (2) is created, and then requested (2)
      await offers.createOffer.sendTransaction("Offer 2", "0x2", {from: accounts[0]});
      await borrowRequests.create.sendTransaction(1, 100, 1, 720, 2160, 2, {from: accounts[1]});

      // Offer (3) is created, requested (3), and then locked
      await offers.createOffer.sendTransaction("Offer 3", "0x3", {from: accounts[0]});
      await borrowRequests.create.sendTransaction(3, 100, 1, 720, 2160, 2, {from: accounts[1]});
      await offerLocks.lockOffer.sendTransaction(3, {from: accounts[0]});

      // Offer (4) is created, requested (4), and then deleted
      await offers.createOffer.sendTransaction("Offer 4", "0x4", {from: accounts[0]});
      await borrowRequests.create.sendTransaction(4, 100, 1, 720, 2160, 2, {from: accounts[1]});
      await offers.deleteOffer.sendTransaction(4, {from: accounts[0]});

      // Offer (5) is created, requested (5), locked, and then unlocked incrementing its nonce
      await offers.createOffer.sendTransaction("Offer 5", "0x5", {from: accounts[0]});
      await borrowRequests.create.sendTransaction(5, 100, 1, 720, 2160, 2, {from: accounts[1]});
      await offerLocks.lockOffer.sendTransaction(5, {from: accounts[0]});
      await offerLocks.unlockOffer.sendTransaction(5, {from: accounts[0]});

      // Offer6 is created, requested 2 times (6, 7) with hoursToConfirm set to 2,
      // and request6 is approved at time1
      await offers.createOffer.sendTransaction("Offer 6", "0x6", {from: accounts[0]});
      await borrowRequests.create.sendTransaction(6, 100, 1, 720, 2160, 2, {from: accounts[1]});
      await borrowRequests.create.sendTransaction(6, 100, 1, 720, 2160, 2, {from: accounts[2]});
      await borrowRequests.approve.sendTransaction(6, {from: accounts[0]});

      // Offer7 is created, requested 2 times (8, 9) with hoursToConfirm set to 2,
      // and request8 is approved at time1
      await offers.createOffer.sendTransaction("Offer 7", "0x7", {from: accounts[0]});
      await borrowRequests.create.sendTransaction(7, 100, 1, 720, 2160, 2, {from: accounts[1]});
      await borrowRequests.create.sendTransaction(7, 100, 1, 720, 2160, 2, {from: accounts[1]});
      await borrowRequests.approve.sendTransaction(8, {from: accounts[0]});

      // Offer8 is created, request10 is created
      await offers.createOffer.sendTransaction("Offer 8", "0x8", {from: accounts[0]});
      await borrowRequests.create.sendTransaction(8, 100, 1, 720, 2160, 2, {from: accounts[1]});
    });

    it("creates approval", async () => {
      await borrowRequests.approve(1, {from: accounts[0]});
      const [requestId, expiresAt] = await borrowRequests.approvals(1);
      assert.equal(requestId, 1);
      assert.equal(expiresAt, time1 + 3600000 * 2);
    });

    it("is restricted to the offer's owner", async () => {
      await assertTransaction.isReverted(
        borrowRequests.approve,
        [2, {from: accounts[2]}],
        "Restricted to offer's owner"
      );
    });

    it("is not allowed for locked offers", async () => {
      await assertTransaction.isReverted(
        borrowRequests.approve,
        [3, {from: accounts[0]}],
        "Not allowed for locked offers"
      );
    });

    it("is not allowed for deleted offers", async () => {
      await assertTransaction.isReverted(
        borrowRequests.approve,
        [4, {from: accounts[0]}],
        "Not allowed for deleted offers"
      );
    });

    it("is not allowed if request's offerNonce doesn't match offer's current nonce", async () => {
      await assertTransaction.isReverted(
        borrowRequests.approve,
        [5, {from: accounts[0]}],
        "Request's offerNonce doesn't match offer's current nonce"
      );
    });

    it("is not allowed when there already is not expired approval for a given offer", async () => {
      await fakeClock.setTime(time1 + 3600000); // set current time to time1 + 1 hour

      await assertTransaction.isReverted(
        borrowRequests.approve,
        [7, {from: accounts[0]}],
        "Not allowed until previous approve expires"
      );
    });

    it("replaces approval for an offer that already has approval which is expired", async () => {
      // set current time to time1 + 3 hours
      const time2 = time1 + 3600000 * 3;
      await fakeClock.setTime(time2);

      await borrowRequests.approve(9, {from: accounts[0]});
      const [requestId, expiresAt] = await borrowRequests.approvals(7);
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
        borrowRequests,
        "approve",
        [10, {from: accounts[0]}]
      );
    });

    contract("when contract is stopped", () => {
      it("is reverted", async () => {
        await offers.createOffer("Offer1", "0x1", {from: accounts[0]});
        await borrowRequests.create(1, 200, 5, 720, 2160, 6, {from: accounts[1]});
        await borrowRequests.stop({from: accounts[0]})

        await assertTransaction.isReverted(
          borrowRequests.approve,
          [1, {from: accounts[0]}],
          "The contract is stopped"
        );
      });
    });
  });

  contract("confirmRequest", () => {
    contract("when request is approved and sender is its owner, they sent enough ether for the guarantee and they have enough Sharing tokens", () => {
      let approvedAt;
      let confirmedAt;
      let account1InitialSharingTokenBalance = 300000;

      before(async () => {
        approvedAt = 1535276856564;
        confirmedAt = approvedAt + 3600000 * 3;

        await sharingToken.transfer(accounts[1], account1InitialSharingTokenBalance);
        await sharingToken.approve(borrowRequests.address, 1000000, {from: accounts[1]})

        await offers.createOffer("Offer1", "0x1", {from: accounts[0]});
        await offers.createOffer("Offer2", "0x2", {from: accounts[0]});
        await borrowRequests.create(1, 200, 3, 720, 2160, 6, {from: accounts[1]});
        await borrowRequests.create(2, 200, 3, 720, 2160, 6, {from: accounts[1]});
        await fakeClock.setTime(approvedAt);
        await borrowRequests.approve(1, {from: accounts[0]})
        await borrowRequests.approve(2, {from: accounts[0]})
        await fakeClock.setTime(confirmedAt);
      });

      it("deploys sharing agreement and stores its address", async () => {
        await borrowRequests.confirmRequest(1, {from: accounts[1], value: 200});

        const sharingAgreementAddress = await borrowRequests.sharingContracts(1);
        const sharingAgreement = SharingAgreement.at(sharingAgreementAddress);

        assert.equal(await sharingAgreement.offerId(), 1);
        assert.equal(await sharingAgreement.borrowRequestId(), 1);
      });

      it("transfers value for the guarantee to the sharing agreement contract", async () => {
        const sharingAgreementAddress = await borrowRequests.sharingContracts(1);

        assert.equal(await web3.eth.getBalance(sharingAgreementAddress), 200);
      });

      it("transfers sharing tokens to cover maxHours from sender to sharing agreement contract", async () => {
        const sharingAgreementAddress = await borrowRequests.sharingContracts(1);

        assert.equal(
          await sharingToken.balanceOf(accounts[1]),
          account1InitialSharingTokenBalance - 2160 * 3,
          "incorrect account 1 balance"
        );

        assert.equal(
          await sharingToken.balanceOf(sharingAgreementAddress),
          2160 * 3,
          "incorect sharing agreement balance"
        );
      });

      it("locks offer", async () => {
        assert(await offerLocks.isOfferLockedBy(1, BorrowRequests.address));
      });

      it("emits BorrowRequestConfirmed event", async () => {
        await assertTransaction.emitsEvents(
          [{
            event: "BorrowRequestConfirmed",
            args: {
              offerId: 2,
              sharingContract: x => x > 0,
              confirmedAt: confirmedAt
            }
          }],
          borrowRequests,
          "confirmRequest",
          [2, {from: accounts[1], value: 200}]
        );
      });
    });

    contract("when request is approved but sender isn't its owner", () => {
      before(async () => {
        await offers.createOffer("Offer1", "0x1", {from: accounts[0]});
        await borrowRequests.create(1, 200, 3, 720, 2160, 6, {from: accounts[1]});
        await borrowRequests.approve(1, {from: accounts[0]})
      });

      it("is reverted", async () => {
        await assertTransaction.isReverted(
          borrowRequests.confirmRequest,
          [1, {from: accounts[2]}],
          "Sender must be approved request's owner"
        );
      });
    });

    contract("when request is not approved", () => {
      before(async () => {
        await offers.createOffer("Offer1", "0x1", {from: accounts[0]});
        await borrowRequests.create(1, 200, 3, 720, 2160, 6, {from: accounts[1]});
      });

      it("is reverted", async () => {
        await assertTransaction.isReverted(
          borrowRequests.confirmRequest,
          [1, {from: accounts[1]}],
          "Request must be approved"
        );
      });
    });

    contract("when approval has expired", () => {
      before(async () => {
        let approvedAt = 1535276856564;

        await offers.createOffer("Offer1", "0x1", {from: accounts[0]});
        await borrowRequests.create(1, 200, 3, 720, 2160, 6, {from: accounts[1]});
        await fakeClock.setTime(approvedAt);
        await borrowRequests.approve(1, {from: accounts[0]});
        await fakeClock.setTime(approvedAt + 3600000 * 8);
      });

      it("is reverted", async () => {
        await assertTransaction.isReverted(
          borrowRequests.confirmRequest,
          [1, {from: accounts[1]}],
          "Approval has expired"
        );
      });
    });

    contract("when message doesn't have enough ether for the guarantee", () => {
      before(async () => {
        await offers.createOffer("Offer1", "0x1", {from: accounts[0]});
        await borrowRequests.create(1, 200, 3, 720, 2160, 6, {from: accounts[1]});
        await borrowRequests.approve(1, {from: accounts[0]})
      });

      it("is reverted", async () => {
        await assertTransaction.isReverted(
          borrowRequests.confirmRequest,
          [1, {from: accounts[1], value: 100}],
          "Not enough value sent for the guarantee"
        );
      });
    });

    contract("when sender doesn't have enough sharing tokens", () => {
      before(async () => {
        await sharingToken.transfer(accounts[1], 800 * 3);
        await sharingToken.approve(borrowRequests.address, 1000000, {from: accounts[1]})

        await offers.createOffer("Offer1", "0x1", {from: accounts[0]});
        await borrowRequests.create(1, 200, 3, 720, 2160, 6, {from: accounts[1]});
        await borrowRequests.approve(1, {from: accounts[0]})
      });

      it("is reverted", async () => {
        await assertTransaction.isReverted(
          borrowRequests.confirmRequest,
          [1, {from: accounts[1], value: 200}],
          "Sender doesn't have enough sharing tokens"
        );
      });
    });

    contract("when sender has enough sharing tokens, but transfer fails (no allowence)", () => {
      before(async () => {
        await sharingToken.transfer(accounts[1], 800000);

        await offers.createOffer("Offer1", "0x1", {from: accounts[0]});
        await borrowRequests.create(1, 200, 3, 720, 2160, 6, {from: accounts[1]});
        await borrowRequests.approve(1, {from: accounts[0]})
      });

      it("is reverted", async () => {
        await assertTransaction.isReverted(
          borrowRequests.confirmRequest,
          [1, {from: accounts[1], value: 200}]
        );
      });
    });

    contract("when contract is stopped", () => {
      it("is reverted", async () => {
        await offers.createOffer("Offer1", "0x1", {from: accounts[0]});
        await borrowRequests.create(1, 200, 5, 720, 2160, 6, {from: accounts[1]});
        await borrowRequests.approve(1, {from: accounts[0]});
        await borrowRequests.stop({from: accounts[0]});

        await assertTransaction.isReverted(
          borrowRequests.confirmRequest,
          [1, {from: accounts[1], value: 200}],
          "The contract is stopped"
        );
      });
    });
  });

  contract("releaseOffer", () => {
    contract("when sender isn't offer's sharing agreement contract", () => {
      before(async () => {
        await sharingToken.transfer(accounts[1], 1000000);
        await sharingToken.approve(borrowRequests.address, 1000000, {from: accounts[1]});

        await offers.createOffer("Offer1", "0x1", {from: accounts[0]});
        await borrowRequests.create(1, 200, 5, 720, 2160, 6, {from: accounts[1]});
        await borrowRequests.approve(1, {from: accounts[0]});
        await borrowRequests.confirmRequest(1, {from: accounts[1], value: 200});
      });

      it("isReverted", async () => {
        await assertTransaction.isReverted(
          borrowRequests.releaseOffer,
          [1, {from: accounts[1]}],
          "Sender must be offer's sharing agreement contract"
        );
      });
    });
  });
});
