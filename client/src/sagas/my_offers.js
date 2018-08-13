import {
  all, call, fork, put, select, takeEvery,
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
}

function* loadOfferDetails({ id }) {
  const offer = yield select(state => OfferCacheState.getOffer(state.offerCache, id));

  if (!Offer.detailsIsPending(offer)) return;

  yield put({ type: Events.LoadOfferDetails.STARTED, id });

  let details;

  try {
    details = yield getJson(Offer.getDetailsMultihash(offer));
  } catch (error) {
    const errorMessage = `Failed to load offer details from IPFS. ${error.message}`;
    yield put({ type: Events.LoadOfferDetails.FAILED, id, errorMessage });
    return;
  }

  yield put({ type: Events.LoadOfferDetails.SUCCEEDED, id, details });
}

function* watchMounted() {
  yield takeEvery(Events.MOUNTED, init);
}

function* watchOfferMounted() {
  yield takeEvery(Events.OFFER_MOUNTED, loadOfferDetails);
}

export default function* () {
  yield all([
    watchMounted(),
    watchOfferMounted(),
  ]);
}
