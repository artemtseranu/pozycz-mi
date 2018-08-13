import { Map } from 'immutable';

export function create(handlers, initialState = new Map({})) { // eslint-disable-line import/prefer-default-export, max-len
  return (state = initialState, event) => {
    const handler = handlers[event.type];
    return handler ? handler(state, event) : state;
  };
}

export function rootSelector(key) {
  return selector => (rootState) => {
    const state = key ? rootState[key] : rootState;
    return selector(state);
  };
}
