import {
  all, call, spawn, put, select, takeEvery,
} from 'redux-saga/effects';

import { currentAccount, getEvents } from 'Lib/ethereum_utils';
import { rootSelector } from 'Lib/reducer_utils';
import { loadOfferDetails, selectInEthereum, selectInMyOffers } from 'Lib/saga_utils';

import * as Events from 'Events/my_offers';
import * as EthereumState from 'Entities/ethereum_state';
import * as MyOffersPage from 'Entities/my_offers_state';
import * as OperationState from 'Entities/operation_state';

function* init() {
  const initState = yield select(state => MyOffersPage.getInit(state.myOffers));

  if (!OperationState.isPending(initState)) return;

  // TODO: rootSelector is useless
  const offersContract = yield select(rootSelector('eth')(EthereumState.getOffersContract));

  let offerCreatedEvents;

  try {
    offerCreatedEvents = yield call(
      getEvents, offersContract.OfferCreated, { owner: currentAccount() },
    );
  } catch (error) {
    const errorMessage = `Failed to get past OfferCreated events. ${error.message}`;
    yield put({ type: Events.Init.FAILED, errorMessage });
    return;
  }

  yield put({ type: Events.Init.SUCCEEDED, offerCreatedEvents });

  const offerIds = offerCreatedEvents.map(offerCreatedEvent => (
    parseInt(offerCreatedEvent.args.id, 10)
  ));

  yield spawn(loadOfferDetails, offerIds);
}

function* sendDeleteOfferTx() {
  const offerToDeleteId = yield selectInMyOffers(MyOffersPage.getOfferToDeleteId);

  yield put({ type: Events.SendDeleteOfferTx.STARTED });

  const offersContract = yield selectInEthereum(EthereumState.getOffersContract);

  try {
    yield call(
      offersContract.deleteOffer.sendTransaction,
      offerToDeleteId,
      { from: currentAccount() },
    );
  } catch (error) {
    console.log('TODO');
  }

  yield put({ type: Events.SendDeleteOfferTx.SUCCEEDED, offerId: offerToDeleteId });
}

function* watchMounted() {
  yield takeEvery(Events.MOUNTED, init);
}

function* watchDeleteOfferConfirmed() {
  yield takeEvery(Events.DELETE_OFFER_CONFIRMED, sendDeleteOfferTx);
}

export default function* () {
  yield all([
    watchMounted(),
    watchDeleteOfferConfirmed(),
  ]);
}
