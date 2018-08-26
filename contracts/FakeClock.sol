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
