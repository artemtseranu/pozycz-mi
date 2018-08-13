export function namespace(ns) {
  return name => `${ns}.${name}`;
}

export function operation(name) {
  return {
    STARTED: `${name}.started`,
    SUCCEEDED: `${name}.succeeded`,
    FAILED: `${name}.failed`,
  };
}
