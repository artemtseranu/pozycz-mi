import { all, call, put, select, takeEvery } from "redux-saga/effects";

import { blockingOperation } from "Lib/sagas";

import * as events from "Events/offers";

const sendCreateTransaction = blockingOperation(function* () {
  const account = window.web3.eth.accounts[0];

  if (!account) {
    alert("No available accounts. If you are using MetaMask please log in");
    return;
  }

  const offersContract = yield select(state => state.app.getIn(["contracts", "offers"]));
  const form = yield select(state => state.offers.get("createForm"));
  const details = form.get("details");

  if (details === "") {
    alert("Please enter offer details");
    return;
  }

  try {
    yield call(offersContract.createOffer.sendTransaction, details, {from: account});
    yield put({type: events.sendCreateTransaction.SUCCEEDED});
  } catch (error) {
    alert(`Transaction failed. ${error}`);
  }
});

function* watchCreateFormSubmitted() {
  yield takeEvery(events.CREATE_FORM_SUBMITTED, sendCreateTransaction);
}

export default function* () {
  yield all([
    watchCreateFormSubmitted()
  ]);
}
