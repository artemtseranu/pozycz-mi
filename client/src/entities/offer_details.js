import { List, Record } from 'immutable';

export const OfferDetails = Record({ // eslint-disable-line import/prefer-default-export
  detailedDescription: '',
  imageHashes: List(),
});

export function from(obj) {
  const imageHashes = List(obj.imageHashes);

  return OfferDetails({
    ...obj,
    imageHashes,
  });
}

export function getImageHashes(details) {
  return details.get('imageHashes');
}
