import { useCallback, useEffect, useRef, useState } from "react";
import { resume } from "../lib/api.js";

function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} kB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ResumePanel({ notify }) {
  const inputRef = useRef(null);
  const [versions, setVersions] = useState(null);
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [confirming, setConfirming] = useState(null);

  const load = useCallback(async () => {
    const payload = await resume.versions();
    setVersions(payload.items);
  }, []);

  useEffect(() => {
    load().catch((failure) => setError(failure.message));
  }, [load]);

  const upload = async (event) => {
    event.preventDefault();
    if (!file) return;

    setBusy(true);
    try {
      const payload = await resume.upload(file);
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
      await load();
      notify(`Uploaded as v${payload.item.version} and made live`);
    } catch (failure) {
      notify(failure.message, "fail");
    } finally {
      setBusy(false);
    }
  };

  const activate = async (item) => {
    setBusy(true);
    try {
      await resume.activate(item.id);
      await load();
      notify(`v${item.version} is now the download`);
    } catch (failure) {
      notify(failure.message, "fail");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (item) => {
    setBusy(true);
    setConfirming(null);
    try {
      await resume.remove(item.id);
      await load();
      notify(`v${item.version} deleted`);
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

  const active = versions?.find((item) => item.active) || null;

  return (
    <div className="page">
      <header className="page__head">
        <h1 className="page__title">Resume</h1>
        <p className="page__lede">
          The site&rsquo;s download button and the terminal&rsquo;s <code>resume</code> command both
          serve whichever version is live here.
        </p>
      </header>

      <section className="panel">
        <div className="panel__head">
          <span>Live file</span>
          <span className={active ? "panel__pill panel__pill--ok" : "panel__pill panel__pill--warn"}>
            &#9679; {active ? `v${active.version}` : "none"}
          </span>
        </div>
        <div className="panel__body">
          <dl className="kv">
            <dt>filename</dt>
            <dd>{active?.filename || "—"}</dd>
            <dt>size</dt>
            <dd>{formatBytes(active?.size)}</dd>
            <dt>uploaded</dt>
            <dd>{formatDate(active?.createdAt)}</dd>
            <dt>public url</dt>
            <dd>
              <a className="link" href={resume.publicUrl} target="_blank" rel="noreferrer">
                {resume.publicUrl}
              </a>
            </dd>
          </dl>
        </div>
      </section>

      <section className="panel">
        <div className="panel__head">
          <span>Upload a new version</span>
        </div>
        <form className="panel__body upload" onSubmit={upload}>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            className="upload__input"
            onChange={(event) => setFile(event.target.files?.[0] || null)}
          />
          <p className="upload__note">
            PDF only, up to 5 MB. Uploading creates the next version and makes it live immediately.
          </p>
          <button type="submit" className="button button--primary" disabled={!file || busy}>
            {busy ? "uploading…" : "upload"}
          </button>
        </form>
      </section>

      <section className="panel">
        <div className="panel__head">
          <span>Version history</span>
        </div>
        <div className="panel__body">
          {versions === null ? <p className="page__wait">loading…</p> : null}

          {versions?.length === 0 ? (
            <p className="page__wait">No resume uploaded yet.</p>
          ) : null}

          {versions?.map((item) => (
            <div className="version" key={item.id} data-active={item.active}>
              <span className="version__n">v{item.version}</span>
              <span className="version__name">
                {item.filename}
                <span className="version__meta">
                  {formatBytes(item.size)} · {formatDate(item.createdAt)}
                </span>
              </span>

              {item.active ? (
                <span className="badge badge--ok">live</span>
              ) : (
                <button
                  type="button"
                  className="icon"
                  onClick={() => activate(item)}
                  disabled={busy}
                >
                  make live
                </button>
              )}

              {item.active ? null : confirming === item.id ? (
                <>
                  <button
                    type="button"
                    className="icon icon--alert"
                    onClick={() => remove(item)}
                    disabled={busy}
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
                  aria-label={`Delete version ${item.version}`}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
