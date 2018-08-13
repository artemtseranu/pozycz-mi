import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import * as Offer from 'Entities/offer';

const styles = theme => ({
  card: {
    padding: theme.spacing.unit * 2,
  },
});

class OfferComponent extends React.Component { // eslint-disable-line react/prefer-stateless-function
  render() {
    const { classes } = this.props; // eslint-disable-line react/prop-types
    const { offer } = this.props;

    return (
      <Card className={classes.card}>
        <Grid container>
          <Grid item xs={12}>
            {offer.get('transactionStatus') === 'pending' ? 'pending...' : Offer.getId(offer)}
          </Grid>
          <Grid item xs={12}>
            <Typography variant="title">
              {Offer.getDescription(offer)}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography>
              {Offer.getDetailsMultihash(offer)}
            </Typography>
          </Grid>
        </Grid>
      </Card>
    );
  }
}

Offer.propTypes = {
  offer: PropTypes.instanceOf(Offer.Offer).isRequired,
};

export default withStyles(styles)(OfferComponent);
