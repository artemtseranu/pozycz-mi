import { List, Map, Record } from 'immutable';

import * as OperationState from './operation_state';

export const MyOffersState = Record({
  init: OperationState.OperationState(),
  offerIds: List(),
  pendingOffers: List(),
  deleteOfferConfirmation: Map({
    isOpen: false,
    offerId: 0,
  }),
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

export function isDeleteOfferConfirmationOpen(myOffersPage) {
  return myOffersPage.getIn(['deleteOfferConfirmation', 'isOpen']);
}

export function getOfferToDeleteId(myOffersPage) {
  return myOffersPage.getIn(['deleteOfferConfirmation', 'offerId']);
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

export function updateOnDeleteOfferRequested(myOffersPage, event) {
  return myOffersPage.set('deleteOfferConfirmation', Map({ isOpen: true, offerId: event.offerId }));
}

export function updateOnDeleteOfferCancelled(myOffersPage) {
  return myOffersPage.set('deleteOfferConfirmation', Map({ isOpen: false, offerId: 0 }));
}

export function updateOnSendDeleteOfferTxStarted(myOffersPage) {
  return myOffersPage.set('deleteOfferConfirmation', Map({ isOpen: false, offerId: 0 }));
}
