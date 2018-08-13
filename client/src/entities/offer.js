import { Record } from 'immutable';
import { pipe } from 'ramda';

import { bytes32ToMultihash } from 'Lib/ipfs_utils';

export const OfferAttributes = Record({
  id: 0,
  description: '',
  details: '',
});

export const Offer = Record({
  attributes: OfferAttributes(),
});

export function fromOfferCreatedEvent(event) {
  const id = parseInt(event.args.id, 10);
  const attributes = OfferAttributes({ ...event.args, id });

  return Offer({
    attributes,
  });
}

export function getId(offer) {
  return offer.getIn(['attributes', 'id']);
}

export function getDescription(offer) {
  return offer.getIn(['attributes', 'description']);
}

export function getDetailsHash(offer) {
  return offer.getIn(['attributes', 'details']);
}

export function getDetailsMultihash(offer) {
  return pipe(getDetailsHash, bytes32ToMultihash)(offer);
}
