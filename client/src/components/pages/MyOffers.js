import React from "react";
import { connect } from "react-redux";
import { push } from "connected-react-router";
import { pipe } from "ramda";

import { withStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";

import { requireEthereum } from "Lib/page_utils";
import { currentAccount } from "Lib/ethereum_utils";

import * as Events from "Events/my_offers";

import Offer from "./MyOffers/Offer";

const styles = {
  root: {
    flexGrow: 1
  },
  flex: {
    flexGrow: 1
  }
};

class MyOffers extends React.Component {
  constructor() {
    super();
    this.state = {};
  }

  componentDidMount() {
    const offerCreated = this.props.offersContract.OfferCreated(
      {owner: currentAccount()},
      {fromBlock: 0},
      (error, event) => {
        if (!error) {
          this.props.dispatch({
            type: Events.OFFER_CREATED,
            transactionHash: event.transactionHash,
            id: parseInt(event.args.id),
            attributes: event.args
          })
        }
      }
    );

    this.state.offerCreated = offerCreated;
  }

  componentWillUnmount() {
    this.state.offerCreated.stopWatching();
  }

  handleCreateOfferClick() {
    this.props.dispatch(push("/create-offer"));
  }

  render() {
    const { classes } = this.props;

    if (this.props.offers.count() === 0) {
      return (
        <div className={classes.root}>
          <p>
            You don't have any offers yet
          </p>
        </div>
      );
    }

    const offers = this.props.offers.map((offer) => {
      return (
        <Grid item key={offer.get("id")}>
          <Offer offer={offer} />
        </Grid>
      );
    });

    return (
      <div className={classes.root}>
        <Grid container spacing={16} direction="column-reverse">
          {offers}
        </Grid>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    offersContract: state.eth.getIn(["contracts", "offers"]),
    offers: state.myOffers.get("offers")
  };
}

// export default requireEthereum(connect(mapStateToProps)(withStyles(styles)(MyOffers)));
export default pipe(
  withStyles(styles),
  connect(mapStateToProps),
  requireEthereum
)(MyOffers)
