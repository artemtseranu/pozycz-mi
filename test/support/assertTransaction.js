async function isReverted(contractFunction, args, reason) {
  let errorMessage;

  try {
    await contractFunction.sendTransaction(...args);
  } catch (error) {
    errorMessage = error.message;
  }

  const expectedErrorMessage = "VM Exception while processing transaction: revert " + reason;

  assert.equal(errorMessage, expectedErrorMessage, "Expected transaction to fail with 'revert " + reason + "' error message");
}

const INT_ARGS = ['id', 'offerId', 'guarantee', 'payPerHour', 'minHours', 'maxHours', 'hoursToConfirm'];

function transformEvent(event) {
  let result = {};
  result.event = event.event;
  result.args = event.args;

  INT_ARGS.forEach((intArg) => {
    if (event.args[intArg]) {
      result.args[intArg] = parseInt(event.args[intArg], 10);
    }
  });

  return result;
}

async function emitsEvents(expectedEvents, contractInstance, contractFunctionKey, args) {
  const watcher = contractInstance.allEvents();

  const transactionHash = await contractInstance[contractFunctionKey].sendTransaction(...args);

  const actualEvents = watcher.get()
    .filter(event => event.transactionHash === transactionHash)
    .map(transformEvent);

  assert.deepEqual(expectedEvents, actualEvents, "Events emitted during transaction don't match expected");
}

module.exports = {
  isReverted,
  emitsEvents,
};
