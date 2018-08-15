import React from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

const OfferCardList = (props) => {
  const {
    OfferCardComponent,
    offers,
    keyFn,
    title,
    whenEmpty,
    direction,
  } = props;

  let titleElem;

  if (title) {
    titleElem = (
      <Typography variant="headline">
        {title}
      </Typography>
    );
  }

  if (offers.isEmpty()) {
    if (whenEmpty) {
      return (
        <React.Fragment>
          {titleElem}
          <Typography>
            {whenEmpty}
          </Typography>
        </React.Fragment>
      );
    }

    return <React.Fragment />;
  }

  const offerCards = offers.map(offer => (
    <Grid item key={keyFn(offer)} xs={12}>
      <OfferCardComponent offer={offer} />
    </Grid>
  ));

  return (
    <React.Fragment>
      {titleElem}
      <Grid container spacing={16} direction={direction}>
        {offerCards}
      </Grid>
    </React.Fragment>
  );
};

OfferCardList.propTypes = {
  offers: PropTypes.instanceOf(List).isRequired,
  OfferCardComponent: PropTypes.func.isRequired,
  title: PropTypes.string,
  keyFn: PropTypes.func.isRequired,
  whenEmpty: PropTypes.string,
  direction: PropTypes.string,
};

OfferCardList.defaultProps = {
  title: undefined,
  whenEmpty: '',
  direction: 'column',
};

export default OfferCardList;
