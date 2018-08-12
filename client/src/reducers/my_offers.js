import { List, Map, Record } from "immutable";

import { create } from "Lib/reducers";

import * as Events from "Events/my_offers";

const OfferAttributes = Record({
  description: "",
  details: ""
});

const Offer = Record({
  id: 0,
  transactionStatus: "pending",
  transactionHash: "",
  attributes: OfferAttributes()
});

const initialState = Map({
  offers: List()
});

function updateOfferListAfterOfferCreated(id, transactionHash, attributes, offers) {
  if (offers.isEmpty()) {
    const offer = Offer({
      id,
      transactionStatus: "mined",
      transactionHash,
      attributes: OfferAttributes(attributes)
    })

    return List([offer]);
  }

  const currentOffer = offers.first();

  if (currentOffer.get("id") === id) return offers;

  if (currentOffer.get("transactionHash") === transactionHash && currentOffer.get("transactionStatus") === "pending") {
    const updatedOffer = currentOffer.
      set("id", id).
      set("transactionStatus", "mined").
      set("attributes", OfferAttributes(attributes));

    return offers.rest().unshift(updatedOffer);
  }

  return updateOfferListAfterOfferCreated(id, transactionHash, attributes, offers.rest()).unshift(currentOffer);
}

function findMinedOffer(id) {

}

function findPendingOffer(id) {

}

function isNewOffer(state, offerId) {
  const targetOffer = state.get("offers").find(offer => offer.get("id") === offerId);
  return !targetOffer;
}

const handlers = {
  [Events.OFFER_CREATED]: (state, event) => {
    return state.update("offers", (offers) => {
      return updateOfferListAfterOfferCreated(event.id, event.transactionHash, event.attributes, offers);
      // const createdOffer = Offer(event.offerAttributes);

      // if (isNewOffer(state, createdOffer.get("id"))) {
      //   offers = offers.push(createdOffer);
      // }

      // return offers;
    });
  },

  [Events.OFFER_ADDED]: (state, event) => {
    return state.update("offers", (offers) => {
      const offer = Offer({
        transactionHash: event.transactionHash,
        attributes: OfferAttributes(event.attributes)
      });

      return offers.push(offer);
    });
  }
};

export default create(handlers, initialState);
