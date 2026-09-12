import { PHOSPHOR_IDS } from "@portfolio/theme/phosphors.js";
import { useCallback, useEffect, useRef, useState } from "react";
import { COMMANDS, findCommand, looksLikeQuestion, ROOT, PROJECTS_DIR } from "./terminal/commands.js";
import { line } from "./terminal/output.js";

const STORAGE_KEY = "portfolio.terminal";
const MAX_SCROLLBACK = 120;
const MAX_HISTORY = 60;

let sequence = 0;

function readSession() {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.entries)) return null;

    return parsed;
  } catch {
    return null;
  }
}

function writeSession(state) {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    return;
  }
}

const WELCOME = {
  id: "welcome",
  prompt: null,
  input: null,
  lines: [
    line("portfolio-sh 1.0 — a real shell, not a decoration.", "dim"),
    line("Type 'help' for the command list, or 'neofetch' if you are curious.", "dim"),
    line("Or just ask: ask what did he build at TATA?", "dim"),
  ],
};

const ARG_COMPLETIONS = {
  cd: ["projects", "~"],
  toon: ["hide", "come", "dance", "wave", "tour", "ask", "say"],
  theme: ["list", "next", ...PHOSPHOR_IDS],
};

export function useTerminal(deps) {
  const {
    content,
    tree,
    files,
    openFile,
    phosphor,
    setPhosphor,
    openThemePicker,
    closeTerminal,
    copyText,
    openResume,
    nowPlaying,
    ask,
    toon,
    onCommand,
  } = deps;

  const [restored] = useState(readSession);

  const [entries, setEntries] = useState(() => {
    if (!restored?.entries?.length) return [WELCOME];

    const highest = restored.entries.reduce(
      (top, entry) => Math.max(top, Number(entry.id) || 0),
      0
    );
    sequence = Math.max(sequence, highest);

    return restored.entries;
  });

  const [cwd, setCwd] = useState(() =>
    restored?.cwd === PROJECTS_DIR ? PROJECTS_DIR : ROOT
  );
  const [history, setHistory] = useState(() =>
    Array.isArray(restored?.history) ? restored.history : []
  );
  const historyIndex = useRef(-1);
  const startedAt = useRef(Date.now());

  useEffect(() => {
    writeSession({
      entries: entries.slice(-MAX_SCROLLBACK),
      cwd,
      history: history.slice(-MAX_HISTORY),
    });
  }, [entries, cwd, history]);

  const push = useCallback((prompt, input, lines) => {
    sequence += 1;
    const id = sequence;
    setEntries((previous) => [...previous, { id, prompt, input, lines }]);
    return id;
  }, []);

  const replace = useCallback((id, lines) => {
    setEntries((previous) =>
      previous.map((entry) => (entry.id === id ? { ...entry, lines } : entry))
    );
  }, []);

  const run = useCallback(
    (raw) => {
      const command = raw.trim();
      const prompt = cwd;

      if (!command) {
        push(prompt, "", []);
        return;
      }

      setHistory((previous) => [...previous, command]);
      historyIndex.current = -1;

      const [name, ...args] = command.split(/\s+/);
      const found = findCommand(name.toLowerCase());

      if (!found) {
        push(prompt, command, [
          line(`command not found: ${name}`, "error"),
          ...(looksLikeQuestion(command)
            ? [
                line("That looks like a question. Put 'ask' in front of it:", "dim"),
                line(`  ask ${command}`, "accent"),
              ]
            : [line("Type 'help' to see what works.", "dim")]),
        ]);
        return;
      }

      onCommand?.(found.name);

      const context = {
        content,
        tree,
        files,
        cwd,
        setCwd,
        openFile,
        phosphor,
        setPhosphor,
        openThemePicker,
        copyText,
        openResume,
        nowPlaying,
        ask,
        toon,
        history,
        startedAt: startedAt.current,
      };

      let result;
      try {
        result = found.run(args, context) || { lines: [] };
      } catch (error) {
        result = { lines: [line(`${name}: ${error.message}`, "error")] };
      }

      if (result.clear) {
        setEntries([]);
        return;
      }

      const id = push(prompt, command, result.lines || []);

      if (typeof result.resolve === "function") {
        Promise.resolve()
          .then(result.resolve)
          .then((settled) => replace(id, settled?.lines || []))
          .catch((error) => replace(id, [line(`${name}: ${error.message}`, "error")]));
      }

      if (result.close) closeTerminal();
    },
    [
      content,
      tree,
      files,
      cwd,
      openFile,
      phosphor,
      setPhosphor,
      openThemePicker,
      copyText,
      openResume,
      nowPlaying,
      ask,
      toon,
      onCommand,
      history,
      push,
      replace,
      closeTerminal,
    ]
  );

  const complete = useCallback(
    (raw) => {
      const hasTrailingSpace = /\s$/.test(raw);
      const parts = raw.trim().split(/\s+/).filter(Boolean);

      if (parts.length === 0 || (parts.length === 1 && !hasTrailingSpace)) {
        const fragment = (parts[0] || "").toLowerCase();
        const matches = COMMANDS.map((entry) => entry.name).filter((entry) =>
          entry.startsWith(fragment)
        );

        if (matches.length === 1) return { value: `${matches[0]} ` };
        if (matches.length > 1) {
          push(cwd, raw, [line(matches.join("   "), "dim")]);
        }
        return { value: raw };
      }

      const commandName = parts[0].toLowerCase();
      const fragment = (hasTrailingSpace ? "" : parts[1] || "").toLowerCase();

      const pool =
        commandName === "open" || commandName === "cat"
          ? files.map((file) => file.name)
          : ARG_COMPLETIONS[commandName] || [];

      const matches = pool.filter((entry) => entry.toLowerCase().startsWith(fragment));

      if (matches.length === 1) return { value: `${commandName} ${matches[0]}` };
      if (matches.length > 1) push(cwd, raw, [line(matches.join("   "), "dim")]);

      return { value: raw };
    },
    [files, cwd, push]
  );

  const recall = useCallback(
    (direction) => {
      if (history.length === 0) return null;

      if (direction === "back") {
        historyIndex.current =
          historyIndex.current === -1
            ? history.length - 1
            : Math.max(0, historyIndex.current - 1);
        return history[historyIndex.current];
      }

      if (historyIndex.current === -1) return null;

      const next = historyIndex.current + 1;
      if (next >= history.length) {
        historyIndex.current = -1;
        return "";
      }

      historyIndex.current = next;
      return history[next];
    },
    [history]
  );

  const clear = useCallback(() => setEntries([]), []);

  return { entries, cwd, run, complete, recall, clear, isProjects: cwd === PROJECTS_DIR };
}
