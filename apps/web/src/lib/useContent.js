import { useCallback, useEffect, useState } from "react";
import { getContent } from "./api.js";

export function useContent() {
  const [state, setState] = useState({ status: "loading", data: null, error: null });

  const load = useCallback(async () => {
    setState((current) => ({ ...current, status: current.data ? "refreshing" : "loading" }));
    const result = await getContent();

    if (!result.reachable) {
      setState({ status: "error", data: null, error: result.error || "The API is unreachable." });
      return;
    }

    if (!result.ok || !result.payload?.profile) {
      setState({
        status: "error",
        data: null,
        error: result.payload?.error?.message || `The API answered ${result.status}.`,
      });
      return;
    }

    setState({ status: "ready", data: result.payload, error: null });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, reload: load };
}
