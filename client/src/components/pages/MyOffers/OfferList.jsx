import React from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import OfferComponent from './Offer';

const styles = {

};

class OfferList extends React.Component { // eslint-disable-line react/prefer-stateless-function, max-len
  render() {
    const { classes } = this.props; // eslint-disable-line react/prop-types, no-unused-vars

    const {
      title, keyFn, offers, whenEmpty, direction,
    } = this.props;

    if (offers.isEmpty()) {
      if (whenEmpty) {
        return (
          <React.Fragment>
            <Typography variant="headline">
              {title}
            </Typography>
            <p>
              {whenEmpty}
            </p>
          </React.Fragment>
        );
      }

      return <React.Fragment />;
    }

    const offerComponents = offers.map(offer => (
      <Grid item key={keyFn(offer)} xs={12}>
        <OfferComponent offer={offer} />
      </Grid>
    ));

    return (
      <React.Fragment>
        <Typography variant="headline">
          {title}
        </Typography>
        <Grid container spacing={16} direction={direction}>
          {offerComponents}
        </Grid>
      </React.Fragment>
    );
  }
}

OfferList.propTypes = {
  title: PropTypes.string.isRequired,
  keyFn: PropTypes.func.isRequired,
  offers: PropTypes.instanceOf(List).isRequired,
  whenEmpty: PropTypes.string,
  direction: PropTypes.string,
};

OfferList.defaultProps = {
  whenEmpty: '',
  direction: 'column',
};

export default withStyles(styles)(OfferList);
