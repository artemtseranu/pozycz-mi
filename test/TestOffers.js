const Offers = artifacts.require("Offers");
const assertTransaction = require("./support/assertTransaction");

contract("Offers", (accounts) => {
  let instance;

  before(async () => {
    instance = await Offers.deployed();
  });

  contract("#createOffer", () => {
    it("creates new offer", async () => {
      await instance.createOffer.sendTransaction("Offer 1", "0x1", {from: accounts[0]})

      const [owner, description, details] = await instance.offers(1);

      assert.equal(owner, accounts[0]);
      assert.equal(description, "Offer 1");
      assert.equal(details, "0x1000000000000000000000000000000000000000000000000000000000000000");
    });

    it("emits OfferCreated event", async () => {
      const expectedEvents = [
        {
          event: "OfferCreated",
          args: {
            owner: accounts[0],
            id: 2,
            description: "Offer 2",
            details: "0x2000000000000000000000000000000000000000000000000000000000000000"
          }
        }
      ];

      await assertTransaction.emitsEvents(
        expectedEvents,
        instance,
        "createOffer",
        "Offer 2",
        "0x2",
        {from: accounts[0]}
      );
    });
  });

  contract("#updateOffer", () => {
    before(async () => {
      await instance.createOffer.sendTransaction("Offer 1", "0x1", {from: accounts[0]});
    });

    it("updates offer", async () => {
      await instance.updateOffer.sendTransaction(1, "Offer 1 - edited", "0x1a", {from: accounts[0]});

      const [_owner, description, details] = await instance.offers(1);

      assert.equal(description, "Offer 1 - edited");
      assert.equal(details, "0x1a00000000000000000000000000000000000000000000000000000000000000");
    });

    it("emits OfferUpdated event", async () => {
      const expectedEvents = [
        {
          event: "OfferUpdated",
          args: {
            id: 1,
            description: "Offer 1 - edited again",
            details: "0x1b00000000000000000000000000000000000000000000000000000000000000"
          }
        }
      ];

      await assertTransaction.emitsEvents(
        expectedEvents,
        instance,
        "updateOffer",
        1,
        "Offer 1 - edited again",
        "0x1b",
        {from: accounts[0]}
      )
    });

    it("is restricted to the offer's owner", async () => {
      await assertTransaction.isReverted(instance.updateOffer, 1, "Offer 1 - edited yet again", "0x1c", {from: accounts[1]});
    });
  });

  contract("#deleteOffer", () => {
    before(async () => {
      await instance.createOffer.sendTransaction("Offer 1", "0x1", {from: accounts[0]});
      await instance.createOffer.sendTransaction("Offer 2", "0x1", {from: accounts[0]});
      await instance.createOffer.sendTransaction("Offer 3", "0x2", {from: accounts[0]});
    });

    it("deletes offer", async () => {
      await instance.deleteOffer.sendTransaction(1, {from: accounts[0]});

      const [_owner, _description, _details, isDeleted] = await instance.offers(1);

      assert.equal(isDeleted, true);
    });

    it("emits OfferDeleted event", async () => {
      const expectedEvents = [
        {
          event: "OfferDeleted",
          args: {
            id: 2
          }
        }
      ];

      await assertTransaction.emitsEvents(
        expectedEvents,
        instance,
        "deleteOffer",
        2,
        {from: accounts[0]}
      );
    });

    it("is restricted to the offer's owner", async () => {
      await assertTransaction.isReverted(instance.deleteOffer, 3, {from: accounts[1]});
    });
  });
});
