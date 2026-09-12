export const line = (text = "", tone = "normal") => ({ text, tone });

export const blank = () => line("");

export function table(rows, gap = 2) {
  const width = rows.reduce((widest, row) => Math.max(widest, row[0].length), 0);
  return rows.map(([left, right, tone]) =>
    line(`${left.padEnd(width + gap)}${right}`, tone || "normal")
  );
}

export function wrap(text, width = 78, indent = "") {
  const words = String(text).split(/\s+/).filter(Boolean);
  const rows = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > width && current) {
      rows.push(indent + current);
      current = word;
    } else {
      current = candidate;
    }
  }

  if (current) rows.push(indent + current);
  return rows;
}
