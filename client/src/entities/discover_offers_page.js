import { Record } from 'immutable';
import { pipe } from 'ramda';

import { getter } from 'Lib/entity_utils';
import * as Operation from './operation';

export const DiscoverOffersPage = Record({
  init: Operation.Operation(),
});

const getInit = getter('init');

export function getInitStatus(discoverOffersPage) {
  return pipe(getInit, Operation.getStatus)(discoverOffersPage);
}

export function getInitErrorMessage(discoverOffersPage) {
  return pipe(getInit, Operation.getErrorMessage)(discoverOffersPage);
}

export function setInitSuccess(discoverOffersPage) {
  return discoverOffersPage.set('init', Operation.success());
}

export function setInitFailure(discoverOffersPage, errorMessage) {
  return discoverOffersPage.set('init', Operation.failure(errorMessage));
}
