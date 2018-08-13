import { all, takeEvery, select } from 'redux-saga/effects';

import { rootSelector } from 'Lib/reducer_utils';
import * as Events from 'Events/my_offers';
import * as EthereumState from 'Entities/ethereum_state';

function* init() {
  const offersContract = yield select(rootSelector('eth')(EthereumState.getOffersContract));
}

function* watchMounted() {
  yield takeEvery(Events.MOUNTED, init);
}

export default function* () {
  yield all([
    watchMounted(),
  ]);
}
