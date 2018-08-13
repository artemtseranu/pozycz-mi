import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import { pipe } from 'ramda';

import { withStyles } from '@material-ui/core/styles';

import { requireEthereum } from 'Lib/page_utils';

import * as Events from 'Events/my_offers';
import * as MyOffersState from 'Entities/my_offers_state';
import * as OperationState from 'Entities/operation_state';

import CombinedOfferList from './MyOffers/CombinedOfferList';
// import OfferList from './MyOffers/OfferList';

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

  renderCombinedOfferList() {
    const { init } = this.props;

    switch (OperationState.getStatus(init)) {
      case 'pending':
        return (
          <p>
            Loading offer list...
          </p>
        );
      case 'success':
        return <CombinedOfferList />;
      case 'failure':
        return (
          <p>
            Failed to load offer list.
            {OperationState.getErrorMessage(init)}
          </p>
        );
      default:
        throw `Unexpected value: ${OperationState.getStatus(init)}`; // eslint-disable-line no-throw-literal, max-len
    }
  }

  render() {
    const { classes } = this.props; // eslint-disable-line react/prop-types

    // <OfferList
    //   title="Pending offers"
    //   keyFn={offer => Offer.getTransactionHash(offer)}
    //   offers={pendingOffers}
    // />
    // <OfferList
    //   title="Recorded offers"
    //   keyFn={offer => Offer.getId(offer)}
    //   offers={offers}
    //   whenEmpty="You don't have any offers yet"
    //   direction="column-reverse"
    // />

    return (
      <div className={classes.root}>
        {this.renderCombinedOfferList()}
      </div>
    );
  }
}

MyOffers.propTypes = {
  init: PropTypes.instanceOf(OperationState.OperationState).isRequired,
};

function mapStateToProps(state) {
  return {
    init: MyOffersState.getInit(state.myOffers),
  };
}

export default pipe(
  withStyles(styles),
  connect(mapStateToProps),
  requireEthereum,
)(MyOffers);
