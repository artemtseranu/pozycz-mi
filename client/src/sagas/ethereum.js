import {
  all, call, put, select, takeEvery,
} from 'redux-saga/effects';
import TruffleContract from 'truffle-contract';

import { getBlockNumber } from 'Lib/ethereum_utils';
import { rootSelector } from 'Lib/reducer_utils';

import * as EthereumState from 'Entities/ethereum_state';
import * as OperationState from 'Entities/operation_state';
import * as Events from 'Events/ethereum';

import offersContractArtifact from 'ContractArtifacts/Offers.json';

function* init() {
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

  yield put({
    type: Events.Init.SUCCEEDED,
    contracts: {
      offers: offersContract,
    },
    initBlockNumber,
  });
}

function* watchRequired() {
  yield takeEvery(Events.REQUIRED, init);
}

export default function* () {
  yield all([
    watchRequired(),
  ]);
}
