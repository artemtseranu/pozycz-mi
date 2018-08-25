pragma solidity ^0.4.23;

contract FakeClock {
  uint time;

  function getTime() public view returns(uint) {
    return time;
  }

  function setTime(uint newTime) public {
    time = newTime;
  }
}
