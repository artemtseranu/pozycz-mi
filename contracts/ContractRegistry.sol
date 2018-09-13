pragma solidity ^0.4.23;

/** @title ContractRegistry
  * Allows mapping contract names to addresses, in order to make contracts
  * upgradable. This also allows to mock contracts in the test environment.
  */
contract ContractRegistry {
  address private owner;
  mapping(bytes32 => address) private contractToAddress;

  constructor() public {
    owner = msg.sender;
  }

  /** @dev Sets the mapping from specified contract name to specified address.
    * @param contractName Contract name.
    * @param contractAddress Contract address.
    */
  function setContractAddress(string contractName, address contractAddress) public {
    require(owner == msg.sender, "Restricted to contract's owner");

    contractToAddress[keccak256(bytes(contractName))] = contractAddress;
  }

  /** @dev Returns a registered address for the specified contract name.
    * @param contractName Contract name.
    * @return contractAddress.
    */
  function getContractAddress(string contractName) public view returns(address) {
    return contractToAddress[keccak256(bytes(contractName))];
  }
}
