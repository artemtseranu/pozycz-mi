import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import * as Offer from 'Entities/offer';
import OfferThumbnail from './OfferThumbnail';

const styles = theme => ({
  card: {
    padding: theme.spacing.unit * 2,
  },
});

class OfferComponent extends React.Component { // eslint-disable-line react/prefer-stateless-function, max-len
  render() {
    const { classes } = this.props; // eslint-disable-line react/prop-types
    const { offer } = this.props;

    return (
      <Card className={classes.card}>
        <Grid container>
          <Grid item xs={1}>
            <OfferThumbnail offer={offer} />
          </Grid>
          <Grid item xs={11}>
            <Typography variant="title">
              {Offer.getDescription(offer)}
            </Typography>
          </Grid>
        </Grid>
      </Card>
    );
  }
}

OfferComponent.propTypes = {
  offer: PropTypes.instanceOf(Offer.Offer).isRequired,
};

export default withStyles(styles)(OfferComponent);
