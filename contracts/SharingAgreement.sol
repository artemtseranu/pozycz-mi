pragma solidity ^0.4.23;

import "./ContractRegistry.sol";
import "./Clock.sol";

contract SharingAgreement {
  ContractRegistry contractRegistry;
  uint public offerId;
  uint public borrowRequestId;
  uint64 public createdAt;

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

  function() internal payable {}
}
