import {
  all, call, put, select, takeEvery,
} from 'redux-saga/effects';

import { push } from 'connected-react-router';

import { currentAccount } from 'Lib/ethereum_utils';
import { addFile, multihashToBytes32 } from 'Lib/ipfs_utils';

import * as Paths from 'Constants/paths';
import * as Events from 'Events/create_offer';
import * as MyOffersEvents from 'Events/my_offers';

import * as OfferDetails from 'Entities/offer_details';

// TODO: handle no accounts
function* sendCreateOfferTransaction() {
  const offersContract = yield select(state => state.eth.getIn(['contracts', 'offers']));
  const { description, detailedDescription } = yield select(state => state.createOffer.getIn(['form', 'fields']).toJS());
  const imageHashes = yield select(state => state.createOffer.get('imageHashes'));

  yield put({ type: Events.SendCreateOfferTransaction.STARTED });

  const details = OfferDetails.OfferDetails({ detailedDescription, imageHashes });
  const detailsAsJson = JSON.stringify(details.toJS());

  let detailsHash;

  try {
    const detailsMultihash = yield call(addFile, detailsAsJson);
    detailsHash = multihashToBytes32(detailsMultihash);
  } catch (error) {
    // TODO: Handle this case
    detailsHash = '';
  }

  try {
    const transactionHash = yield call(
      offersContract.createOffer.sendTransaction,
      description,
      detailsHash,
      { from: currentAccount() },
    );

    yield put({
      type: Events.SendCreateOfferTransaction.SUCCEEDED, transactionHash, description, details,
    });

    yield put(push(Paths.MY_OFFERS));
  } catch (error) {
    yield put({ type: Events.SendCreateOfferTransaction.FAILED });
  }
}

function* watchFormSubmitted() {
  yield takeEvery(Events.FORM_SUBMITTED, sendCreateOfferTransaction);
}

export default function* () {
  yield all([
    watchFormSubmitted(),
  ]);
}
