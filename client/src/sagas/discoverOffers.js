import {
  all,
  call,
  put,
  select,
  spawn,
  takeEvery,
} from 'redux-saga/effects';

import { getEvents } from 'Lib/ethereum_utils';
import { loadOfferDetails } from 'Lib/saga_utils';

import { getInitStatus } from 'Entities/discover_offers_page';
import * as Ethereum from 'Entities/ethereum_state';

import * as Events from 'Events/discover_offers';

function* init() {
  const initStatus = yield select(state => getInitStatus(state.discoverOffers));

  if (initStatus !== 'pending') return;

  const offersContract = yield select(state => Ethereum.getOffersContract(state.eth));
  const initBlockNumber = yield select(state => Ethereum.getInitBlockNumber(state.eth));

  const numberOfBlocksToLoad = 3;
  const earliestBlock = Math.max(initBlockNumber - (numberOfBlocksToLoad - 1), 0);

  let offerCreatedEvents;

  try {
    offerCreatedEvents = yield call(
      getEvents,
      offersContract.OfferCreated,
      {},
      earliestBlock,
      initBlockNumber,
    );
  } catch (error) {
    const errorMessage = `Failed to get past OfferCreated events. ${error.message}`;
    yield put({ type: Events.Init.FAILED, errorMessage });
    return;
  }

  yield put({ type: Events.Init.SUCCEEDED, offerCreatedEvents, earliestBlock });

  const offerIds = offerCreatedEvents.map(offerCreatedEvent => (
    parseInt(offerCreatedEvent.args.id, 10)
  ));

  yield spawn(loadOfferDetails, offerIds);
}

function* watchMounted() {
  yield takeEvery(Events.MOUNTED, init);
}

export default function* () {
  yield all([
    watchMounted(),
  ]);
}
