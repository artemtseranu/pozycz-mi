import { Map } from "immutable";

// TODO: Lib/reducers -> Lib/reducer_utils
import { create } from "Lib/reducers";

import * as Events from "Events/ethereum";

const initialState = Map({
  initStatus: "pending",
  initErrorMessage: "",
  contracts: Map()
});

const handlers = {
  [Events.Init.STARTED]: state => initialState,

  [Events.Init.SUCCEEDED]: (state, event) => {
    return state.
      set("initStatus", "success").
      set("contracts", Map(event.contracts));
  },

  [Events.Init.FAILED]: (state, event) => {
    return state.
      set("initStatus", "failure").
      set("initErrorMessage", event.errorMessage);
  }
}

export default create(handlers, initialState);
