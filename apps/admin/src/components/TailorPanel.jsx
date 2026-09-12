import { useCallback, useEffect, useMemo, useState } from "react";
import { tailor } from "../lib/api.js";
import { relativeTime } from "../lib/format.js";
import {
  countSelected,
  emptySelection,
  estimateFit,
  isChosen,
  chosenIndexes,
  moveRecord,
  selectionFrom,
  toggleEducation,
  toggleIndex,
  toggleRecord,
  toPayload,
} from "../lib/tailor.js";

function Bullet({ text, checked, onToggle }) {
  return (
    <label className="pickbullet" data-on={checked}>
      <input className="switch" type="checkbox" checked={checked} onChange={onToggle} />
      <span className="pickbullet__text">{text}</span>
    </label>
  );
}

function RecordCard({
  title,
  meta,
  bullets,
  chosen,
  indexes,
  onToggleAll,
  onToggleBullet,
  onMove,
  canMoveUp,
  canMoveDown,
}) {
  return (
    <article className="pick" data-on={chosen}>
      <header className="pick__head">
        <label className="pick__toggle">
          <input className="switch" type="checkbox" checked={chosen} onChange={onToggleAll} />
          <span className="pick__title">{title}</span>
        </label>
        <span className="pick__meta">{meta}</span>
        {chosen ? (
          <span className="pick__moves">
            <button
              type="button"
              className="icon"
              onClick={() => onMove(-1)}
              disabled={!canMoveUp}
              aria-label={`Move ${title} up`}
            >
              ↑
            </button>
            <button
              type="button"
              className="icon"
              onClick={() => onMove(1)}
              disabled={!canMoveDown}
              aria-label={`Move ${title} down`}
            >
              ↓
            </button>
          </span>
        ) : null}
      </header>

      <div className="pick__body">
        {bullets.map((bullet, index) => (
          <Bullet
            key={index}
            text={bullet}
            checked={indexes.includes(index)}
            onToggle={() => onToggleBullet(index)}
          />
        ))}
      </div>
    </article>
  );
}

export default function TailorPanel({ notify }) {
  const [source, setSource] = useState(null);
  const [variants, setVariants] = useState([]);
  const [selection, setSelection] = useState(null);
  const [activeId, setActiveId] = useState("");
  const [busy, setBusy] = useState("");
  const [truth, setTruth] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    const [payload, saved] = await Promise.all([tailor.source(), tailor.list()]);
    setSource(payload);
    setVariants(saved.items);
    setSelection((current) => current || selectionFrom(payload));
  }, []);

  useEffect(() => {
    load().catch((failure) => setError(failure.message));
  }, [load]);

  useEffect(() => {
    setTruth(null);
  }, [selection]);

  const fit = useMemo(
    () => (source && selection ? estimateFit(selection, source) : null),
    [selection, source]
  );

  const counts = useMemo(
    () => (source && selection ? countSelected(selection, source) : null),
    [selection, source]
  );

  if (error) {
    return (
      <div className="page">
        <p className="page__error" role="alert">
          {error}
        </p>
      </div>
    );
  }

  if (!source || !selection) {
    return (
      <div className="page">
        <p className="page__wait">loading content…</p>
      </div>
    );
  }

  const set = (next) => setSelection(next);
  const field = (name) => (event) => set({ ...selection, [name]: event.target.value });

  const run = async (name, action) => {
    setBusy(name);
    try {
      await action();
    } catch (failure) {
      notify(failure.message, "fail");
    } finally {
      setBusy("");
    }
  };

  const checkFit = () =>
    run("preview", async () => {
      const payload = await tailor.preview(toPayload(selection));
      setTruth(payload);
      notify(`${payload.pages} page${payload.pages === 1 ? "" : "s"} · ${payload.filename}`);
    });

  const exportPdf = () =>
    run("render", async () => {
      const { blob, filename, pages } = await tailor.render(toPayload(selection));
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      notify(`Exported ${filename} (${pages} page${pages === 1 ? "" : "s"})`);
    });

  const publish = () =>
    run("publish", async () => {
      const payload = await tailor.publish(toPayload(selection), activeId);
      notify(`Published as v${payload.item.version} — this is now the site download`);
    });

  const save = () =>
    run("save", async () => {
      const body = toPayload(selection);
      const payload = activeId
        ? await tailor.update(activeId, body)
        : await tailor.create(body);
      setActiveId(payload.item.id);
      const saved = await tailor.list();
      setVariants(saved.items);
      notify(`Saved “${payload.item.label}”`);
    });

  const openVariant = (variant) => {
    setActiveId(variant.id);
    setSelection({ ...emptySelection(variant.label), ...variant });
  };

  const removeVariant = (variant) =>
    run("remove", async () => {
      await tailor.remove(variant.id);
      if (activeId === variant.id) setActiveId("");
      const saved = await tailor.list();
      setVariants(saved.items);
      notify(`Deleted “${variant.label}”`);
    });

  const reset = () => {
    setActiveId("");
    setSelection(selectionFrom(source));
  };

  return (
    <div className="page">
      <header className="page__head">
        <h1 className="page__title">Tailor</h1>
        <p className="page__lede">
          Pick the bullets that matter for one role, check it fits a page, then export the PDF or
          publish it as the site&rsquo;s download.
        </p>
      </header>

      <section className="panel">
        <div className="panel__head">
          <span>Target</span>
          <span className={`panel__pill panel__pill--${fit.tone === "ok" ? "ok" : "warn"}`}>
            &#9679; {truth ? `${truth.pages} page${truth.pages === 1 ? "" : "s"}` : `~${fit.percent}% of a page`}
          </span>
        </div>

        <div className="panel__body tailor__target">
          <label className="field">
            <span className="field__label">Variant name</span>
            <input className="input" value={selection.label} onChange={field("label")} />
          </label>

          <label className="field">
            <span className="field__label">Target role</span>
            <input
              className="input"
              value={selection.targetRole}
              onChange={field("targetRole")}
              placeholder="Senior Backend Engineer"
            />
          </label>

          <label className="field">
            <span className="field__label">Headline under the name</span>
            <input
              className="input"
              value={selection.headline}
              onChange={field("headline")}
              placeholder={source.profile.roleTitle}
            />
          </label>

          <label className="field field--wide">
            <span className="field__label">Summary</span>
            <textarea
              className="input input--area"
              rows={4}
              value={selection.summary}
              onChange={field("summary")}
            />
          </label>

          <label className="field field--wide">
            <span className="field__label">Notes to self</span>
            <input
              className="input"
              value={selection.notes}
              onChange={field("notes")}
              placeholder="Where this went, what they asked for"
            />
          </label>

          <div className="tailor__switches">
            <label className="toggleline">
              <input
                className="switch"
                type="checkbox"
                checked={selection.showTech !== false}
                onChange={(event) => set({ ...selection, showTech: event.target.checked })}
              />
              <span>Show project tech lines</span>
            </label>
            <label className="toggleline">
              <input
                className="switch"
                type="checkbox"
                checked={selection.showLinks !== false}
                onChange={(event) => set({ ...selection, showLinks: event.target.checked })}
              />
              <span>Show profile links</span>
            </label>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel__head">
          <span>Fit</span>
        </div>
        <div className="panel__body">
          <div className="gauge" data-tone={fit.tone}>
            <div className="gauge__bar">
              <span className="gauge__fill" style={{ width: `${Math.min(fit.percent, 100)}%` }} />
              {fit.percent > 100 ? (
                <span className="gauge__over" style={{ width: `${Math.min(fit.percent - 100, 100)}%` }} />
              ) : null}
            </div>
            <p className="gauge__note">
              {truth
                ? `Rendered: ${truth.pages} page${truth.pages === 1 ? "" : "s"}, ${(truth.bytes / 1024).toFixed(1)} kB.`
                : `Estimated ${fit.percent}% of one page. Check fit for the real page count.`}
            </p>
          </div>

          <dl className="kv">
            <dt>roles</dt>
            <dd>
              {counts.experience} ({counts.experienceBullets} bullets)
            </dd>
            <dt>projects</dt>
            <dd>
              {counts.projects} ({counts.projectBullets} bullets)
            </dd>
            <dt>skills</dt>
            <dd>
              {counts.skills} across {counts.skillCategories} categories
            </dd>
            <dt>education</dt>
            <dd>{counts.education}</dd>
          </dl>

          <div className="tailor__actions">
            <button type="button" className="button" onClick={checkFit} disabled={Boolean(busy)}>
              {busy === "preview" ? "checking…" : "check fit"}
            </button>
            <button type="button" className="button" onClick={save} disabled={Boolean(busy)}>
              {busy === "save" ? "saving…" : activeId ? "update variant" : "save variant"}
            </button>
            <button
              type="button"
              className="button button--primary"
              onClick={exportPdf}
              disabled={Boolean(busy)}
            >
              {busy === "render" ? "building…" : "export pdf"}
            </button>
            <button type="button" className="button" onClick={publish} disabled={Boolean(busy)}>
              {busy === "publish" ? "publishing…" : "publish as site resume"}
            </button>
            <button type="button" className="button button--quiet" onClick={reset}>
              reset
            </button>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel__head">
          <span>Experience</span>
          <span className="panel__pill">{counts.experienceBullets} bullets</span>
        </div>
        <div className="panel__body">
          {source.experience.map((role) => {
            const order = selection.experience.findIndex(
              (entry) => String(entry.id) === String(role.id)
            );
            return (
              <RecordCard
                key={role.id}
                title={`${role.role} — ${role.company}`}
                meta={role.current ? "current" : role.endDate || ""}
                bullets={role.bullets || []}
                chosen={isChosen(selection, "experience", role.id)}
                indexes={chosenIndexes(selection, "experience", role.id, "bullets")}
                onToggleAll={() =>
                  set(
                    toggleRecord(
                      selection,
                      "experience",
                      role.id,
                      (role.bullets || []).map((bullet, index) => index),
                      "bullets"
                    )
                  )
                }
                onToggleBullet={(index) =>
                  set(toggleIndex(selection, "experience", role.id, index, "bullets"))
                }
                onMove={(direction) =>
                  set(moveRecord(selection, "experience", role.id, direction))
                }
                canMoveUp={order > 0}
                canMoveDown={order > -1 && order < selection.experience.length - 1}
              />
            );
          })}
        </div>
      </section>

      <section className="panel">
        <div className="panel__head">
          <span>Projects</span>
          <span className="panel__pill">{counts.projectBullets} bullets</span>
        </div>
        <div className="panel__body">
          {source.projects.map((project) => {
            const order = selection.projects.findIndex(
              (entry) => String(entry.id) === String(project.id)
            );
            return (
              <RecordCard
                key={project.id}
                title={project.title}
                meta={project.period || ""}
                bullets={project.bullets || []}
                chosen={isChosen(selection, "projects", project.id)}
                indexes={chosenIndexes(selection, "projects", project.id, "bullets")}
                onToggleAll={() =>
                  set(
                    toggleRecord(
                      selection,
                      "projects",
                      project.id,
                      (project.bullets || []).map((bullet, index) => index),
                      "bullets"
                    )
                  )
                }
                onToggleBullet={(index) =>
                  set(toggleIndex(selection, "projects", project.id, index, "bullets"))
                }
                onMove={(direction) =>
                  set(moveRecord(selection, "projects", project.id, direction))
                }
                canMoveUp={order > 0}
                canMoveDown={order > -1 && order < selection.projects.length - 1}
              />
            );
          })}
        </div>
      </section>

      <section className="panel">
        <div className="panel__head">
          <span>Skills</span>
          <span className="panel__pill">{counts.skills} selected</span>
        </div>
        <div className="panel__body">
          {source.skills.map((category) => {
            const indexes = chosenIndexes(selection, "skills", category.id, "items");
            return (
              <article className="pick" key={category.id} data-on={indexes.length > 0}>
                <header className="pick__head">
                  <label className="pick__toggle">
                    <input
                      className="switch"
                      type="checkbox"
                      checked={isChosen(selection, "skills", category.id)}
                      onChange={() =>
                        set(
                          toggleRecord(
                            selection,
                            "skills",
                            category.id,
                            (category.skills || []).map((skill, index) => index),
                            "items"
                          )
                        )
                      }
                    />
                    <span className="pick__title">{category.name}</span>
                  </label>
                  <span className="pick__meta">
                    {indexes.length}/{(category.skills || []).length}
                  </span>
                </header>
                <div className="pick__body pick__body--chips">
                  {(category.skills || []).map((skill, index) => (
                    <button
                      key={skill.name}
                      type="button"
                      className="chiptoggle"
                      data-on={indexes.includes(index)}
                      onClick={() =>
                        set(toggleIndex(selection, "skills", category.id, index, "items"))
                      }
                    >
                      {skill.name}
                    </button>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="panel">
        <div className="panel__head">
          <span>Education</span>
        </div>
        <div className="panel__body">
          {source.education.map((entry) => (
            <label className="pickbullet" key={entry.id} data-on={selection.education.includes(entry.id)}>
              <input
                className="switch"
                type="checkbox"
                checked={selection.education.includes(entry.id)}
                onChange={() => set(toggleEducation(selection, entry.id))}
              />
              <span className="pickbullet__text">
                {entry.qualification} — {entry.institution}
                {entry.score ? ` (${entry.score})` : ""}
              </span>
            </label>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel__head">
          <span>Saved variants</span>
          <span className="panel__pill">{variants.length}</span>
        </div>
        <div className="panel__body">
          {variants.length === 0 ? (
            <p className="page__wait">Nothing saved yet. Build a selection and save it.</p>
          ) : null}

          {variants.map((variant) => (
            <div className="version" key={variant.id} data-active={variant.id === activeId}>
              <span className="version__name">
                {variant.label}
                <span className="version__meta">
                  {variant.targetRole || "no target role"} · edited {relativeTime(variant.updatedAt)}
                  {variant.notes ? ` · ${variant.notes}` : ""}
                </span>
              </span>
              <button type="button" className="icon" onClick={() => openVariant(variant)}>
                load
              </button>
              <button
                type="button"
                className="icon icon--alert"
                onClick={() => removeVariant(variant)}
                disabled={Boolean(busy)}
                aria-label={`Delete ${variant.label}`}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
