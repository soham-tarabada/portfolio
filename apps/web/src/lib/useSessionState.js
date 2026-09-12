import { useEffect, useState } from "react";

export function useSessionState(key, fallback) {
  const [value, setValue] = useState(() => {
    try {
      const raw = window.sessionStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch {
      return fallback;
    }
  });

  useEffect(() => {
    try {
      window.sessionStorage.setItem(key, JSON.stringify(value));
    } catch {
      return;
    }
  }, [key, value]);

  return [value, setValue];
}
