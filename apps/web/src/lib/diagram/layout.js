export const DIAGRAM = {
  width: 344,
  gutter: 58,
  padRight: 8,
  topPad: 6,
  bottomPad: 6,
  nodesPerRow: 2,
  nodeGap: 7,
  rowGap: 6,
  nodePadY: 8,
  titleFont: 11,
  noteFont: 8.5,
  gutterFont: 8.5,
  titleLineHeight: 13,
  noteLineHeight: 11,
  captionHeight: 13,
  charRatio: 0.6,
  gap: 30,
  gapWithVia: 40,
};

function charBudget(width, fontSize) {
  return Math.max(4, Math.floor(width / (fontSize * DIAGRAM.charRatio)));
}

function chunk(items, size) {
  const rows = [];
  for (let index = 0; index < items.length; index += size) {
    rows.push(items.slice(index, index + size));
  }
  return rows;
}

export function wrapLabel(text, limit, maxLines = 2) {
  const words = String(text || "").split(/\s+/).filter(Boolean);
  const lines = [];
  let current = "";

  for (const word of words) {
    if (word.length > limit) {
      if (current) {
        lines.push(current);
        current = "";
      }
      for (let index = 0; index < word.length; index += limit) {
        lines.push(word.slice(index, index + limit));
      }
      current = lines.pop() || "";
      continue;
    }

    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > limit && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }

  if (current) lines.push(current);
  if (lines.length === 0) return [];
  if (lines.length <= maxLines) return lines;

  const trimmed = lines.slice(0, maxLines);
  const last = trimmed[maxLines - 1];
  trimmed[maxLines - 1] = `${last.slice(0, Math.max(1, limit - 1))}…`;
  return trimmed;
}

export function layoutDiagram(spec) {
  if (!spec || !Array.isArray(spec.layers) || spec.layers.length === 0) return null;

  const areaX = DIAGRAM.gutter;
  const areaWidth = DIAGRAM.width - DIAGRAM.gutter - DIAGRAM.padRight;
  const gutterLimit = charBudget(DIAGRAM.gutter - 12, DIAGRAM.gutterFont);

  let cursor = DIAGRAM.topPad;
  const layers = [];

  spec.layers.forEach((layer, layerIndex) => {
    const captionLines = layer.note
      ? wrapLabel(layer.note, charBudget(areaWidth, DIAGRAM.noteFont), 1)
      : [];
    const captionY = captionLines.length > 0 ? cursor + DIAGRAM.noteFont : null;
    if (captionLines.length > 0) cursor += DIAGRAM.captionHeight;

    const layerTop = cursor;
    const rows = [];
    let rowCursor = cursor;

    chunk(layer.nodes, DIAGRAM.nodesPerRow).forEach((rowNodes) => {
      const count = rowNodes.length;
      const nodeWidth = (areaWidth - DIAGRAM.nodeGap * (count - 1)) / count;
      const titleLimit = charBudget(nodeWidth - 12, DIAGRAM.titleFont);
      const noteLimit = charBudget(nodeWidth - 10, DIAGRAM.noteFont);

      const placed = rowNodes.map((node, position) => ({
        ...node,
        lines: wrapLabel(node.label, titleLimit, 2),
        noteLines: node.note ? wrapLabel(node.note, noteLimit, 1) : [],
        x: areaX + position * (nodeWidth + DIAGRAM.nodeGap),
        width: nodeWidth,
      }));

      const titleRows = Math.max(...placed.map((node) => node.lines.length));
      const noteRows = Math.max(...placed.map((node) => node.noteLines.length));
      const height =
        DIAGRAM.nodePadY * 2 +
        titleRows * DIAGRAM.titleLineHeight +
        (noteRows > 0 ? noteRows * DIAGRAM.noteLineHeight + 2 : 0);

      rows.push({
        y: rowCursor,
        height,
        titleRows,
        nodes: placed.map((node) => ({
          ...node,
          y: rowCursor,
          height,
          titleRows,
          centerX: node.x + node.width / 2,
        })),
      });

      rowCursor += height + DIAGRAM.rowGap;
    });

    const layerHeight = rowCursor - DIAGRAM.rowGap - layerTop;

    layers.push({
      label: layer.label,
      labelLines: wrapLabel(layer.label.toUpperCase(), gutterLimit, 2),
      owned: Boolean(layer.owned),
      via: layer.via || null,
      captionLines,
      captionY,
      y: layerTop,
      height: layerHeight,
      rows,
      nodes: rows.flatMap((row) => row.nodes),
    });

    cursor = layerTop + layerHeight;
    if (layerIndex < spec.layers.length - 1) {
      cursor += spec.layers[layerIndex + 1].via ? DIAGRAM.gapWithVia : DIAGRAM.gap;
    }
  });

  const connectors = [];
  for (let index = 0; index < layers.length - 1; index += 1) {
    const from = layers[index];
    const to = layers[index + 1];

    const fromRow = from.rows[from.rows.length - 1];
    const toRow = to.rows[0];

    const top = fromRow.y + fromRow.height;
    const bottom = to.captionY !== null ? to.captionY - DIAGRAM.noteFont : toRow.y;
    const railY = top + (bottom - top) / 2;

    const fromCenters = fromRow.nodes.map((node) => node.centerX);
    const toCenters = toRow.nodes.map((node) => node.centerX);
    const centers = [...fromCenters, ...toCenters];

    connectors.push({
      id: `c${index}`,
      fromCenters,
      toCenters,
      top,
      bottom,
      railY,
      railStart: Math.min(...centers),
      railEnd: Math.max(...centers),
      via: to.via || null,
      straight:
        fromCenters.length === 1 &&
        toCenters.length === 1 &&
        Math.abs(fromCenters[0] - toCenters[0]) < 0.5,
    });
  }

  const last = layers[layers.length - 1];

  return {
    width: DIAGRAM.width,
    height: last.y + last.height + DIAGRAM.bottomPad,
    gutter: DIAGRAM.gutter,
    layers,
    connectors,
  };
}
