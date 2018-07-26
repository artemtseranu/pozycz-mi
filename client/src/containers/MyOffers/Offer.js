import React from "react";
import PropTypes from "prop-types";

import { withStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";

const styles = (theme) => {
  return {
    card: {
      padding: theme.spacing.unit * 2
    }
  };
};

class Offer extends React.Component {
  render() {
    const { classes, offer } = this.props;

    return (
      <Card className={classes.card}>
        <Grid container>
          <Grid item xs={12}>
            {offer.get("transactionStatus") === "pending" ? "pending..." : offer.get("id")}
          </Grid>
          <Grid item xs={12}>
            <Typography variant="title">
              {offer.getIn(["attributes", "description"])}
            </Typography>
          </Grid>
        </Grid>
      </Card>
    );
  }
}

Offer.propTypes = {
  offer: PropTypes.object.isRequired
};

export default withStyles(styles)(Offer);
