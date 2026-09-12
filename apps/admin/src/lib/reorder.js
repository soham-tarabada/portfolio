export function swap(list, index, delta) {
  const target = index + delta;
  if (index < 0 || index >= list.length || target < 0 || target >= list.length) return list;

  const next = [...list];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

export function moveTo(list, from, to) {
  if (from === to) return list;
  if (from < 0 || from >= list.length || to < 0 || to >= list.length) return list;

  const next = [...list];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

export function removeAt(list, index) {
  if (index < 0 || index >= list.length) return list;
  return list.filter((_, position) => position !== index);
}

export function replaceAt(list, index, value) {
  if (index < 0 || index >= list.length) return list;
  return list.map((entry, position) => (position === index ? value : entry));
}
