pragma solidity ^0.4.23;

import "./ContractRegistry.sol";
import "./Offers.sol";
import "./Clock.sol";

contract BorrowRequests {
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

    require(!offers.isOfferLocked(offerId), "Not allowed for locked offers");
    require(!offers.isOfferDeleted(offerId), "Not allowed for deleted offers");

    address borrower = msg.sender;
    uint32 offerNonce = offers.getNonce(offerId);

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
    Request memory request = requests[id];
    address offerOwner = offers.getOfferOwner(request.offerId);

    require(offerOwner == msg.sender, "Restricted to offer's owner");
    require(!offers.isOfferLocked(request.offerId), "Not allowed for locked offers");
    require(!offers.isOfferDeleted(request.offerId), "Not allowed for deleted offers");
    require(request.offerNonce == offers.getNonce(request.offerId), "Request's offerNonce doesn't match offer's current nonce");

    Clock clock = Clock(contractRegistry.getContractAddress("clock"));
    uint currentTime = clock.getTime();

    Approval memory prevApproval = approvals[request.offerId];

    if (prevApproval.requestId > 0) {
      require(currentTime > prevApproval.expiresAt, "Not allowed until previous approve expires");
    }

    uint expiresAt = currentTime + (request.hoursToConfirm * 3600000);

    Approval memory approval = Approval({requestId: id, expiresAt: expiresAt});

    approvals[request.offerId] = approval;

    emit BorrowRequestApproved({
      offerId: request.offerId,
      requestId: id,
      expiresAt: expiresAt
    });
  }
}
