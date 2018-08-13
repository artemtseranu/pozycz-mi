import { List, Map, Record } from 'immutable';

import { create } from 'Lib/reducer_utils';

import {
  OperationState, SuccessOperationState, FailureOperationState,
} from 'Entities/operation_state';

import * as Events from 'Events/my_offers';

const OfferAttributes = Record({
  description: '',
  details: '',
});

export const Offer = Record({
  id: 0,
  transactionStatus: 'pending',
  transactionHash: '',
  attributes: OfferAttributes(),
});

const initialState = Map({
  offers: List(),

  init: OperationState(),
  offerIds: List(),
});

function updateOfferListAfterOfferCreated(id, transactionHash, attributes, offers) {
  if (offers.isEmpty()) {
    const offer = Offer({
      id,
      transactionStatus: 'mined',
      transactionHash,
      attributes: OfferAttributes(attributes),
    });

    return List([offer]);
  }

  const currentOffer = offers.first();

  if (currentOffer.get('id') === id) return offers;

  if (currentOffer.get('transactionHash') === transactionHash && currentOffer.get('transactionStatus') === 'pending') {
    const updatedOffer = currentOffer
      .set('id', id)
      .set('transactionStatus', 'mined')
      .set('attributes', OfferAttributes(attributes));

    return offers.rest().unshift(updatedOffer);
  }

  return updateOfferListAfterOfferCreated(
    id,
    transactionHash,
    attributes,
    offers.rest(),
  ).unshift(currentOffer);
}

const handlers = {
  [Events.Init.STARTED]: () => initialState,

  [Events.Init.SUCCEEDED]: (state, event) => (
    state
      .set('init', SuccessOperationState())
      .set('offerIds', event.offerIds)
  ),

  [Events.Init.FAILED]: (state, event) => state.set('init', FailureOperationState(event.errorMessage)),

  [Events.OFFER_CREATED]: (state, event) => state.update('offers', offers => updateOfferListAfterOfferCreated(event.id, event.transactionHash, event.attributes, offers)),

  [Events.OFFER_ADDED]: (state, event) => state.update('offers', (offers) => {
    const offer = Offer({
      transactionHash: event.transactionHash,
      attributes: OfferAttributes(event.attributes),
    });

    return offers.push(offer);
  }),
};

export default create(handlers, initialState);
