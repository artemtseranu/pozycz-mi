import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { List } from 'immutable';
import { pipe } from 'ramda';

import Typography from '@material-ui/core/Typography';

import { requireEthereum } from 'Lib/page_utils';

import { getInitStatus, getInitErrorMessage } from 'Entities/discover_offers_page';
import * as Offer from 'Entities/offer';
import * as OfferCache from 'Entities/offer_cache_state';

import * as Events from 'Events/discover_offers';

import OfferCardList from 'Components/OfferCardList';

class DiscoverOffers extends React.Component {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: Events.MOUNTED });
  }

  render() {
    const { initStatus, initErrorMessage, offers } = this.props;

    switch (initStatus) {
      case 'pending':
      case 'inProgress':
        return (
          <Typography>
            Initializing page...
          </Typography>
        );
      case 'success':
        return (
          <OfferCardList offers={offers} keyFn={Offer.getId} direction="column-reverse" />
        );
      case 'failure':
        return (
          <Typography>
            Failed to initialize page.
            { initErrorMessage }
          </Typography>
        );
      default:
        throw Error(`Unexpected value: ${initStatus}`);
    }
  }
}

DiscoverOffers.propTypes = {
  dispatch: PropTypes.func.isRequired,
  initStatus: PropTypes.string.isRequired,
  initErrorMessage: PropTypes.string.isRequired,
  offers: PropTypes.instanceOf(List).isRequired,
};

function mapStateToProps(state) {
  return {
    initStatus: getInitStatus(state.discoverOffers),
    initErrorMessage: getInitErrorMessage(state.discoverOffers),
    offers: OfferCache.getOffers(state.offerCache),
  };
}

export default pipe(
  connect(mapStateToProps),
  requireEthereum,
)(DiscoverOffers);
