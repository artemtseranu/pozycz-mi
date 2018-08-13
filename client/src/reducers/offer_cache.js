import { List, Map } from 'immutable';
import { partialRight, pipe } from 'ramda';

import { create } from 'Lib/reducer_utils';

import * as Offer from 'Entities/offer';
import * as OfferAttributes from 'Entities/offer_attributes';

import {
  OfferCacheState,
  addCreatedOffers,
  addOffers,
  addMyOfferIds,
  addPendingOffer,
  addNewMyOffer,
  markOfferDetailsLoaddingInProgress,
  markOfferDetailsLoaddingLoaded,
} from 'Entities/offer_cache_state';

import * as Events from 'Events/offer_cache';
import * as EthereumEvents from 'Events/ethereum';
import * as MyOffersEvents from 'Events/my_offers';
import * as CreateOfferEvents from 'Events/create_offer';

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

  [MyOffersEvents.Init.SUCCEEDED]: (state, event) => {
    const [newOffers, newMyOfferIds] = event.offerCreatedEvents.reduce(
      ([map, list], ethereumEvent) => {
        const offer = Offer.fromEthereumEvent(ethereumEvent);
        const id = Offer.getId(offer);
        return [map.set(id, offer), list.push(id)];
      },
      [Map(), List()],
    );

    return pipe(
      partialRight(addOffers, [newOffers]),
      partialRight(addMyOfferIds, [newMyOfferIds]),
    )(state);
  },

  [CreateOfferEvents.SendCreateOfferTransaction.SUCCEEDED]: (state, event) => {
    const offer = Offer.pending(event.transactionHash, event.description, event.details);
    return addPendingOffer(state, offer);
  },

  [EthereumEvents.MY_OFFER_CREATED]: (state, event) => {
    const { args, transactionHash } = event.ethereumEvent;
    const attributes = OfferAttributes.from(args);
    return addNewMyOffer(state, transactionHash, attributes);
  },

  [MyOffersEvents.LoadOfferDetails.STARTED]: (state, { id }) => (
    markOfferDetailsLoaddingInProgress(state, id)
  ),

  [MyOffersEvents.LoadOfferDetails.SUCCEEDED]: (state, { id, details }) => (
    markOfferDetailsLoaddingLoaded(state, id, details)
  ),
};

export default create(handlers, initialState);
