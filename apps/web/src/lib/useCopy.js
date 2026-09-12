import { useCallback, useEffect, useRef, useState } from "react";

export function useCopy(resetAfter = 1600) {
  const [copiedKey, setCopiedKey] = useState(null);
  const timer = useRef(null);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = useCallback(
    async (value, key) => {
      try {
        await navigator.clipboard.writeText(value);
        setCopiedKey(key || value);
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setCopiedKey(null), resetAfter);
      } catch {
        setCopiedKey(null);
      }
    },
    [resetAfter]
  );

  return { copiedKey, copy };
}
