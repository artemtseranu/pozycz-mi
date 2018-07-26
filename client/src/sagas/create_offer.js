import { all, call, put, select, takeEvery } from "redux-saga/effects";
import { push } from "connected-react-router";

import { currentAccount } from "Lib/ethereum_utils";

import * as Paths from "Root/paths";
import * as Events from "Events/create_offer";
import * as MyOffersEvents from "Events/my_offers";

// TODO: handle no accounts
function* sendCreateOfferTransaction() {
  const offersContract = yield select(state => state.eth.getIn(["contracts", "offers"]));
  const { description } = yield select(state => state.createOffer.getIn(["form", "fields"]).toJS());

  if (description === "") {
    alert("Please enter offer details");
    return;
  }

  yield put({type: Events.SendCreateOfferTransaction.STARTED});

  try {
    const transactionHash = yield call(
      offersContract.createOffer.sendTransaction,
      description,
      "0x0",
      {from: currentAccount()}
    );
    console.log(transactionHash);

    yield put({type: MyOffersEvents.OFFER_ADDED, transactionHash, attributes: {description}});
    yield put(push(Paths.MY_OFFERS));
  } catch (error) {
    yield put({type: Events.SendCreateOfferTransaction.FAILED});
  }
}

function* watchFormSubmitted() {
  yield takeEvery(Events.FORM_SUBMITTED, sendCreateOfferTransaction);
}

export default function* () {
  yield all([
    watchFormSubmitted()
  ]);
}
