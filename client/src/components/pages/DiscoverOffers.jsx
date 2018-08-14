import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { pipe } from 'ramda';

import Typography from '@material-ui/core/Typography';

import { requireEthereum } from 'Lib/page_utils';

import { getInitStatus, getInitErrorMessage } from 'Entities/discover_offers_page';

import * as Events from 'Events/discover_offers';

class DiscoverOffers extends React.Component {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: Events.MOUNTED });
  }

  render() {
    const { initStatus, initErrorMessage } = this.props;

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
          <Typography>
            Offers
          </Typography>
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
};

function mapStateToProps(state) {
  return {
    initStatus: getInitStatus(state.discoverOffers),
    initErrorMessage: getInitErrorMessage(state.discoverOffers),
  };
}

export default pipe(
  connect(mapStateToProps),
  requireEthereum,
)(DiscoverOffers);
