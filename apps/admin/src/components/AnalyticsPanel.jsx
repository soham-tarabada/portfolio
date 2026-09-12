import { useCallback, useEffect, useState } from "react";
import { analytics, ask } from "../lib/api.js";
import { barChart, shareOf } from "../lib/chart.js";
import { dayLabel, relativeTime } from "../lib/format.js";

const RANGES = [7, 30, 90];

function Tile({ label, value, note }) {
  return (
    <div className="tile">
      <span className="tile__value">{value}</span>
      <span className="tile__label">{label}</span>
      {note ? <span className="tile__note">{note}</span> : null}
    </div>
  );
}

function Bars({ series }) {
  const chart = barChart(series);

  if (chart.bars.length === 0) {
    return <p className="page__wait">No traffic recorded in this window.</p>;
  }

  const peakDay = chart.bars.reduce((best, bar) => (bar.views > best.views ? bar : best));

  return (
    <div className="chart">
      <svg
        className="chart__svg"
        viewBox={`0 0 ${chart.width} ${chart.height}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={`Daily page views, peaking at ${chart.peak} on ${peakDay.day}`}
      >
        <line
          className="chart__base"
          x1="0"
          y1={chart.plot}
          x2={chart.width}
          y2={chart.plot}
        />
        {chart.bars.map((bar) => (
          <rect
            key={bar.day}
            className="chart__bar"
            x={bar.x}
            y={bar.y}
            width={bar.width}
            height={Math.max(bar.height, bar.views > 0 ? 1 : 0)}
          >
            <title>{`${bar.day}: ${bar.views} views, ${bar.visitors} visitors`}</title>
          </rect>
        ))}
      </svg>

      <div className="chart__axis">
        <span>{dayLabel(chart.bars[0].day)}</span>
        <span className="chart__peak">peak {chart.peak}</span>
        <span>{dayLabel(chart.bars[chart.bars.length - 1].day)}</span>
      </div>
    </div>
  );
}

function Ranking({ title, rows, empty }) {
  const scored = shareOf(rows || []);

  return (
    <section className="panel">
      <div className="panel__head">
        <span>{title}</span>
      </div>
      <div className="panel__body">
        {scored.length === 0 ? (
          <p className="page__wait">{empty}</p>
        ) : (
          <ul className="rank">
            {scored.map((row) => (
              <li className="rank__row" key={row.name}>
                <span className="rank__meter" style={{ "--share": `${row.share}%` }} />
                <span className="rank__name">{row.name}</span>
                <span className="rank__count">{row.count}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function Questions() {
  const [state, setState] = useState(null);

  useEffect(() => {
    ask
      .list({ limit: 10 })
      .then(setState)
      .catch(() => setState({ items: [], total: 0, failures: 0, configured: false }));
  }, []);

  if (!state) return null;

  return (
    <section className="panel">
      <div className="panel__head">
        <span>Questions asked</span>
        <span className={`panel__pill panel__pill--${state.configured ? "ok" : "warn"}`}>
          &#9679; {state.configured ? state.model : "not configured"}
        </span>
      </div>
      <div className="panel__body">
        {state.items.length === 0 ? (
          <p className="page__wait">
            {state.configured
              ? "Nobody has run the ask command yet."
              : "Set ANTHROPIC_API_KEY to switch the ask command on."}
          </p>
        ) : null}

        {state.items.map((entry) => (
          <div className="qa" key={entry.id}>
            <p className="qa__q">{entry.question}</p>
            {entry.answer ? <p className="qa__a">{entry.answer}</p> : null}
            <p className={`qa__meta${entry.failed ? " qa__meta--fail" : ""}`}>
              {relativeTime(entry.createdAt)} · {entry.device} ·{" "}
              {entry.failed
                ? "failed"
                : `${entry.inputTokens + entry.outputTokens} tokens · ${entry.latencyMs}ms`}
            </p>
          </div>
        ))}

        {state.total > state.items.length ? (
          <p className="page__wait">
            {state.total} asked in total{state.failures > 0 ? `, ${state.failures} failed` : ""}.
          </p>
        ) : null}
      </div>
    </section>
  );
}

export default function AnalyticsPanel() {
  const [days, setDays] = useState(30);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    const payload = await analytics.summary(days);
    setReport(payload);
  }, [days]);

  useEffect(() => {
    setError(null);
    load().catch((failure) => setError(failure.message));
  }, [load]);

  if (error) {
    return (
      <div className="page">
        <p className="page__error" role="alert">
          {error}
        </p>
      </div>
    );
  }

  const totals = report?.totals;

  return (
    <div className="page">
      <header className="page__head">
        <h1 className="page__title">Analytics</h1>
        <p className="page__lede">
          First-party counts only — no cookies, no third party, no IP kept. Visitors are a
          per-tab id that the browser forgets when it closes.
        </p>
      </header>

      <div className="mailbox__filters">
        {RANGES.map((entry) => (
          <button
            key={entry}
            type="button"
            className="tab"
            data-active={days === entry}
            onClick={() => setDays(entry)}
          >
            {entry} days
          </button>
        ))}
      </div>

      {!report ? <p className="page__wait">loading…</p> : null}

      {report ? (
        <>
          <div className="tiles">
            <Tile label="views" value={totals.views} />
            <Tile label="visitors" value={totals.visitors} note="unique sessions" />
            <Tile label="files opened" value={totals.files} />
            <Tile label="commands run" value={totals.commands} />
            <Tile label="resume opens" value={totals.resume} />
            <Tile label="messages" value={totals.contacts} />
          </div>

          <section className="panel">
            <div className="panel__head">
              <span>Views per day</span>
              <span className="panel__pill panel__pill--ok">
                {report.range.from} → {report.range.to}
              </span>
            </div>
            <div className="panel__body">
              <Bars series={report.series} />
            </div>
          </section>

          <Ranking title="Pages" rows={report.topPages} empty="No page views yet." />
          <Ranking title="Files opened" rows={report.topFiles} empty="No files opened yet." />
          <Ranking title="Terminal commands" rows={report.topCommands} empty="No commands run yet." />
          <Ranking title="Referrers" rows={report.referrers} empty="No referrers recorded." />
          <Ranking title="Devices" rows={report.devices} empty="No devices recorded." />

          <Questions />

          <p className="page__wait">
            Events are deleted automatically after {report.retentionDays} days.
            {report.enabled ? "" : " Collection is currently switched off."}
          </p>
        </>
      ) : null}
    </div>
  );
}
