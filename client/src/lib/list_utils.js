export function findAndDelete(list, fn) {
  if (list.isEmpty()) {
    return list;
  }

  const head = list.first();

  if (fn(head)) {
    return list.rest();
  }

  return findAndDelete(list.rest(), fn).unshift(head);
}
