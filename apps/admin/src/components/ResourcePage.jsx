import { useCallback, useEffect, useMemo, useState } from "react";
import { admin } from "../lib/api.js";
import { FORMS, blankRecord } from "../lib/forms.js";
import ResourceList from "./ResourceList.jsx";
import ResourceForm from "./ResourceForm.jsx";

export default function ResourcePage({ resource, meta, id, go, notify }) {
  const form = FORMS[resource];
  const blank = useMemo(() => blankRecord(form), [form]);
  const [items, setItems] = useState(null);
  const [record, setRecord] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const payload = await admin.list(resource);
    if (meta.singleton) {
      setRecord(payload.item);
      setItems(null);
    } else {
      setItems(payload.items);
      setRecord(null);
    }
  }, [resource, meta.singleton]);

  useEffect(() => {
    let cancelled = false;
    setItems(null);
    setRecord(null);
    setError(null);

    load().catch((failure) => {
      if (!cancelled) setError(failure.message);
    });

    return () => {
      cancelled = true;
    };
  }, [load]);

  const isNew = id === "new";
  const ready = meta.singleton ? record !== null : items !== null;

  const save = async (payload) => {
    setBusy(true);
    try {
      if (meta.singleton) {
        const result = await admin.update(resource, null, payload);
        setRecord(result.item);
        notify(`${meta.label} saved`);
      } else if (isNew) {
        const body = { ...payload };
        if (!body.order) body.order = (items?.length || 0) + 1;
        const result = await admin.create(resource, body);
        await load();
        notify(`${meta.label} entry created`);
        go(`${resource}/${result.item.id}`);
      } else {
        await admin.update(resource, id, payload);
        await load();
        notify("Saved and live");
      }
    } catch (failure) {
      notify(failure.message, "fail");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (target) => {
    setBusy(true);
    try {
      await admin.remove(resource, target.id);
      await load();
      notify("Deleted");
      if (id) go(resource);
    } catch (failure) {
      notify(failure.message, "fail");
    } finally {
      setBusy(false);
    }
  };

  const reorder = async (ids) => {
    setBusy(true);
    try {
      const payload = await admin.reorder(resource, ids);
      setItems(payload.items);
      notify("Order saved");
    } catch (failure) {
      notify(failure.message, "fail");
      await load().catch(() => {});
    } finally {
      setBusy(false);
    }
  };

  const toggleVisible = async (item) => {
    setBusy(true);
    try {
      await admin.patch(resource, item.id, { visible: !item.visible });
      await load();
      notify(item.visible ? "Hidden from the site" : "Now live on the site");
    } catch (failure) {
      notify(failure.message, "fail");
    } finally {
      setBusy(false);
    }
  };

  if (error) {
    return (
      <div className="page">
        <p className="page__error" role="alert">
          {error}
        </p>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="page">
        <p className="page__wait">loading {meta.label.toLowerCase()}…</p>
      </div>
    );
  }

  if (meta.singleton) {
    return (
      <div className="page">
        <header className="page__head">
          <h1 className="page__title">{meta.label}</h1>
          <p className="page__lede">One document. Saving publishes straight to the site.</p>
        </header>
        <ResourceForm form={form} meta={meta} record={record} busy={busy} onSave={save} />
      </div>
    );
  }

  if (id) {
    const found = isNew ? null : items.find((item) => item.id === id);

    if (!isNew && !found) {
      return (
        <div className="page">
          <p className="page__error">That record no longer exists.</p>
          <button type="button" className="button" onClick={() => go(resource)}>
            back to list
          </button>
        </div>
      );
    }

    return (
      <div className="page">
        <header className="page__head">
          <button type="button" className="page__back" onClick={() => go(resource)}>
            ← {meta.label}
          </button>
          <h1 className="page__title">
            {isNew ? `New ${meta.label.toLowerCase().replace(/s$/, "")}` : found[form.titleField] || "(untitled)"}
          </h1>
        </header>
        <ResourceForm
          form={form}
          meta={meta}
          record={isNew ? blank : found}
          isNew={isNew}
          busy={busy}
          onSave={save}
          onCancel={() => go(resource)}
          onDelete={remove}
        />
      </div>
    );
  }

  return (
    <div className="page">
      <header className="page__head">
        <h1 className="page__title">{meta.label}</h1>
        <p className="page__lede">
          {items.length} {items.length === 1 ? "entry" : "entries"}
          {meta.reorderable ? " · drag a row, or use the arrows, to reorder" : ""}
        </p>
      </header>

      <ResourceList
        form={form}
        meta={meta}
        items={items}
        busy={busy}
        onOpen={(target) => go(`${resource}/${target}`)}
        onCreate={() => go(`${resource}/new`)}
        onDelete={remove}
        onReorder={reorder}
        onToggleVisible={toggleVisible}
      />
    </div>
  );
}
