import { create } from 'Lib/reducer_utils';

import * as Offer from 'Entities/offer';
import { OfferCacheState, addCreatedOffers } from 'Entities/offer_cache_state';
import * as Events from 'Events/offer_cache';

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
};

export default create(handlers, initialState);
