import { all, put, takeEvery } from 'redux-saga/effects';

import * as Events from 'Events/discover_offers';

function* init() {
  yield put({ type: Events.Init.SUCCEEDED });
}

function* watchMounted() {
  yield takeEvery(Events.MOUNTED, init);
}

export default function* () {
  yield all([
    watchMounted(),
  ]);
}
