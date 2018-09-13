pragma solidity ^0.4.23;

import "./ContractRegistry.sol";
import "./Offers.sol";

/** @title Offer Locks
  * Adds an ability to lock/unlock offers in order to prevent specific actions
  * with them at specific times.
  */
contract OfferLocks {
  ContractRegistry private contractRegistry;
  mapping(uint => address) private locks;
  mapping(uint => uint32) private nonces;

  event OfferLocked(uint offerId);
  event OfferUnlocked(uint offerId);

  constructor(address contractRegistryAddress) public {
    contractRegistry = ContractRegistry(contractRegistryAddress);
  }

  /** @dev Locks an offer, preventing some of the actions on it, e.g. creating
    * a borrow request for it.
    * @param offerId Offer ID.
    */
  function lockOffer(uint offerId) public {
    Offers offers = Offers(contractRegistry.getContractAddress("offers"));

    bool senderIsOfferOwnerOrSystemAccount = (
      msg.sender == offers.getOfferOwner(offerId) ||
      msg.sender == contractRegistry.getContractAddress("borrowRequests"),
    );

    require(
      senderIsOfferOwnerOrSystemAccount,
      "Sender must be offer's owner or a system contract"
    );

    locks[offerId] = msg.sender;

    emit OfferLocked(offerId);
  }

  /** @dev Unlocks an offer.
    * @param offerId Offer ID.
    */
  function unlockOffer(uint offerId) public {
    require(msg.sender == locks[offerId], "Sender must be lock's owner");

    locks[offerId] = 0;
    nonces[offerId] += 1;

    emit OfferUnlocked(offerId);
  }

  /** @dev Returns true if the specified offer is locked.
    * @param offerId Offer ID.
    * @return boolean
    */
  function isOfferLocked(uint offerId) public view returns(bool) {
    return locks[offerId] > 0;
  }

  /** @dev Returns true if the specified offer is locked by a specified address.
    * @param offerId Offer ID.
    * @param lockOwner An address of the account to check
    * @return boolean
    */
  function isOfferLockedBy(uint offerId, address lockOwner) public view returns(bool) {
    return locks[offerId] == lockOwner;
  }

  /** @dev Returns a nonce of the specified offer. Nonce is incremented each
    * time an offer is unlocked.
    * @param offerId Offer ID.
    * @return nonce
    */
  function getOfferNonce(uint offerId) public view returns(uint32) {
    return nonces[offerId];
  }
}
