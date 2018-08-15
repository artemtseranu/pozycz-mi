import { Record } from 'immutable';
import { pipe } from 'ramda';

import { bytes32ToMultihash } from 'Lib/ipfs_utils';
import { getter } from 'Lib/entity_utils';

import * as AsyncContent from './async_content';
import * as OfferAttributes from './offer_attributes';
import * as Operation from './operation';

export const Offer = Record({
  transactionHash: '',
  attributes: OfferAttributes.OfferAttributes(),
  details: AsyncContent.AsyncContent(),
  loadDetails: Operation.Operation(),
});

const getLoadDetails = getter('loadDetails');

export function fromOfferCreatedEvent({ transactionHash, args }) {
  const id = parseInt(args.id, 10);
  const attributes = OfferAttributes.OfferAttributes({ ...args, id });

  return Offer({
    transactionHash,
    attributes,
  });
}

// TODO: REMOVE
export function fromEthereumEvent(ethereumEvent) {
  const { transactionHash, args } = ethereumEvent;
  const attributes = OfferAttributes.from(args);

  return Offer({
    transactionHash,
    attributes,
  });
}

export function pending(transactionHash, description, details) {
  return Offer({
    transactionHash,
    attributes: OfferAttributes.OfferAttributes({ description }),
    details: AsyncContent.loaded(details),
  });
}

export function getDetails(offer) {
  return offer.get('details');
}

export function detailsIsPending(offer) {
  return offer.getIn(['loadDetails', 'status']) === 'pending';
}

export function detailsIsLoaded(offer) {
  return offer.getIn(['loadDetails', 'status']) === 'success';
}

export function getTransactionHash(offer) {
  return offer.get('transactionHash');
}

export function getAttributes(offer) {
  return offer.get('attributes');
}

export function getId(offer) {
  return pipe(getAttributes, OfferAttributes.getId)(offer);
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

export function getThumbnailUrl(offer) {
  const imageHashes = offer.getIn(['loadDetails', 'result', 'imageHashes']);

  if (imageHashes.isEmpty()) return null;

  return `https://ipfs.io/ipfs/${imageHashes.first()}`;
}

export function getDetailedDescription(offer) {
  return offer.getIn(['loadDetails', 'result', 'detailedDescription']);
}

export function isLoadDetailsCompleted(offer) {
  return pipe(getLoadDetails, Operation.isCompleted)(offer);
}

export function setAttributes(offer, attributes) {
  return offer.set('attributes', attributes);
}
