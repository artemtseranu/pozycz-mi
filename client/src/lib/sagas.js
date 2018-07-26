import { call, put, select } from "redux-saga/effects";

import * as events from "Events/app";

export function blockingOperation(f) {
  return function* () {
    const isBlocked = yield select(state => state.app.get("isBlockingOperationInProgress"));

    if (isBlocked) return;

    yield put({type: events.STARTED_BLOCKING_OPERATION});

    yield call(f, ...arguments);

    yield put({type: events.ENDED_BLOCKING_OPERATION});
  };
}
