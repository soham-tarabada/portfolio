import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import TitleBar from "./components/TitleBar.jsx";
import Explorer from "./components/Explorer.jsx";
import TabStrip from "./components/TabStrip.jsx";
import EditorPane from "./components/EditorPane.jsx";
import StatusBar from "./components/StatusBar.jsx";
import FirstRunHint from "./components/FirstRunHint.jsx";
import Toon from "./components/Toon.jsx";
const Terminal = lazy(() => import("./components/Terminal.jsx"));
const CommandPalette = lazy(() => import("./components/CommandPalette.jsx"));
const Shortcuts = lazy(() => import("./components/Shortcuts.jsx"));
const ThemePicker = lazy(() => import("./components/ThemePicker.jsx"));
import { LoadingScreen, ErrorScreen } from "./components/BootStates.jsx";
import { API_BASE } from "./lib/api.js";
import { useContent } from "./lib/useContent.js";
import { useAnalytics } from "./lib/useAnalytics.js";
import { useNowPlaying } from "./lib/useNowPlaying.js";
import { sendQuestion } from "./lib/ask.js";
import { useAskStatus } from "./lib/useAskStatus.js";
import { usePhosphor } from "./lib/usePhosphor.js";
import { useMediaQuery } from "./lib/useMediaQuery.js";
import { useKeys } from "./lib/useKeys.js";
import { useDismissed } from "./lib/useDismissed.js";
import { useSessionState } from "./lib/useSessionState.js";
import { useTabs } from "./lib/useTabs.js";
import { useTerminal } from "./lib/useTerminal.js";
import { useToon } from "./lib/useToon.js";
import { TOON_NAME } from "./lib/toon/dialogue.js";
import { usePathname } from "./lib/usePathname.js";
import { pathForFile, fileForPath } from "./lib/router.js";
import { buildTree, findFile, flattenFiles, defaultFileId } from "./lib/workspace.js";
import "./components/shell.css";
import "./components/terminal.css";
import "./components/palette.css";
import "./components/toon.css";

const HINT_KEY = "portfolio.hint";

function copyText(value) {
  navigator.clipboard?.writeText(value).catch(() => {});
}

function isTypingTarget(target) {
  if (!target || !target.tagName) return false;
  return (
    target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable === true
  );
}

export default function App() {
  const { mode, setMode, toggle, preview } = usePhosphor();
  const { track, session } = useAnalytics();
  const nowPlaying = useNowPlaying();
  const { status, data, error, reload } = useContent();
  const compact = useMediaQuery("(max-width: 60rem)");
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const keys = useKeys();
  const askEnabled = useAskStatus();
  const tabs = useTabs();
  const [pathname, go] = usePathname();
  const [hintDismissed, dismissHint] = useDismissed(HINT_KEY);

  const [explorerOpen, setExplorerOpen] = useState(false);
  const [explorerCollapsed, setExplorerCollapsed] = useSessionState("portfolio.explorer", false);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [terminalFocus, setTerminalFocus] = useState(0);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [themePickerOpen, setThemePickerOpen] = useState(false);

  const tree = useMemo(() => buildTree(data), [data]);
  const files = useMemo(() => flattenFiles(tree), [tree]);

  const activeIdRef = useRef(null);
  activeIdRef.current = tabs.activeId;

  const compactRef = useRef(compact);
  compactRef.current = compact;

  const toonRef = useRef(null);

  const react = useCallback((type, payload) => {
    toonRef.current?.react(type, payload);
  }, []);

  const terminalOpenRef = useRef(false);
  terminalOpenRef.current = terminalOpen;

  const overlaysRef = useRef({});
  overlaysRef.current = {
    palette: paletteOpen,
    shortcuts: shortcutsOpen,
    terminal: terminalOpen,
    themePicker: themePickerOpen,
  };

  const openFile = useCallback(
    (id) => {
      if (!id) return;
      tabs.open(id);
      setExplorerOpen(false);
    },
    [tabs]
  );

  const closeTerminal = useCallback(() => setTerminalOpen(false), []);

  const openThemePicker = useCallback(() => {
    setThemePickerOpen(true);
    dismissHint();
  }, [dismissHint]);

  const toggleTerminal = useCallback(() => {
    const next = !terminalOpenRef.current;
    terminalOpenRef.current = next;

    setTerminalOpen(next);
    setTerminalFocus((count) => count + 1);
    dismissHint();

    if (next) react("terminal", { name: "opened" });
  }, [dismissHint, react]);

  const openPalette = useCallback(() => {
    setPaletteOpen(true);
    dismissHint();
  }, [dismissHint]);

  const toggleExplorer = useCallback(() => {
    if (compactRef.current) setExplorerOpen((open) => !open);
    else setExplorerCollapsed((collapsed) => !collapsed);
  }, [setExplorerCollapsed]);

  const openResume = useCallback(() => {
    track("resume", "download", window.location.pathname);
    react("resume", { name: "download" });
    window.open(`${API_BASE}/api/v1/resume`, "_blank", "noopener,noreferrer");
  }, [track, react]);

  const openSocial = useCallback(
    (social) => {
      track("social", social.platform, window.location.pathname);
      react("social", { name: social.platform });
    },
    [track, react]
  );

  const onCommand = useCallback(
    (name) => {
      track("command", name, window.location.pathname);
      react("command", { name });
    },
    [track, react]
  );

  const report = useCallback(
    (type, name, path) => {
      track(type, name, path);
      react(type, { name });
    },
    [track, react]
  );

  const closeTab = useCallback(
    (id) => {
      tabs.close(id);
      react("tab", { name: "closed" });
    },
    [tabs, react]
  );

  const ask = useCallback(
    (question) =>
      sendQuestion(question, { session, path: window.location.pathname }),
    [session]
  );

  const copyEmail = useCallback(() => {
    if (!data?.profile?.email) return;
    copyText(data.profile.email);
    react("copy", { name: "email" });
  }, [data, react]);

  const activeFile = useMemo(() => findFile(tree, tabs.activeId), [tree, tabs.activeId]);

  const toonActions = useMemo(
    () => ({
      openFile,
      openTerminal: toggleTerminal,
      openPalette,
      openResume,
      copyEmail,
      ask,
    }),
    [openFile, toggleTerminal, openPalette, openResume, copyEmail, ask]
  );

  const toon = useToon({
    file: activeFile,
    files,
    keys,
    terminalOpen,
    compact,
    reduced,
    askEnabled,
    actions: toonActions,
  });

  toonRef.current = toon;

  const terminal = useTerminal({
    content: data,
    tree,
    files,
    openFile,
    phosphor: mode,
    setPhosphor: setMode,
    openThemePicker,
    closeTerminal,
    copyText,
    openResume,
    nowPlaying,
    ask,
    toon: toon.controls,
    onCommand,
  });

  useEffect(() => {
    if (!data) return;
    tabs.reconcile(files.map((file) => file.id));
  }, [data, files, tabs.reconcile]);

  useEffect(() => {
    if (!data) return;

    const match = fileForPath(pathname, files);
    if (!match && pathname && pathname !== "/") react("route", { name: "missing" });

    const id = match ? match.id : activeIdRef.current || defaultFileId(data, tree);
    if (id && id !== activeIdRef.current) tabs.open(id);
  }, [pathname, data, files, tree, tabs.open, react]);

  useEffect(() => {
    if (!data || !tabs.activeId) return;
    const file = findFile(tree, tabs.activeId);
    go(pathForFile(file), { replace: window.location.pathname === "/" });
  }, [tabs.activeId, tree, data, go]);

  useEffect(() => {
    if (!data) return;
    track("view", pathname || "/", pathname || "/");
  }, [pathname, data, track]);

  useEffect(() => {
    if (!data || !tabs.activeId) return;
    const file = findFile(tree, tabs.activeId);
    if (file) track("file", file.name, pathname || "/");
  }, [tabs.activeId, tree, data, pathname, track]);

  useEffect(() => {
    if (!compact) setExplorerOpen(false);
  }, [compact]);

  const themeRef = useRef(mode);

  useEffect(() => {
    if (themeRef.current === mode) return;
    themeRef.current = mode;
    react("theme", { name: "changed" });
  }, [mode, react]);

  useEffect(() => {
    const onKeyDown = (event) => {
      const modifier = event.metaKey || event.ctrlKey;
      const typing = isTypingTarget(event.target);

      if (modifier && !event.altKey && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((open) => !open);
        dismissHint();
        return;
      }

      if (modifier && !event.altKey && event.key.toLowerCase() === "b") {
        event.preventDefault();
        toggleExplorer();
        return;
      }

      if (event.ctrlKey && event.key === "`") {
        event.preventDefault();
        toggleTerminal();
        return;
      }

      if (event.altKey && !modifier) {
        if (event.code === "KeyW") {
          event.preventDefault();
          if (activeIdRef.current) closeTab(activeIdRef.current);
          return;
        }

        if (event.code === "BracketRight") {
          event.preventDefault();
          tabs.step(1);
          return;
        }

        if (event.code === "BracketLeft") {
          event.preventDefault();
          tabs.step(-1);
          return;
        }

        const digit = event.code.match(/^Digit([1-9])$/);
        if (digit) {
          event.preventDefault();
          const id = tabs.openIds[Number(digit[1]) - 1];
          if (id) tabs.activate(id);
          return;
        }
      }

      if (event.key.toLowerCase() === "b" && !typing && !modifier && !event.altKey) {
        if (overlaysRef.current.palette || overlaysRef.current.shortcuts) return;
        if (overlaysRef.current.themePicker) return;
        event.preventDefault();
        toonRef.current?.controls.focus();
        return;
      }

      if (event.key === "?" && !typing && !modifier) {
        event.preventDefault();
        setShortcutsOpen(true);
        dismissHint();
        return;
      }

      if (event.key === "Escape") {
        if (overlaysRef.current.themePicker) return;
        if (overlaysRef.current.shortcuts) {
          setShortcutsOpen(false);
          return;
        }
        if (overlaysRef.current.palette) return;
        if (overlaysRef.current.terminal) {
          event.preventDefault();
          setTerminalOpen(false);
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [dismissHint, toggleExplorer, toggleTerminal, closeTab, tabs.step, tabs.activate, tabs.openIds]);

  const paletteItems = useMemo(() => {
    if (!data) return [];

    return [
      ...files.map((file) => ({
        id: `file:${file.id}`,
        group: "Files",
        label: file.name,
        hint: file.label,
        run: () => openFile(file.id),
      })),
      {
        id: "action:terminal",
        group: "Actions",
        label: terminalOpen ? "Hide terminal" : "Open terminal",
        hint: keys.terminal,
        run: toggleTerminal,
      },
      {
        id: "action:shortcuts",
        group: "Actions",
        label: "Keyboard shortcuts",
        hint: keys.shortcuts,
        run: () => setShortcutsOpen(true),
      },
      {
        id: "action:explorer",
        group: "Actions",
        label: "Toggle the file tree",
        hint: keys.explorer,
        run: toggleExplorer,
      },
      {
        id: "action:phosphor",
        group: "Actions",
        label: "Change the phosphor…",
        hint: `now ${mode}`,
        run: openThemePicker,
      },
      {
        id: "action:phosphor-next",
        group: "Actions",
        label: "Cycle to the next phosphor",
        hint: "theme",
        run: toggle,
      },
      {
        id: "action:toon",
        group: "Actions",
        label: toon.enabled ? `Send ${TOON_NAME} away` : `Bring ${TOON_NAME} back`,
        hint: "toon",
        run: toon.controls.toggle,
      },
      {
        id: "action:resume",
        group: "Actions",
        label: "Open resume PDF",
        hint: "resume",
        run: openResume,
      },
      {
        id: "action:email",
        group: "Actions",
        label: "Copy email address",
        hint: data.profile.email,
        run: () => copyText(data.profile.email),
      },
      ...data.profile.socials.map((social) => ({
        id: `social:${social.platform}`,
        group: "Links",
        label: `Open ${social.label}`,
        hint: social.url,
        run: () => {
          openSocial(social);
          window.open(social.url, "_blank", "noopener,noreferrer");
        },
      })),
    ];
  }, [
    data,
    files,
    openFile,
    terminalOpen,
    toggleTerminal,
    toggleExplorer,
    keys,
    mode,
    toggle,
    openThemePicker,
    openResume,
    openSocial,
    toon.enabled,
    toon.controls.toggle,
  ]);

  if (status === "loading") {
    return (
      <div className="shell shell--bare">
        <LoadingScreen />
      </div>
    );
  }

  if (status === "error" || !data) {
    return (
      <div className="shell shell--bare">
        <ErrorScreen message={error} onRetry={reload} />
      </div>
    );
  }

  const openFiles = tabs.openIds.map((id) => findFile(tree, id)).filter(Boolean);
  const showHint = !hintDismissed && !toon.enabled;

  return (
    <div className="shell">
      <a className="skip" href="#workspace">
        Skip to content
      </a>

      <TitleBar
        path={`soham@vadodara: ~/portfolio${activeFile ? ` — ${activeFile.name}` : ""}`}
        compact={compact}
        explorerOpen={explorerOpen}
        onToggleExplorer={toggleExplorer}
        onOpenPalette={openPalette}
        onOpenShortcuts={() => setShortcutsOpen(true)}
        keys={keys}
      />

      <div
        className="shell__body"
        data-explorer={compact ? undefined : explorerCollapsed ? "collapsed" : "open"}
      >
        <Explorer
          tree={tree}
          activeId={tabs.activeId}
          openIds={tabs.openIds}
          onOpen={openFile}
          socials={data.profile.socials}
          onSocial={openSocial}
          compact={compact}
          open={explorerOpen}
        />

        {compact && explorerOpen ? (
          <button
            type="button"
            className="scrim"
            onClick={() => setExplorerOpen(false)}
            aria-label="Close file tree"
          />
        ) : null}

        <main className="workspace" id="workspace" tabIndex={-1} data-terminal={terminalOpen}>
          <TabStrip
            files={openFiles}
            activeId={tabs.activeId}
            onActivate={tabs.activate}
            onClose={closeTab}
          />
          <EditorPane
            file={activeFile}
            content={data}
            onOpen={openFile}
            firstFileId={files[0]?.id}
            track={report}
            session={session}
            keys={keys}
            onOpenTerminal={toggleTerminal}
          />
          {terminalOpen ? (
            <Suspense fallback={null}>
              <Terminal terminal={terminal} onClose={closeTerminal} focusSignal={terminalFocus} />
            </Suspense>
          ) : null}
        </main>
      </div>

      {showHint ? (
        <FirstRunHint
          keys={keys}
          onOpenTerminal={toggleTerminal}
          onOpenPalette={openPalette}
          onDismiss={dismissHint}
        />
      ) : null}

      <Toon toon={toon} hidden={compact && explorerOpen} />

      <StatusBar
        file={activeFile}
        online={status === "ready"}
        phosphor={mode}
        onOpenPhosphor={openThemePicker}
        onCyclePhosphor={toggle}
        openCount={openFiles.length}
        terminalOpen={terminalOpen}
        onToggleTerminal={toggleTerminal}
        nowPlaying={nowPlaying}
        onOpenTrack={() => track("link", "spotify", window.location.pathname)}
        toonEnabled={toon.enabled}
        toonProgress={toon.progress}
        onToggleToon={toon.controls.toggle}
      />

      {paletteOpen ? (
        <Suspense fallback={null}>
          <CommandPalette items={paletteItems} onClose={() => setPaletteOpen(false)} />
        </Suspense>
      ) : null}

      {shortcutsOpen ? (
        <Suspense fallback={null}>
          <Shortcuts keys={keys} onClose={() => setShortcutsOpen(false)} />
        </Suspense>
      ) : null}

      {themePickerOpen ? (
        <Suspense fallback={null}>
          <ThemePicker
            mode={mode}
            onPreview={preview}
            onSelect={setMode}
            onClose={() => setThemePickerOpen(false)}
          />
        </Suspense>
      ) : null}
    </div>
  );
}
