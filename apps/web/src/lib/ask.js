import { API_BASE } from "./api.js";

export const ASK_LIMITS = {
  min: 3,
  max: 300,
};

export const ASK_SUGGESTIONS = [
  "what did he build at TATA?",
  "does he know kubernetes?",
  "how do I hire him?",
];

export function validateQuestion(value) {
  const question = String(value || "").trim();

  if (question.length < ASK_LIMITS.min) return "ask a real question, not a fragment";
  if (question.length > ASK_LIMITS.max) {
    return `keep it under ${ASK_LIMITS.max} characters (that was ${question.length})`;
  }

  return null;
}

export async function sendQuestion(question, { session = "", path = "/", signal } = {}) {
  const response = await fetch(`${API_BASE}/api/v1/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question: String(question).trim(), session, path }),
    signal,
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(payload?.error?.message || `Request failed with ${response.status}`);
    error.status = response.status;
    error.code = payload?.error?.code;
    throw error;
  }

  return payload;
}

export async function fetchAskStatus({ signal } = {}) {
  const response = await fetch(`${API_BASE}/api/v1/ask`, { signal });
  if (!response.ok) throw new Error(`Request failed with ${response.status}`);

  const payload = await response.json();
  return { configured: payload?.configured !== false, limits: payload?.limits || null };
}
