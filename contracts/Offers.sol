pragma solidity ^0.4.23;

contract Offers {
  struct Offer {
    address owner;
    bool isCreated;
    bool isOpen;
    string description;
    bytes32 details;
    uint prev;
    uint next;
  }

  mapping(uint => Offer) list;
  uint public head;
  uint public tail;

  event OfferCreated(address indexed owner, uint id, string description, bytes32 details);

  function createOffer(string description, bytes32 details) public {
    address owner = msg.sender;

    Offer memory offer = Offer({
      owner: owner,
      isOpen: false,
      description: description,
      details: details,
      isCreated: true,
      prev: tail,
      next: 0
    });

    uint id = tail + 1;
    list[id] = offer;

    if (list[tail].isCreated) {
      list[tail].next = id;
    } else {
      head = id;
    }

    tail = id;

    emit OfferCreated({owner: owner, id: id, description: description, details: details});
  }

  function updateOfferDetails(uint id, bytes32 details) public {
    Offer storage offer = list[id];

    require(offer.owner == msg.sender, "An offer can be updated only by its owner");

    offer.details = details;
  }

  function getOffer(uint id) public view returns(address owner, string description, bytes32 details, bool isOpen, uint prev, uint next) {
    return (
      list[id].owner,
      list[id].description,
      list[id].details,
      list[id].isOpen,
      list[id].prev,
      list[id].next
    );
  }
}
