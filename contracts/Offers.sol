pragma solidity ^0.4.23;

import "./ContractRegistry.sol";
import "./OfferLocks.sol";

/** @title Offers
  * Acts as a database of all the created offers. Allows create/update/delete
  * actions.
  */
contract Offers {
  struct Offer {
    address owner;
    string description;
    bytes32 details;
    bool isDeleted;
  }

  ContractRegistry contractRegistry;
  mapping(uint => Offer) public offers;
  uint offersIdSeq = 0;

  event OfferCreated(address indexed owner, uint id, string description, bytes32 details);
  event OfferUpdated(uint id, string description, bytes32 details);
  event OfferDeleted(uint id);

  modifier requireOfferOwner(uint id) {
    require(offers[id].owner == msg.sender, "Sender must be offer's owner");
    _;
  }

  constructor(address contractRegistryAddress) public {
    contractRegistry = ContractRegistry(contractRegistryAddress);
  }

  /** @dev Creates and stores a new Offer record.
    * @param description A short offer description
    * @param details A hash of the offer details document
    */
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

  /** @dev Updates description and details hash of the specified offer.
    * @param id ID of an offer to udpate.
    * @param description New description
    * @param details New details hash
    */
  function updateOffer(uint id, string description, bytes32 details)
  public
  requireOfferOwner(id)
  {
    Offer storage offer = offers[id];

    OfferLocks offerLocks = OfferLocks(contractRegistry.getContractAddress("offerLocks"));

    require(offerLocks.isOfferLockedBy(id, offer.owner), "Offer must be locked by its owner");

    offer.description = description;
    offer.details = details;
    emit OfferUpdated({id: id, description: description, details: details});
  }

  /** @dev Marks specified offer as deleted.
    * @param id And ID of an offer to delete.
    */
  function deleteOffer(uint id) public requireOfferOwner(id) {
    // Refund for clearing storage causes ganache-cli to fail the transaction
    // https://github.com/trufflesuite/ganache-cli/issues/294
    // delete offers[id];

    Offer storage offer = offers[id];

    OfferLocks offerLocks = OfferLocks(contractRegistry.getContractAddress("offerLocks"));

    bool canDelete = (
      !offerLocks.isOfferLocked(id) ||
      offerLocks.isOfferLockedBy(id, offer.owner)
    );

    require(canDelete, "Offer must be unlocked or locked by its owner");

    offer.isDeleted = true;

    emit OfferDeleted({id: id});
  }

  /** Returns true if a specified offer is marked as deleted.
    * @param id Offer ID
    * @returns boolean
    */
  function isOfferDeleted(uint id) public view returns(bool) {
    return offers[id].isDeleted;
  }

  /** Returns an owner address of the specified offer.
    * @param id Offer ID
    * @returns ownerAddress
    */
  function getOfferOwner(uint id) public view returns(address) {
    return offers[id].owner;
  }
}
