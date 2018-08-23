import {
  all, call, put, select, spawn, takeEvery,
} from 'redux-saga/effects';
import TruffleContract from 'truffle-contract';

import { getBlockNumber } from 'Lib/ethereum_utils';
import { rootSelector } from 'Lib/reducer_utils';
import { loadSingleOfferDetails } from 'Lib/saga_utils';

import * as EthereumState from 'Entities/ethereum_state';
import * as OperationState from 'Entities/operation_state';
import * as Events from 'Events/ethereum';

import offersContractArtifact from 'ContractArtifacts/Offers.json';

function* init({ dispatch }) {
  const initState = yield select(rootSelector('eth')(EthereumState.getInit));

  if (!OperationState.isPending(initState)) return;

  yield put({ type: Events.Init.STARTED });

  const OffersContract = TruffleContract(offersContractArtifact);
  OffersContract.setProvider(window.web3.currentProvider);

  let offersContract;

  try {
    offersContract = yield call(OffersContract.deployed);
  } catch (error) {
    const errorMessage = `Failed to get deployed Offers contract instance. ${error.message}`;
    yield put({ type: Events.Init.FAILED, errorMessage });
    return;
  }

  let initBlockNumber;

  try {
    initBlockNumber = yield call(getBlockNumber);
  } catch (error) {
    const errorMessage = `Failed to get current block number. ${error.message}`;
    yield put({ type: Events.Init.FAILED, errorMessage });
    return;
  }

  const account = window.web3.eth.accounts[0];

  const offerCreated = offersContract.OfferCreated();
  const offerDeleted = offersContract.OfferDeleted();

  yield put({
    type: Events.Init.SUCCEEDED,
    contracts: {
      offers: offersContract,
    },
    initBlockNumber,
    watchers: {
      offerCreated,
      offerDeleted,
    },
  });

  offerCreated.watch((error, event) => {
    if (!error && event.blockNumber > initBlockNumber) {
      dispatch({
        type: Events.OFFER_CREATED_EVENT_RECEIVED,
        offerCreatedEvent: event,
        isOwned: event.args.owner === account,
      });
    }
  });

  offerDeleted.watch((error, event) => {
    if (!error && event.blockNumber > initBlockNumber) {
      dispatch({
        type: Events.OFFER_DELETED_EVENT_RECEIVED,
        offerDeletedEvent: event,
      });
    }
  });
}

function* handleOfferCreatedEventReceived({ offerCreatedEvent, isOwned }) {
  yield put({ type: Events.OFFER_CREATED, offerCreatedEvent, isOwned });
  const id = parseInt(offerCreatedEvent.args.id, 10);
  yield spawn(loadSingleOfferDetails, id);
}

function* handleOfferDeletedEventReceived({ offerDeletedEvent }) {
  yield put({ type: Events.OFFER_DELETED, offerDeletedEvent });
}

function* watchRequired() {
  yield takeEvery(Events.REQUIRED, init);
}

function* watchOfferCreatedEventReceived() {
  yield takeEvery(Events.OFFER_CREATED_EVENT_RECEIVED, handleOfferCreatedEventReceived);
}

function* watchOfferDeletedEventReceived() {
  yield takeEvery(Events.OFFER_DELETED_EVENT_RECEIVED, handleOfferDeletedEventReceived);
}

export default function* () {
  yield all([
    watchRequired(),
    watchOfferCreatedEventReceived(),
    watchOfferDeletedEventReceived(),
  ]);
}
