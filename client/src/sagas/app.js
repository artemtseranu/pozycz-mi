import { all, call, put, takeEvery } from "redux-saga/effects";
import TruffleContract from "truffle-contract";

import offersContractArtifact from "ContractArtifacts/Offers.json";

import * as events from "Events/app";

function* getLatestOffer(offersContract) {
  const tail = yield call(offersContract.tail.call);
  return yield call(offersContract.getOffer.call, tail);
}

function* initializeApp() {
  yield put({type: events.init.STARTED});

  const OffersContract = TruffleContract(offersContractArtifact);
  OffersContract.setProvider(window.web3.currentProvider);
  let offersContract;

  try {
    offersContract = yield call(OffersContract.deployed);
  } catch (error) {
    const msg = `Error getting deployed Offers contract instance. ${error.message}`;
    yield put({type: events.init.FAILED, error: msg});
    return;
  }

  let latestOffer;

  try {
    latestOffer = yield getLatestOffer(offersContract);
  } catch (error) {
    console.log(error);
  }

  yield put({type: events.init.SUCCEEDED, offersContract, latestOffer});
}

function* watchAppMounted() {
  yield takeEvery(events.MOUNTED, initializeApp);
}

export default function* () {
  yield all([
    yield watchAppMounted()
  ]);
};
