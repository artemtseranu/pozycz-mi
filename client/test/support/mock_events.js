export function mockOfferCreated({ id, description }) {
  return {
    event: 'OfferCreated',
    args: {
      id,
      description,
    },
  };
}

export function mockOfferDeleted(id) {
  return {
    event: 'OfferDeleted',
    args: {
      id,
    },
  };
}
