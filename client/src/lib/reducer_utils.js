import { Map } from "immutable";

export function create(handlers, initialState = new Map({})) {
  return (state = initialState, event) => {
    const handler = handlers[event.type];
    return handler ? handler(state, event) : state;
  };
}
