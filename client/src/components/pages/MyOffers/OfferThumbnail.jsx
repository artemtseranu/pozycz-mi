import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';

import * as Offer from 'Entities/offer';

const styles = theme => ({ // eslint-disable-line no-unused-vars
  container: {
    width: 50,
    height: 50,
    maxWidth: 50,
    maxHeight: 50,
    textAlign: 'center',
    padding: 5,
    border: '1px solid grey',
  },
  noImage: {
    backgroundColor: 'grey',
    width: '100%',
    height: '100%',
  },
  image: {
    maxWidth: '100%',
    maxHeight: '100%',
  },
});

class OfferThumbnail extends React.Component { // eslint-disable-line react/prefer-stateless-function, max-len
  renderImage() {
    const { classes } = this.props; // eslint-disable-line react/prop-types, no-unused-vars
    const { offer } = this.props;

    if (!Offer.detailsIsLoaded(offer) || !Offer.getThumbnailUrl(offer)) {
      return (<div className={classes.noImage} />);
    }

    return (<img src={Offer.getThumbnailUrl(offer)} alt="" className={classes.image} />);
  }

  render() {
    const { classes } = this.props; // eslint-disable-line react/prop-types, no-unused-vars

    return (
      <div className={classes.container}>
        {this.renderImage()}
      </div>
    );
  }
}

OfferThumbnail.propTypes = {
  offer: PropTypes.instanceOf(Offer.Offer).isRequired,
};

export default withStyles(styles)(OfferThumbnail);
