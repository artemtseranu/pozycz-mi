import { List, Record } from 'immutable';

import * as OperationState from './operation_state';

export const MyOffersState = Record({
  init: OperationState.OperationState(),
  offerIds: List(),
  pendingOffers: List(),
});

export function getInit(state) {
  return state.get('init');
}

export function getOfferIds(state) {
  return state.get('offerIds');
}

export function getPendingOffers(state) {
  return state.get('pendingOffers');
}

export function setSuccessInit(state) {
  return state.set('init', OperationState.SuccessOperationState());
}

export function setOfferIds(state, offerIds) {
  return state.set('offerIds', List(offerIds));
}

export function addPendingOffer(state, offer) {
  return state.update('pendingOffers', list => list.push(offer));
}
