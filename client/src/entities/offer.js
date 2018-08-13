import { Record } from 'immutable';
import { pipe } from 'ramda';

import { bytes32ToMultihash } from 'Lib/ipfs_utils';
import * as AsyncContent from './async_content';
import * as OfferDetails from './offer_details';
import * as OfferAttributes from './offer_attributes';

export const Offer = Record({
  transactionHash: '',
  attributes: OfferAttributes.OfferAttributes(),
  details: AsyncContent.AsyncContent(),
});

// TODO: REMOVE
export function fromOfferCreatedEvent(event) {
  const id = parseInt(event.args.id, 10);
  const attributes = OfferAttributes({ ...event.args, id });

  return Offer({
    attributes,
  });
}

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

export function detailsLoaded(offer) {
  return pipe(getDetails, AsyncContent.isLoaded)(offer);
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
  const imageHashes = pipe(getDetails, AsyncContent.getContent, OfferDetails.getImageHashes)(offer);

  if (imageHashes.isEmpty()) return null;

  return `https://ipfs.io/ipfs/${imageHashes.first()}`;
}

export function setAttributes(offer, attributes) {
  return offer.set('attributes', attributes);
}
