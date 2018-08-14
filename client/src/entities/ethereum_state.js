import { Map, Record } from 'immutable';

import { getter } from 'Lib/entity_utils';

import * as OperationState from 'Entities/operation_state';

export const EthereumState = Record({
  init: OperationState.OperationState(),
  initBlockNumber: 0,
  contracts: Map(),
  watchers: Map(),
});

export const getInitBlockNumber = getter('initBlockNumber');

export function getOffersContract(state) {
  return state.getIn(['contracts', 'offers']);
}

export function getInit(state) {
  return state.get('init');
}

export function setSuccessInit(state) {
  return state.set('init', OperationState.SuccessOperationState());
}

export function setFailureInit(state, errorMessage) {
  return state.set('init', OperationState.FailureOperationState(errorMessage));
}

export function setInitBlockNumber(state, initBlockNumber) {
  return state.set('initBlockNumber', initBlockNumber);
}

export function setContracts(state, contracts) {
  return state.set('contracts', Map(contracts));
}

export function setWatchers(state, watchers) {
  return state.set('watchers', Map(watchers));
}
