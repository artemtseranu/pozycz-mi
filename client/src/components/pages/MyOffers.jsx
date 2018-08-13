import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import { pipe } from 'ramda';
import { List } from 'immutable';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';

import { requireEthereum } from 'Lib/page_utils';
import { currentAccount } from 'Lib/ethereum_utils';

import * as Events from 'Events/my_offers';

import Offer from './MyOffers/Offer';

const styles = {
  root: {
    flexGrow: 1,
  },
  flex: {
    flexGrow: 1,
  },
};

class MyOffers extends React.Component {
  constructor() {
    super();
    this.state = {};
  }

  componentDidMount() {
    const { dispatch, offersContract } = this.props; // eslint-disable-line react/prop-types

    const offerCreated = offersContract.OfferCreated(
      { owner: currentAccount() },
      { fromBlock: 0 },
      (error, event) => {
        if (!error) {
          dispatch({
            type: Events.OFFER_CREATED,
            transactionHash: event.transactionHash,
            id: parseInt(event.args.id, 10),
            attributes: event.args,
          });
        }
      },
    );

    this.state.offerCreated = offerCreated;
  }

  componentWillUnmount() {
    const { offerCreated } = this.state;
    offerCreated.stopWatching();
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
            You don&quot;t have any offers yet
          </p>
        </div>
      );
    }

    const offerElements = offers.map(offer => (
      <Grid item key={offer.get('id')}>
        <Offer offer={offer} />
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
  return {
    offersContract: state.eth.getIn(['contracts', 'offers']),
    offers: state.myOffers.get('offers'),
  };
}

export default pipe(
  withStyles(styles),
  connect(mapStateToProps),
  requireEthereum,
)(MyOffers);
