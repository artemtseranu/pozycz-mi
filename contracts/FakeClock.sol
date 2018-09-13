pragma solidity ^0.4.23;

/** @title Fake Clock
  * This contract is only deployed to the network with ID 'test'. It's being
  * used as a mock of a Clock contract in order to better test contract
  * functions that depend on the current block's timestamp.
  */
contract FakeClock {
  uint64 time;

  /** @dev Returns the current timestamp stored in the contract.
    * @return timestamp
    */
  function getTime() public view returns(uint64) {
    return time;
  }

  /** @dev Sets the current timestamp to the specified value.
    * @param newTime New time.
    */
  function setTime(uint64 newTime) public {
    time = newTime;
  }
}
