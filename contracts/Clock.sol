pragma solidity ^0.4.23;

/** @title Clock
  * This contract is used to provide an additional level of indirection when
  * getting the current block timestamp, in order for it to be mockable in a
  * test environment.
  */
contract Clock {
  /** @dev Returns current block timestamp. */
  function getTime() public view returns(uint64) {
    return uint64(now);
  }
}
