import { all } from 'redux-saga/effects';

import ethereumSaga from './ethereum';
import createOfferSaga from './create_offer';
import myOffersSaga from './my_offers';

export default function* () {
  yield all([
    ethereumSaga(),
    createOfferSaga(),
    myOffersSaga(),
  ]);
}
