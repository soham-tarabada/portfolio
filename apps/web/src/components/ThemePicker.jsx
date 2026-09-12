import { useCallback, useEffect, useRef, useState } from "react";
import { PHOSPHORS } from "@portfolio/theme/phosphors.js";

const COLUMNS = 2;

const SAMPLE = [
  { prompt: true, text: "theme" },
  { text: "phosphor set", tone: "accent" },
  { text: `${PHOSPHORS.length} palettes`, tone: "dim" },
];

function Swatch({ phosphor, current }) {
  const { ground, panel, rule, text, phosphor: hot, phosphorDim } = phosphor.preview;

  return (
    <span className="swatch" style={{ background: ground, borderColor: rule }} aria-hidden="true">
      <span className="swatch__bar" style={{ background: panel, borderColor: rule }}>
        <span className="swatch__dot" style={{ background: hot }} />
        <span className="swatch__dot" style={{ background: phosphorDim }} />
        <span className="swatch__dot" style={{ background: text, opacity: 0.45 }} />
      </span>
      <span className="swatch__screen">
        {SAMPLE.map((row) => (
          <span className="swatch__line" key={row.text}>
            {row.prompt ? <span style={{ color: hot }}>❯ </span> : null}
            <span
              style={{ color: row.tone === "accent" ? phosphorDim : row.tone === "dim" ? rule : text }}
            >
              {row.text}
            </span>
          </span>
        ))}
      </span>
      <span className="swatch__ramp">
        {[hot, phosphorDim, text, panel].map((color) => (
          <span key={color} className="swatch__chip" style={{ background: color }} />
        ))}
      </span>
      {current ? (
        <span className="swatch__mark" style={{ background: hot, color: ground }}>
          ✓
        </span>
      ) : null}
    </span>
  );
}

export default function ThemePicker({ mode, onPreview, onSelect, onClose }) {
  const committed = useRef(mode);
  const cells = useRef([]);
  const byKeyboard = useRef(true);

  const [cursor, setCursor] = useState(() => {
    const index = PHOSPHORS.findIndex((phosphor) => phosphor.id === mode);
    return index === -1 ? 0 : index;
  });

  const focused = PHOSPHORS[cursor];

  useEffect(() => () => onPreview(null), [onPreview]);

  useEffect(() => {
    onPreview(focused.id);
    if (byKeyboard.current) cells.current[cursor]?.focus();
  }, [focused, cursor, onPreview]);

  const cancel = useCallback(() => {
    onPreview(null);
    onClose();
  }, [onPreview, onClose]);

  const commit = useCallback(
    (id) => {
      onSelect(id);
      onClose();
    },
    [onSelect, onClose]
  );

  const onKeyDown = (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      cancel();
      return;
    }

    const steps = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: COLUMNS, ArrowUp: -COLUMNS };

    if (event.key in steps) {
      event.preventDefault();
      byKeyboard.current = true;
      setCursor((current) => {
        const next = current + steps[event.key];
        return next < 0 || next >= PHOSPHORS.length ? current : next;
      });
      return;
    }

    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      byKeyboard.current = true;
      setCursor(event.key === "Home" ? 0 : PHOSPHORS.length - 1);
    }
  };

  return (
    <div className="sheet" role="presentation" onMouseDown={cancel}>
      <div
        className="sheet__panel sheet__panel--wide"
        role="dialog"
        aria-modal="true"
        aria-label="Choose a phosphor"
        onMouseDown={(event) => event.stopPropagation()}
        onKeyDown={onKeyDown}
      >
        <header className="sheet__head">
          <span className="sheet__title">Phosphor</span>
          <span className="picker__reading">
            {focused.label} — {focused.note} ·{" "}
            {focused.id === committed.current ? "in use" : "previewing"}
          </span>
          <button type="button" className="sheet__close" onClick={cancel} aria-label="Close">
            <span aria-hidden="true">✕</span>
          </button>
        </header>

        <div className="picker__grid" role="radiogroup" aria-label="Phosphor palettes">
          {PHOSPHORS.map((phosphor, index) => (
            <button
              key={phosphor.id}
              type="button"
              role="radio"
              ref={(node) => {
                cells.current[index] = node;
              }}
              aria-checked={phosphor.id === committed.current}
              className="picker__cell"
              data-focused={index === cursor}
              data-current={phosphor.id === committed.current}
              tabIndex={index === cursor ? 0 : -1}
              onMouseEnter={() => {
                byKeyboard.current = false;
                setCursor(index);
              }}
              onFocus={() => setCursor(index)}
              onClick={() => commit(phosphor.id)}
            >
              <Swatch phosphor={phosphor} current={phosphor.id === committed.current} />
              <span className="picker__label">
                <span className="picker__name">{phosphor.label}</span>
                <span className="picker__note">{phosphor.note}</span>
              </span>
            </button>
          ))}
        </div>

        <footer className="sheet__foot picker__foot">
          <span>
            <kbd className="sheet__kbd">↑ ↓ ← →</kbd> preview
          </span>
          <span>
            <kbd className="sheet__kbd">Enter</kbd> keep
          </span>
          <span>
            <kbd className="sheet__kbd">Esc</kbd> revert
          </span>
          <span className="picker__hint">
            or type <code>theme {focused.id}</code>
          </span>
        </footer>
      </div>
    </div>
  );
}
