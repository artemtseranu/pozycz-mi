import { Map, List } from "immutable";

// TODO: Should be createReducer?
import { create } from "Lib/reducers";

import * as Events from "Events/create_offer";

const initialState = Map({
  form: Map({
    submitStatus: "pending",
    submitErrorMessage: "",
    fields: Map({
      description: "",
      detailedDescription: "",
    })
  }),
  imageHashes: List()
});

const handlers = {
  [Events.MOUNTED]: state => initialState,

  [Events.FIELD_UPDATED]: (state, event) => state.setIn(["form", "fields", event.field], event.value),

  [Events.IMAGE_UPLOADED]: (state, event) => state.update("imageHashes", list => list.push(event.hash)),

  [Events.SendCreateOfferTransaction.STARTED]: state => state.setIn(["form", "submitStatus"], "processing"),

  [Events.SendCreateOfferTransaction.FAILED]: state => state.setIn(["form", "submitStatus"], "failed")
};

export default create(handlers, initialState);
