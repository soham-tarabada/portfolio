import { useCallback, useEffect, useRef, useState } from "react";
import { API_BASE } from "./api.js";

const POLL_MS = 30000;

export function useNowPlaying() {
  const [state, setState] = useState({ configured: false, playing: false, track: null });
  const timer = useRef(null);

  const load = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/now-playing`);
      if (!response.ok) return;
      setState(await response.json());
    } catch {
      setState((current) => current);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const tick = async () => {
      if (cancelled) return;
      if (document.visibilityState === "visible") await load();
      timer.current = setTimeout(tick, POLL_MS);
    };

    tick();

    const onVisible = () => {
      if (document.visibilityState === "visible") load();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      clearTimeout(timer.current);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [load]);

  return state;
}
