const KEY = "portfolio.workspace";

export function readWorkspace() {
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.openIds)) return null;

    const openIds = parsed.openIds.filter((id) => typeof id === "string");
    const activeId =
      typeof parsed.activeId === "string" && openIds.includes(parsed.activeId)
        ? parsed.activeId
        : openIds[openIds.length - 1] || null;

    return { openIds, activeId };
  } catch {
    return null;
  }
}

export function writeWorkspace(state) {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    return;
  }
}
