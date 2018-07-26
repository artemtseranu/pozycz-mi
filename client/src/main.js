import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { applyMiddleware, combineReducers, createStore } from "redux";
import createSagaMiddleware from "redux-saga";
import { createHashHistory } from "history";
import { ConnectedRouter, connectRouter, routerMiddleware } from "connected-react-router";
import { Switch, Route } from "react-router";

import CssBaseline from '@material-ui/core/CssBaseline';

import RequireEthereum from "Components/RequireEthereum";

import * as reducers from "./reducers";
import rootSaga from "./sagas/root";
import MyOffers from "./containers/MyOffers";
import CreateOffer from "./containers/CreateOffer";
import About from "./containers/About";
import NotFound from "./containers/NotFound";

import Layout from "Components/Layout";

const reducer = combineReducers(reducers);
const sagaMiddleware = createSagaMiddleware();
const history = createHashHistory();
const middleware = applyMiddleware(routerMiddleware(history), sagaMiddleware);
const store = createStore(connectRouter(history)(reducer), middleware);

const provider = (
  <Provider store={store}>
    <React.Fragment>
      <CssBaseline />
      <ConnectedRouter history={history}>
        <Layout>
          <Switch>
            <Route exact path="/" render={() => <RequireEthereum><MyOffers /></RequireEthereum>} />
            <Route exact path="/create-offer" render={() => <RequireEthereum><CreateOffer /></RequireEthereum>} />
            <Route exact path="/about" component={About} />
            <Route component={NotFound} />
          </Switch>
        </Layout>
      </ConnectedRouter>
    </React.Fragment>
  </Provider>
);

sagaMiddleware.run(rootSaga);

var container = document.getElementById("main");
ReactDOM.render(provider, container);
