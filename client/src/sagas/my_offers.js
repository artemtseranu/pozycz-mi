import { delay } from 'redux-saga';

import {
  all, call, spawn, put, select, takeEvery,
} from 'redux-saga/effects';

import { currentAccount, getAllEvents } from 'Lib/ethereum_utils';
import { getJson } from 'Lib/ipfs_utils';
import { rootSelector } from 'Lib/reducer_utils';
import * as Events from 'Events/my_offers';
import * as EthereumState from 'Entities/ethereum_state';
import * as MyOffersState from 'Entities/my_offers_state';
import * as Offer from 'Entities/offer';
import * as OfferCacheState from 'Entities/offer_cache_state';
import * as OperationState from 'Entities/operation_state';

function* loadOfferDetails(id) {
  const offer = yield select(state => OfferCacheState.getOffer(state.offerCache, id));

  if (!Offer.detailsIsPending(offer)) return;

  yield put({ type: Events.LoadOfferDetails.STARTED, id });

  let details;

  try {
    yield call(delay, 0);
    details = yield call(getJson, Offer.getDetailsMultihash(offer), { timeout: 5000 });
  } catch (error) {
    const errorMessage = `Failed to load offer details from IPFS. ${error.message}`;
    yield put({ type: Events.LoadOfferDetails.FAILED, id, errorMessage });
    return;
  }

  yield put({ type: Events.LoadOfferDetails.SUCCEEDED, id, details });
}

function* loadOffersDetails(offerCreatedEvents) {
  const effects = offerCreatedEvents.map((offerCreatedEvent) => {
    const offerId = parseInt(offerCreatedEvent.args.id, 10);
    return call(loadOfferDetails, offerId);
  });

  yield all(effects);
}

function* init() {
  const initState = yield select(state => MyOffersState.getInit(state.myOffers));

  if (!OperationState.isPending(initState)) return;

  // TODO: rootSelector is useless
  const offersContract = yield select(rootSelector('eth')(EthereumState.getOffersContract));

  let offerCreatedEvents;

  try {
    offerCreatedEvents = yield call(
      getAllEvents, offersContract.OfferCreated, { owner: currentAccount() },
    );
  } catch (error) {
    const errorMessage = `Failed to get past OfferCreated events. ${error.message}`;
    yield put({ type: Events.Init.FAILED, errorMessage });
    return;
  }

  yield put({ type: Events.Init.SUCCEEDED, offerCreatedEvents });
  yield spawn(loadOffersDetails, offerCreatedEvents);
}

function* watchMounted() {
  yield takeEvery(Events.MOUNTED, init);
}

export default function* () {
  yield all([
    watchMounted(),
  ]);
}
