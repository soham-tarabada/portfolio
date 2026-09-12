export function fuzzyScore(needle, haystack) {
  const query = needle.trim().toLowerCase();
  const target = haystack.toLowerCase();

  if (query.length === 0) return 0;
  if (target === query) return 1000;
  if (target.startsWith(query)) return 900 - target.length;
  if (target.includes(query)) return 700 - target.indexOf(query) - target.length;

  let score = 0;
  let cursor = 0;
  let streak = 0;

  for (const character of query) {
    const found = target.indexOf(character, cursor);
    if (found === -1) return -1;

    streak = found === cursor ? streak + 1 : 0;
    score += 10 + streak * 5 - Math.min(found - cursor, 10);
    cursor = found + 1;
  }

  return score;
}

export function fuzzyFilter(query, items, keyOf) {
  if (!query.trim()) return items;

  return items
    .map((item) => ({ item, score: fuzzyScore(query, keyOf(item)) }))
    .filter((entry) => entry.score > -1)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.item);
}
