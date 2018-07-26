import React from "react";
import { connect } from "react-redux";

import { withStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";

import * as Events from "Events/create_offer";

const styles = (theme) => {
  return {
    card: {
      padding: theme.spacing.unit * 3
    },
    textField: {
      marginBottom: theme.spacing.unit * 2
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

    return (
      <form>
        <Card className={classes.card}>
          <TextField
            fullWidth
            id="description"
            label="Description"
            value={form.getIn(["fields", "description"])}
            onChange={this.fieldChangeHandler("description").bind(this)}
            className={classes.textField}
          />
          <Button variant="contained" color="primary" onClick={this.handleSubmit.bind(this)}>
            Submit
          </Button>
        </Card>
      </form>
    );
  }
}

function mapStateToProps(state) {
  return {
    form: state.createOffer.get("form")
  };
}

export default connect(mapStateToProps)(withStyles(styles)(CreateOffer));
