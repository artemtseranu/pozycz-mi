var Offers = artifacts.require("Offers");

contract("Offers", (accounts) => {
  contract("#createOffer", () => {
    it("creates new offer", async () => {
      const instance = await Offers.deployed();

      await instance.createOffer.sendTransaction("Offer 1", "0x1", {from: accounts[0]});

      const [owner, description, details] = await instance.offers(1);

      assert.equal(owner, accounts[0]);
      assert.equal(description, "Offer 1");
      assert.equal(details, "0x1000000000000000000000000000000000000000000000000000000000000000");
    });
  });

  contract("#updateOffer", () => {
    let instance;

    before(async () => {
      instance = await Offers.deployed();
      await instance.createOffer.sendTransaction("Offer 1", "0x1", {from: accounts[0]});
    });

    it("updates offer if msg.sender is offer's owner", async () => {
      await instance.updateOffer.sendTransaction(1, "Offer 1 - edited", "0x1a", {from: accounts[0]});

      const [_owner, description, details] = await instance.offers(1);

      assert.equal(description, "Offer 1 - edited");
      assert.equal(details, "0x1a00000000000000000000000000000000000000000000000000000000000000");
    });

    it("reverts if msg.sender isn't offer's owner", async () => {
      const instance = await Offers.deployed();

      let errorMessage;

      try {
        await instance.updateOffer.sendTransaction(1, "Offer 1 - edited again", "0x1b", {from: accounts[1]});
      } catch (error) {
        errorMessage = error.message;
      }

      assert.equal(errorMessage, "VM Exception while processing transaction: revert", "Transaction wasn't reverted");
    });
  });
});
