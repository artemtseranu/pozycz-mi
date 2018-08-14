export function getter(key) {
  return entity => entity.get(key);
}

export function setter(key) {
  return (entity, value) => entity.set(key, value);
}
