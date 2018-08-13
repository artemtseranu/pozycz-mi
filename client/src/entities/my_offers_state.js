import { List, Record } from 'immutable';

import * as OperationState from './operation_state';

export const MyOffersState = Record({
  init: OperationState.OperationState(),
  offerIds: List(),
});

export function getOfferIds(state) {
  return state.get('offerIds');
}

export function setSuccessInit(state) {
  return state.set('init', OperationState.SuccessOperationState());
}

export function setOfferIds(state, offerIds) {
  return state.set('offerIds', List(offerIds));
}
