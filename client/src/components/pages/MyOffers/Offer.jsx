import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import { Offer as OfferRecord } from 'Reducers/my_offers';
import { bytes32ToMultihash } from 'Lib/ipfs_utils';

const styles = theme => ({
  card: {
    padding: theme.spacing.unit * 2,
  },
});

class Offer extends React.Component { // eslint-disable-line react/prefer-stateless-function
  render() {
    const { classes } = this.props; // eslint-disable-line react/prop-types
    const { offer } = this.props;

    return (
      <Card className={classes.card}>
        <Grid container>
          <Grid item xs={12}>
            {offer.get('transactionStatus') === 'pending' ? 'pending...' : offer.get('id')}
          </Grid>
          <Grid item xs={12}>
            <Typography variant="title">
              {offer.getIn(['attributes', 'description'])}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography>
              {bytes32ToMultihash(offer.getIn(['attributes', 'details']))}
            </Typography>
          </Grid>
        </Grid>
      </Card>
    );
  }
}

Offer.propTypes = {
  offer: PropTypes.instanceOf(OfferRecord).isRequired,
};

export default withStyles(styles)(Offer);
