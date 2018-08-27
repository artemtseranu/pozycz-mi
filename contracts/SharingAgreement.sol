pragma solidity ^0.4.23;

import "zeppelin/contracts/math/Math.sol";
import "zeppelin/contracts/math/SafeMath.sol";

import "./ContractRegistry.sol";
import "./Clock.sol";
import "./Offers.sol";
import "./SharingToken.sol";
import "./BorrowRequests.sol";

/** @title Sharing Agreement
  * Locks up the agreed upon amount of sharing tokens and ether once the borrower
  * confirms that they received an item. Contains functions that allow item's
  * owner and borrower to withdraw this value, the distribution of which
  * depends on how long the borrower was in possetion of an item and whether
  * they returned it in time.
  */
contract SharingAgreement {
  using Math for uint;
  using SafeMath for uint;

  ContractRegistry contractRegistry;
  uint public offerId;
  uint public borrowRequestId;
  uint64 public createdAt;
  bool public returnConfirmed;
  uint public borrowerRefund;

  constructor(address contractRegistryAddress, uint _offerId, uint _borrowRequestId) public {
    contractRegistry = ContractRegistry(contractRegistryAddress);

    require(
      msg.sender == contractRegistry.getContractAddress("borrowRequests"),
      "Sender must be BorrowRequests contract account"
    );

    offerId = _offerId;
    borrowRequestId = _borrowRequestId;

    Clock clock = Clock(contractRegistry.getContractAddress("clock"));
    createdAt = clock.getTime();
  }

  /** @dev Confirms that borrowed item has been returned to the owner.
    * The item's owner is payed some amount (depending on how long the
    * borrower held an item) of sharing tokens, remaining tokens are set
    * aside for the borrower to withdraw later.
    */
  function confirmReturn() {
    require(!returnConfirmed, "Return has already been confirmed");

    Offers offers = Offers(contractRegistry.getContractAddress("offers"));

    require(msg.sender == offers.getOfferOwner(offerId), "Sender must be offer's owner");

    Clock clock = Clock(contractRegistry.getContractAddress("clock"));

    uint hour = 60 * 60 * 1000;
    uint hoursSinceCreated = uint(clock.getTime() - createdAt).div(hour);

    if ((clock.getTime() - createdAt) % hour != 0) {
      hoursSinceCreated += 1;
    }

    BorrowRequests borrowRequests = BorrowRequests(contractRegistry.getContractAddress("borrowRequests"));

    uint hoursToReward = hoursSinceCreated
      .max256(uint(borrowRequests.getRequestMinHours(borrowRequestId)))
      .min256(uint(borrowRequests.getRequestMaxHours(borrowRequestId)));

    uint offerOwnerReward = hoursToReward.mul(borrowRequests.getRequestTokensPerHour(borrowRequestId));

    SharingToken sharingToken = SharingToken(contractRegistry.getContractAddress("sharingToken"));

    borrowerRefund = sharingToken.balanceOf(this).sub(offerOwnerReward);

    sharingToken.transfer(msg.sender, offerOwnerReward);

    returnConfirmed = true;

    borrowRequests.releaseOffer(offerId);
  }

  /** @dev Transfers the value of guarantee and available refund to the
    * borrower's account. Can only be called if item's owner confirmed that
    * an item was returned.
    */
  function withdrawRefundAndGuarantee() public {
    require(returnConfirmed, "Return hasn't been confirmed");

    BorrowRequests borrowRequests = BorrowRequests(contractRegistry.getContractAddress("borrowRequests"));
    address borrower = borrowRequests.getRequestBorrower(borrowRequestId);

    require(msg.sender == borrower, "Sender must be offer's borrower");

    SharingToken sharingToken = SharingToken(contractRegistry.getContractAddress("sharingToken"));
    sharingToken.transfer(borrower, borrowerRefund);

    selfdestruct(borrower);
  }

  /** @dev Transfers all of the sharing tokens an the value of a guarantee to
    * the item owner's account. Is expected to be used if the borrower hasn't
    * returned an item in the agreed upon amount of time or an item is
    * damaged.
    */
  function claimRewardAndGuarantee() public {
    require(!returnConfirmed, "Return has been confirmed");

    BorrowRequests borrowRequests = BorrowRequests(contractRegistry.getContractAddress("borrowRequests"));
    Clock clock = Clock(contractRegistry.getContractAddress("clock"));

    require(
      uint(clock.getTime()) > uint(createdAt).add(uint(borrowRequests.getRequestMaxHours(borrowRequestId)).mul(60 * 60 * 1000)),
      "maxHours haven't passed yet"
    );

    Offers offers = Offers(contractRegistry.getContractAddress("offers"));
    address offerOwner = offers.getOfferOwner(offerId);

    require(msg.sender == offerOwner, "Sender must be offer's owner");

    SharingToken sharingToken = SharingToken(contractRegistry.getContractAddress("sharingToken"));
    sharingToken.transfer(offerOwner, sharingToken.balanceOf(this));

    borrowRequests.releaseOffer(offerId);

    selfdestruct(offerOwner);
  }

  function() internal payable {}
}
