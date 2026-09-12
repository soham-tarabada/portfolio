export const API_BASE = import.meta.env?.VITE_API_URL || "http://localhost:4000";

export async function fetchJson(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(payload?.error?.message || `Request failed with ${response.status}`);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

export async function getHealth() {
  const startedAt = performance.now();
  try {
    const response = await fetch(`${API_BASE}/api/v1/health`);
    const payload = await response.json().catch(() => null);
    return {
      reachable: true,
      ok: response.ok,
      status: response.status,
      roundTripMs: Math.round(performance.now() - startedAt),
      payload,
      error: null,
    };
  } catch (error) {
    return {
      reachable: false,
      ok: false,
      status: 0,
      roundTripMs: Math.round(performance.now() - startedAt),
      payload: null,
      error: error.message,
    };
  }
}

export async function getContent() {
  const startedAt = performance.now();
  try {
    const response = await fetch(`${API_BASE}/api/v1/content`);
    const text = await response.text();
    const payload = text ? JSON.parse(text) : null;
    return {
      reachable: true,
      ok: response.ok,
      status: response.status,
      bytes: new Blob([text]).size,
      roundTripMs: Math.round(performance.now() - startedAt),
      payload,
      error: null,
    };
  } catch (error) {
    return {
      reachable: false,
      ok: false,
      status: 0,
      bytes: 0,
      roundTripMs: Math.round(performance.now() - startedAt),
      payload: null,
      error: error.message,
    };
  }
}
