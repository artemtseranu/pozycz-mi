const SharingAgreement = artifacts.require("SharingAgreement");
const ContractRegistry = artifacts.require("ContractRegistry");
const FakeClock = artifacts.require("FakeClock");
const Offers = artifacts.require("Offers");
const BorrowRequests = artifacts.require("BorrowRequests");
const SharingToken = artifacts.require("SharingToken");
const OfferLocks = artifacts.require("OfferLocks");

const assertTransaction = require("./support/assertTransaction");

contract("SharingAgreement", (accounts) => {
  let contractRegistry;
  let fakeClock;
  let offers;
  let borrowRequests;
  let sharingToken;
  let offerLocks;

  before(async () => {
    contractRegistry = await ContractRegistry.deployed();
    fakeClock = await FakeClock.deployed();
    offers = await Offers.deployed();
    borrowRequests = await BorrowRequests.deployed();
    sharingToken = await SharingToken.deployed();
    offerLocks = await OfferLocks.deployed();
  });

  // * Test that the contract is created with correct attributes
  // * Test that the contract can only be created by the BorrowRequests contract
  contract("constructor", () => {
    contract("when sender is BorrowRequests contract", () => {
      const createdAt = 1535287845671;

      before(async () => {
        await contractRegistry.setContractAddress("borrowRequests", accounts[9]);
        await fakeClock.setTime(createdAt);
      });

      it("stores offerId, borrowRequestId, and createdAt", async () => {
        const sharingAgreement = await SharingAgreement.new(
          ContractRegistry.address,
          1,
          2,
          {from: accounts[9]}
        );

        assert.equal(await sharingAgreement.offerId(), 1, "unexpected offerId");
        assert.equal(await sharingAgreement.borrowRequestId(), 2, "unexpected borrowRequestId");
        assert.equal(await sharingAgreement.createdAt(), createdAt, "undexpected createdAt");
      });
    });

    contract("when sender is not BorrowRequests contract", () => {
      it("is reverted", async () => {
        await assertTransaction.isReverted(
          SharingAgreement.new,
          [ContractRegistry.address, 1, 2, {from: accounts[0]}],
          "Sender must be BorrowRequests contract account"
        );
      });
    });
  });

  // * Test that 'confirmReturn' function sets 'returnConfirmed' flag in the
  //   contract's state
  // * Test that the function transfers appropriate reward (depending on the
  //   time for which the item was borrowed) to the offer's owner
  // * Test that the function sets correct amount of the refund for the
  //   borrower in the contract's state
  // * Test that the function unlocks the offer, and unsets mappings from offer's ID
  //   to approval record and sharing contract address
  // * Test that the function requires the following conditions to be met:
  //   - msg.sender is offer's owner
  //   - returning of the item hasn't already been confirmed
  contract("confirmReturn", () => {
    contract("when sender is offer's owner, and when minHours have passed", () => {
      let approvedAt = 1535297540453;
      let confirmedAt = approvedAt + 3 * 60 * 60 * 1000;
      let sharingAgreement;

      before(async () => {
        await sharingToken.transfer(accounts[1], 1000000);
        await sharingToken.approve(borrowRequests.address, 1000000, {from: accounts[1]});

        await offers.createOffer("Offer1", "0x1", {from: accounts[2]});
        await borrowRequests.create(1, 200, 5, 720, 2160, 6, {from: accounts[1]});
        await fakeClock.setTime(approvedAt);
        await borrowRequests.approve(1, {from: accounts[2]});
        await fakeClock.setTime(confirmedAt);
        await borrowRequests.confirmRequest(1, {from: accounts[1], value: 200});

        await fakeClock.setTime(confirmedAt + 10 * 60 * 60 * 1000);
      });

      it("sets returnConfirmed flag", async () => {
        sharingAgreement = SharingAgreement.at(await borrowRequests.sharingContracts(1));

        await sharingAgreement.confirmReturn({from: accounts[2]});

        assert(await sharingAgreement.returnConfirmed());
      });

      it("transfers sharingTokens equal to minHours * tokensPerHour to offer's owner", async () => {
        assert.equal(await sharingToken.balanceOf(accounts[2]), 5 * 720);
      });

      it("sets borrowerRefund", async () => {
        assert.equal(await sharingAgreement.borrowerRefund(), 2160 * 5 - 720 * 5);
      });

      it("unlocks offer", async () => {
        assert(!await offerLocks.isOfferLocked(1));
      });

      it("resets offer's borrow request approvement mapping", async () => {
        assert.equal(await borrowRequests.getOfferApprovalRequestId(1), 0);
      });

      it("resets offer's sharing agreement contract mapping", async () => {
        assert.equal(await borrowRequests.sharingContracts(1), 0);
      });
    });

    contract("when sender is offer's owner, and when 9.5 more hours over minHours have passed but maxHours haven't passed", () => {
      let approvedAt = 1535297540453;
      let confirmedAt = approvedAt + 3 * 60 * 60 * 1000;
      let sharingAgreement;

      before(async () => {
        await sharingToken.transfer(accounts[1], 1000000);
        await sharingToken.approve(borrowRequests.address, 1000000, {from: accounts[1]});

        await offers.createOffer("Offer1", "0x1", {from: accounts[2]});
        await borrowRequests.create(1, 200, 5, 720, 2160, 6, {from: accounts[1]});
        await fakeClock.setTime(approvedAt);
        await borrowRequests.approve(1, {from: accounts[2]});
        await fakeClock.setTime(confirmedAt);
        await borrowRequests.confirmRequest(1, {from: accounts[1], value: 200});

        await fakeClock.setTime(confirmedAt + (720 + 9.5) * 60 * 60 * 1000);

        sharingAgreement = SharingAgreement.at(await borrowRequests.sharingContracts(1));

        await sharingAgreement.confirmReturn({from: accounts[2]});
      });

      it("transfers sharingTokens equal to (minHours + 10) * tokensPerHour to offer's owner", async () => {
        assert.equal(await sharingToken.balanceOf(accounts[2]), (720 + 10) * 5);
      });

      it("sets borrowerRefund", async () => {
        SharingAgreement.at(await borrowRequests.sharingContracts(1));

        assert.equal(await sharingAgreement.borrowerRefund(), 2160 * 5 - (720 + 10) * 5);
      });
    });

    contract("when maxHours have passed", () => {
      let approvedAt = 1535297540453;
      let confirmedAt = approvedAt + 3 * 60 * 60 * 1000;
      let sharingAgreement;

      before(async () => {
        await sharingToken.transfer(accounts[1], 1000000);
        await sharingToken.approve(borrowRequests.address, 1000000, {from: accounts[1]});

        await offers.createOffer("Offer1", "0x1", {from: accounts[2]});
        await borrowRequests.create(1, 200, 5, 720, 2160, 6, {from: accounts[1]});
        await fakeClock.setTime(approvedAt);
        await borrowRequests.approve(1, {from: accounts[2]});
        await fakeClock.setTime(confirmedAt);
        await borrowRequests.confirmRequest(1, {from: accounts[1], value: 200});

        await fakeClock.setTime(confirmedAt + 3000 * 60 * 60 * 1000);

        sharingAgreement = SharingAgreement.at(await borrowRequests.sharingContracts(1));

        await sharingAgreement.confirmReturn({from: accounts[2]});
      });

      it("transfers sharingTokens equal to maxHours * tokensPerHour to offer's owner", async () => {
        assert.equal(await sharingToken.balanceOf(accounts[2]), 2160 * 5);
      });

      it("doesn't set borrowerRefund", async () => {
        assert.equal(await sharingAgreement.borrowerRefund(), 0);
      });
    });

    contract("when sender is not offer's owner", () => {
      before(async () => {
        await sharingToken.transfer(accounts[1], 1000000);
        await sharingToken.approve(borrowRequests.address, 1000000, {from: accounts[1]});

        await offers.createOffer("Offer1", "0x1", {from: accounts[2]});
        await borrowRequests.create(1, 200, 3, 720, 2160, 6, {from: accounts[1]});
        await borrowRequests.approve(1, {from: accounts[2]});
        await borrowRequests.confirmRequest(1, {from: accounts[1], value: 200});
      });

      it("is reverted", async () => {
        const sharingAgreement = SharingAgreement.at(await borrowRequests.sharingContracts(1));

        await assertTransaction.isReverted(
          sharingAgreement.confirmReturn,
          [{from: accounts[3]}],
          "Sender must be offer's owner"
        );
      });
    });

    contract("when return has already been confirmed", () => {
      let approvedAt = 1535297540453;
      let confirmedAt = approvedAt + 3 * 60 * 60 * 1000;

      before(async () => {
        await sharingToken.transfer(accounts[1], 1000000);
        await sharingToken.approve(borrowRequests.address, 1000000, {from: accounts[1]});

        await offers.createOffer("Offer1", "0x1", {from: accounts[2]});
        await borrowRequests.create(1, 200, 5, 720, 2160, 6, {from: accounts[1]});
        await fakeClock.setTime(approvedAt);
        await borrowRequests.approve(1, {from: accounts[2]});
        await fakeClock.setTime(confirmedAt);
        await borrowRequests.confirmRequest(1, {from: accounts[1], value: 200});

        await fakeClock.setTime(confirmedAt + 3000 * 60 * 60 * 1000);
      });

      it("is reverted", async () => {
        const sharingAgreement = SharingAgreement.at(await borrowRequests.sharingContracts(1));

        await sharingAgreement.confirmReturn({from: accounts[2]});

        await assertTransaction.isReverted(
          sharingAgreement.confirmReturn,
          [{from: accounts[2]}],
          "Return has already been confirmed"
        );
      });
    });
  });

  // * Test that 'withdrawRefundAndGuarantee' function transfers the amount of
  //   sharing tokens equal to the refund amount and guarantee to the borrower
  // * Test that the function requires the following conditions to be met:
  //   - returning of the item has been confirmed
  //   - msg.sender is borrower
  contract("withdrawRefundAndGuarantee", () => {
    contract("when return is confirmed, and sender is offer's borrower", () => {
      let sharingAgreement;

      before(async () => {
        await sharingToken.transfer(accounts[1], 1000000);
        await sharingToken.approve(borrowRequests.address, 1000000, {from: accounts[1]});

        await offers.createOffer("Offer1", "0x1", {from: accounts[2]});
        await borrowRequests.create(1, 20 * (10 ** 18), 5, 720, 2160, 6, {from: accounts[1]});
        await borrowRequests.approve(1, {from: accounts[2]});
        await borrowRequests.confirmRequest(1, {from: accounts[1], value: 20 * (10 ** 18)});

        sharingAgreement = SharingAgreement.at(await borrowRequests.sharingContracts(1));
        await sharingAgreement.confirmReturn({from: accounts[2]});
      });

      it("transfers guarantee and refund to borrower", async () => {
        const prevEthBalance = await web3.eth.getBalance(accounts[1]);
        const prevSharingTokenBalance = await sharingToken.balanceOf(accounts[1]);

        await sharingAgreement.withdrawRefundAndGuarantee({from: accounts[1]});

        // accounting for gas cost
        assert(
          parseInt(await web3.eth.getBalance(accounts[1])) > parseInt(prevEthBalance) + 19 * (10 ** 18),
          "borrower's ether balance is incorrect"
        );

        assert.equal(
          await sharingToken.balanceOf(accounts[1]),
          parseInt(prevSharingTokenBalance) + (2160 * 5) - (720 * 5),
          "borrower's sharing token balance is incorrect"
        );
      });
    });

    contract("when return is not confirmed", () => {
      let sharingAgreement;

      before(async () => {
        await sharingToken.transfer(accounts[1], 1000000);
        await sharingToken.approve(borrowRequests.address, 1000000, {from: accounts[1]});

        await offers.createOffer("Offer1", "0x1", {from: accounts[2]});
        await borrowRequests.create(1, 20 * (10 ** 18), 5, 720, 2160, 6, {from: accounts[1]});
        await borrowRequests.approve(1, {from: accounts[2]});
        await borrowRequests.confirmRequest(1, {from: accounts[1], value: 20 * (10 ** 18)});

        sharingAgreement = SharingAgreement.at(await borrowRequests.sharingContracts(1));
      });

      it("is reverted", async () => {
        await assertTransaction.isReverted(
          sharingAgreement.withdrawRefundAndGuarantee,
          [{from: accounts[1]}],
          "Return hasn't been confirmed"
        );
      });
    });

    contract("when sender isn't offer's borrower", () => {
      let sharingAgreement;

      before(async () => {
        await sharingToken.transfer(accounts[1], 1000000);
        await sharingToken.approve(borrowRequests.address, 1000000, {from: accounts[1]});

        await offers.createOffer("Offer1", "0x1", {from: accounts[2]});
        await borrowRequests.create(1, 20 * (10 ** 18), 5, 720, 2160, 6, {from: accounts[1]});
        await borrowRequests.approve(1, {from: accounts[2]});
        await borrowRequests.confirmRequest(1, {from: accounts[1], value: 20 * (10 ** 18)});

        sharingAgreement = SharingAgreement.at(await borrowRequests.sharingContracts(1));
        await sharingAgreement.confirmReturn({from: accounts[2]});
      });

      it("is reverted", async () => {
        await assertTransaction.isReverted(
          sharingAgreement.withdrawRefundAndGuarantee,
          [{from: accounts[3]}],
          "Sender must be offer's borrower"
        );
      });
    });
  });

  // * Test that 'claimRewardAndGuarantee' function transfers all of the sharing
  //   tokens locked in the contract and the guarantee to the offer's owner
  // * Test that the function unlocks the offer, and unsets mappings from offer's ID
  //   to approval record and sharing agreement contract address
  // * Test that the function requires the following conditions to be met:
  //   - returning of the item hasn't been confirmed
  //   - maximum amount of time agreed upon in the contract has passed
  //   - msg.sender is offer's owner
  contract("claimRewardAndGuarantee", () => {
    contract("when sender is offer's owner, and maxHours have passed", () => {
      let sharingAgreement;
      let approvedAt = 1535309854108
      let createdAt = approvedAt + 3 * 60 * 60 * 1000;

      before(async () => {
        await sharingToken.transfer(accounts[1], 1000000);
        await sharingToken.approve(borrowRequests.address, 1000000, {from: accounts[1]});

        await offers.createOffer("Offer1", "0x1", {from: accounts[2]});
        await borrowRequests.create(1, 20 * (10 ** 18), 5, 720, 2160, 6, {from: accounts[1]});

        await fakeClock.setTime(approvedAt);
        await borrowRequests.approve(1, {from: accounts[2]});

        await fakeClock.setTime(createdAt);
        await borrowRequests.confirmRequest(1, {from: accounts[1], value: 20 * (10 ** 18)});

        await fakeClock.setTime(createdAt + 3000 * 60 * 60 * 1000);

        sharingAgreement = SharingAgreement.at(await borrowRequests.sharingContracts(1));
      });

      it("transfers reward and guarantee to offer's owner", async () => {
        const prevEthBalance = await web3.eth.getBalance(accounts[2]);
        const prevSharingTokenBalance = await sharingToken.balanceOf(accounts[2]);

        await sharingAgreement.claimRewardAndGuarantee({from: accounts[2]});

        // accounting for gas cost
        assert(
          await parseInt(web3.eth.getBalance(accounts[2])) > parseInt(prevEthBalance),
          "offer owner's ether balance is incorrect"
        );

        assert.equal(
          await sharingToken.balanceOf(accounts[2]),
          parseInt(prevSharingTokenBalance) + 2160 * 5,
          "offer owner's sharing token balance is incorrect"
        );
      });

      it("unlocks offer", async () => {
        assert(!await offerLocks.isOfferLocked(1));
      });

      it("resets offer's borrow request approvement mapping", async () => {
        assert.equal(await borrowRequests.getOfferApprovalRequestId(1), 0);
      });

      it("resets offer's sharing agreement contract mapping", async () => {
        assert.equal(await borrowRequests.sharingContracts(1), 0);
      });
    });

    contract("when return has been confirmed", () => {
      let sharingAgreement;
      let approvedAt = 1535309854108
      let createdAt = approvedAt + 3 * 60 * 60 * 1000;

      before(async () => {
        await sharingToken.transfer(accounts[1], 1000000);
        await sharingToken.approve(borrowRequests.address, 1000000, {from: accounts[1]});

        await offers.createOffer("Offer1", "0x1", {from: accounts[2]});
        await borrowRequests.create(1, 20 * (10 ** 18), 5, 720, 2160, 6, {from: accounts[1]});

        await fakeClock.setTime(approvedAt);
        await borrowRequests.approve(1, {from: accounts[2]});

        await fakeClock.setTime(createdAt);
        await borrowRequests.confirmRequest(1, {from: accounts[1], value: 20 * (10 ** 18)});

        await fakeClock.setTime(createdAt + 3000 * 60 * 60 * 1000);

        sharingAgreement = SharingAgreement.at(await borrowRequests.sharingContracts(1));

        await sharingAgreement.confirmReturn({from: accounts[2]});
      });

      it("is reverted", async () => {
        await assertTransaction.isReverted(
          sharingAgreement.claimRewardAndGuarantee,
          [{from: accounts[2]}],
          "Return has been confirmed"
        );
      });
    });

    contract("when max hours haven't passed yet", () => {
      let sharingAgreement;
      let approvedAt = 1535309854108
      let createdAt = approvedAt + 3 * 60 * 60 * 1000;

      before(async () => {
        await sharingToken.transfer(accounts[1], 1000000);
        await sharingToken.approve(borrowRequests.address, 1000000, {from: accounts[1]});

        await offers.createOffer("Offer1", "0x1", {from: accounts[2]});
        await borrowRequests.create(1, 20 * (10 ** 18), 5, 720, 2160, 6, {from: accounts[1]});

        await fakeClock.setTime(approvedAt);
        await borrowRequests.approve(1, {from: accounts[2]});

        await fakeClock.setTime(createdAt);
        await borrowRequests.confirmRequest(1, {from: accounts[1], value: 20 * (10 ** 18)});

        await fakeClock.setTime(createdAt + 2000 * 60 * 60 * 1000);

        sharingAgreement = SharingAgreement.at(await borrowRequests.sharingContracts(1));
      });

      it("is reverted", async () => {
        await assertTransaction.isReverted(
          sharingAgreement.claimRewardAndGuarantee,
          [{from: accounts[2]}],
          "maxHours haven't passed yet"
        );
      });
    });

    contract("when sender isn't offer's owner", () => {
      let sharingAgreement;
      let approvedAt = 1535309854108
      let createdAt = approvedAt + 3 * 60 * 60 * 1000;

      before(async () => {
        await sharingToken.transfer(accounts[1], 1000000);
        await sharingToken.approve(borrowRequests.address, 1000000, {from: accounts[1]});

        await offers.createOffer("Offer1", "0x1", {from: accounts[2]});
        await borrowRequests.create(1, 20 * (10 ** 18), 5, 720, 2160, 6, {from: accounts[1]});

        await fakeClock.setTime(approvedAt);
        await borrowRequests.approve(1, {from: accounts[2]});

        await fakeClock.setTime(createdAt);
        await borrowRequests.confirmRequest(1, {from: accounts[1], value: 20 * (10 ** 18)});

        await fakeClock.setTime(createdAt + 3000 * 60 * 60 * 1000);

        sharingAgreement = SharingAgreement.at(await borrowRequests.sharingContracts(1));
      });

      it("is reverted", async () => {
        await assertTransaction.isReverted(
          sharingAgreement.claimRewardAndGuarantee,
          [{from: accounts[4]}],
          "Sender must be offer's owner"
        );
      });
    });
  });
});
