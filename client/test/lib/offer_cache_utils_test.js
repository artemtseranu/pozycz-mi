/* eslint-env mocha */
import { parseEvents } from 'Lib/offer_cache_utils';

import chai, { expect } from 'chai';
import chaiImmutable from 'chai-immutable';
import { List, Set } from 'immutable';

import { mockOfferCreated, mockOfferDeleted } from 'TestSupport/mock_events';

import * as Offer from 'Entities/offer';

chai.use(chaiImmutable);

describe('parseEvents', () => {
  const pragprogCreated = mockOfferCreated({ id: 11, description: 'Book: Pragmatic Programmer' });
  const drillCreated = mockOfferCreated({ id: 12, description: 'Drill' });
  const cleanCodeCreated = mockOfferCreated({ id: 13, description: 'Book: Clean Code' });
  const botwCreated = mockOfferCreated({ id: 14, description: 'Legend of Zelda: Breath of the Wild' });
  const designPatternsCreated = mockOfferCreated({ id: 15, description: 'Book: Design Patterns' });
  const drillDeleted = mockOfferDeleted(12);
  const veryOldOfferDeleted = mockOfferDeleted(5);

  const offerCreatedEvents = [
    pragprogCreated,
    drillCreated,
    cleanCodeCreated,
    botwCreated,
    designPatternsCreated,
  ];

  const offerDeletedEvents = [
    drillDeleted,
    veryOldOfferDeleted,
  ];

  const deletedOfferIds = Set([14]);

  function subject() {
    return parseEvents({
      offerCreatedEvents,
      offerDeletedEvents,
      deletedOfferIds,
    });
  }

  it('returns offers that should be added to the cache', () => {
    const result = subject();
    const pragprog = result.getIn(['offers', 11]);
    expect(Offer.getDescription(pragprog)).to.equal('Book: Pragmatic Programmer');
    const cleanCode = result.getIn(['offers', 13]);
    expect(Offer.getDescription(cleanCode)).to.equal('Book: Clean Code');
  });

  it('returns IDs of offers that should be added to the cache', () => {
    const actual = subject().get('offerIds');
    const expected = List([11, 13, 15]);
    expect(actual).to.equal(expected);
  });

  it('returns updated set of deleted offer IDs', () => {
    const actual = subject().get('deletedOfferIds');
    const expected = Set([5]);
    expect(actual).to.equal(expected);
  });
});
