import { useCallback, useEffect, useState } from "react";
import { DEFAULT_PHOSPHOR, isPhosphor, nextPhosphor } from "@portfolio/theme/phosphors.js";

const STORAGE_KEY = "portfolio.admin.phosphor";

function readStoredMode() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return isPhosphor(stored) ? stored : DEFAULT_PHOSPHOR;
  } catch {
    return DEFAULT_PHOSPHOR;
  }
}

export function usePhosphor() {
  const [mode, setMode] = useState(readStoredMode);

  useEffect(() => {
    document.documentElement.setAttribute("data-phosphor", mode);
    try {
      window.localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      return;
    }
  }, [mode]);

  const toggle = useCallback(() => {
    setMode((current) => nextPhosphor(current));
  }, []);

  return { mode, setMode, toggle };
}
