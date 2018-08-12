import React from "react";
import { Switch, Route } from "react-router";

import Layout from "./Layout";

import MyOffers from "./pages/MyOffers";
import CreateOffer from "./pages/CreateOffer";
import About from "./pages/About";
import NotFound from "./pages/NotFound";

class Root extends React.Component {
  componentDidMount() {
    console.log("Root did mount");
  }

  render() {
    return (
      <Layout>
        <Switch>
          <Route exact path="/" component={MyOffers} />
          <Route exact path="/create-offer" component={CreateOffer} />
          <Route exact path="/about" component={About} />
          <Route component={NotFound} />
        </Switch>
      </Layout>
    );
  }
}

export default Root;
