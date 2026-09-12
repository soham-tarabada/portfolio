export const CHART = { width: 640, height: 132, gap: 2, axis: 16 };

export function barChart(series, options = {}) {
  const { width, height, gap, axis } = { ...CHART, ...options };
  const points = Array.isArray(series) ? series : [];
  const plot = Math.max(height - axis, 1);
  const peak = Math.max(1, ...points.map((point) => point.views || 0));

  if (points.length === 0) {
    return { width, height, plot, peak, bars: [] };
  }

  const slot = width / points.length;
  const barWidth = Math.max(1, slot - gap);

  const bars = points.map((point, index) => {
    const views = Math.max(point.views || 0, 0);
    const barHeight = Math.round((views / peak) * plot);

    return {
      day: point.day,
      views,
      visitors: Math.max(point.visitors || 0, 0),
      x: Number((index * slot + (slot - barWidth) / 2).toFixed(2)),
      y: plot - barHeight,
      width: Number(barWidth.toFixed(2)),
      height: barHeight,
    };
  });

  return { width, height, plot, peak, bars };
}

export function shareOf(rows) {
  const total = rows.reduce((sum, row) => sum + (row.count || 0), 0);
  if (total === 0) return rows.map((row) => ({ ...row, share: 0 }));

  return rows.map((row) => ({ ...row, share: Math.round(((row.count || 0) / total) * 100) }));
}
