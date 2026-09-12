import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthProvider, useAuth } from "./lib/useAuth.jsx";
import { admin, inbox } from "./lib/api.js";
import { useRoute } from "./lib/useRoute.js";
import { RESOURCE_ORDER } from "./lib/forms.js";
import Login from "./components/Login.jsx";
import Shell from "./components/Shell.jsx";
import ResourcePage from "./components/ResourcePage.jsx";
import InboxPanel from "./components/InboxPanel.jsx";
import AnalyticsPanel from "./components/AnalyticsPanel.jsx";
import ResumePanel from "./components/ResumePanel.jsx";
import TailorPanel from "./components/TailorPanel.jsx";
import SystemPanel from "./components/SystemPanel.jsx";
import "./components/admin.css";

export default function App() {
  return (
    <AuthProvider>
      <Console />
    </AuthProvider>
  );
}

function Console() {
  const { status } = useAuth();

  if (status === "checking") {
    return (
      <div className="gate">
        <p className="gate__wait">restoring session…</p>
      </div>
    );
  }

  if (status === "anonymous") return <Login />;

  return <Workspace />;
}

function Workspace() {
  const { view, id, go } = useRoute();
  const [resources, setResources] = useState(null);
  const [failure, setFailure] = useState(null);
  const [flash, setFlash] = useState(null);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    admin
      .resources()
      .then((payload) => setResources(payload.resources))
      .catch((error) => setFailure(error.message));
  }, []);

  useEffect(() => {
    inbox
      .counts()
      .then((payload) => setUnread(payload.counts.new))
      .catch(() => setUnread(0));
  }, []);

  useEffect(() => {
    if (!flash) return undefined;
    const timer = setTimeout(() => setFlash(null), 3600);
    return () => clearTimeout(timer);
  }, [flash]);

  const notify = useCallback((message, tone = "ok") => {
    setFlash({ message, tone, at: Date.now() });
  }, []);

  const trackCounts = useCallback((counts) => setUnread(counts?.new || 0), []);

  const nav = useMemo(() => {
    if (!resources) return [];
    const known = new Map(resources.map((entry) => [entry.name, entry]));
    const ordered = RESOURCE_ORDER.filter((name) => known.has(name)).map((name) => known.get(name));
    const rest = resources.filter((entry) => !RESOURCE_ORDER.includes(entry.name));
    return [...ordered, ...rest];
  }, [resources]);

  useEffect(() => {
    if (!view) go("profile");
  }, [view, go]);

  if (failure) {
    return (
      <div className="gate">
        <p className="gate__error" role="alert">
          {failure}
        </p>
      </div>
    );
  }

  if (!resources) {
    return (
      <div className="gate">
        <p className="gate__wait">loading workspace…</p>
      </div>
    );
  }

  const meta = nav.find((entry) => entry.name === view) || null;

  let body;
  if (view === "inbox") {
    body = <InboxPanel notify={notify} onCounts={trackCounts} />;
  } else if (view === "analytics") {
    body = <AnalyticsPanel />;
  } else if (view === "resume") {
    body = <ResumePanel notify={notify} />;
  } else if (view === "tailor") {
    body = <TailorPanel notify={notify} />;
  } else if (view === "system") {
    body = <SystemPanel />;
  } else if (meta) {
    body = (
      <ResourcePage
        key={view}
        resource={view}
        meta={meta}
        id={id}
        go={go}
        notify={notify}
      />
    );
  } else {
    body = (
      <div className="page">
        <p className="page__error">Nothing lives at that address.</p>
        <button type="button" className="button" onClick={() => go("profile")}>
          go to profile
        </button>
      </div>
    );
  }

  return (
    <Shell nav={nav} active={view} onNavigate={go} flash={flash} unread={unread}>
      {body}
    </Shell>
  );
}
