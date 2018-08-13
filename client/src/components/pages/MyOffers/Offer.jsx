import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { pipe } from 'ramda';

import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import * as Offer from 'Entities/offer';
import * as Events from 'Events/my_offers';

import OfferThumbnail from './OfferThumbnail';
import OfferDetails from './OfferDetails';

const styles = theme => ({
  card: {
    padding: theme.spacing.unit * 1,
  },
});

class OfferComponent extends React.Component { // eslint-disable-line react/prefer-stateless-function, max-len
  componentDidMount() {
    const { dispatch } = this.props; // eslint-disable-line react/prop-types
    const { offer } = this.props;
    const id = Offer.getId(offer);

    if (id) dispatch({ type: Events.OFFER_MOUNTED, id });
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
              <Grid>
                <Typography variant="title">
                  {Offer.getDescription(offer)}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <OfferDetails offer={offer} />
          </Grid>
        </Grid>
      </Card>
    );
  }
}

OfferComponent.propTypes = {
  offer: PropTypes.instanceOf(Offer.Offer).isRequired,
};

export default pipe(
  withStyles(styles),
  connect(),
)(OfferComponent);
