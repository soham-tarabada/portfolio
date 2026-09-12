import { Event } from "../models/index.js";
import { env } from "../config/env.js";
import { dayKey } from "../utils/fingerprint.js";

export const RANGES = [7, 30, 90];

function sinceDate(days) {
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  start.setUTCDate(start.getUTCDate() - (days - 1));
  return start;
}

export function dayRange(days) {
  const start = sinceDate(days);
  const keys = [];

  for (let offset = 0; offset < days; offset += 1) {
    const cursor = new Date(start);
    cursor.setUTCDate(start.getUTCDate() + offset);
    keys.push(dayKey(cursor));
  }

  return keys;
}

export function fillSeries(days, rows) {
  const found = new Map(rows.map((row) => [row._id, row]));

  return dayRange(days).map((day) => {
    const row = found.get(day);
    return {
      day,
      views: row?.views || 0,
      visitors: row?.sessions?.length || 0,
    };
  });
}

export async function recordEvents(events) {
  if (!env.ANALYTICS_ENABLED || events.length === 0) return 0;
  const written = await Event.insertMany(events, { ordered: false, lean: true });
  return written.length;
}

export async function forgetSession(session) {
  const result = await Event.deleteMany({ session });
  return result.deletedCount || 0;
}

async function topOf(match, limit = 8) {
  const rows = await Event.aggregate([
    { $match: match },
    { $group: { _id: "$name", count: { $sum: 1 } } },
    { $sort: { count: -1, _id: 1 } },
    { $limit: limit },
  ]);

  return rows.map((row) => ({ name: row._id, count: row.count }));
}

export async function summarize({ days = 30 } = {}) {
  const window = RANGES.includes(days) ? days : 30;
  const since = sinceDate(window);
  const scope = { createdAt: { $gte: since } };
  const views = { ...scope, type: "view" };

  const [series, totals, visitors, pages, files, commands, referrers, devices] = await Promise.all([
    Event.aggregate([
      { $match: views },
      { $group: { _id: "$day", views: { $sum: 1 }, sessions: { $addToSet: "$session" } } },
    ]),
    Event.aggregate([{ $match: scope }, { $group: { _id: "$type", count: { $sum: 1 } } }]),
    Event.distinct("session", scope),
    topOf(views),
    topOf({ ...scope, type: "file" }),
    topOf({ ...scope, type: "command" }),
    Event.aggregate([
      { $match: views },
      { $group: { _id: "$referrer", count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
      { $limit: 8 },
    ]),
    Event.aggregate([
      { $match: scope },
      { $group: { _id: "$device", count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
    ]),
  ]);

  const byType = Object.fromEntries(totals.map((row) => [row._id, row.count]));

  return {
    range: { days: window, from: dayKey(since), to: dayKey() },
    totals: {
      views: byType.view || 0,
      visitors: visitors.length,
      files: byType.file || 0,
      commands: byType.command || 0,
      resume: byType.resume || 0,
      socials: byType.social || 0,
      contacts: byType.contact || 0,
      events: Object.values(byType).reduce((sum, value) => sum + value, 0),
    },
    series: fillSeries(window, series),
    topPages: pages,
    topFiles: files,
    topCommands: commands,
    referrers: referrers.map((row) => ({ name: row._id || "direct", count: row.count })),
    devices: devices.map((row) => ({ name: row._id || "unknown", count: row.count })),
    retentionDays: env.ANALYTICS_RETENTION_DAYS,
    enabled: env.ANALYTICS_ENABLED,
  };
}
