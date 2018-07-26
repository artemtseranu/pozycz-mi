import React from "react";
import { connect } from "react-redux";

import * as events from "Events/offers";

class CreateForm extends React.Component {
  onDetailsChange(event) {
    const updates = {details: event.target.value};
    this.props.dispatch({type: events.CREATE_FORM_UPDATED, updates});
  }

  onSubmit(event) {
    event.preventDefault();
    this.props.dispatch({type: events.CREATE_FORM_SUBMITTED});
  }

  render() {
    if (this.props.isBlocked) {
      return (<div>Busy... Please wait</div>);
    }

    return (
      <form onSubmit={this.onSubmit.bind(this)}>
        <label htmlFor="offers/create-form/details">Details</label><br />
        <input
          id="offers/create-form/details"
          type="text"
          value={this.props.form.get("details")}
          onChange={this.onDetailsChange.bind(this)}
        /><br />
        <button>Send Transaction</button>
      </form>
    );
  }
}

function mapStateToProps(state) {
  return {
    isBlocked: state.app.get("isBlockingOperationInProgress"),
    form: state.offers.get("createForm")
  };
}

export default connect(mapStateToProps)(CreateForm);
