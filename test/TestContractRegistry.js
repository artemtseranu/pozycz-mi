const ContractRegistry = artifacts.require("ContractRegistry");

const assertTransaction = require("./support/assertTransaction");

contract("ContractRegistry", (accounts) => {
  let instance;

  before(async () => {
    instance = await ContractRegistry.deployed();
  });

  contract("setContractAddress", () => {
    it("associates given contract name with a given address", async () => {
      const address = "0xa5366f71ac599262e83cffa63d9e0722d47046e7";
      await instance.setContractAddress.sendTransaction("Foo", address, {from: accounts[0]});
      assert.equal(await instance.getContractAddress("Foo"), address);
    });

    it("is restricted to contract owner", async () => {
      const address = "0xa5366f71ac599262e83cffa63d9e0722d47046e7";

      assertTransaction.isReverted(
        instance.setContractAddress,
        ["Bar", address, {from: accounts[1]}],
        "Restricted to contract's owner"
      );
    });
  });
});
