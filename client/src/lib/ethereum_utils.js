export function checkWeb3() {
  return window.web3 !== undefined;
}

export function currentAccount() {
  if (!checkWeb3()) {
    const error = { message: 'web3 is required' };
    throw error;
  }

  return window.web3.eth.accounts[0];
}
