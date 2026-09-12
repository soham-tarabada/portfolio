const UNITS = [
  { limit: 60, size: 1, name: "s" },
  { limit: 3600, size: 60, name: "m" },
  { limit: 86400, size: 3600, name: "h" },
  { limit: 604800, size: 86400, name: "d" },
];

export function relativeTime(value, now = Date.now()) {
  if (!value) return "—";

  const then = new Date(value).getTime();
  if (Number.isNaN(then)) return "—";

  const seconds = Math.floor((now - then) / 1000);
  if (seconds < 5) return "just now";
  if (seconds < 0) return "just now";

  for (const unit of UNITS) {
    if (seconds < unit.limit) return `${Math.floor(seconds / unit.size)}${unit.name} ago`;
  }

  return new Date(then).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export function fullDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function dayLabel(day) {
  const parts = String(day || "").split("-");
  if (parts.length !== 3) return day || "";
  return `${parts[2]}/${parts[1]}`;
}

export function initials(name) {
  return String(name || "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() || "")
    .join("");
}
