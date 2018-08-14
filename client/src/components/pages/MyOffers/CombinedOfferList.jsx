import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { List } from 'immutable';
import { pipe } from 'ramda';

import { withStyles } from '@material-ui/core/styles';

import * as Offer from 'Entities/offer';
import * as OfferCacheState from 'Entities/offer_cache_state';
import OfferCardList from 'Components/OfferCardList';

const styles = {

};

class CombinedOfferList extends React.Component {
  render() {
    const { classes } = this.props; // eslint-disable-line react/prop-types, no-unused-vars
    const { offers, pendingOffers } = this.props;

    return (
      <React.Fragment>
        <OfferCardList
          title="Pending offers"
          keyFn={offer => Offer.getTransactionHash(offer)}
          offers={pendingOffers}
        />
        <OfferCardList
          title="Recorded offers"
          keyFn={offer => Offer.getId(offer)}
          offers={offers}
          whenEmpty="You don't have any offers yet"
          direction="column-reverse"
        />
      </React.Fragment>
    );
  }
}

CombinedOfferList.propTypes = {
  offers: PropTypes.instanceOf(List).isRequired,
  pendingOffers: PropTypes.instanceOf(List).isRequired,
};

function mapStateToProps(state) {
  return {
    offers: OfferCacheState.getMyOffers(state.offerCache),
    pendingOffers: OfferCacheState.getPendingOffers(state.offerCache),
  };
}

export default pipe(
  withStyles(styles),
  connect(mapStateToProps),
)(CombinedOfferList);
