import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { push, goBack } from 'connected-react-router';

import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Drawer from '@material-ui/core/Drawer';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import AddIcon from '@material-ui/icons/Add';
import InfoIcon from '@material-ui/icons/Info';
import MenuIcon from '@material-ui/icons/Menu';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';

import * as Paths from 'Constants/paths';

const styles = theme => ({
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
  },
  title: {
    flexGrow: 1,
  },
  menuTitle: {
    padding: theme.spacing.unit * 3,
  },
  menuPaper: {
    width: 240,
  },
  main: {
    padding: theme.spacing.unit * 3,
  },
  toolbar: theme.mixins.toolbar,
});

class Layout extends React.Component {
  constructor() {
    super();

    this.openMenu = this.openMenu.bind(this);
    this.closeMenu = this.closeMenu.bind(this);

    this.state = {
      menuOpen: false,
    };
  }

  openMenu() {
    this.setState({ menuOpen: true });
  }

  closeMenu() {
    this.setState({ menuOpen: false });
  }

  title() {
    const { pathname } = this.props;

    switch (pathname) {
      case Paths.MY_OFFERS:
        return 'My Offers';
      case Paths.CREATE_OFFER:
        return 'Create Offer';
      case Paths.ABOUT:
        return 'About';
      default:
        return '';
    }
  }

  backButton() {
    const { dispatch } = this.props; // eslint-disable-line react/prop-types

    return (
      <IconButton color="inherit" onClick={() => dispatch(goBack())}>
        <ArrowBackIcon />
      </IconButton>
    );
  }

  button() {
    const { dispatch, pathname } = this.props;

    switch (pathname) {
      case Paths.MY_OFFERS:
        return (
          <Button color="inherit" onClick={() => dispatch(push(Paths.CREATE_OFFER))}>
            <AddIcon />
            &nbsp;
            Create Offer
          </Button>
        );
      case Paths.CREATE_OFFER:
        return this.backButton();
      default:
        return (<React.Fragment />);
    }
  }

  menuNavigator(path) {
    const { dispatch } = this.props;

    const fn = () => {
      this.closeMenu();
      dispatch(push(path));
    };

    fn.bind(this);

    return fn;
  }

  render() {
    const { children, classes } = this.props; // eslint-disable-line react/prop-types
    const { menuOpen } = this.state;

    return (
      <React.Fragment>
        <AppBar variant="sticky">
          <Toolbar>
            <IconButton
              className={classes.menuButton}
              color="inherit"
              aria-label="Menu"
              onClick={this.openMenu}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="title" color="inherit" className={classes.title}>
              {this.title()}
            </Typography>
            {this.button()}
          </Toolbar>
        </AppBar>
        <Drawer
          open={menuOpen}
          onClose={this.closeMenu}
          classes={{ paper: classes.menuPaper }}
        >
          <Typography variant="title" className={classes.menuTitle}>
            Shara
          </Typography>
          <Divider />
          <List component="nav">
            <ListItem button onClick={this.menuNavigator(Paths.MY_OFFERS)}>
              <ListItemText primary="My Offers" />
            </ListItem>
            <ListItem button>
              <ListItemText primary="Discover" />
            </ListItem>
          </List>
          <Divider />
          <List component="nav">
            <ListItem button onClick={this.menuNavigator(Paths.ABOUT)}>
              <ListItemIcon>
                <InfoIcon />
              </ListItemIcon>
              <ListItemText primary="About" />
            </ListItem>
          </List>
        </Drawer>
        <div className={classes.toolbar} />
        <div className={classes.main}>
          {children}
        </div>
      </React.Fragment>
    );
  }
}

Layout.propTypes = {
  pathname: PropTypes.string.isRequired,
};

function mapStateToProps(state) {
  return {
    pathname: state.router.location.pathname,
  };
}

export default connect(mapStateToProps)(withStyles(styles)(Layout));
