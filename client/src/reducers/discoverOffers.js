import { create as createReducer } from 'Lib/reducer_utils';

import * as DiscoverOffersPage from 'Entities/discover_offers_page';

import * as Events from 'Events/discover_offers';

const initialState = DiscoverOffersPage.DiscoverOffersPage();

const handlers = {
  [Events.Init.SUCCEEDED]: DiscoverOffersPage.updateOnInitSuccess,
  [Events.Init.FAILED]: DiscoverOffersPage.updateOnInitFailure,

  [Events.LoadMoreOffers.STARTED]: DiscoverOffersPage.updateOnLoadMoreOffersStarted,
  [Events.LoadMoreOffers.SUCCEEDED]: DiscoverOffersPage.updateOnLoadMoreOffersSucceeded,
  [Events.LoadMoreOffers.FAILED]: DiscoverOffersPage.updateOnLoadMoreOffersFailed,

  [Events.NUMBER_OF_BLOCKS_TO_LOAD_CHANGED]: (state, event) => (
    state.set('numberOfBlocksToLoad', parseInt(event.value, 10))
  ),
};

export default createReducer(handlers, initialState);
