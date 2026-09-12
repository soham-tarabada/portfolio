import { useCallback, useEffect, useMemo, useState } from "react";
import { DEFAULT_PHOSPHOR, findPhosphor, isPhosphor, nextPhosphor } from "@portfolio/theme/phosphors.js";

const STORAGE_KEY = "portfolio.phosphor";

function readStoredMode() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return isPhosphor(stored) ? stored : DEFAULT_PHOSPHOR;
  } catch {
    return DEFAULT_PHOSPHOR;
  }
}

function paintBrowserChrome(mode) {
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", findPhosphor(mode).preview.ground);
}

export function usePhosphor() {
  const [mode, setStoredMode] = useState(readStoredMode);
  const [preview, setPreview] = useState(null);

  const active = preview && isPhosphor(preview) ? preview : mode;

  useEffect(() => {
    document.documentElement.setAttribute("data-phosphor", active);
    paintBrowserChrome(active);
  }, [active]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      return;
    }
  }, [mode]);

  const setMode = useCallback((next) => {
    if (!isPhosphor(next)) return;
    setPreview(null);
    setStoredMode(next);
  }, []);

  const toggle = useCallback(() => {
    setPreview(null);
    setStoredMode((current) => nextPhosphor(current));
  }, []);

  const previewMode = useCallback((next) => {
    setPreview(next && isPhosphor(next) ? next : null);
  }, []);

  return useMemo(
    () => ({ mode, active, setMode, toggle, preview: previewMode }),
    [mode, active, setMode, toggle, previewMode]
  );
}
