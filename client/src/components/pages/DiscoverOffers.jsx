import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { List } from 'immutable';
import { pipe } from 'ramda';

import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import NativeSelect from '@material-ui/core/NativeSelect';
import Typography from '@material-ui/core/Typography';

import { requireEthereum } from 'Lib/page_utils';

import { getInitStatus, getInitErrorMessage } from 'Entities/discover_offers_page';
import * as Offer from 'Entities/offer';
import * as OfferCache from 'Entities/offer_cache_state';

import * as Events from 'Events/discover_offers';

import OfferCardList from 'Components/OfferCardList';

import OfferCard from './DiscoverOffers/OfferCard';

const styles = theme => ({
  loadMoreControls: {
    marginTop: theme.spacing.unit * 2,
  },
  numberOfBlocksToLoadSelect: {
    width: 200,
    marginLeft: theme.spacing.unit * 2,
  },
});

class DiscoverOffers extends React.Component {
  constructor() {
    super();
    this.handleLoadMoreClick = this.handleLoadMoreClick.bind(this);
    this.handleNumberOfBlocksToLoadChange = this.handleNumberOfBlocksToLoadChange.bind(this);
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: Events.MOUNTED });
  }

  handleLoadMoreClick() {
    const { dispatch } = this.props;
    dispatch({ type: Events.LOAD_MORE_OFFERS_REQUESTED });
  }

  handleNumberOfBlocksToLoadChange(event) {
    const { dispatch } = this.props;
    dispatch({ type: Events.NUMBER_OF_BLOCKS_TO_LOAD_CHANGED, value: event.target.value });
  }

  renderLoadMoreControls() {
    const {
      classes,
      earliestBlock,
      loadMoreOffersStatus,
      numberOfBlocksToLoad,
    } = this.props;

    if (earliestBlock === 0) {
      return <React.Fragment />;
    }

    if (loadMoreOffersStatus === 'inProgress') {
      return (
        <Typography>
          Loading...
        </Typography>
      );
    }

    return (
      <React.Fragment>
        <Button variant="outlined" onClick={this.handleLoadMoreClick}>
          Load offers from earlier blocks
        </Button>
        <FormControl className={classes.numberOfBlocksToLoadSelect}>
          <InputLabel htmlFor="number-of-blocks-to-load">
            Number of blocks to load
          </InputLabel>
          <NativeSelect
            value={numberOfBlocksToLoad}
            inputProps={{ id: 'number-of-blocks-to-load' }}
            onChange={this.handleNumberOfBlocksToLoadChange}
          >
            <option value={1}>
              1
            </option>
            <option value={3}>
              3
            </option>
            <option value={10}>
              10
            </option>
            <option value={100}>
              100
            </option>
          </NativeSelect>
        </FormControl>
      </React.Fragment>
    );
  }

  render() {
    const {
      classes,
      initStatus,
      initErrorMessage,
      offers,
    } = this.props;

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
          <React.Fragment>
            <OfferCardList
              offers={offers}
              OfferCardComponent={OfferCard}
              keyFn={Offer.getId}
              direction="column-reverse"
              whenEmpty="No offers found"
            />
            <div className={classes.loadMoreControls}>
              {this.renderLoadMoreControls()}
            </div>
          </React.Fragment>
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
  classes: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  initStatus: PropTypes.string.isRequired,
  initErrorMessage: PropTypes.string.isRequired,
  offers: PropTypes.instanceOf(List).isRequired,
  loadMoreOffersStatus: PropTypes.string.isRequired,
  numberOfBlocksToLoad: PropTypes.number.isRequired,
  earliestBlock: PropTypes.number,
};

DiscoverOffers.defaultProps = {
  earliestBlock: 0,
};

function mapStateToProps(state) {
  return {
    initStatus: getInitStatus(state.discoverOffers),
    initErrorMessage: getInitErrorMessage(state.discoverOffers),
    offers: OfferCache.getOffers(state.offerCache),
    loadMoreOffersStatus: state.discoverOffers.getIn(['loadMoreOffers', 'status']),
    numberOfBlocksToLoad: state.discoverOffers.get('numberOfBlocksToLoad'),
    earliestBlock: state.offerCache.get('earliestBlock'),
  };
}

export default pipe(
  withStyles(styles),
  connect(mapStateToProps),
  requireEthereum,
)(DiscoverOffers);
