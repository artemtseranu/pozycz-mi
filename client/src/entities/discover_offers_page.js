import { Record } from 'immutable';
import { pipe } from 'ramda';

import { getter } from 'Lib/entity_utils';
import * as Operation from './operation';

export const DiscoverOffersPage = Record({
  init: Operation.Operation(),
  loadMoreOffers: Operation.Operation(),
  numberOfBlocksToLoad: 10,
});

const getInit = getter('init');

export function getInitStatus(discoverOffersPage) {
  return pipe(getInit, Operation.getStatus)(discoverOffersPage);
}

export function getInitErrorMessage(discoverOffersPage) {
  return pipe(getInit, Operation.getErrorMessage)(discoverOffersPage);
}

export function updateOnInitSuccess(discoverOffersPage) {
  return discoverOffersPage.set('init', Operation.success());
}

export function updateOnInitFailure(discoverOffersPage, event) {
  return discoverOffersPage.set('init', Operation.failure(event.errorMessage));
}

export function updateOnLoadMoreOffersStarted(discoverOffersPage) {
  return discoverOffersPage.set('loadMoreOffers', Operation.inProgress());
}

export function updateOnLoadMoreOffersSucceeded(discoverOffersPage) {
  return discoverOffersPage.set('loadMoreOffers', Operation.success());
}

export function updateOnLoadMoreOffersFailed(discoverOffersPage, event) {
  return discoverOffersPage.set('loadMoreOffers', Operation.failure(event.errorMessage));
}
