import { useEffect, useRef, useState } from "react";

function OutputLine({ entry }) {
  return <div className={`term__line term__line--${entry.tone}`}>{entry.text || " "}</div>;
}

export default function Terminal({ terminal, onClose, focusSignal }) {
  const [value, setValue] = useState("");
  const inputRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [focusSignal]);

  useEffect(() => {
    const node = scrollRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [terminal.entries]);

  const onKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      terminal.run(value);
      setValue("");
      return;
    }

    if (event.key === "Tab") {
      event.preventDefault();
      const result = terminal.complete(value);
      if (result?.value !== undefined) setValue(result.value);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      const recalled = terminal.recall("back");
      if (recalled !== null) setValue(recalled);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      const recalled = terminal.recall("forward");
      if (recalled !== null) setValue(recalled);
      return;
    }

    if (event.key === "l" && event.ctrlKey) {
      event.preventDefault();
      terminal.clear();
    }
  };

  return (
    <section className="term" aria-label="Terminal">
      <header className="term__bar">
        <span className="term__title">Terminal</span>
        <span className="term__cwd">{terminal.cwd}</span>
        <span className="term__spacer" />
        <button type="button" className="term__action" onClick={terminal.clear}>
          clear
        </button>
        <button type="button" className="term__action" onClick={onClose} aria-label="Close terminal">
          ✕
        </button>
      </header>

      <div
        className="term__scroll"
        ref={scrollRef}
        onClick={() => inputRef.current?.focus()}
        role="log"
        aria-live="polite"
      >
        {terminal.entries.map((entry) => (
          <div className="term__entry" key={entry.id}>
            {entry.prompt !== null ? (
              <div className="term__echo">
                <span className="term__prompt">{entry.prompt}</span>
                <span className="term__sigil">$</span>
                <span className="term__command">{entry.input}</span>
              </div>
            ) : null}
            {entry.lines.map((row, index) => (
              <OutputLine entry={row} key={index} />
            ))}
          </div>
        ))}

        <div className="term__input-row">
          <span className="term__prompt">{terminal.cwd}</span>
          <span className="term__sigil">$</span>
          <input
            ref={inputRef}
            className="term__input"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={onKeyDown}
            spellCheck="false"
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            aria-label="Terminal input"
          />
        </div>
      </div>
    </section>
  );
}
