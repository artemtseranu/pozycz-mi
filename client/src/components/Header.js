import React from "react";
import PropTypes from "prop-types";

import { withStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";

const styles = {
  title: {
    flexGrow: 1
  }
};

class Header extends React.Component {
  render() {
    const { classes } = this.props;
    return (
      <AppBar position="static">
        <Toolbar>
          <Typography variant="title" color="inherit" className={classes.title}>
            {this.props.title}
          </Typography>
          {this.props.children}
        </Toolbar>
      </AppBar>
    );
  }
}

Header.propTypes = {
  title: PropTypes.string.isRequired
};

export default withStyles(styles)(Header);
