pragma solidity ^0.4.23;

contract Offers {
  struct Offer {
    address owner;
    string description;
    bytes32 details;
    bool isLocked;
    bool isDeleted;
    uint32 nonce;
  }

  mapping(uint => Offer) public offers;
  uint offersIdSeq = 0;

  event OfferCreated(address indexed owner, uint id, string description, bytes32 details);
  event OfferLocked(uint id);
  event OfferUnlocked(uint id);
  event OfferUpdated(uint id, string description, bytes32 details);
  event OfferDeleted(uint id);

  modifier restrictedToOfferOwner(uint id) {
    require(offers[id].owner == msg.sender, "Restricted to offer's owner");
    _;
  }

  modifier whenLocked(uint id) {
    require(offers[id].isLocked, 'Not allowed for unlocked offers');
    _;
  }

  modifier whenUnlocked(uint id) {
    require(!offers[id].isLocked, 'Not allowed for locked offers');
    _;
  }

  function createOffer(string description, bytes32 details) public {
    address owner = msg.sender;

    Offer memory offer = Offer({
      owner: owner,
      description: description,
      details: details,
      isLocked: false,
      isDeleted: false,
      nonce: 0
    });

    offersIdSeq += 1;
    uint id = offersIdSeq;
    offers[id] = offer;
    emit OfferCreated({owner: owner, id: id, description: description, details: details});
  }

  function lockOffer(uint id) public restrictedToOfferOwner(id) whenUnlocked(id) {
    offers[id].isLocked = true;
    emit OfferLocked(id);
  }

  function unlockOffer(uint id) public restrictedToOfferOwner(id) whenLocked(id) {
    offers[id].isLocked = false;
    offers[id].nonce += 1;
    emit OfferUnlocked(id);
  }

  function updateOffer(uint id, string description, bytes32 details)
      public
      restrictedToOfferOwner(id)
      whenLocked(id) {
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

  function isOfferLocked(uint id) public view returns(bool) {
    return offers[id].isLocked;
  }

  function isOfferDeleted(uint id) public view returns(bool) {
    return offers[id].isDeleted;
  }

  function getNonce(uint id) public view returns(uint32) {
    return offers[id].nonce;
  }
}
