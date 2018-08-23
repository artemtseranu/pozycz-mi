pragma solidity ^0.4.23;

contract ContractRegistry {
  address private owner;
  mapping(bytes32 => address) private contractToAddress;

  constructor() public {
    owner = msg.sender;
  }

  function setContractAddress(string contractName, address contractAddress) public {
    require(owner == msg.sender, "Restricted to contract's owner");

    contractToAddress[keccak256(bytes(contractName))] = contractAddress;
  }

  function getContractAddress(string contractName) public view returns(address) {
    return contractToAddress[keccak256(bytes(contractName))];
  }
}
