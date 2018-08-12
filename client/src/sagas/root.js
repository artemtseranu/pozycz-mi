import { all } from "redux-saga/effects";

import ethereumSaga from "./ethereum";
import createOfferSaga from "./create_offer";

export default function* () {
  yield all([
    ethereumSaga(),
    createOfferSaga()
  ]);
}
