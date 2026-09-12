import { useMemo } from "react";

function isApple() {
  if (typeof navigator === "undefined") return false;
  const source =
    navigator.userAgentData?.platform || navigator.platform || navigator.userAgent || "";
  return /mac|iphone|ipad|ipod/i.test(source);
}

export function keysFor(apple) {
  const mod = apple ? "⌘" : "Ctrl";
  const join = apple ? "" : "+";

  return {
    apple,
    mod,
    palette: `${mod}${join}K`,
    terminal: apple ? "⌃`" : "Ctrl+`",
    explorer: `${mod}${join}B`,
    closeTab: apple ? "⌥W" : "Alt+W",
    prevTab: apple ? "⌥[" : "Alt+[",
    nextTab: apple ? "⌥]" : "Alt+]",
    jumpTab: apple ? "⌥1…9" : "Alt+1…9",
    shortcuts: "?",
    toon: "B",
    escape: "Esc",
  };
}

export function useKeys() {
  return useMemo(() => keysFor(isApple()), []);
}
