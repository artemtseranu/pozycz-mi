import { create as createReducer } from 'Lib/reducer_utils';

import { DiscoverOffersPage, setInitSuccess, setInitFailure } from 'Entities/discover_offers_page';

import * as Events from 'Events/discover_offers';

const initialState = DiscoverOffersPage();

const handlers = {
  [Events.Init.SUCCEEDED]: setInitSuccess,
  [Events.Init.FAILED]: (state, event) => setInitFailure(state, event.errorMessage),
};

export default createReducer(handlers, initialState);
