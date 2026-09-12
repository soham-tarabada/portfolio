import { useCallback, useEffect, useState } from "react";
import { API_BASE, health } from "../lib/api.js";
import { useAuth } from "../lib/useAuth.jsx";

const SITE_URL = import.meta.env.VITE_SITE_URL || "http://localhost:5173";

export default function SystemPanel() {
  const { user } = useAuth();
  const [report, setReport] = useState(null);
  const [checking, setChecking] = useState(true);

  const check = useCallback(async () => {
    setChecking(true);
    const started = performance.now();
    const result = await health();
    setReport({ ...result, roundTripMs: Math.round(performance.now() - started) });
    setChecking(false);
  }, []);

  useEffect(() => {
    check();
  }, [check]);

  const database = report?.payload?.database || null;
  const state = checking ? "pending" : report?.ok && database?.status === "connected" ? "ok" : "fail";
  const label = { pending: "checking", ok: "connected", fail: "unreachable" }[state];

  return (
    <div className="page">
      <header className="page__head">
        <h1 className="page__title">System</h1>
        <p className="page__lede">Where this panel is pointed and whether the pieces answer.</p>
      </header>

      <section className="panel">
        <div className="panel__head">
          <span>API</span>
          <span className={`panel__pill panel__pill--${state}`}>&#9679; {label}</span>
        </div>
        <div className="panel__body">
          <dl className="kv">
            <dt>endpoint</dt>
            <dd>{API_BASE}</dd>
            <dt>round trip</dt>
            <dd>{report ? `${report.roundTripMs} ms` : "…"}</dd>
            <dt>atlas</dt>
            <dd>
              {database
                ? `${database.status}${database.pingMs === null ? "" : ` · ${database.pingMs} ms`}`
                : report?.error || "…"}
            </dd>
            <dt>database</dt>
            <dd>{database?.name || "—"}</dd>
            <dt>service</dt>
            <dd>
              {report?.payload
                ? `${report.payload.service} v${report.payload.version} · ${report.payload.environment}`
                : "—"}
            </dd>
          </dl>
        </div>
      </section>

      <section className="panel">
        <div className="panel__head">
          <span>Session</span>
        </div>
        <div className="panel__body">
          <dl className="kv">
            <dt>signed in as</dt>
            <dd>{user?.email || "—"}</dd>
            <dt>role</dt>
            <dd>{user?.role || "—"}</dd>
            <dt>public site</dt>
            <dd>
              <a className="link" href={SITE_URL} target="_blank" rel="noreferrer">
                {SITE_URL}
              </a>
            </dd>
          </dl>
        </div>
      </section>

      <div className="page__actions">
        <button type="button" className="button" onClick={check} disabled={checking}>
          {checking ? "checking…" : "re-check"}
        </button>
      </div>
    </div>
  );
}
