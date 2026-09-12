export const SESSION_KEY = "portfolio_session";
export const MAX_BATCH = 20;
export const FLUSH_DELAY_MS = 3000;

export function makeSessionId(random = Math.random) {
  const noise = () => Math.floor(random() * 0xffffffff).toString(36);
  return `${noise()}${noise()}`.slice(0, 24);
}

export function trackingAllowed(agent) {
  if (!agent) return false;
  if (agent.globalPrivacyControl === true) return false;
  return agent.doNotTrack !== "1" && agent.doNotTrack !== "yes";
}

export function readSession(storage, random = Math.random) {
  try {
    const existing = storage?.getItem(SESSION_KEY);
    if (existing) return existing;

    const created = makeSessionId(random);
    storage?.setItem(SESSION_KEY, created);
    return created;
  } catch {
    return makeSessionId(random);
  }
}

export function pushEvent(queue, event) {
  if (!event?.type || !event?.name) return queue;

  const last = queue[queue.length - 1];
  const repeat =
    last && last.type === event.type && last.name === event.name && last.path === event.path;

  if (repeat) return queue;

  return [...queue, event].slice(-MAX_BATCH);
}

export function createTracker({
  storage,
  agent,
  send,
  referrer = "",
  delay = FLUSH_DELAY_MS,
  schedule = setTimeout,
  cancel = clearTimeout,
} = {}) {
  const enabled = trackingAllowed(agent);
  const session = enabled ? readSession(storage) : "";

  let queue = [];
  let timer = null;

  function flush() {
    if (timer !== null) {
      cancel(timer);
      timer = null;
    }

    if (!enabled || queue.length === 0) return null;

    const batch = queue;
    queue = [];

    return send({ session, referrer, events: batch });
  }

  function track(type, name, path = "/") {
    if (!enabled) return;

    const next = pushEvent(queue, { type, name, path });
    if (next === queue) return;

    queue = next;

    if (queue.length >= MAX_BATCH) {
      flush();
      return;
    }

    if (timer === null) timer = schedule(flush, delay);
  }

  return {
    enabled,
    session,
    track,
    flush,
    pending: () => queue.length,
  };
}
