const Offers = artifacts.require("Offers");
const OfferLocks = artifacts.require("OfferLocks");
const ContractRegistry = artifacts.require("ContractRegistry");

const assertTransaction = require("./support/assertTransaction");

contract("Offers", (accounts) => {
  let offers;
  let offerLocks;
  let contractRegistry;

  before(async () => {
    offers = await Offers.deployed();
    offerLocks = await OfferLocks.deployed();
    contractRegistry = await ContractRegistry.deployed();
  });

  contract("#createOffer", () => {
    it("creates new offer", async () => {
      await offers.createOffer.sendTransaction("Offer 1", "0x1", {from: accounts[0]})

      const [owner, description, details] = await offers.offers(1);

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
        offers,
        "createOffer",
        ["Offer 2", "0x2", {from: accounts[0]}],
      );
    });
  });

  contract("#updateOffer", () => {
    before(async () => {
      await contractRegistry.setContractAddress("borrowRequests", accounts[1]);

      await offers.createOffer("Offer1", "0x1", {from: accounts[0]});
      await offerLocks.lockOffer(1, {from: accounts[0]});

      await offers.createOffer("Offer2", "0x2", {from: accounts[0]});
      await offerLocks.lockOffer(2, {from: accounts[0]});

      await offers.createOffer("Offer3", "0x3", {from: accounts[0]});
      await offerLocks.lockOffer(3, {from: accounts[0]});

      await offers.createOffer("Offer4", "0x4", {from: accounts[0]});

      await offers.createOffer("Offer5", "0x5", {from: accounts[0]});
      await offerLocks.lockOffer(5, {from: accounts[1]});
    });

    it("is successful if sender is offer's owner and offer is locked by owner", async () => {
      await offers.updateOffer(1, "Offer1 - edited", "0x1a", {from: accounts[0]});

      const [_owner, description, details] = await offers.offers(1);

      assert.equal(description, "Offer1 - edited");
      assert.equal(details, "0x1a00000000000000000000000000000000000000000000000000000000000000");
    });

    it("emits OfferUpdated event", async () => {
      await assertTransaction.emitsEvents(
        [{
          event: "OfferUpdated",
          args: {
            id: 2,
            description: "Offer2 - updated",
            details: "0x2a00000000000000000000000000000000000000000000000000000000000000"
          }
        }],
        offers,
        "updateOffer",
        [2, "Offer2 - updated", "0x2a", {from: accounts[0]}],
      )
    });

    it("is reverted if sender is not offer's owner", async () => {
      await assertTransaction.isReverted(
        offers.updateOffer,
        [3, "Offer4 - updated", "0x4a", {from: accounts[2]}],
        "Sender must be offer's owner",
      );
    });

    it("is reverted if offer is unlocked", async () => {
      await assertTransaction.isReverted(
        offers.updateOffer,
        [4, "Offer4 - updated", "0x4a", {from: accounts[0]}],
        "Offer must be locked by its owner"
      );
    });

    it("is reverted if offer is locked by a system contract", async () => {
      await assertTransaction.isReverted(
        offers.updateOffer,
        [5, "Offer5 - updated", "0x5a", {from: accounts[0]}],
        "Offer must be locked by its owner"
      );
    });
  });

  contract("#deleteOffer", () => {
    before(async () => {
      await contractRegistry.setContractAddress("borrowRequests", accounts[9]);

      await offers.createOffer.sendTransaction("Offer 1", "0x1", {from: accounts[0]});

      await offers.createOffer.sendTransaction("Offer 2", "0x2", {from: accounts[0]});

      await offers.createOffer.sendTransaction("Offer 3", "0x3", {from: accounts[0]});

      await offers.createOffer.sendTransaction("Offer 4", "0x4", {from: accounts[0]});
      await offerLocks.lockOffer(4, {from: accounts[0]});

      // To test that offer is reverted when offer is locked by system contract
      await offers.createOffer.sendTransaction("Offer 5", "0x5", {from: accounts[0]});
      await offerLocks.lockOffer(5, {from: accounts[9]});
    });

    it("is successful when sender is offer's owner and offer is unlocked", async () => {
      await offers.deleteOffer(1, {from: accounts[0]});

      assert.equal(await offers.isOfferDeleted(1), true);
    });

    it("is successful when sender is offer's owner and offer is locked by owner", async () => {
      await offers.deleteOffer(4, {from: accounts[0]});

      assert.equal(await offers.isOfferDeleted(4), true);
    });

    it("emits OfferDeleted event", async () => {
      await assertTransaction.emitsEvents(
        [{event: "OfferDeleted", args: {id: 2}}],
        offers,
        "deleteOffer",
        [2, {from: accounts[0]}],
      );
    });

    it("is reverted when sender isn't offer's owner", async () => {
      await assertTransaction.isReverted(
        offers.deleteOffer,
        [3, {from: accounts[1]}],
        "Sender must be offer's owner",
      );
    });

    it("is reverted when offer is locked by a system contract", async () => {
      await assertTransaction.isReverted(
        offers.deleteOffer,
        [5, {from: accounts[0]}],
        "Offer must be unlocked or locked by its owner"
      );
    });
  });
});
