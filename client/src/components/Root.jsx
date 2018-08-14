import React from 'react';
import { Switch, Route } from 'react-router';

import * as Paths from 'Constants/paths';

import Layout from './Layout';
import MyOffers from './pages/MyOffers';
import CreateOffer from './pages/CreateOffer';
import DiscoverOffers from './pages/DiscoverOffers';
import About from './pages/About';
import NotFound from './pages/NotFound';

export default () => (
  <Layout>
    <Switch>
      <Route exact path={Paths.MY_OFFERS} component={MyOffers} />
      <Route exact path={Paths.CREATE_OFFER} component={CreateOffer} />
      <Route exact path={Paths.DISCOVER_OFFERS} component={DiscoverOffers} />
      <Route exact path={Paths.ABOUT} component={About} />
      <Route component={NotFound} />
    </Switch>
  </Layout>
);
