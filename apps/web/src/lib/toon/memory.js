export const MEMORY_KEY = "portfolio.toon";
export const MEMORY_VERSION = 2;
export const RETURNING_AFTER = 1800000;
export const MAX_REMEMBERED_LINES = 12;
export const MAX_REMEMBERED_FILES = 60;

export function emptyMemory() {
  return {
    v: MEMORY_VERSION,
    enabled: true,
    visits: 0,
    lastSeen: 0,
    lastFile: null,
    seen: {},
    lines: [],
    tour: null,
  };
}

function sanitiseSeen(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};

  const seen = {};
  for (const [id, count] of Object.entries(raw)) {
    if (Object.keys(seen).length >= MAX_REMEMBERED_FILES) break;
    if (typeof id !== "string" || id.length === 0 || id.length > 80) continue;

    const times = Number(count);
    if (!Number.isFinite(times) || times <= 0) continue;

    seen[id] = Math.min(999, Math.floor(times));
  }

  return seen;
}

function sanitiseLines(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((entry) => typeof entry === "string" && entry.length > 0 && entry.length <= 200)
    .slice(-MAX_REMEMBERED_LINES);
}

function whole(value, fallback = 0) {
  return Number.isFinite(value) && value >= 0 ? Math.floor(value) : fallback;
}

export function parseMemory(raw) {
  const base = emptyMemory();

  if (!raw) return base;
  if (raw === "off") return { ...base, enabled: false };
  if (raw === "on") return base;

  let parsed = null;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return base;
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return base;

  return {
    ...base,
    enabled: parsed.enabled !== false,
    visits: whole(Number(parsed.visits)),
    lastSeen: whole(Number(parsed.lastSeen)),
    lastFile: typeof parsed.lastFile === "string" ? parsed.lastFile.slice(0, 80) : null,
    seen: sanitiseSeen(parsed.seen),
    lines: sanitiseLines(parsed.lines),
    tour: parsed.tour === "done" || parsed.tour === "skipped" ? parsed.tour : null,
  };
}

export function serialiseMemory(memory) {
  return JSON.stringify({
    v: MEMORY_VERSION,
    enabled: memory.enabled !== false,
    visits: whole(memory.visits),
    lastSeen: whole(memory.lastSeen),
    lastFile: memory.lastFile || null,
    seen: sanitiseSeen(memory.seen),
    lines: sanitiseLines(memory.lines),
    tour: memory.tour || null,
  });
}

export function readMemory(storage) {
  try {
    return parseMemory(storage?.getItem(MEMORY_KEY));
  } catch {
    return emptyMemory();
  }
}

export function writeMemory(storage, memory) {
  try {
    storage?.setItem(MEMORY_KEY, serialiseMemory(memory));
  } catch {
    return memory;
  }
  return memory;
}

export function isReturning(memory, now = Date.now()) {
  return memory.visits > 0 && now - memory.lastSeen > RETURNING_AFTER;
}

export function withVisit(memory, now = Date.now()) {
  return { ...memory, visits: memory.visits + 1, lastSeen: now };
}

export function hasSeen(memory, fileId) {
  if (!memory || !fileId) return false;
  return Boolean(memory.seen[fileId]);
}

export function withSeen(memory, fileId, now = Date.now()) {
  if (!fileId) return memory;

  const times = Math.min(999, (memory.seen[fileId] || 0) + 1);
  const seen = sanitiseSeen({ ...memory.seen, [fileId]: times });

  return { ...memory, seen, lastFile: fileId, lastSeen: now };
}

export function withEnabled(memory, enabled) {
  return { ...memory, enabled: Boolean(enabled) };
}

export function withTour(memory, state) {
  return { ...memory, tour: state === "done" || state === "skipped" ? state : null };
}

export function withLine(memory, text) {
  if (!text || typeof text !== "string") return memory;
  const lines = [...memory.lines.filter((entry) => entry !== text), text].slice(
    -MAX_REMEMBERED_LINES
  );
  return { ...memory, lines };
}

export function progressOf(memory, files = []) {
  const total = files.length;
  const read = files.filter((file) => hasSeen(memory, file.id)).length;
  return { read, total, done: total > 0 && read >= total };
}

export function unreadFiles(memory, files = [], excludeId = null) {
  return files.filter((file) => file.id !== excludeId && !hasSeen(memory, file.id));
}

export function nextUnread(memory, files = [], excludeId = null) {
  return unreadFiles(memory, files, excludeId)[0] || null;
}
