import React from "react";
import { connect } from "react-redux";

import CreateForm from "./offers/CreateForm";

class Offers extends React.Component {
  constructor() {
    super();
    this.state = {};
  }

  componentDidMount() {
    const owner = window.web3.eth.accounts[0];
    const offerCreatedEvent = this.props.offersContract.OfferCreated({_owner: owner}, {fromBlock: 0});
    offerCreatedEvent.watch((error, result) => {
      if (!error) {
        console.log(result.args.details);
      }
    });
    this.state.offerCreatedEvent = offerCreatedEvent;
  }

  componentWillUnmount() {
    this.state.offerCreatedEvent.stopWatching();
  }

  render() {
    return (
      <div>
        <p>
          Welcome!
        </p>
        <p>
          Offers Contract Address: {this.props.offersContract.address}
        </p>
        <p>
          <i>Latest offer:</i><br />
          Owner: {this.props.latestOffer.get("owner")}<br />
          Open: {this.props.latestOffer.get("isOpen") ? "Yes" : "No"}<br />
          Details: {this.props.latestOffer.get("details")}<br />
        </p>
        <div>
          <i>Create Offer</i>
          <CreateForm />
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    offersContract: state.app.getIn(["contracts", "offers"]),
    latestOffer: state.app.get("latestOffer")
  };
}

export default connect(mapStateToProps)(Offers);
