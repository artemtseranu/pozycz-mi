var Offers = artifacts.require("Offers");

contract("Offers", (accounts) => {
  describe("#createOffer", () => {
    it("creates new offer", async () => {
      const instance = await Offers.deployed();

      await instance.createOffer.sendTransaction("Offer 1", "0x1", {from: accounts[0]});

      const [owner, description, details, isOpen] = await instance.offers(1);

      assert.equal(owner, accounts[0]);
      assert.equal(description, "Offer 1");
      assert.equal(details, "0x1000000000000000000000000000000000000000000000000000000000000000");
      assert.equal(isOpen, false);
    });
  });

//   it("allows user to update offer details if they are its owner", async () => {
//     const instance = await Offers.deployed();

//     await instance.updateOfferDetails.sendTransaction(1, "0x1a", {from: accounts[0]});

//     const actualOffersDetails = await mapOffers(instance, offer => offer.details);
//     const expectedOffersDetails = [
//       "0x1a00000000000000000000000000000000000000000000000000000000000000",
//       "0x2000000000000000000000000000000000000000000000000000000000000000",
//       "0x3000000000000000000000000000000000000000000000000000000000000000"
//     ];

//     assert.deepEqual(actualOffersDetails, expectedOffersDetails);
//   });

//   it("disallows user to update offer details if they aren't its owner", async () => {
//     const instance = await Offers.deployed();

//     let errorMessage;

//     try {
//       await instance.updateOfferDetails.sendTransaction(2, "0x2a", {from: accounts[0]});
//     } catch (error) {
//       errorMessage = error.message;
//     }

//     assert.equal(errorMessage, "VM Exception while processing transaction: revert");
//   });

  // TODO: check this
  // it("handles weird inputs", async () => {
  //   const instance = await Offers.deployed();

  //   await instance.createOffer.sendTransaction("Offer 4", "QmTe8wa5tCniYFZxvjMDAvjy3xQ2No1kkw5ciLLSmz2k5v", {from: accounts[0]});

  //   const [_owner, _description, details] = await instance.getOffer(4);
  //   console.log(details);
  // });
});
