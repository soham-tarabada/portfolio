import { useCallback, useEffect, useMemo } from "react";
import { API_BASE } from "./api.js";
import { createTracker } from "./analytics.js";

function post(body) {
  return fetch(`${API_BASE}/api/v1/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    keepalive: true,
  }).catch(() => {});
}

export function useAnalytics() {
  const tracker = useMemo(
    () =>
      createTracker({
        storage: typeof window === "undefined" ? null : window.sessionStorage,
        agent: typeof navigator === "undefined" ? null : navigator,
        send: post,
        referrer: typeof document === "undefined" ? "" : document.referrer,
      }),
    []
  );

  useEffect(() => {
    const flush = () => tracker.flush();
    const onHidden = () => {
      if (document.visibilityState === "hidden") flush();
    };

    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", onHidden);

    return () => {
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", onHidden);
      flush();
    };
  }, [tracker]);

  const track = useCallback(
    (type, name, path) => tracker.track(type, name, path),
    [tracker]
  );

  return { track, session: tracker.session, enabled: tracker.enabled };
}
