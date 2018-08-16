import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import { pipe } from 'ramda';

import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';

import { requireEthereum } from 'Lib/page_utils';

import * as Events from 'Events/my_offers';
import * as MyOffersState from 'Entities/my_offers_state';
import * as OperationState from 'Entities/operation_state';

import CombinedOfferList from './MyOffers/CombinedOfferList';

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
    this.handleDeleteOfferCancel = this.handleDeleteOfferCancel.bind(this);
    this.handleDeleteOfferConfirm = this.handleDeleteOfferConfirm.bind(this);
  }

  componentDidMount() {
    const { dispatch } = this.props;

    dispatch({ type: Events.MOUNTED });
  }

  handleCreateOfferClick() {
    const { dispatch } = this.props;
    // TODO: Use constant
    dispatch(push('/create-offer'));
  }

  handleDeleteOfferCancel() {
    const { dispatch } = this.props;
    dispatch({ type: Events.DELETE_OFFER_CANCELLED });
  }

  handleDeleteOfferConfirm() {
    const { dispatch } = this.props;
    dispatch({ type: Events.DELETE_OFFER_CONFIRMED });
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
    const { classes, isDeleteOfferConfirmationOpen } = this.props;

    return (
      <div className={classes.root}>
        {this.renderCombinedOfferList()}
        <Dialog
          open={isDeleteOfferConfirmationOpen}
          onClose={this.handleDeleteOfferCancel}
        >
          <DialogContent>
            <DialogContentText>
              Really delete offer?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button color="primary" onClick={this.handleDeleteOfferCancel}>
              Cancel
            </Button>
            <Button color="secondary" onClick={this.handleDeleteOfferConfirm}>
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

MyOffers.propTypes = {
  classes: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  init: PropTypes.instanceOf(OperationState.OperationState).isRequired,
  isDeleteOfferConfirmationOpen: PropTypes.bool.isRequired,
};

function mapStateToProps(state) {
  return {
    init: MyOffersState.getInit(state.myOffers),
    isDeleteOfferConfirmationOpen: MyOffersState.isDeleteOfferConfirmationOpen(state.myOffers),
  };
}

export default pipe(
  withStyles(styles),
  connect(mapStateToProps),
  requireEthereum,
)(MyOffers);
