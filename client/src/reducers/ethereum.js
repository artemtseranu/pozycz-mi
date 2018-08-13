import { partialRight, pipe } from 'ramda';

import { create } from 'Lib/reducer_utils';
import * as Events from 'Events/ethereum';

import {
  EthereumState, setSuccessInit, setInitBlockNumber, setContracts, setFailureInit, setWatchers,
} from 'Entities/ethereum_state';

const handlers = {
  [Events.Init.STARTED]: () => EthereumState(),

  [Events.Init.SUCCEEDED]: (state, event) => pipe(
    setSuccessInit,
    partialRight(setInitBlockNumber, [event.initBlockNumber]),
    partialRight(setContracts, [event.contracts]),
    partialRight(setWatchers, [event.watchers]),
  )(state),

  [Events.Init.FAILED]: (state, event) => setFailureInit(state, event.errorMessage),
};

export default create(handlers, EthereumState());
