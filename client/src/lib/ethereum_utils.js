export function checkWeb3() {
  return window.web3 !== undefined;
}

function requireWeb3() {
  if (!checkWeb3()) {
    const error = { message: 'web3 is required' };
    throw error;
  }
}

export function currentAccount() {
  requireWeb3();

  return window.web3.eth.accounts[0];
}

export function getBlockNumber() {
  requireWeb3();

  return new Promise((resolve, reject) => {
    window.web3.eth.getBlockNumber((error, blockNumber) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(blockNumber);
    });
  });
}

export function getEvents(Event, filters, fromBlock = 0, toBlock = 'latest') {
  requireWeb3();

  return new Promise((resolve, reject) => {
    Event(filters, { fromBlock, toBlock }).get((error, events) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(events);
    });
  });
}
