import { List } from 'immutable';

export function findAndDelete(list, fn) {
  if (list.isEmpty()) return [undefined, List()];

  const head = list.first();

  if (fn(head)) return [head, list.rest()];

  const [elem, rest] = findAndDelete(list.rest(), fn);

  return [elem, rest.unshift(head)];
}
