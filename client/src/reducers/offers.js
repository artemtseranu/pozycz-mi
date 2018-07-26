import { Map, Record } from "immutable";

import { create } from "Lib/reducers";

import * as events from "Events/offers";

const CreateForm = new Record({
  details: ""
});

const initialState = new Map({
  createForm: new CreateForm({})
});

const handlers = {
  [events.CREATE_FORM_UPDATED]: (state, event) =>
    state.update("createForm", form => form.merge(event.updates)),

  [events.sendCreateTransaction.SUCCEEDED]: state =>
    state.set("createForm", new CreateForm({}))
};

export default create(handlers, initialState);
