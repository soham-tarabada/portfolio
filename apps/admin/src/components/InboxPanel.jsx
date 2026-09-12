import { useCallback, useEffect, useState } from "react";
import { inbox } from "../lib/api.js";
import { relativeTime, fullDate, initials } from "../lib/format.js";

const FILTERS = [
  { key: "inbox", label: "Inbox" },
  { key: "new", label: "Unread" },
  { key: "replied", label: "Replied" },
  { key: "archived", label: "Archived" },
  { key: "spam", label: "Spam" },
  { key: "all", label: "All" },
];

const ACTIONS = [
  { status: "replied", label: "mark replied" },
  { status: "archived", label: "archive" },
  { status: "spam", label: "spam" },
  { status: "new", label: "mark unread" },
];

function snippet(body) {
  const flat = String(body || "").replace(/\s+/g, " ").trim();
  return flat.length > 120 ? `${flat.slice(0, 119)}…` : flat;
}

function mailtoLink(message) {
  const subject = message.subject ? `Re: ${message.subject}` : "Re: your message";
  const quoted =
    message.body.length > 800 ? `${message.body.slice(0, 800)}…` : message.body;
  const intro = `\n\n---\nOn ${fullDate(message.createdAt)} you wrote:\n${quoted}`;
  return `mailto:${message.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(intro)}`;
}

function Detail({ message, busy, onBack, onStatus, onDelete }) {
  const [confirming, setConfirming] = useState(false);

  return (
    <article className="mailbox__detail">
      <button type="button" className="page__back" onClick={onBack}>
        ← back to list
      </button>

      <header className="mailbox__detail-head">
        <h2 className="mailbox__subject">{message.subject || "(no subject)"}</h2>
        <p className="mailbox__from">
          {message.name}
          {message.company ? ` · ${message.company}` : ""}{" "}
          <a className="link" href={`mailto:${message.email}`}>
            &lt;{message.email}&gt;
          </a>
        </p>
        <p className="mailbox__when">
          {fullDate(message.createdAt)} · {relativeTime(message.createdAt)}
        </p>
      </header>

      <div className="mailbox__text">{message.body}</div>

      <dl className="kv">
        <dt>status</dt>
        <dd>{message.status}</dd>
        <dt>landed on</dt>
        <dd>{message.path || "—"}</dd>
        <dt>came from</dt>
        <dd>{message.referrer || "direct"}</dd>
        <dt>user agent</dt>
        <dd>{message.userAgent || "—"}</dd>
      </dl>

      <div className="mailbox__actions">
        <a className="button button--primary" href={mailtoLink(message)}>
          reply by email
        </a>

        {ACTIONS.filter((action) => action.status !== message.status).map((action) => (
          <button
            key={action.status}
            type="button"
            className="button"
            disabled={busy}
            onClick={() => onStatus(message, action.status)}
          >
            {action.label}
          </button>
        ))}

        {confirming ? (
          <>
            <button
              type="button"
              className="button button--alert"
              disabled={busy}
              onClick={() => onDelete(message)}
            >
              delete for good
            </button>
            <button type="button" className="button" onClick={() => setConfirming(false)}>
              keep
            </button>
          </>
        ) : (
          <button type="button" className="button button--alert" onClick={() => setConfirming(true)}>
            delete
          </button>
        )}
      </div>
    </article>
  );
}

export default function InboxPanel({ notify, onCounts }) {
  const [filter, setFilter] = useState("inbox");
  const [term, setTerm] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [open, setOpen] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    const payload = await inbox.list({ status: filter, q: query, page });
    setData(payload);
    onCounts?.(payload.counts);
  }, [filter, query, page, onCounts]);

  useEffect(() => {
    setError(null);
    load().catch((failure) => setError(failure.message));
  }, [load]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(term.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [term]);

  const openMessage = async (item) => {
    setBusy(true);
    try {
      const payload = await inbox.open(item.id);
      setOpen(payload.item);
      onCounts?.(payload.counts);
      await load();
    } catch (failure) {
      notify(failure.message, "fail");
    } finally {
      setBusy(false);
    }
  };

  const setStatus = async (item, status) => {
    setBusy(true);
    try {
      const payload = await inbox.setStatus(item.id, status);
      setOpen(payload.item);
      onCounts?.(payload.counts);
      await load();
      notify(`Marked ${status}`);
    } catch (failure) {
      notify(failure.message, "fail");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (item) => {
    setBusy(true);
    try {
      const payload = await inbox.remove(item.id);
      setOpen(null);
      onCounts?.(payload.counts);
      await load();
      notify("Message deleted");
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

  const counts = data?.counts || {};

  return (
    <div className="page">
      <header className="page__head">
        <h1 className="page__title">Inbox</h1>
        <p className="page__lede">
          Everything the contact form on <code>contact.sh</code> collects. Nothing leaves this
          database; replies go from your own mail client.
        </p>
      </header>

      {open ? (
        <Detail
          key={open.id}
          message={open}
          busy={busy}
          onBack={() => setOpen(null)}
          onStatus={setStatus}
          onDelete={remove}
        />
      ) : (
        <>
          <div className="mailbox__bar">
            <div className="mailbox__filters">
              {FILTERS.map((entry) => (
                <button
                  key={entry.key}
                  type="button"
                  className="tab"
                  data-active={filter === entry.key}
                  onClick={() => {
                    setFilter(entry.key);
                    setPage(1);
                  }}
                >
                  {entry.label}
                  {counts[entry.key] ? <span className="tab__count">{counts[entry.key]}</span> : null}
                </button>
              ))}
            </div>

            <input
              type="search"
              className="input mailbox__search"
              placeholder="search name, address or text"
              value={term}
              aria-label="Search messages"
              onChange={(event) => setTerm(event.target.value)}
            />
          </div>

          {data === null ? <p className="page__wait">loading…</p> : null}

          {data && data.items.length === 0 ? (
            <div className="empty">
              <p>{query ? "Nothing matches that search." : "No messages in this box."}</p>
            </div>
          ) : null}

          <div className="rows" data-busy={busy}>
            {data?.items.map((item) => (
              <button
                key={item.id}
                type="button"
                className="mailrow"
                data-unread={item.status === "new"}
                onClick={() => openMessage(item)}
              >
                <span className="mailrow__mark" aria-hidden="true">
                  {initials(item.name)}
                </span>
                <span className="mailrow__main">
                  <span className="mailrow__top">
                    <span className="mailrow__name">{item.name}</span>
                    <span className="mailrow__when">{relativeTime(item.createdAt)}</span>
                  </span>
                  <span className="mailrow__subject">{item.subject || "(no subject)"}</span>
                  <span className="mailrow__snippet">{snippet(item.body)}</span>
                </span>
                {item.status !== "new" ? (
                  <span className="badge badge--dim">{item.status}</span>
                ) : null}
              </button>
            ))}
          </div>

          {data && data.pages > 1 ? (
            <div className="mailbox__pager">
              <button
                type="button"
                className="button"
                disabled={page <= 1}
                onClick={() => setPage((current) => current - 1)}
              >
                newer
              </button>
              <span className="mailbox__pagenum">
                page {data.page} of {data.pages} · {data.total} messages
              </span>
              <button
                type="button"
                className="button"
                disabled={page >= data.pages}
                onClick={() => setPage((current) => current + 1)}
              >
                older
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
