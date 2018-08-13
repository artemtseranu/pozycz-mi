import { partialRight, pipe } from 'ramda';

import { create } from 'Lib/reducer_utils';

import {
  MyOffersState, setSuccessInit, setFailureInit, setOfferIds,
} from 'Entities/my_offers_state';

import * as Events from 'Events/my_offers';

const initialState = MyOffersState();

function offerCreatedEventsToOfferIds(offerCreatedEvents) {
  return offerCreatedEvents.map(event => parseInt(event.args.id, 10));
}

const handlers = {
  [Events.Init.STARTED]: () => initialState,

  [Events.Init.SUCCEEDED]: (state, event) => pipe(
    setSuccessInit,
    partialRight(setOfferIds, [offerCreatedEventsToOfferIds(event.offerCreatedEvents)]),
  )(state),

  [Events.Init.FAILED]: (state, event) => setFailureInit(state, event.errorMessage),
};

export default create(handlers, initialState);
