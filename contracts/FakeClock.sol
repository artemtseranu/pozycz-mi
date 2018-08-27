// This contract is only deployed to the network with ID 'test'. It's being
// used as a mock of a Clock contract in order to better test contract
// functions that depend on the current block's timestamp.
pragma solidity ^0.4.23;

contract FakeClock {
  uint64 time;

  function getTime() public view returns(uint64) {
    return time;
  }

  function setTime(uint64 newTime) public {
    time = newTime;
  }
}
