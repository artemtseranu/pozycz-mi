import { all } from 'redux-saga/effects';

import ethereumSaga from './ethereum';
import createOfferSaga from './create_offer';
import myOffersSaga from './my_offers';
import discoverOffers from './discoverOffers';

export default function* () {
  yield all([
    ethereumSaga(),
    myOffersSaga(),
    createOfferSaga(),
    discoverOffers(),
  ]);
}
