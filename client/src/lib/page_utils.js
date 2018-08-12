import React from "react";
import { connect } from "react-redux";

import * as Events from "Events/ethereum";

class EthereumComponent extends React.Component {
  checkWeb3() {
    return window.web3 !== undefined;
  }

  componentDidMount() {
    if (!this.checkWeb3()) return;

    this.props.dispatch({type: Events.REQUIRED});
  }

  render() {
    if (!this.checkWeb3()) {
      // Taken from https://github.com/trufflesuite/drizzle-react-components/blob/master/src/LoadingContainer.js#L36
      return (
        <React.Fragment>
          <p>
            This page requires connection to the Ethereum network
          </p>
          <p>
            Please use the Chrome/Firefox extension MetaMask, or dedicated Ethereum browser such as Mist or Parity
          </p>
        </React.Fragment>
      );
    }

    switch (this.props.initStatus) {
      case "pending":
        return (
          <React.Fragment>
            <p>
              Connecting to the Ethereum network...
            </p>
          </React.Fragment>
        );
      case "success":
        return (
          <React.Fragment>
            {this.props.children}
          </React.Fragment>
        );
      case "failure":
        return (
          <React.Fragment>
            <p>
              Failed to connect to the Ethereum network.
            </p>
            <p>
              {this.props.initErrorMessage}
            </p>
          </React.Fragment>
        );
      default:
        throw `Unexpected value: ${this.props.initStatus}`;
    }
  }
}

function mapEthereumStateToProps(state) {
  return {
    initStatus: state.eth.get("initStatus"),
    initErrorMessage: state.eth.get("initErrorMessage")
  };
}

const ConnectedEthereumComponent = connect(mapEthereumStateToProps)(EthereumComponent);

export function requireEthereum(Component) {
  return props => (
    <ConnectedEthereumComponent><Component /></ConnectedEthereumComponent>
  );
}
