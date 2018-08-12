import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { applyMiddleware, combineReducers, createStore } from "redux";
import createSagaMiddleware from "redux-saga";
import { createHashHistory } from "history";
import { ConnectedRouter, connectRouter, routerMiddleware } from "connected-react-router";

import CssBaseline from '@material-ui/core/CssBaseline';

import * as reducers from "./reducers";
import rootSaga from "./sagas/root";
import Root from "./components/Root";

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
        <Root />
      </ConnectedRouter>
    </React.Fragment>
  </Provider>
);

sagaMiddleware.run(rootSaga);

var container = document.getElementById("main");
ReactDOM.render(provider, container);
