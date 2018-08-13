import { Map } from 'immutable';

import { create } from 'Lib/reducer_utils';

import * as Events from 'Events/ethereum';

const initialState = Map({
  initStatus: 'pending',
  initErrorMessage: '',
  initBlockNumber: 0,
  contracts: Map(),
});

const handlers = {
  [Events.Init.STARTED]: () => initialState,

  [Events.Init.SUCCEEDED]: (state, event) => state
    .set('initStatus', 'success')
    .set('initBlockNumber', event.initBlockNumber)
    .set('contracts', Map(event.contracts)),

  [Events.Init.FAILED]: (state, event) => state
    .set('initStatus', 'failure')
    .set('initErrorMessage', event.errorMessage),
};

export default create(handlers, initialState);
