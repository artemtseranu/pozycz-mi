import { List, Map, Record } from 'immutable';
import { partialRight, pipe } from 'ramda';

import { findAndDelete } from 'Lib/list_utils';

import * as Offer from './offer';
import * as OfferDetails from './offer_details';
import * as OfferAttributes from './offer_attributes';
import * as Operation from './operation';

export const OfferCacheState = Record({ // eslint-disable-line import/prefer-default-export
  createdOffers: Map(),

  offers: Map(),
  offerIds: List(),
  myOfferIds: List(),
  pendingOffers: List(),

  earliestBlock: undefined,
});

export function getOffer(state, id) {
  return state.getIn(['offers', id]);
}

export function getOffers(offerCache) {
  return offerCache.get('offerIds').map(id => getOffer(offerCache, id));
}

export function getMyOfferIds(state) {
  return state.get('myOfferIds');
}

export function getMyOffers(state) {
  return getMyOfferIds(state).map(id => getOffer(state, id));
}

export function getPendingOffers(state) {
  return state.get('pendingOffers');
}

export function addCreatedOffers(state, offers) {
  return state.mergeIn(['createdOffers'], offers);
}

export function addOffers(state, offers) {
  return state.mergeIn(['offers'], offers);
}

export function addOffer(state, id, offer) {
  return state.setIn(['offers', id], offer);
}

export function addMyOfferIds(state, ids) {
  return state.update('myOfferIds', list => list.unshift(...ids));
}

export function addNewMyOfferId(state, id) {
  return state.update('myOfferIds', list => list.push(id));
}

export function addPendingOffer(state, offer) {
  return state.update('pendingOffers', list => list.push(offer));
}

export function removePendingOffer(state, transactionHash) {
  return state.update('pendingOffers', list => (
    findAndDelete(list, offer => Offer.getTransactionHash(offer) === transactionHash)
  ));
}

export function addNewMyOffer(state, transactionHash, attributes) {
  const id = OfferAttributes.getId(attributes);
  const pendingOffer = getPendingOffers(state).find(offer => (
    Offer.getTransactionHash(offer) === transactionHash
  ));

  if (pendingOffer) {
    const offer = Offer.setAttributes(pendingOffer, attributes);

    return pipe(
      partialRight(removePendingOffer, [transactionHash]),
      partialRight(addOffer, [id, offer]),
      partialRight(addNewMyOfferId, [id]),
    )(state);
  }

  const offer = Offer.Offer({ transactionHash, attributes });

  return pipe(
    partialRight(addOffer, [id, offer]),
    partialRight(addNewMyOfferId, [id]),
  )(state);
}

export function markOfferDetailsLoaddingInProgress(state, id) {
  return state.setIn(['offers', id, 'details', 'status'], 'inProgress');
}

export function markOfferDetailsLoaddingLoaded(state, id, details) {
  return state
    .setIn(['offers', id, 'details', 'status'], 'loaded')
    .setIn(['offers', id, 'details', 'content'], OfferDetails.from(details));
}

export function markOfferDetailsLoaddingFailed(state, id, errorMessage) {
  return state
    .setIn(['offers', id, 'details', 'status'], 'failed')
    .setIn(['offers', id, 'details', 'errorMessage'], errorMessage);
}

export function updateOnDiscoverOffersInitSucceeded(offerCache, event) {
  const { offerCreatedEvents, earliestBlock } = event;

  const [offers, ids] = offerCreatedEvents.reduce(([map, list], offerCreatedEvent) => {
    const offer = Offer.fromOfferCreatedEvent(offerCreatedEvent);
    const id = Offer.getId(offer);
    return [map.set(id, offer), list.push(id)];
  }, [Map(), List()]);

  return offerCache
    .mergeIn(['offers'], offers)
    .update('offerIds', list => list.unshift(...ids))
    .set('earliestBlock', earliestBlock);
}

function updateOfferLoadDetails(offerCache, id, loadDetails) {
  return offerCache.updateIn(['offers', id], offer => offer.set('loadDetails', loadDetails));
}

export function updateOnLoadOfferDetailsSucceeded(offerCache, event) {
  const details = OfferDetails.fromJSON(event.details);
  const loadDetails = Operation.success(details);
  return updateOfferLoadDetails(offerCache, event.id, loadDetails);
}

export function updateOnLoadOfferDetailsFailed(offerCache, event) {
  const loadDetails = Operation.failure(event.errorMessage);
  return updateOfferLoadDetails(offerCache, event.id, loadDetails);
}
