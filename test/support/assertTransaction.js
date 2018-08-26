async function isReverted(contractFunction, args, reason) {
  let errorMessage;

  try {
    await contractFunction(...args);
  } catch (error) {
    errorMessage = error.message;
  }

  let expectedErrorMessage;

  if (reason) {
    expectedErrorMessage = "VM Exception while processing transaction: revert " + reason;
  } else {
    expectedErrorMessage = "VM Exception while processing transaction: revert";
  }

  assert.equal(errorMessage, expectedErrorMessage, "Expected transaction to fail with 'revert " + reason + "' error message");
}

function matchEvent(actualEvent, expectedEvent) {
  Object.keys(actualEvent.args).forEach((arg) => {
    if (typeof expectedEvent.args[arg] === "function") {
      const check = expectedEvent.args[arg](actualEvent.args[arg]);

      assert(
        check,
        `Actual event argument doesn't match expected. Actual arguments: ${JSON.stringify(actualEvent.args)}, Not matching argument: ${arg}`
      );
    } else {
      assert.equal(
        actualEvent.args[arg],
        expectedEvent.args[arg],
        `Actual event argument doesn't match expected. Actual arguments: ${JSON.stringify(actualEvent.args)}, Not matching argument: ${arg}`
      );
    }
  });
}

async function emitsEvents(expectedEvents, contractInstance, contractFunctionKey, args) {
  const watcher = contractInstance.allEvents();

  const transactionHash = await contractInstance[contractFunctionKey].sendTransaction(...args);

  const actualEvents = watcher.get().filter(event => event.transactionHash === transactionHash);
  const actualEventTypes = actualEvents.map(event => event.event);
  const expectedEventTypes = expectedEvents.map(event => event.event);

  assert.deepEqual(expectedEventTypes, actualEventTypes, "Events emitted during transaction don't match expected");

  actualEvents.forEach((actualEvent, idx) => {
    const expectedEvent = expectedEvents[idx];
    matchEvent(actualEvent, expectedEvent);
  });
}

module.exports = {
  isReverted,
  emitsEvents,
};
