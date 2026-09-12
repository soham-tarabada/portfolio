import { useCallback, useEffect, useState } from "react";

export function usePathname() {
  const [pathname, setPathname] = useState(() => window.location.pathname);

  useEffect(() => {
    const onPopState = () => setPathname(window.location.pathname);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const go = useCallback((next, { replace = false } = {}) => {
    if (next === window.location.pathname) return;
    window.history[replace ? "replaceState" : "pushState"]({}, "", next);
    setPathname(next);
  }, []);

  return [pathname, go];
}
