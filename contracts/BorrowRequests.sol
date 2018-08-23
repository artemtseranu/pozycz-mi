pragma solidity ^0.4.23;

import "./ContractRegistry.sol";
import "./Offers.sol";

contract BorrowRequests {
  struct Request {
    address borrower;
    uint guarantee;
    uint payPerHour;
    uint16 minHours;
    uint16 maxHours;
    uint8 hoursToConfirm;
    uint32 offerNonce;
  }

  ContractRegistry contractRegistry;
  mapping(uint => Request) public requests;
  uint private idSeq;

  event BorrowRequestCreated(
    uint id,
    address indexed borrower,
    uint indexed offerId,
    uint guarantee,
    uint payPerHour,
    uint16 minHours,
    uint16 maxHours,
    uint8 hoursToConfirm
  );

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

    Request memory request = Request({
      borrower: borrower,
      guarantee: guarantee,
      payPerHour: payPerHour,
      minHours: minHours,
      maxHours: maxHours,
      hoursToConfirm: hoursToConfirm,
      offerNonce: offers.getNonce(offerId)
    });

    idSeq += 1;
    requests[idSeq] = request;

    emit BorrowRequestCreated({
      id: idSeq,
      borrower: msg.sender,
      offerId: offerId,
      guarantee: guarantee,
      payPerHour: payPerHour,
      minHours: minHours,
      maxHours: maxHours,
      hoursToConfirm: hoursToConfirm
    });
  }
}
