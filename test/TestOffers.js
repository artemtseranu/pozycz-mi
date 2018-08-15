const Offers = artifacts.require("Offers");
const assertTransaction = require("./support/assertTransaction");

contract("Offers", (accounts) => {
  let instance;

  before(async () => {
    instance = await Offers.deployed();
  });

  contract("#createOffer", () => {
    it("creates new offer", async () => {
      const expectedEvents = [
        {
          event: "OfferCreated",
          args: {
            owner: accounts[0],
            id: 1,
            description: "Offer 1",
            details: "0x1000000000000000000000000000000000000000000000000000000000000000"
          }
        }
      ];

      await assertTransaction.emitsEvents(
        expectedEvents,
        instance,
        "createOffer",
        "Offer 1",
        "0x1",
        {from: accounts[0]}
      );

      const [owner, description, details] = await instance.offers(1);

      assert.equal(owner, accounts[0]);
      assert.equal(description, "Offer 1");
      assert.equal(details, "0x1000000000000000000000000000000000000000000000000000000000000000");
    });
  });

  contract("#updateOffer", () => {
    before(async () => {
      await instance.createOffer.sendTransaction("Offer 1", "0x1", {from: accounts[0]});
    });

    it("updates offer", async () => {
      const expectedEvents = [
        {
          event: "OfferUpdated",
          args: {
            id: 1,
            description: "Offer 1 - edited",
            details: "0x1a00000000000000000000000000000000000000000000000000000000000000"
          }
        }
      ];

      await assertTransaction.emitsEvents(
        expectedEvents,
        instance,
        "updateOffer",
        1,
        "Offer 1 - edited",
        "0x1a",
        {from: accounts[0]}
      )

      const [_owner, description, details] = await instance.offers(1);

      assert.equal(description, "Offer 1 - edited");
      assert.equal(details, "0x1a00000000000000000000000000000000000000000000000000000000000000");
    });

    it("is restricted to the offer's owner", async () => {
      await assertTransaction.isReverted(instance.updateOffer, 1, "Offer 1 - edited again", "0x1b", {from: accounts[1]});
    });
  });

  contract("#deleteOffer", () => {
    before(async () => {
      await instance.createOffer.sendTransaction("Offer 1", "0x1", {from: accounts[0]});
      await instance.createOffer.sendTransaction("Offer 2", "0x2", {from: accounts[0]});
    });

    it("deletes offer", async () => {
      const expectedEvents = [
        {
          event: "OfferDeleted",
          args: {
            id: 1
          }
        }
      ];

      await assertTransaction.emitsEvents(
        expectedEvents,
        instance,
        "deleteOffer",
        1,
        {from: accounts[0]}
      );

      const [owner, description, details] = await instance.offers(1);

      assert.equal(owner, 0);
      assert.equal(description, "");
      assert.equal(details, 0);
    });

    it("is restricted to the offer's owner", async () => {
      await assertTransaction.isReverted(instance.deleteOffer, 2, {from: accounts[1]});
    });
  });
});
