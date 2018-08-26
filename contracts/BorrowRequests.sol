pragma solidity ^0.4.23;

import "zeppelin/contracts/token/SafeERC20.sol";

import "./ContractRegistry.sol";
import "./Offers.sol";
import "./Clock.sol";
import "./OfferLocks.sol";
import "./SharingAgreement.sol";
import "./SharingToken.sol";

contract BorrowRequests {
  using SafeERC20 for SharingToken;

  struct Request {
    uint offerId;
    address borrower;
    uint guarantee;
    uint payPerHour;
    uint16 minHours;
    uint16 maxHours;
    uint8 hoursToConfirm;
    uint32 offerNonce;
  }

  struct Approval {
    uint requestId;
    uint expiresAt;
  }

  ContractRegistry contractRegistry;
  mapping(uint => Request) public requests;
  uint private idSeq;

  mapping(uint => Approval) public approvals;

  mapping(uint => address) public sharingContracts;

  event BorrowRequestCreated(
    uint id,
    uint indexed offerId,
    address indexed borrower,
    uint32 indexed offerNonce,
    uint guarantee,
    uint payPerHour,
    uint16 minHours,
    uint16 maxHours,
    uint8 hoursToConfirm
  );

  event BorrowRequestApproved(uint indexed offerId, uint indexed requestId, uint expiresAt);

  event BorrowRequestConfirmed(uint indexed offerId, address sharingContract, uint confirmedAt);

  constructor(address contractRegistryAddress) public {
    contractRegistry = ContractRegistry(contractRegistryAddress);
  }

  function create(
    uint offerId,
    uint guarantee,
    uint payPerHour,
    uint16 minHours,
    uint16 maxHours,
    uint8 hoursToConfirm
  )
  public
  {
    Offers offers = Offers(contractRegistry.getContractAddress("offers"));
    OfferLocks offerLocks = OfferLocks(contractRegistry.getContractAddress("offerLocks"));

    require(!offerLocks.isOfferLocked(offerId), "Not allowed for locked offers");
    require(!offers.isOfferDeleted(offerId), "Not allowed for deleted offers");

    address borrower = msg.sender;
    uint32 offerNonce = offerLocks.getOfferNonce(offerId);

    Request memory request = Request({
      offerId: offerId,
      borrower: borrower,
      guarantee: guarantee,
      payPerHour: payPerHour,
      minHours: minHours,
      maxHours: maxHours,
      hoursToConfirm: hoursToConfirm,
      offerNonce: offerNonce
    });

    idSeq += 1;
    requests[idSeq] = request;

    emit BorrowRequestCreated({
      id: idSeq,
      borrower: msg.sender,
      offerId: offerId,
      offerNonce: offerNonce,
      guarantee: guarantee,
      payPerHour: payPerHour,
      minHours: minHours,
      maxHours: maxHours,
      hoursToConfirm: hoursToConfirm
    });
  }

  function approve(uint id) public {
    Offers offers = Offers(contractRegistry.getContractAddress("offers"));
    OfferLocks offerLocks = OfferLocks(contractRegistry.getContractAddress("offerLocks"));
    Request memory request = requests[id];
    address offerOwner = offers.getOfferOwner(request.offerId);

    require(offerOwner == msg.sender, "Restricted to offer's owner");
    require(!offerLocks.isOfferLocked(request.offerId), "Not allowed for locked offers");
    require(!offers.isOfferDeleted(request.offerId), "Not allowed for deleted offers");
    require(request.offerNonce == offerLocks.getOfferNonce(request.offerId), "Request's offerNonce doesn't match offer's current nonce");

    Clock clock = Clock(contractRegistry.getContractAddress("clock"));
    uint currentTime = clock.getTime();

    Approval memory prevApproval = approvals[request.offerId];

    if (prevApproval.requestId > 0) {
      require(currentTime > prevApproval.expiresAt, "Not allowed until previous approve expires");
    }

    uint expiresAt = currentTime + (uint(request.hoursToConfirm) * 3600000);

    Approval memory approval = Approval({requestId: id, expiresAt: expiresAt});

    approvals[request.offerId] = approval;

    emit BorrowRequestApproved({
      offerId: request.offerId,
      requestId: id,
      expiresAt: expiresAt
    });
  }

  function confirmRequest(uint offerId) public payable {
    Approval storage approval = approvals[offerId];

    require(approval.requestId > 0, "Request must be approved");

    Clock clock = Clock(contractRegistry.getContractAddress("clock"));
    uint currentTime = clock.getTime();

    require(currentTime < approval.expiresAt, "Approval has expired");

    Request storage borrowRequest = requests[approval.requestId];

    require(msg.sender == borrowRequest.borrower, "Sender must be approved request's owner");
    require(msg.value >= borrowRequest.guarantee, "Not enough value sent for the guarantee");

    SharingToken sharingToken = SharingToken(contractRegistry.getContractAddress("sharingToken"));

    uint neededSharingTokens = borrowRequest.payPerHour * borrowRequest.maxHours;

    require(
      sharingToken.balanceOf(msg.sender) > neededSharingTokens,
      "Sender doesn't have enough sharing tokens"
    );

    OfferLocks offerLocks = OfferLocks(contractRegistry.getContractAddress("offerLocks"));

    offerLocks.lockOffer(offerId);

    SharingAgreement sharingAgreement = new SharingAgreement(contractRegistry, offerId, approval.requestId);

    sharingContracts[offerId] = sharingAgreement;
    address(sharingAgreement).transfer(msg.value);
    sharingToken.safeTransferFrom(msg.sender, address(sharingAgreement), neededSharingTokens);

    emit BorrowRequestConfirmed({
      offerId: offerId,
      sharingContract: sharingAgreement,
      confirmedAt: currentTime
    });
  }

  function releaseOffer(uint offerId) public {
    require(msg.sender == sharingContracts[offerId], "Sender must be offer's sharing agreement contract");

    OfferLocks offerLocks = OfferLocks(contractRegistry.getContractAddress("offerLocks"));
    offerLocks.unlockOffer(offerId);

    approvals[offerId] = Approval(0, 0);
    sharingContracts[offerId] = 0;
  }

  function getOfferApprovalRequestId(uint offerId) public view returns(uint) {
    return approvals[offerId].requestId;
  }

  function getRequestBorrower(uint256 requestId) public view returns(address) {
    return requests[requestId].borrower;
  }

  function getRequestMinHours(uint256 requestId) public view returns(uint16) {
    return requests[requestId].minHours;
  }

  function getRequestMaxHours(uint256 requestId) public view returns(uint16) {
    return requests[requestId].maxHours;
  }

  function getRequestTokensPerHour(uint256 requestId) public view returns(uint256) {
    return requests[requestId].payPerHour;
  }
}
