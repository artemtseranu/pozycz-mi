var Offers = artifacts.require("Offers");

async function getOffer(instance, id) {
	const [owner, description, details, isOpen, prev, next] = await instance.getOffer(id);
	return {owner, description, details, isOpen, prev, next};
}

async function doMapOffers(instance, result, current, fn) {
  if (current == 0) return result;

  const offer = await getOffer(instance, current);
  result.push(fn(offer));
  return await doMapOffers(instance, result, offer.next, fn);
}

async function mapOffers(instance, fn) {
  return await doMapOffers(instance, [], await instance.head(), fn);
}

contract("Offers", function(accounts) {
  it("has an ability to create new offers", async () => {
    const instance = await Offers.deployed();

    await instance.createOffer.sendTransaction("Offer 1", "0x1", {from: accounts[0]});
    await instance.createOffer.sendTransaction("Offer 2", "0x2", {from: accounts[1]});
    await instance.createOffer.sendTransaction("Offer 3", "0x3", {from: accounts[0]});

		const actualOffers = await mapOffers(instance, (offer) => {
			return [offer.owner, offer.description, offer.details, offer.isOpen]
		});

    const expectedOffers = [
      [accounts[0], "Offer 1", "0x1000000000000000000000000000000000000000000000000000000000000000", false],
      [accounts[1], "Offer 2", "0x2000000000000000000000000000000000000000000000000000000000000000", false],
      [accounts[0], "Offer 3", "0x3000000000000000000000000000000000000000000000000000000000000000", false]
    ];

    assert.deepEqual(actualOffers, expectedOffers);
  });

  it("allows user to update offer details if they are its owner", async () => {
    const instance = await Offers.deployed();

    await instance.updateOfferDetails.sendTransaction(1, "0x1a", {from: accounts[0]});

    const actualOffersDetails = await mapOffers(instance, offer => offer.details);
    const expectedOffersDetails = [
      "0x1a00000000000000000000000000000000000000000000000000000000000000",
      "0x2000000000000000000000000000000000000000000000000000000000000000",
      "0x3000000000000000000000000000000000000000000000000000000000000000"
    ];

    assert.deepEqual(actualOffersDetails, expectedOffersDetails);
  });

  it("disallows user to update offer details if they aren't its owner", async () => {
    const instance = await Offers.deployed();

    let errorMessage;

    try {
      await instance.updateOfferDetails.sendTransaction(2, "0x2a", {from: accounts[0]});
    } catch (error) {
      errorMessage = error.message;
    }

    assert.equal(errorMessage, "VM Exception while processing transaction: revert");
  });

  // TODO: check this
  // it("handles weird inputs", async () => {
  //   const instance = await Offers.deployed();

  //   await instance.createOffer.sendTransaction("Offer 4", "QmTe8wa5tCniYFZxvjMDAvjy3xQ2No1kkw5ciLLSmz2k5v", {from: accounts[0]});

  //   const [_owner, _description, details] = await instance.getOffer(4);
  //   console.log(details);
  // });
});
