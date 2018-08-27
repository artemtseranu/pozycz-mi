import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import IpfsApi from 'ipfs-api';
import { pipe } from 'ramda';
import { Map, List } from 'immutable';

import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import Typography from '@material-ui/core/Typography';

import { requireEthereum } from 'Lib/page_utils';

import * as Events from 'Events/create_offer';

const styles = theme => ({
  card: {
    padding: theme.spacing.unit * 3,
    marginBottom: theme.spacing.unit * 3,
  },
  textField: {
    marginBottom: theme.spacing.unit * 1,
  },
  secondaryButton: {
    marginTop: theme.spacing.unit,
  },
});

class CreateOffer extends React.Component {
  constructor() {
    super();

    this.handleImageInputChange = this.handleImageInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    const { dispatch } = this.props; // eslint-disable-line react/prop-types
    dispatch({ type: Events.MOUNTED });
  }

  fieldChangeHandler(field) {
    const { dispatch } = this.props; // eslint-disable-line react/prop-types

    return (event) => {
      dispatch({ type: Events.FIELD_UPDATED, field, value: event.target.value });
    };
  }

  handleImageInputChange(event) {
    const { dispatch } = this.props; // eslint-disable-line react/prop-types
    const { imageHashes } = this.props;
    // TODO: Use utils
    const ipfs = IpfsApi('localhost', 5001);
    const reader = new FileReader();

    reader.onloadend = () => {
      const buffer = Buffer.from(reader.result);

      ipfs.files.add(buffer, (error, result) => {
        if (error) {
          // TODO: Handle this
          return;
        }

        if (imageHashes.includes(result[0].hash)) {
          // TODO: Show alert?
          return;
        }

        dispatch({ type: Events.IMAGE_UPLOADED, hash: result[0].hash });
      });
    };

    reader.readAsArrayBuffer(event.target.files[0]);
  }

  handleSubmit() {
    const { dispatch } = this.props; // eslint-disable-line react/prop-types
    dispatch({ type: Events.FORM_SUBMITTED });
  }

  render() {
    const { classes } = this.props; // eslint-disable-line react/prop-types
    const { form, imageHashes } = this.props;

    if (form.get('submitStatus') === 'processing') {
      return (
        <p>
          Waiting on transaction approval...
        </p>
      );
    }

    const images = imageHashes.map((hash) => {
      const src = `https://ipfs.io/ipfs/${hash}`;
      return (
        <li key={hash}>
          <img src={src} alt={hash} />
        </li>
      );
    });

    return (
      <form>
        <Card className={classes.card}>
          <TextField
            fullWidth
            id="description"
            label="Short description"
            value={form.getIn(['fields', 'description'])}
            onChange={this.fieldChangeHandler('description')}
            className={classes.textField}
            helperText="testing... 1, 2, 3"
          />
          <TextField
            fullWidth
            multiline
            id="description"
            label="Detailed description"
            value={form.getIn(['fields', 'detailedDescription'])}
            onChange={this.fieldChangeHandler('detailedDescription')}
            className={classes.textField}
          />
        </Card>
        <Card className={classes.card}>
          <Typography>
            Upload images
          </Typography>
          {images}
          <input type="file" onChange={this.handleImageInputChange} />
        </Card>
        <Button variant="contained" color="primary" onClick={this.handleSubmit}>
          Submit
        </Button>
      </form>
    );
  }
}

CreateOffer.propTypes = {
  form: PropTypes.instanceOf(Map).isRequired,
  imageHashes: PropTypes.instanceOf(List).isRequired,
};

function mapStateToProps(state) {
  return {
    form: state.createOffer.get('form'),
    imageHashes: state.createOffer.get('imageHashes'),
  };
}

export default pipe(
  withStyles(styles),
  connect(mapStateToProps),
  requireEthereum,
)(CreateOffer);
