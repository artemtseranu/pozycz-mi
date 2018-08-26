pragma solidity ^0.4.23;

import "zeppelin/contracts/math/Math.sol";

import "./ContractRegistry.sol";
import "./Clock.sol";
import "./Offers.sol";
import "./SharingToken.sol";
import "./BorrowRequests.sol";

contract SharingAgreement {
  using Math for uint;

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

  function confirmReturn() {
    require(!returnConfirmed, "Return has already been confirmed");

    Offers offers = Offers(contractRegistry.getContractAddress("offers"));

    require(msg.sender == offers.getOfferOwner(offerId), "Sender must be offer's owner");

    Clock clock = Clock(contractRegistry.getContractAddress("clock"));

    uint hour = 60 * 60 * 1000;
    uint hoursSinceCreated = (clock.getTime() - createdAt) / hour;

    if ((clock.getTime() - createdAt) % hour != 0) {
      hoursSinceCreated += 1;
    }

    BorrowRequests borrowRequests = BorrowRequests(contractRegistry.getContractAddress("borrowRequests"));

    uint hoursToReward = hoursSinceCreated
      .max256(uint(borrowRequests.getRequestMinHours(borrowRequestId)))
      .min256(uint(borrowRequests.getRequestMaxHours(borrowRequestId)));

    uint offerOwnerReward = (
      hoursToReward *
      borrowRequests.getRequestTokensPerHour(borrowRequestId)
    );

    SharingToken sharingToken = SharingToken(contractRegistry.getContractAddress("sharingToken"));

    borrowerRefund = sharingToken.balanceOf(this) - offerOwnerReward;

    sharingToken.transfer(msg.sender, offerOwnerReward);

    returnConfirmed = true;

    borrowRequests.releaseOffer(offerId);
  }

  function withdrawRefundAndGuarantee() public {

  }

  function() internal payable {}
}
