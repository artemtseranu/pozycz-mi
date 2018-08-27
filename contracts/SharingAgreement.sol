pragma solidity ^0.4.23;

import "zeppelin/contracts/math/Math.sol";
import "zeppelin/contracts/math/SafeMath.sol";

import "./ContractRegistry.sol";
import "./Clock.sol";
import "./Offers.sol";
import "./SharingToken.sol";
import "./BorrowRequests.sol";

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

  /** @dev Confirms that borrowed item has been returned to the owner. */
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

  function withdrawRefundAndGuarantee() public {
    require(returnConfirmed, "Return hasn't been confirmed");

    BorrowRequests borrowRequests = BorrowRequests(contractRegistry.getContractAddress("borrowRequests"));
    address borrower = borrowRequests.getRequestBorrower(borrowRequestId);

    require(msg.sender == borrower, "Sender must be offer's borrower");

    SharingToken sharingToken = SharingToken(contractRegistry.getContractAddress("sharingToken"));
    sharingToken.transfer(borrower, borrowerRefund);

    selfdestruct(borrower);
  }

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
