import { useEffect, useState } from "react";
import { swap, moveTo } from "../lib/reorder.js";

function badges(item) {
  const flags = [];
  if (item.visible === false) flags.push({ key: "hidden", tone: "warn", label: "hidden" });
  if (item.featured) flags.push({ key: "featured", tone: "ok", label: "featured" });
  if (item.current) flags.push({ key: "current", tone: "ok", label: "current" });
  if (item.confidential) flags.push({ key: "nda", tone: "dim", label: "nda" });
  return flags;
}

function period(item) {
  if (!item.startDate) return null;
  return `${item.startDate} → ${item.current ? "present" : item.endDate || "—"}`;
}

export default function ResourceList({ form, meta, items, busy, onOpen, onCreate, onDelete, onReorder, onToggleVisible }) {
  const [rows, setRows] = useState(items);
  const [dragging, setDragging] = useState(null);
  const [over, setOver] = useState(null);
  const [armed, setArmed] = useState(null);
  const [confirming, setConfirming] = useState(null);

  useEffect(() => {
    setRows(items);
    setDragging(null);
    setOver(null);
    setArmed(null);
  }, [items]);

  const commit = (next) => {
    setRows(next);
    onReorder(next.map((row) => row.id));
  };

  const move = (index, delta) => {
    const next = swap(rows, index, delta);
    if (next !== rows) commit(next);
  };

  const drop = (index) => {
    const next = dragging === null ? rows : moveTo(rows, dragging, index);
    setDragging(null);
    setOver(null);
    setArmed(null);
    if (next !== rows) commit(next);
  };

  if (!rows.length) {
    return (
      <div className="empty">
        <p>No {form.label.toLowerCase()} yet.</p>
        {meta.fixed ? null : (
          <button type="button" className="button button--primary" onClick={onCreate}>
            + new {form.label.toLowerCase().replace(/s$/, "")}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="rows" data-busy={busy}>
      {rows.map((item, index) => {
        const title = item[form.titleField] || "(untitled)";
        const subtitle = item[form.subtitleField];
        const span = period(item);

        return (
          <article
            key={item.id}
            className="row"
            data-dragging={dragging === index}
            data-over={over === index && dragging !== index}
            draggable={Boolean(meta.reorderable) && armed === index}
            onDragStart={(event) => {
              setDragging(index);
              event.dataTransfer.effectAllowed = "move";
              event.dataTransfer.setData("text/plain", item.id);
            }}
            onDragEnd={() => {
              setDragging(null);
              setOver(null);
              setArmed(null);
            }}
            onDragOver={(event) => {
              if (!meta.reorderable || dragging === null) return;
              event.preventDefault();
              event.dataTransfer.dropEffect = "move";
              setOver(index);
            }}
            onDrop={(event) => {
              event.preventDefault();
              drop(index);
            }}
          >
            {meta.reorderable ? (
              <div
                className="row__grip"
                aria-hidden="true"
                onPointerDown={() => setArmed(index)}
                onPointerUp={() => setArmed(null)}
              >
                ⋮⋮
              </div>
            ) : null}

            <button type="button" className="row__open" onClick={() => onOpen(item.id)}>
              <span className="row__title">{title}</span>
              {subtitle ? <span className="row__sub">{subtitle}</span> : null}
              {span ? <span className="row__meta">{span}</span> : null}
              <span className="row__flags">
                {badges(item).map((flag) => (
                  <span key={flag.key} className={`badge badge--${flag.tone}`}>
                    {flag.label}
                  </span>
                ))}
              </span>
            </button>

            <div className="row__tools">
              {meta.reorderable ? (
                <>
                  <button
                    type="button"
                    className="icon"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    aria-label={`Move ${title} up`}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="icon"
                    onClick={() => move(index, 1)}
                    disabled={index === rows.length - 1}
                    aria-label={`Move ${title} down`}
                  >
                    ↓
                  </button>
                </>
              ) : null}

              {"visible" in item ? (
                <button
                  type="button"
                  className="icon"
                  onClick={() => onToggleVisible(item)}
                  aria-label={item.visible ? `Hide ${title}` : `Show ${title}`}
                  title={item.visible ? "Visible on the site" : "Hidden from the site"}
                >
                  {item.visible ? "◉" : "○"}
                </button>
              ) : null}

              {meta.fixed ? null : confirming === item.id ? (
                <>
                  <button
                    type="button"
                    className="icon icon--alert"
                    onClick={() => {
                      setConfirming(null);
                      onDelete(item);
                    }}
                  >
                    delete
                  </button>
                  <button type="button" className="icon" onClick={() => setConfirming(null)}>
                    keep
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="icon"
                  onClick={() => setConfirming(item.id)}
                  aria-label={`Delete ${title}`}
                >
                  ✕
                </button>
              )}
            </div>
          </article>
        );
      })}

      {meta.fixed ? (
        <p className="rows__note">
          Sections are fixed — the site expects these keys, so they can be renamed and reordered but
          not added or removed.
        </p>
      ) : (
        <button type="button" className="button button--primary rows__add" onClick={onCreate}>
          + new {form.label.toLowerCase().replace(/s$/, "")}
        </button>
      )}
    </div>
  );
}
