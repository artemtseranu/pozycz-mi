export function namespace(ns) {
  return function(name) {
    return `${ns}.${name}`;
  }
}

export function operation(name) {
  return {
    STARTED: `${name}.started`,
    SUCCEEDED: `${name}.succeeded`,
    FAILED: `${name}.failed`
  };
}
