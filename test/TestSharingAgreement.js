const SharingAgreement = artifacts.require("SharingAgreement");
const ContractRegistry = artifacts.require("ContractRegistry");
const FakeClock = artifacts.require("FakeClock");

const assertTransaction = require("./support/assertTransaction");

contract("SharingAgreement", (accounts) => {
  let contractRegistry;
  let fakeClock;

  before(async () => {
    contractRegistry = await ContractRegistry.deployed();
    fakeClock = await FakeClock.deployed();
  });

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
});
