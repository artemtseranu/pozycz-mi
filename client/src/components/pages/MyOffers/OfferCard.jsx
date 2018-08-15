import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { pipe } from 'ramda';

import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import UnfoldMoreIcon from '@material-ui/icons/UnfoldMore';
import UnfoldLessIcon from '@material-ui/icons/UnfoldLess';
import DeleteIcon from '@material-ui/icons/Delete';

import * as Offer from 'Entities/offer';

import OfferThumbnail from 'Components/OfferCardThumbnail';
import OfferDetails from 'Components/OfferCardDetails';

const styles = theme => ({
  card: {
    padding: theme.spacing.unit * 1,
  },
});

class OfferCard extends React.Component {
  constructor() {
    super();

    this.state = {
      isDetailsOpen: false,
    };

    this.showDetails = this.showDetails.bind(this);
    this.hideDetails = this.hideDetails.bind(this);
  }

  showDetails() {
    this.setState(state => ({ ...state, isDetailsOpen: true }));
  }

  hideDetails() {
    this.setState(state => ({ ...state, isDetailsOpen: false }));
  }

  renderToggleDetailsButton() {
    const { offer } = this.props;

    if (!Offer.isLoadDetailsCompleted(offer)) {
      return (
        <Button mini disabled>
          Loading details...
        </Button>
      );
    }

    const { isDetailsOpen } = this.state;

    if (isDetailsOpen) {
      return (
        <Button mini onClick={this.hideDetails}>
          <UnfoldLessIcon />
          Hide Details
        </Button>
      );
    }

    return (
      <Button mini onClick={this.showDetails}>
        <UnfoldMoreIcon />
        Show Details
      </Button>
    );
  }

  renderDetails() {
    const { isDetailsOpen } = this.state;
    const { offer } = this.props;

    if (!isDetailsOpen) return <React.Fragment />;

    return (
      <Grid item xs={12}>
        <OfferDetails offer={offer} />
      </Grid>
    );
  }

  render() {
    const { classes } = this.props; // eslint-disable-line react/prop-types
    const { offer } = this.props;

    return (
      <Card className={classes.card}>
        <Grid container spacing={8}>
          <Grid item xs={12}>
            <Grid container spacing={8}>
              <Grid item>
                <OfferThumbnail offer={offer} />
              </Grid>
              <Grid item>
                <Grid container spacing={8}>
                  <Grid item xs={12}>
                    <Typography variant="title">
                      {Offer.getDescription(offer)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    {this.renderToggleDetailsButton()}
                    <Button mini onClick={this.handleClickDelete}>
                      <DeleteIcon />
                      Delete
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          {this.renderDetails()}
        </Grid>
      </Card>
    );
  }
}

OfferCard.propTypes = {
  offer: PropTypes.instanceOf(Offer.Offer).isRequired,
};

export default pipe(
  withStyles(styles),
  connect(),
)(OfferCard);
