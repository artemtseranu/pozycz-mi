pragma solidity ^0.4.23;

import "zeppelin/contracts/token/SafeERC20.sol";

import "./ContractRegistry.sol";
import "./Offers.sol";
import "./Clock.sol";
import "./OfferLocks.sol";
import "./SharingAgreement.sol";
import "./SharingToken.sol";

/** @title Borrow Requests
  * This contract allows users interested in borrowing a specific item, to
  * create 'borrow requests' for the offer's owner to review. It also provides
  * an ability for the offer's owner to approve a specific request, and for
  * the borrower to confirm that they have received an item, which creates a
  * sharing agreement contract.
  */
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

  address owner;
  bool public stopped;

  modifier requireOwner() {
    require(msg.sender == owner, "Sender must be contract's owner");
    _;
  }

  modifier stopInEmergency() {
    require(!stopped, "The contract is stopped");
    _;
  }

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
    owner = msg.sender;
    contractRegistry = ContractRegistry(contractRegistryAddress);
  }

  /** @dev Marks the contract as 'stopped' which prevents some of the functions
    * from being executed.
    */
  function stop() public requireOwner {
    stopped = true;
  }

  /** @dev Unmarks the contract as 'stopped' */
  function resume() public requireOwner {
    stopped = false;
  }

  /** @dev Creates and stores a new Request record.
    * @param offerId ID of the offer being requested.
    * @param guarantee Amount of ether (wei) the borrower agrees to provide as
    * guarantee.
    * @param payPerHour Amount of tokens per hour the borrower agrees to
    * provide to the offer's owner as a reward for borrowing the item.
    * @param minHours Together with payPerHour determines the minimum reward
    * the offer's owner would be payed.
    * @param maxHours Together with payPerHour determines the maximum reward
    * the offer's owner would be payed and determines when the offer's owner
    * can claim the reward and guarantee in the case when the item hasn't been
    * returned.
    */
  function create(
    uint offerId,
    uint guarantee,
    uint payPerHour,
    uint16 minHours,
    uint16 maxHours,
    uint8 hoursToConfirm
  )
  public
  stopInEmergency
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

  /** @dev Approves a specified 'borrow request'.
    * @param id ID of a 'borrow request' to approve.
    */
  function approve(uint id) public stopInEmergency {
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

  /** @dev Confirmes that the borrower has received the requested item.
    * @param offerId ID of the offer for which 'borrow request' was made
    */
  function confirmRequest(uint offerId) public payable stopInEmergency {
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

  /** @dev Unlocks the specified offer, and unsets mappings from offer ID to
    * approval record and SharingAgreement address.
    * @param offerId Offer ID
    */
  function releaseOffer(uint offerId) public {
    require(msg.sender == sharingContracts[offerId], "Sender must be offer's sharing agreement contract");

    OfferLocks offerLocks = OfferLocks(contractRegistry.getContractAddress("offerLocks"));
    offerLocks.unlockOffer(offerId);

    approvals[offerId] = Approval(0, 0);
    sharingContracts[offerId] = 0;
  }

  /** @dev Returns an ID of approved request for the specified offer.
    * @param offerId Offer ID
    * @return requestId
    */
  function getOfferApprovalRequestId(uint offerId) public view returns(uint) {
    return approvals[offerId].requestId;
  }

  /** @dev Returns the address of an owner (borrower) of a specified request.
    * @param requestId Request ID.
    * @return borrowerAddress.
    */
  function getRequestBorrower(uint256 requestId) public view returns(address) {
    return requests[requestId].borrower;
  }

  /** @dev Returns minHours field of a specified request.
    * @param requestId Request ID.
    * @return minHours
    */
  function getRequestMinHours(uint256 requestId) public view returns(uint16) {
    return requests[requestId].minHours;
  }

  /** @dev Returns maxHours field of a specified request.
    * @param requestId Request ID.
    * @return maxHours
    */
  function getRequestMaxHours(uint256 requestId) public view returns(uint16) {
    return requests[requestId].maxHours;
  }

  /** @dev Returns payPerHour field of a specified request.
    * @param requestId Request ID.
    * @return payPerHour
    */
  function getRequestTokensPerHour(uint256 requestId) public view returns(uint256) {
    return requests[requestId].payPerHour;
  }
}
