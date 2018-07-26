import { all } from "redux-saga/effects";

import appSaga from "./app";
import offersSaga from "./offers";
import ethereumSaga from "./ethereum";
import createOffer from "./create_offer";

export default function* () {
  yield all([
    appSaga(),
    offersSaga(),
    ethereumSaga(),
    createOffer()
  ]);
}
