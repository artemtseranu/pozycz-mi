import { partialRight, pipe } from 'ramda';

import { create } from 'Lib/reducer_utils';

import {
  MyOffersState, setSuccessInit, setFailureInit, setOfferIds, addPendingOffer,
} from 'Entities/my_offers_state';
import * as MyOffersPage from 'Entities/my_offers_state';

import * as Events from 'Events/my_offers';
import * as Offer from 'Entities/offer';

const initialState = MyOffersState();

const handlers = {
  [Events.Init.STARTED]: () => initialState,

  [Events.Init.SUCCEEDED]: (state, event) => {
    const offerIds = event.offerCreatedEvents.map(ethEvent => parseInt(ethEvent.args.id, 10));

    return pipe(
      setSuccessInit,
      partialRight(setOfferIds, [offerIds]),
    )(state);
  },

  [Events.Init.FAILED]: (state, event) => setFailureInit(state, event.errorMessage),

  [Events.OFFER_ADDED]: (state, { transactionHash, description, details }) => {
    const offer = Offer.pending(transactionHash, description, details);
    return addPendingOffer(state, offer);
  },

  [Events.DELETE_OFFER_REQUESTED]: MyOffersPage.updateOnDeleteOfferRequested,
  [Events.DELETE_OFFER_CANCELLED]: MyOffersPage.updateOnDeleteOfferCancelled,

  [Events.SendDeleteOfferTx.STARTED]: MyOffersPage.updateOnSendDeleteOfferTxStarted,
};

export default create(handlers, initialState);
