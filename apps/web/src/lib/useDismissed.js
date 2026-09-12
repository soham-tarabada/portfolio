import { useCallback, useState } from "react";

export function useDismissed(key) {
  const [dismissed, setDismissed] = useState(() => {
    try {
      return window.localStorage.getItem(key) === "1";
    } catch {
      return true;
    }
  });

  const dismiss = useCallback(() => {
    setDismissed(true);
    try {
      window.localStorage.setItem(key, "1");
    } catch {
      return;
    }
  }, [key]);

  return [dismissed, dismiss];
}
