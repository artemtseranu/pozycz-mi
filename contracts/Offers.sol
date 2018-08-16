pragma solidity ^0.4.23;

contract Offers {
  struct Offer {
    address owner;
    string description;
    bytes32 details;
    bool isDeleted;
  }

  mapping(uint => Offer) public offers;
  uint offersIdSeq = 0;

  event OfferCreated(address indexed owner, uint id, string description, bytes32 details);
  event OfferUpdated(uint id, string description, bytes32 details);
  event OfferDeleted(uint id);

  modifier restrictedToOfferOwner(uint id) {
    require(offers[id].owner == msg.sender, "Restricted to offer's owner");
    _;
  }

  function createOffer(string description, bytes32 details) public {
    address owner = msg.sender;

    Offer memory offer = Offer({
      owner: owner,
      description: description,
      details: details,
      isDeleted: false
    });

    offersIdSeq += 1;
    uint id = offersIdSeq;
    offers[id] = offer;
    emit OfferCreated({owner: owner, id: id, description: description, details: details});
  }

  function updateOffer(uint id, string description, bytes32 details) public restrictedToOfferOwner(id) {
    Offer storage offer = offers[id];

    offer.description = description;
    offer.details = details;
    emit OfferUpdated({id: id, description: description, details: details});
  }

  function deleteOffer(uint id) public restrictedToOfferOwner(id) {
    // Refund for clearing storage causes ganache-cli to fail the transaction
    // https://github.com/trufflesuite/ganache-cli/issues/294
    // delete offers[id];
    offers[id].isDeleted = true;
    emit OfferDeleted({id: id});
  }
}
