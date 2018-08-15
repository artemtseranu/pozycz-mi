pragma solidity ^0.4.23;

contract Offers {
  struct Offer {
    address owner;
    string description;
    bytes32 details;
    bool isOpen;
  }

  mapping(uint => Offer) public offers;
  uint offersIdSeq = 0;

  event OfferCreated(address indexed owner, uint id, string description, bytes32 details);

  function createOffer(string description, bytes32 details) public {
    address owner = msg.sender;

    Offer memory offer = Offer({
      owner: owner,
      description: description,
      details: details,
      isOpen: false
    });

    uint id = offersIdSeq + 1;
    offers[id] = offer;
    emit OfferCreated({owner: owner, id: id, description: description, details: details});
  }

//   function updateOfferDetails(uint id, bytes32 details) public {
//     Offer storage offer = offers[id];

//     require(offer.owner == msg.sender, "An offer can be updated only by its owner");

//     offer.details = details;
//   }
}
