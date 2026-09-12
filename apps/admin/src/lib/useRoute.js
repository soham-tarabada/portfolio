import { useCallback, useEffect, useState } from "react";

export function parseHash(hash) {
  const raw = String(hash || "").replace(/^#\/?/, "");
  const parts = raw.split("/").filter(Boolean).map(decodeURIComponent);
  return { view: parts[0] || "", id: parts[1] || "" };
}

function readRoute() {
  return parseHash(window.location.hash);
}

export function navigate(path) {
  const next = `#/${String(path).replace(/^#?\/?/, "")}`;
  if (window.location.hash === next) return;
  window.location.hash = next;
}

export function useRoute() {
  const [route, setRoute] = useState(readRoute);

  useEffect(() => {
    const sync = () => setRoute(readRoute());
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  const go = useCallback((path) => navigate(path), []);

  return { view: route.view, id: route.id, go };
}
