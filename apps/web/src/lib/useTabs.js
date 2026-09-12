import { useCallback, useEffect, useReducer } from "react";
import { readWorkspace, writeWorkspace } from "./workspaceStore.js";

export const emptyTabs = { openIds: [], activeId: null };

function hydrate() {
  return readWorkspace() || emptyTabs;
}

export function tabsReducer(state, action) {
  switch (action.type) {
    case "open": {
      const openIds = state.openIds.includes(action.id)
        ? state.openIds
        : [...state.openIds, action.id];
      return { openIds, activeId: action.id };
    }

    case "activate":
      return state.openIds.includes(action.id) ? { ...state, activeId: action.id } : state;

    case "close": {
      const index = state.openIds.indexOf(action.id);
      if (index === -1) return state;

      const openIds = state.openIds.filter((id) => id !== action.id);

      if (state.activeId !== action.id) {
        return { openIds, activeId: state.activeId };
      }

      const neighbour = openIds[index] || openIds[index - 1] || null;
      return { openIds, activeId: neighbour };
    }

    case "step": {
      if (state.openIds.length === 0) return state;

      const current = state.openIds.indexOf(state.activeId);
      const from = current === -1 ? 0 : current;
      const next = (from + action.by + state.openIds.length) % state.openIds.length;
      return { ...state, activeId: state.openIds[next] };
    }

    case "closeOthers":
      return { openIds: [action.id], activeId: action.id };

    case "reconcile": {
      const known = new Set(action.ids);
      const openIds = state.openIds.filter((id) => known.has(id));
      const activeValid = state.activeId !== null && known.has(state.activeId);

      if (openIds.length === state.openIds.length && (state.activeId === null || activeValid)) {
        return state;
      }

      return {
        openIds,
        activeId: activeValid ? state.activeId : openIds[openIds.length - 1] || null,
      };
    }

    case "reset":
      return action.id ? { openIds: [action.id], activeId: action.id } : emptyTabs;

    default:
      return state;
  }
}

export function useTabs() {
  const [state, dispatch] = useReducer(tabsReducer, null, hydrate);

  useEffect(() => {
    writeWorkspace({ openIds: state.openIds, activeId: state.activeId });
  }, [state.openIds, state.activeId]);

  const open = useCallback((id) => dispatch({ type: "open", id }), []);
  const activate = useCallback((id) => dispatch({ type: "activate", id }), []);
  const close = useCallback((id) => dispatch({ type: "close", id }), []);
  const step = useCallback((by) => dispatch({ type: "step", by }), []);
  const closeOthers = useCallback((id) => dispatch({ type: "closeOthers", id }), []);
  const reconcile = useCallback((ids) => dispatch({ type: "reconcile", ids }), []);
  const reset = useCallback((id) => dispatch({ type: "reset", id }), []);

  return { ...state, open, activate, close, step, closeOthers, reconcile, reset };
}
