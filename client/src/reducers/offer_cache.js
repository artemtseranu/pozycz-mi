import { create } from 'Lib/reducer_utils';

import * as Offer from 'Entities/offer';
import * as OfferAttributes from 'Entities/offer_attributes';

import {
  OfferCacheState,
  addCreatedOffers,
  addPendingOffer,
  markOfferDetailsLoaddingInProgress,
  markOfferDetailsLoaddingLoaded,
  markOfferDetailsLoaddingFailed,
} from 'Entities/offer_cache_state';

import * as OfferCache from 'Entities/offer_cache_state';
import * as Operation from 'Entities/operation';

import * as Events from 'Events/offer_cache';
import * as EthereumEvents from 'Events/ethereum';
import * as MyOffersEvents from 'Events/my_offers';
import * as CreateOfferEvents from 'Events/create_offer';
import * as DiscoverOffersEvents from 'Events/discover_offers';
import * as IpfsEvents from 'Events/ipfs';

const initialState = OfferCacheState();

function offerCreatedEventsToOffers(offerCreatedEvents) {
  const map = {};

  offerCreatedEvents.forEach((event) => {
    const offer = Offer.fromOfferCreatedEvent(event);
    map[Offer.getId(offer)] = offer;
  });

  return map;
}

const handlers = {
  [Events.PAST_OFFERS_CREATED]: (state, event) => addCreatedOffers(
    state, offerCreatedEventsToOffers(event.offerCreatedEvents),
  ),

  [MyOffersEvents.Init.SUCCEEDED]: OfferCache.updateOnMyOffersInitSucceeded,

  [CreateOfferEvents.SendCreateOfferTransaction.SUCCEEDED]: (state, event) => {
    const { transactionHash, description, details } = event;

    const offer = Offer.Offer({
      transactionHash,
      attributes: OfferAttributes.OfferAttributes({ description }),
      loadDetails: Operation.success(details),
    });

    return addPendingOffer(state, offer);
  },

  // [EthereumEvents.OFFER_CREATED]: (state, event) => {
  //   const { args, transactionHash } = event.offerCreatedEvent;
  //   const attributes = OfferAttributes.from(args);
  //   return addNewMyOffer(state, transactionHash, attributes);
  // },
  [EthereumEvents.OFFER_CREATED]: OfferCache.updateOnOfferCreated,
  [EthereumEvents.OFFER_DELETED]: OfferCache.updateOnOfferDeleted,

  [MyOffersEvents.LoadOfferDetails.STARTED]: (state, { id }) => (
    markOfferDetailsLoaddingInProgress(state, id)
  ),

  [MyOffersEvents.LoadOfferDetails.SUCCEEDED]: (state, { id, details }) => (
    markOfferDetailsLoaddingLoaded(state, id, details)
  ),

  [MyOffersEvents.LoadOfferDetails.FAILED]: (state, { id, errorMessage }) => (
    markOfferDetailsLoaddingFailed(state, id, errorMessage)
  ),

  [DiscoverOffersEvents.Init.SUCCEEDED]: OfferCache.updateOnDiscoverOffersInitSucceeded,
  [DiscoverOffersEvents.LoadMoreOffers.SUCCEEDED]: OfferCache.updateOnLoadMoreOffersSucceeded,

  [IpfsEvents.LoadOfferDetails.SUCCEEDED]: OfferCache.updateOnLoadOfferDetailsSucceeded,
  [IpfsEvents.LoadOfferDetails.FAILED]: OfferCache.updateOnLoadOfferDetailsFailed,
};

export default create(handlers, initialState);
