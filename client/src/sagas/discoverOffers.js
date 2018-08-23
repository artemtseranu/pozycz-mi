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
  const numberOfBlocksToLoad = yield select(state => state.discoverOffers.get('numberOfBlocksToLoad'));
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

  let offerDeletedEvents;

  try {
    offerDeletedEvents = yield call(
      getEvents,
      offersContract.OfferDeleted,
      {},
      earliestBlock,
      initBlockNumber,
    );
  } catch (error) {
    const errorMessage = `Failed to get past OfferDeleted events. ${error.message}`;
    yield put({ type: Events.Init.FAILED, errorMessage });
    return;
  }

  yield put({
    type: Events.Init.SUCCEEDED,
    offerCreatedEvents,
    offerDeletedEvents,
    earliestBlock,
  });

  const offerIds = offerCreatedEvents.map(offerCreatedEvent => (
    parseInt(offerCreatedEvent.args.id, 10)
  ));

  yield spawn(loadOfferDetails, offerIds);
}

function* loadMoreOffers() {
  const loadMoreOffersStatus = yield select(state => state.discoverOffers.getIn(['loadMoreOffers', 'status']));

  if (loadMoreOffersStatus === 'inProgress') return;

  yield put({ type: Events.LoadMoreOffers.STARTED });

  const offersContract = yield select(state => state.eth.getIn(['contracts', 'offers']));
  const earliestBlock = yield select(state => state.offerCache.get('earliestBlock'));

  if (earliestBlock === 0) return;

  const numberOfBlocksToLoad = yield select(state => state.discoverOffers.get('numberOfBlocksToLoad'));
  const newEarliestBlock = Math.max((earliestBlock - 1) - (numberOfBlocksToLoad - 1), 0);

  let offerCreatedEvents;

  try {
    offerCreatedEvents = yield call(
      getEvents,
      offersContract.OfferCreated,
      {},
      newEarliestBlock,
      earliestBlock - 1,
    );
  } catch (error) {
    const errorMessage = `Failed to get past OfferCreated events. ${error.message}`;
    yield put({ type: Events.LoadMoreOffers.FAILED, errorMessage });
    return;
  }

  yield put({ type: Events.LoadMoreOffers.SUCCEEDED, offerCreatedEvents, newEarliestBlock });

  const offerIds = offerCreatedEvents.map(offerCreatedEvent => (
    parseInt(offerCreatedEvent.args.id, 10)
  ));

  yield spawn(loadOfferDetails, offerIds);
}

function* watchMounted() {
  yield takeEvery(Events.MOUNTED, init);
}

function* watchLoadMoreOffersRequested() {
  yield takeEvery(Events.LOAD_MORE_OFFERS_REQUESTED, loadMoreOffers);
}

export default function* () {
  yield all([
    watchMounted(),
    watchLoadMoreOffersRequested(),
  ]);
}
