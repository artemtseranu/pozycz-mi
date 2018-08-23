import { delay } from 'redux-saga';

import {
  all,
  call,
  put,
  select,
} from 'redux-saga/effects';

import { getJSON } from 'Lib/ipfs_utils';

import * as Offer from 'Entities/offer';
import * as OfferCache from 'Entities/offer_cache_state';

import * as IpfsEvents from 'Events/ipfs';

export function* loadSingleOfferDetails(id) {
  const offer = yield select(state => OfferCache.getOffer(state.offerCache, id));

  if (!offer) return;

  // TODO detailsIsPending -> isDetailsPending
  if (!Offer.detailsIsPending(offer)) return;

  yield put({ type: IpfsEvents.LoadOfferDetails.STARTED, id });

  yield call(delay, 0);

  let details;

  try {
    details = yield call(getJSON, Offer.getDetailsMultihash(offer));
  } catch (error) {
    yield put({ type: IpfsEvents.LoadOfferDetails.FAILED, id, errorMessage: error.message });
    return;
  }

  yield put({ type: IpfsEvents.LoadOfferDetails.SUCCEEDED, id, details });
}

export function* loadOfferDetails(offerIds) {
  const loaders = offerIds.map(offerId => call(loadSingleOfferDetails, offerId));
  yield all(loaders);
}

function selectIn(key) {
  return selector => select(state => selector(state[key]));
}

export const selectInEthereum = selectIn('eth');
export const selectInMyOffers = selectIn('myOffers');
