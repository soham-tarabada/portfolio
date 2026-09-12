import { useEffect, useState } from "react";
import { fetchAskStatus } from "./ask.js";

export function useAskStatus() {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    fetchAskStatus({ signal: controller.signal })
      .then((status) => setEnabled(status.configured))
      .catch(() => setEnabled((current) => current));

    return () => controller.abort();
  }, []);

  return enabled;
}
