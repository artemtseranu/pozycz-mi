import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { checkWeb3 } from 'Lib/ethereum_utils';
import * as Events from 'Events/ethereum';
import * as OperationState from 'Entities/operation_state';

class EthereumComponent extends React.Component {
  componentDidMount() {
    if (!checkWeb3()) return;

    const { dispatch } = this.props; // eslint-disable-line react/prop-types
    dispatch({ type: Events.REQUIRED });
  }

  render() {
    if (!checkWeb3()) {
      // Taken from https://github.com/trufflesuite/drizzle-react-components/blob/master/src/LoadingContainer.js#L36
      return (
        <React.Fragment>
          <p>
            This page requires connection to the Ethereum network
          </p>
          <p>
            Please use the Chrome/Firefox extension MetaMask, or dedicated
            Ethereum browser such as Mist or Parity
          </p>
        </React.Fragment>
      );
    }

    const { children } = this.props; // eslint-disable-line react/prop-types
    const { init } = this.props;

    switch (OperationState.getStatus(init)) {
      case 'pending':
        return (
          <React.Fragment>
            <p>
              Connecting to the Ethereum network...
            </p>
          </React.Fragment>
        );
      case 'success':
        return (
          <React.Fragment>
            {children}
          </React.Fragment>
        );
      case 'failure':
        return (
          <React.Fragment>
            <p>
              Failed to connect to the Ethereum network.
            </p>
            <p>
              {OperationState.getErrorMessage(init)}
            </p>
          </React.Fragment>
        );
      default:
        throw `Unexpected value: ${OperationState.getStatus(init)}`; // eslint-disable-line no-throw-literal
    }
  }
}

EthereumComponent.propTypes = {
  init: PropTypes.instanceOf(OperationState.OperationState).isRequired,
};

function mapEthereumStateToProps(state) {
  return {
    init: state.eth.get('init'),
  };
}

const ConnectedEthereumComponent = connect(mapEthereumStateToProps)(EthereumComponent);

export function requireEthereum(Component) { // eslint-disable-line import/prefer-default-export
  return () => (
    <ConnectedEthereumComponent>
      <Component />
    </ConnectedEthereumComponent>
  );
}
