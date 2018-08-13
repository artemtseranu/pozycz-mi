import { Record } from 'immutable';

export const OfferAttributes = Record({
  id: 0,
  description: '',
  details: '',
});

export function from(attributes) {
  const id = parseInt(attributes.id, 10);
  return OfferAttributes({ ...attributes, id });
}

export function getId(attirbutes) {
  return attirbutes.get('id');
}
