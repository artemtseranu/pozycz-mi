import React from "react";
import { connect } from "react-redux";
import IpfsApi from "ipfs-api";
import { pipe } from "ramda";

import { withStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";

import { requireEthereum } from "Lib/page_utils";

import * as Events from "Events/create_offer";

const styles = (theme) => {
  return {
    card: {
      padding: theme.spacing.unit * 3,
      marginBottom: theme.spacing.unit * 3
    },
    textField: {
      marginBottom: theme.spacing.unit * 1
    },
    secondaryButton: {
      marginTop: theme.spacing.unit
    }
  };
};

class CreateOffer extends React.Component {
  componentDidMount() {
    this.props.dispatch({type: Events.MOUNTED});
  }

  fieldChangeHandler(field) {
    return (event) => {
      this.props.dispatch({type: Events.FIELD_UPDATED, field: field, value: event.target.value});
    };
  }

  handleImageInputChange(event) {
    const ipfs = IpfsApi("localhost", 5001);
    const reader = new FileReader();

    reader.onloadend = () => {
      const buffer = Buffer(reader.result);

      ipfs.files.add(buffer, (error, result) => {
        if (error) {
          console.error(error);
          return;
        }

        if (this.props.imageHashes.includes(result[0].hash)) {
          alert("You've already uploaded this image");
          return;
        }

        this.props.dispatch({type: Events.IMAGE_UPLOADED, hash: result[0].hash});
      });
    };

    reader.readAsArrayBuffer(event.target.files[0]);
  }

  handleSubmit() {
    this.props.dispatch({type: Events.FORM_SUBMITTED});
  }

  render() {
    const { classes, form } = this.props;

    if (form.get("submitStatus") === "processing") {
      return (
        <Card className={classes.card}>
          Waiting on transaction approval...
        </Card>
      );
    }

    const images = this.props.imageHashes.map(hash => {
      const src = `https://ipfs.io/ipfs/${hash}`;
      return (
        <li key={hash}>
          <img src={src} />
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
            value={form.getIn(["fields", "description"])}
            onChange={this.fieldChangeHandler("description").bind(this)}
            className={classes.textField}
            helperText="testing... 1, 2, 3"
          />
          <TextField
            fullWidth
            multiline
            id="description"
            label="Detailed description"
            value={form.getIn(["fields", "detailedDescription"])}
            onChange={this.fieldChangeHandler("detailedDescription").bind(this)}
            className={classes.textField}
          />
        </Card>
        <Card className={classes.card}>
          {images}
          <input type="file" onChange={this.handleImageInputChange.bind(this)} />
        </Card>
        <Button variant="contained" color="primary" onClick={this.handleSubmit.bind(this)}>
          Submit
        </Button>
      </form>
    );
  }
}

function mapStateToProps(state) {
  return {
    form: state.createOffer.get("form"),
    imageHashes: state.createOffer.get("imageHashes")
  };
}

export default pipe(
  withStyles(styles),
  connect(mapStateToProps),
  requireEthereum
)(CreateOffer);
