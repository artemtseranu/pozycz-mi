pragma solidity ^0.4.23;

contract Offers {
  struct Offer {
    address owner;
    string description;
    bytes32 details;
  }

  mapping(uint => Offer) public offers;
  uint offersIdSeq = 0;

  event OfferCreated(address indexed owner, uint id, string description, bytes32 details);

  function createOffer(string description, bytes32 details) public {
    address owner = msg.sender;

    Offer memory offer = Offer({
      owner: owner,
      description: description,
      details: details
    });

    uint id = offersIdSeq + 1;
    offers[id] = offer;
    emit OfferCreated({owner: owner, id: id, description: description, details: details});
  }

  function updateOffer(uint id, string description, bytes32 details) public {
    Offer storage offer = offers[id];

    require(offer.owner == msg.sender, "Restricted to offer's owner");

    offer.description = description;
    offer.details = details;
  }
}
