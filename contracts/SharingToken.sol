pragma solidity ^0.4.23;

import "zeppelin/contracts/token/StandardToken.sol";

contract SharingToken is StandardToken {
  string public symbol = "SHT";
  string public name = "SharingToken";
  uint8 public decimals = 18;

  constructor() {
    balances[msg.sender] = 1000 * (10 ** uint256(decimals));
    totalSupply = 1000 * (10 ** uint256(decimals));
  }
}
