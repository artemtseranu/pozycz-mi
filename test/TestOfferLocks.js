const OfferLocks = artifacts.require("OfferLocks");
const Offers = artifacts.require("Offers");
const ContractRegistry = artifacts.require("ContractRegistry");

const assertTransaction = require("./support/assertTransaction");

contract("OfferLocks", (accounts) => {
  let offerLocks;
  let offers;
  let contractRegistry;

  before(async () => {
    offerLocks = await OfferLocks.deployed();
    offers = await Offers.deployed();
    contractRegistry = await ContractRegistry.deployed();
  });

  // * Test that 'lockOffer' function sets a mapping from specified offer's ID
  //   to and address of the account that holds the lock
  // * Test that the function requires msg.sender to be offer's owner or a
  //   BorrowRequests contract
  // * Test that the function emits OfferLocked event
  contract("lockOffer", () => {
    before(async () => {
      await contractRegistry.setContractAddress("borrowRequests", accounts[1]);
      await offers.createOffer("Offer1", "0x1", {from: accounts[0]});
      await offers.createOffer("Offer2", "0x2", {from: accounts[0]});
      await offers.createOffer("Offer3", "0x3", {from: accounts[0]});
      await offers.createOffer("Offer4", "0x4", {from: accounts[0]});
    });

    it("is successful when sender is offer's owner", async () => {
      assert(!await offerLocks.isOfferLocked(1), "offer is unlocked before calling lockOffer");
      await offerLocks.lockOffer(1, {from: accounts[0]});
      assert(await offerLocks.isOfferLocked(1), "offer is locked after calling lockOffer");
      assert(await offerLocks.isOfferLockedBy(1, accounts[0]), "offer is locked by offer owner");
    });

    it("emits OfferLocked event", async () => {
      await assertTransaction.emitsEvents(
        [{event: "OfferLocked", args: {offerId: 2}}],
        offerLocks,
        "lockOffer",
        [2, {from: accounts[0]}]
      );
    });

    it("is successful when sender is BorrowRequests contract", async () => {
      assert(!await offerLocks.isOfferLocked(3), "offer is unlocked before calling lockOffer");
      await offerLocks.lockOffer(3, {from: accounts[1]});
      assert(await offerLocks.isOfferLocked(3), "offer is locked after calling lockOffer");
      assert(await offerLocks.isOfferLockedBy(3, accounts[1]), "offer is locked by BorrowRequests contract");
    });

    it("is reverted when sender is some other address", async () => {
      await assertTransaction.isReverted(
        offerLocks.lockOffer,
        [4, {from: accounts[2]}],
        "Sender must be offer's owner or a system contract"
      );
    });
  });

  // * Test that 'unlockOffer' function unsets a mapping from specified offer's ID
  //   to and address of the account that holds the lock
  // * Test that the function increments offer's nonce
  // * Test that the function requires msg.sender the account which currently
  //   holds specified offer's lock
  // * Test that the function emits OfferUnlocked event
  contract("unlockOffer", () => {
    before(async () => {
      await contractRegistry.setContractAddress("borrowRequests", accounts[1]);

      await offers.createOffer("Offer1", "0x1", {from: accounts[0]});
      await offerLocks.lockOffer(1, {from: accounts[1]});

      await offers.createOffer("Offer2", "0x2", {from: accounts[0]});
      await offerLocks.lockOffer(2, {from: accounts[1]});

      await offers.createOffer("Offer3", "0x3", {from: accounts[0]});
      await offerLocks.lockOffer(3, {from: accounts[1]});

      await offers.createOffer("Offer4", "0x4", {from: accounts[0]});
      await offerLocks.lockOffer(4, {from: accounts[1]});

      await offers.createOffer("Offer5", "0x5", {from: accounts[0]});
    });

    it("is successful when sender is lock's owner", async () => {
      assert(await offerLocks.isOfferLocked(1), "offer is locked before calling unlockOffer");
      await offerLocks.unlockOffer(1, {from: accounts[1]});
      assert(!await offerLocks.isOfferLocked(1), "offer is unlocked after calling unlockOffer");
    });

    it("emits OfferUnlocked event", async () => {
      await assertTransaction.emitsEvents(
        [{event: "OfferUnlocked", args: {offerId: 2}}],
        offerLocks,
        "unlockOffer",
        [2, {from: accounts[1]}]
      );
    });

    it("is reverted when sender isn't lock's owner", async () => {
      await assertTransaction.isReverted(
        offerLocks.unlockOffer,
        [3, {from: accounts[0]}],
        "Sender must be lock's owner"
      );
    });

    it("increments offer's nonce", async () => {
      await offerLocks.unlockOffer(4, {from: accounts[1]});
      assert.equal(1, await offerLocks.getOfferNonce(4));
      await offerLocks.lockOffer(4, {from: accounts[1]});
      await offerLocks.unlockOffer(4, {from: accounts[1]});
      assert.equal(2, await offerLocks.getOfferNonce(4));
    });

    it("is reverted when offer is unlocked", async () => {
      await assertTransaction.isReverted(
        offerLocks.unlockOffer,
        [5, {from: accounts[1]}],
        "Sender must be lock's owner"
      );
    });
  });
});
