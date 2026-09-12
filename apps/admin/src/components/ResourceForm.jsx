import { useEffect, useMemo, useState } from "react";
import { Field } from "./fields/Field.jsx";
import { hydrate, toPayload } from "../lib/forms.js";

export default function ResourceForm({ form, meta, record, isNew, busy, onSave, onCancel, onDelete }) {
  const initial = useMemo(() => hydrate(form, record), [form, record]);
  const [values, setValues] = useState(initial);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    setValues(initial);
    setConfirming(false);
  }, [initial]);

  const dirty = useMemo(
    () => JSON.stringify(values) !== JSON.stringify(initial),
    [values, initial]
  );

  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const setField = (name, next) => setValues((current) => ({ ...current, [name]: next }));

  const submit = (event) => {
    event.preventDefault();
    onSave(toPayload(record, values));
  };

  return (
    <form className="form" onSubmit={submit}>
      <div className="form__body">
        {form.fields.map((field) => (
          <Field
            key={field.name}
            field={field}
            value={values[field.name]}
            path={field.name}
            onChange={(next) => setField(field.name, next)}
          />
        ))}
      </div>

      <div className="form__foot">
        <button type="submit" className="button button--primary" disabled={busy || !dirty}>
          {busy ? "saving…" : isNew ? "create" : "save changes"}
        </button>

        {meta.singleton ? null : (
          <button type="button" className="button" onClick={onCancel} disabled={busy}>
            back to list
          </button>
        )}

        <span className="form__spacer" />

        {dirty ? <span className="form__dirty">unsaved changes</span> : null}

        {!isNew && !meta.singleton && !meta.fixed ? (
          confirming ? (
            <>
              <span className="form__dirty">delete for good?</span>
              <button
                type="button"
                className="button button--alert"
                onClick={() => onDelete(record)}
                disabled={busy}
              >
                yes, delete
              </button>
              <button type="button" className="button" onClick={() => setConfirming(false)}>
                cancel
              </button>
            </>
          ) : (
            <button type="button" className="button" onClick={() => setConfirming(true)} disabled={busy}>
              delete
            </button>
          )
        ) : null}
      </div>
    </form>
  );
}
