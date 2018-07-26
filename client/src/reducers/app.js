import { Map, Record } from "immutable";

import { create } from "Lib/reducers";

import * as events from "Events/app";

const Offer = new Record({
  owner: "0x0000000000000000000000000000000000000000000000000000000000000000",
  isOpen: false,
  details: "0x0000000000000000000000000000000000000000000000000000000000000000"
});

const initialState = new Map({
  isBlockingOperationInProgress: false,
  initStatus: "pending",
  initError: "",
  contracts: new Map({}),
  latestOffer: new Offer({})
});

const handlers = {
  [events.STARTED_BLOCKING_OPERATION]: state =>
    state.set("isBlockingOperationInProgress", true),
  [events.ENDED_BLOCKING_OPERATION]: state =>
    state.set("isBlockingOperationInProgress", false),

  [events.init.STARTED]: state =>
    state.set("initStatus", "pending").set("initError", ""),

  [events.init.SUCCEEDED]: (state, event) => {
    let updatedState = state.
      set("initStatus", "success").
      setIn(["contracts", "offers"], event.offersContract);

    if (event.latestOffer) {
      const [owner, details, isOpen] = event.latestOffer;
      const offer = new Offer({owner, isOpen, details});
      updatedState = updatedState.set("latestOffer", offer);
    }

    return updatedState;
  },

  [events.init.FAILED]: (state, event) =>
    state.set("initStatus", "failure").set("initError", event.error)
};

export default create(handlers, initialState);
