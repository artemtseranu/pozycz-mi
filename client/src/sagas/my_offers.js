import {
  all, call, put, select, takeEvery,
} from 'redux-saga/effects';

import { currentAccount, getAllEvents } from 'Lib/ethereum_utils';
import { rootSelector } from 'Lib/reducer_utils';
import * as Events from 'Events/my_offers';
import * as OffersCacheEvents from 'Events/offer_cache';
import * as EthereumState from 'Entities/ethereum_state';

function* init() {
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

  yield put({ type: OffersCacheEvents.PAST_OFFERS_CREATED, offerCreatedEvents });
  yield put({ type: Events.Init.SUCCEEDED, offerCreatedEvents });
}

function* watchMounted() {
  yield takeEvery(Events.MOUNTED, init);
}

export default function* () {
  yield all([
    watchMounted(),
  ]);
}
