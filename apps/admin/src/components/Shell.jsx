import { useState } from "react";
import { useAuth } from "../lib/useAuth.jsx";
import { usePhosphor } from "../lib/usePhosphor.js";

const SIGNAL_NAV = [
  { name: "inbox", label: "Inbox" },
  { name: "analytics", label: "Analytics" },
];

const ASSET_NAV = [
  { name: "resume", label: "Resume" },
  { name: "tailor", label: "Tailor" },
  { name: "system", label: "System" },
];

export default function Shell({ nav, active, onNavigate, flash, unread = 0, children }) {
  const { user, signOut } = useAuth();
  const { mode, toggle } = usePhosphor();
  const [open, setOpen] = useState(false);

  const go = (name) => {
    setOpen(false);
    onNavigate(name);
  };

  return (
    <div className="admin" data-nav={open ? "open" : "closed"}>
      <header className="admin__bar">
        <button
          type="button"
          className="admin__burger"
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
          aria-label="Toggle navigation"
        >
          {open ? "✕" : "☰"}
        </button>
        <span className="admin__mark">portfolio-v5</span>
        <span className="admin__crumb">/ {active || "…"}</span>
        <span className="admin__spacer" />
        {flash ? (
          <span className={`admin__flash admin__flash--${flash.tone}`} role="status">
            {flash.message}
          </span>
        ) : null}
        <button type="button" className="chip" onClick={toggle}>
          {mode}
        </button>
      </header>

      <div className="admin__grid">
        <nav className="admin__nav" aria-label="Sections">
          <p className="admin__navhead">content</p>
          {nav.map((item) => (
            <button
              key={item.name}
              type="button"
              className="navlink"
              data-active={item.name === active}
              onClick={() => go(item.name)}
            >
              <span className="navlink__label">{item.label}</span>
              {item.singleton ? <span className="navlink__tag">single</span> : null}
            </button>
          ))}

          <p className="admin__navhead">signals</p>
          {SIGNAL_NAV.map((item) => (
            <button
              key={item.name}
              type="button"
              className="navlink"
              data-active={item.name === active}
              onClick={() => go(item.name)}
            >
              <span className="navlink__label">{item.label}</span>
              {item.name === "inbox" && unread > 0 ? (
                <span className="navlink__count">{unread}</span>
              ) : null}
            </button>
          ))}

          <p className="admin__navhead">assets</p>
          {ASSET_NAV.map((item) => (
            <button
              key={item.name}
              type="button"
              className="navlink"
              data-active={item.name === active}
              onClick={() => go(item.name)}
            >
              <span className="navlink__label">{item.label}</span>
            </button>
          ))}

          <div className="admin__navfoot">
            <p className="admin__who">{user?.email}</p>
            <button type="button" className="button button--quiet" onClick={signOut}>
              sign out
            </button>
          </div>
        </nav>

        <main className="admin__main">{children}</main>
      </div>

      <div className="admin__scrim" role="presentation" onClick={() => setOpen(false)} />
    </div>
  );
}
