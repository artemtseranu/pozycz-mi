async function isReverted(contractFunction, ...args) {
  let errorMessage;

  try {
    await contractFunction.sendTransaction(...args);
  } catch (error) {
    errorMessage = error.message;
  }

  const expectedErrorMessage = "VM Exception while processing transaction: revert";

  assert.equal(errorMessage, expectedErrorMessage, "Expected transaction to fail with 'revert' error message");
}

function transformEvent(event) {
  let result = {};
  result.event = event.event;
  result.args = event.args;

  if (event.args.id) {
    result.args.id = parseInt(event.args.id, 10);
  }

  return result;
}

async function emitsEvents(expectedEvents, contractInstance, contractFunctionKey, ...args) {
  const watcher = contractInstance.allEvents();

  const transactionHash = await contractInstance[contractFunctionKey].sendTransaction(...args);

  const actualEvents = watcher.get()
    .filter(event => event.transactionHash === transactionHash)
    .map(transformEvent);

  assert.deepEqual(expectedEvents, actualEvents, "Events emitted during transaction don't match expected");
}

module.exports = {
  isReverted,
  emitsEvents
};
