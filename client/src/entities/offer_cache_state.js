import { List, Map, Record } from 'immutable';

export const OfferCacheState = Record({ // eslint-disable-line import/prefer-default-export
  createdOffers: Map(),
});

export function getOffer(state, id) {
  return state.getIn(['createdOffers', id.toString()]);
}

export function getOffers(state, ids) {
  return ids.reduce((result, id) => {
    const offer = getOffer(state, id);

    if (!offer) {
      return result;
    }

    return result.push(offer);
  }, List());
}

export function addCreatedOffers(state, offers) {
  return state.mergeIn(['createdOffers'], offers);
}
