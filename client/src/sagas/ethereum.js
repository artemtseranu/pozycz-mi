import { all, call, put, select, takeEvery } from "redux-saga/effects";
import TruffleContract from "truffle-contract";

import * as Events from "Events/ethereum";

import offersContractArtifact from "ContractArtifacts/Offers.json";

function* init() {
  const initStatus = yield select(state => state.eth.get("initStatus"));

  if (initStatus !== "pending") return;

  yield put({type: Events.Init.STARTED});

  const OffersContract = TruffleContract(offersContractArtifact);
  OffersContract.setProvider(window.web3.currentProvider);

  let offersContract;

  try {
    offersContract = yield call(OffersContract.deployed);
  } catch (error) {
    const errorMessage = `Failed to get deployed Offers contract instance. ${error.message}`;
    yield put({type: Events.Init.FAILED, errorMessage});
    return;
  }

  yield put({
    type: Events.Init.SUCCEEDED,
    contracts: {
      offers: offersContract
    }
  });
}

function* watchRequired() {
  yield takeEvery(Events.REQUIRED, init);
}

export default function* () {
  yield all([
    watchRequired()
  ]);
}
