import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import { pipe } from 'ramda';
import { List } from 'immutable';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';

import { requireEthereum } from 'Lib/page_utils';

import * as Events from 'Events/my_offers';
import * as MyOffersState from 'Entities/my_offers_state';
import * as Offer from 'Entities/offer';
import * as OfferCacheState from 'Entities/offer_cache_state';

import OfferComponent from './MyOffers/Offer';

const styles = {
  root: {
    flexGrow: 1,
  },
  flex: {
    flexGrow: 1,
  },
};

class MyOffers extends React.Component {
  componentDidMount() {
    const { dispatch } = this.props; // eslint-disable-line react/prop-types

    dispatch({ type: Events.MOUNTED });
  }

  handleCreateOfferClick() {
    const { dispatch } = this.props; // eslint-disable-line react/prop-types
    // TODO: Use constant
    dispatch(push('/create-offer'));
  }

  render() {
    const { classes } = this.props; // eslint-disable-line react/prop-types
    const { offers } = this.props;

    if (offers.count() === 0) {
      return (
        <div className={classes.root}>
          <p>
            You don&#39;t have any offers yet
          </p>
        </div>
      );
    }

    const offerElements = offers.map(offer => (
      <Grid item key={Offer.getId(offer)}>
        <OfferComponent offer={offer} />
      </Grid>
    ));

    return (
      <div className={classes.root}>
        <Grid container spacing={16} direction="column-reverse">
          {offerElements}
        </Grid>
      </div>
    );
  }
}

MyOffers.propTypes = {
  offers: PropTypes.instanceOf(List).isRequired,
};

function mapStateToProps(state) {
  const offerIds = MyOffersState.getOfferIds(state.myOffers);
  const offers = OfferCacheState.getOffers(state.offerCache, offerIds);

  return {
    offers,
  };
}

export default pipe(
  withStyles(styles),
  connect(mapStateToProps),
  requireEthereum,
)(MyOffers);
