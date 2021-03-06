import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import * as Offer from 'Entities/offer';

const styles = () => ({
});

const OfferDetails = (props) => {
  const { offer } = props;

  if (Offer.detailsIsLoaded(offer)) {
    return (
      <Typography>
        {Offer.getDetailedDescription(offer)}
      </Typography>
    );
  }

  if (offer.getIn(['loadDetails', 'status']) === 'failure') {
    return (
      <Typography>
        Failed to load offer details from IPFS.
        {offer.getIn(['loadDetails', 'errorMessage'])}
      </Typography>
    );
  }

  return (
    <Typography>
      Loading details...
    </Typography>
  );
};

OfferDetails.propTypes = {
  offer: PropTypes.instanceOf(Offer.Offer).isRequired,
};

export default withStyles(styles)(OfferDetails);
