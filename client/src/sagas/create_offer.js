import { all, call, put, select, takeEvery } from "redux-saga/effects";
import { push } from "connected-react-router";

import { currentAccount } from "Lib/ethereum_utils";
import { addFile, multihashToBytes32 } from "Lib/ipfs_utils";

import * as Paths from "Root/paths";
import * as Events from "Events/create_offer";
import * as MyOffersEvents from "Events/my_offers";

import OfferDetails from "Models/OfferDetails";

// TODO: handle no accounts
function* sendCreateOfferTransaction() {
  const offersContract = yield select(state => state.eth.getIn(["contracts", "offers"]));
  const { description, detailedDescription } = yield select(state => state.createOffer.getIn(["form", "fields"]).toJS());
  const imageHashes = yield select(state => state.createOffer.get("imageHashes"));

  if (description === "") {
    alert("Please enter offer description");
    return;
  }

  yield put({type: Events.SendCreateOfferTransaction.STARTED});

  let detailsHash;

  try {
    const details = OfferDetails({detailedDescription, imageHashes});
    const detailsAsJson = JSON.stringify(details.toJS());
    const detailsMultihash = yield call(addFile, detailsAsJson);
    detailsHash = multihashToBytes32(detailsMultihash);
  } catch (error) {
    const response = confirm("Uploading offer details to IPFS failed. Click OK if you wish to proceed with creating an offer regardless");

    if (response) {
      detailsHash = "";
    } else {
      yield put({type: Events.SendCreateOfferTransaction.FAILED});
      return;
    }
  }

  try {
    const transactionHash = yield call(
      offersContract.createOffer.sendTransaction,
      description,
      detailsHash,
      {from: currentAccount()}
    );

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
