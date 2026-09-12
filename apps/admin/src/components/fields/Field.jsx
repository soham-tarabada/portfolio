import { useState } from "react";
import { emptyValue } from "../../lib/forms.js";
import { swap, removeAt, replaceAt } from "../../lib/reorder.js";

function Label({ htmlFor, children, hint }) {
  return (
    <label className="field__label" htmlFor={htmlFor}>
      {children}
      {hint ? <span className="field__hint">{hint}</span> : null}
    </label>
  );
}

function TextList({ field, value, onChange, id }) {
  const rows = Array.isArray(value) ? value : [];

  const replace = (index, next) => onChange(replaceAt(rows, index, next));
  const remove = (index) => onChange(removeAt(rows, index));
  const move = (index, delta) => onChange(swap(rows, index, delta));

  return (
    <div className="list">
      {rows.map((row, index) => (
        <div className="list__row" key={index}>
          <textarea
            className="input input--area"
            rows={field.rows || 2}
            value={row}
            onChange={(event) => replace(index, event.target.value)}
            id={index === 0 ? id : undefined}
          />
          <div className="list__tools">
            <button type="button" onClick={() => move(index, -1)} aria-label="Move up">↑</button>
            <button type="button" onClick={() => move(index, 1)} aria-label="Move down">↓</button>
            <button type="button" onClick={() => remove(index)} aria-label="Remove">✕</button>
          </div>
        </div>
      ))}
      <button type="button" className="list__add" onClick={() => onChange([...rows, ""])}>
        + add
      </button>
    </div>
  );
}

function ObjectList({ field, value, onChange, path }) {
  const rows = Array.isArray(value) ? value : [];
  const [open, setOpen] = useState(() => new Set());

  const toggle = (index) => {
    const next = new Set(open);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setOpen(next);
  };

  const replace = (index, next) => onChange(replaceAt(rows, index, next));
  const remove = (index) => onChange(removeAt(rows, index));
  const move = (index, delta) => onChange(swap(rows, index, delta));

  const blank = Object.fromEntries(field.fields.map((entry) => [entry.name, emptyValue(entry)]));

  return (
    <div className="objlist">
      {rows.map((row, index) => {
        const expanded = open.has(index);
        const title = row?.[field.titleField] || `Item ${index + 1}`;

        return (
          <div className="objlist__item" key={index} data-open={expanded}>
            <div className="objlist__head">
              <button type="button" className="objlist__toggle" onClick={() => toggle(index)}>
                <span aria-hidden="true">{expanded ? "▾" : "▸"}</span> {title}
              </button>
              <div className="list__tools">
                <button type="button" onClick={() => move(index, -1)} aria-label="Move up">↑</button>
                <button type="button" onClick={() => move(index, 1)} aria-label="Move down">↓</button>
                <button type="button" onClick={() => remove(index)} aria-label="Remove">✕</button>
              </div>
            </div>

            {expanded ? (
              <div className="objlist__body">
                {field.fields.map((child) => (
                  <Field
                    key={child.name}
                    field={child}
                    value={row?.[child.name]}
                    path={`${path}.${index}.${child.name}`}
                    onChange={(next) => replace(index, { ...row, [child.name]: next })}
                  />
                ))}
              </div>
            ) : null}
          </div>
        );
      })}
      <button
        type="button"
        className="list__add"
        onClick={() => {
          onChange([...rows, blank]);
          setOpen(new Set([...open, rows.length]));
        }}
      >
        + add {field.label.toLowerCase()}
      </button>
    </div>
  );
}

function JsonField({ field, value, onChange, id }) {
  const [draft, setDraft] = useState(() => (value ? JSON.stringify(value, null, 2) : ""));
  const [error, setError] = useState(null);

  const commit = (text) => {
    setDraft(text);
    if (!text.trim()) {
      setError(null);
      onChange(null);
      return;
    }
    try {
      onChange(JSON.parse(text));
      setError(null);
    } catch (parseError) {
      setError(parseError.message);
    }
  };

  return (
    <>
      <textarea
        id={id}
        className={error ? "input input--area input--invalid" : "input input--area"}
        rows={field.rows || 12}
        value={draft}
        onChange={(event) => commit(event.target.value)}
        spellCheck="false"
      />
      {error ? <p className="field__error">{error}</p> : <p className="field__ok">valid JSON</p>}
    </>
  );
}

export function Field({ field, value, onChange, path }) {
  const id = `f-${path}`;

  if (field.type === "toggle") {
    return (
      <div className="field field--inline">
        <input
          id={id}
          type="checkbox"
          className="switch"
          checked={Boolean(value)}
          onChange={(event) => onChange(event.target.checked)}
        />
        <Label htmlFor={id}>{field.label}</Label>
      </div>
    );
  }

  return (
    <div className="field">
      <Label htmlFor={id} hint={field.readOnly ? "read only" : null}>
        {field.label}
      </Label>

      {field.type === "textarea" ? (
        <textarea
          id={id}
          className="input input--area"
          rows={field.rows || 3}
          value={value ?? ""}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : null}

      {field.type === "select" ? (
        <select
          id={id}
          className="input"
          value={value ?? ""}
          onChange={(event) => onChange(event.target.value)}
        >
          {field.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : null}

      {field.type === "number" ? (
        <input
          id={id}
          type="number"
          step={field.step || "1"}
          className="input"
          value={value ?? 0}
          onChange={(event) => onChange(Number(event.target.value))}
        />
      ) : null}

      {field.type === "month" ? (
        <input
          id={id}
          type="month"
          className="input"
          value={value ?? ""}
          onChange={(event) => onChange(event.target.value || (field.nullable ? null : ""))}
        />
      ) : null}

      {field.type === "textlist" ? (
        <TextList field={field} value={value} onChange={onChange} id={id} />
      ) : null}

      {field.type === "objectlist" ? (
        <ObjectList field={field} value={value} onChange={onChange} path={path} />
      ) : null}

      {field.type === "json" ? (
        <JsonField field={field} value={value} onChange={onChange} id={id} />
      ) : null}

      {!["textarea", "select", "number", "month", "textlist", "objectlist", "json"].includes(
        field.type
      ) ? (
        <input
          id={id}
          type="text"
          className="input"
          value={value ?? ""}
          readOnly={field.readOnly}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : null}
    </div>
  );
}
