import { useEffect, useRef } from "react";

function groupsFor(keys) {
  return [
    [
      "Editor",
      [
        [keys.palette, "Command palette — jump to any file or action"],
        [keys.terminal, "Show or hide the terminal"],
        [keys.explorer, "Show or hide the file tree"],
        [keys.shortcuts, "This sheet"],
      ],
    ],
    [
      "Tabs",
      [
        [keys.nextTab, "Next open file"],
        [keys.prevTab, "Previous open file"],
        [keys.jumpTab, "Jump to the nth open file"],
        [keys.closeTab, "Close the current file"],
      ],
    ],
    [
      "File tree",
      [
        ["↑ ↓", "Move between files"],
        ["→ ←", "Expand or collapse a folder"],
        ["Enter", "Open the focused file"],
      ],
    ],
    [
      "Terminal",
      [
        ["Tab", "Complete a command or filename"],
        ["↑ ↓", "Walk back through what you typed"],
        ["Ctrl+L", "Clear the scrollback"],
        [keys.escape, "Close the terminal"],
      ],
    ],
    [
      "Bit, the guide",
      [
        [keys.toon, "Call Bit over and open its menu"],
        ["Click", "Ask where to go next, or ask a question"],
        ["Drag", "Pick Bit up and throw it about"],
        ["toon", "Summon or dismiss Bit from the terminal"],
      ],
    ],
  ];
}

export default function Shortcuts({ keys, onClose }) {
  const panelRef = useRef(null);

  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  return (
    <div className="sheet" role="presentation" onMouseDown={onClose}>
      <div
        ref={panelRef}
        className="sheet__panel"
        role="dialog"
        aria-modal="true"
        aria-label="Keyboard shortcuts"
        tabIndex={-1}
        onMouseDown={(event) => event.stopPropagation()}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            onClose();
          }
        }}
      >
        <header className="sheet__head">
          <span className="sheet__title">Keyboard shortcuts</span>
          <button type="button" className="sheet__close" onClick={onClose} aria-label="Close">
            <span aria-hidden="true">✕</span>
          </button>
        </header>

        <div className="sheet__body">
          {groupsFor(keys).map(([title, rows]) => (
            <section className="sheet__group" key={title}>
              <h2 className="sheet__group-head">{title}</h2>
              <dl className="sheet__list">
                {rows.map(([combo, meaning]) => (
                  <div className="sheet__row" key={`${title}-${combo}`}>
                    <dt>
                      <kbd className="sheet__kbd">{combo}</kbd>
                    </dt>
                    <dd className="sheet__meaning">{meaning}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>

        <footer className="sheet__foot">
          Everything here also works as a terminal command — type <code>keys</code>.
        </footer>
      </div>
    </div>
  );
}
