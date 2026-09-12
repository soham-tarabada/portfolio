import { useEffect, useMemo, useRef, useState } from "react";
import { fuzzyFilter } from "../lib/fuzzy.js";

export default function CommandPalette({ items, onClose }) {
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const results = useMemo(
    () => fuzzyFilter(query, items, (item) => `${item.label} ${item.hint || ""}`).slice(0, 40),
    [query, items]
  );

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setIndex(0);
  }, [query]);

  useEffect(() => {
    const active = listRef.current?.querySelector('[data-active="true"]');
    active?.scrollIntoView({ block: "nearest" });
  }, [index, results]);

  const choose = (item) => {
    if (!item) return;
    item.run();
    onClose();
  };

  const onKeyDown = (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setIndex((current) => (results.length === 0 ? 0 : (current + 1) % results.length));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setIndex((current) =>
        results.length === 0 ? 0 : (current - 1 + results.length) % results.length
      );
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      choose(results[index]);
    }
  };

  let lastGroup = null;

  return (
    <div className="palette" role="presentation" onMouseDown={onClose}>
      <div
        className="palette__panel"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="palette__field">
          <span className="palette__sigil" aria-hidden="true">
            ›
          </span>
          <input
            ref={inputRef}
            className="palette__input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Jump to a file, run an action…"
            spellCheck="false"
            autoComplete="off"
            aria-label="Search files and actions"
          />
          <kbd className="palette__kbd">esc</kbd>
        </div>

        <div className="palette__results" ref={listRef} role="listbox" aria-label="Results">
          {results.length === 0 ? (
            <p className="palette__empty">Nothing matches “{query}”.</p>
          ) : (
            results.map((item, position) => {
              const showGroup = item.group !== lastGroup;
              lastGroup = item.group;

              return (
                <div key={item.id}>
                  {showGroup ? <div className="palette__group">{item.group}</div> : null}
                  <button
                    type="button"
                    className="palette__item"
                    data-active={position === index}
                    role="option"
                    aria-selected={position === index}
                    onMouseEnter={() => setIndex(position)}
                    onClick={() => choose(item)}
                  >
                    <span className="palette__label">{item.label}</span>
                    {item.hint ? <span className="palette__hint">{item.hint}</span> : null}
                  </button>
                </div>
              );
            })
          )}
        </div>

        <footer className="palette__foot">
          <span>↑↓ move</span>
          <span>⏎ open</span>
          <span>esc close</span>
        </footer>
      </div>
    </div>
  );
}
