pragma solidity ^0.4.23;

import "./ContractRegistry.sol";
import "./Offers.sol";

contract OfferLocks {
  ContractRegistry private contractRegistry;
  mapping(uint => address) private locks;
  mapping(uint => uint32) private nonces;

  event OfferLocked(uint offerId);
  event OfferUnlocked(uint offerId);

  constructor(address contractRegistryAddress) public {
    contractRegistry = ContractRegistry(contractRegistryAddress);
  }

  /** @dev Locks an offer, preventing some of the actions on it, e.g. update. */
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

  function unlockOffer(uint offerId) public {
    require(msg.sender == locks[offerId], "Sender must be lock's owner");

    locks[offerId] = 0;
    nonces[offerId] += 1;

    emit OfferUnlocked(offerId);
  }

  function isOfferLocked(uint offerId) public view returns(bool) {
    return locks[offerId] > 0;
  }

  function isOfferLockedBy(uint offerId, address lockOwner) public view returns(bool) {
    return locks[offerId] == lockOwner;
  }

  function getOfferNonce(uint offerId) public view returns(uint32) {
    return nonces[offerId];
  }
}
