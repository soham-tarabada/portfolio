import { API_BASE } from "./api.js";

export const CONTACT_LIMITS = {
  name: { min: 2, max: 120 },
  email: { min: 3, max: 200 },
  subject: { min: 0, max: 200 },
  company: { min: 0, max: 160 },
  body: { min: 20, max: 5000 },
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const EMPTY_CONTACT = {
  name: "",
  email: "",
  company: "",
  subject: "",
  body: "",
  website: "",
};

export function validateContact(values) {
  const errors = {};
  const name = String(values.name || "").trim();
  const email = String(values.email || "").trim();
  const subject = String(values.subject || "").trim();
  const company = String(values.company || "").trim();
  const body = String(values.body || "").trim();

  if (name.length < CONTACT_LIMITS.name.min) errors.name = "at least 2 characters";
  else if (name.length > CONTACT_LIMITS.name.max) errors.name = "120 characters at most";

  if (!EMAIL_PATTERN.test(email)) errors.email = "a real address, so I can reply";
  else if (email.length > CONTACT_LIMITS.email.max) errors.email = "200 characters at most";

  if (subject.length > CONTACT_LIMITS.subject.max) errors.subject = "200 characters at most";
  if (company.length > CONTACT_LIMITS.company.max) errors.company = "160 characters at most";

  if (body.length < CONTACT_LIMITS.body.min) errors.body = "at least 20 characters";
  else if (body.length > CONTACT_LIMITS.body.max) errors.body = "5000 characters at most";

  return errors;
}

export function isValidContact(values) {
  return Object.keys(validateContact(values)).length === 0;
}

export async function sendContact(values, context = {}) {
  const response = await fetch(`${API_BASE}/api/v1/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...EMPTY_CONTACT,
      ...values,
      dwellMs: context.dwellMs || 0,
      path: context.path || "/",
      referrer: context.referrer || "",
      session: context.session || "",
    }),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(payload?.error?.message || `The server answered ${response.status}.`);
    error.status = response.status;
    error.code = payload?.error?.code;
    throw error;
  }

  return payload;
}
