import { List, Map } from 'immutable';

import * as Offer from 'Entities/offer';

export function parseEvents({ offerCreatedEvents, offerDeletedEvents, deletedOfferIds }) {
  let updatedDeletedOfferIds = deletedOfferIds;

  offerDeletedEvents.forEach((offerDeletedEvent) => {
    const id = parseInt(offerDeletedEvent.args.id, 10);
    updatedDeletedOfferIds = updatedDeletedOfferIds.add(id);
  });

  let offers = Map();
  let offerIds = List();

  offerCreatedEvents.forEach((offerCreatedEvent) => {
    const id = parseInt(offerCreatedEvent.args.id, 10);

    if (updatedDeletedOfferIds.includes(id)) {
      updatedDeletedOfferIds = updatedDeletedOfferIds.delete(id);
    } else {
      const offer = Offer.fromOfferCreatedEvent(offerCreatedEvent);
      offers = offers.set(id, offer);
      offerIds = offerIds.push(id);
    }
  });

  return Map({
    offers,
    offerIds,
    deletedOfferIds: updatedDeletedOfferIds,
  });
}
