pragma solidity ^0.4.23;

contract Clock {
  function getTime() public view returns(uint64) {
    return uint64(now);
  }
}
