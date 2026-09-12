export const API_BASE = import.meta.env?.VITE_API_URL || "http://localhost:4000";

let accessToken = null;
let refreshing = null;

export function setAccessToken(token) {
  accessToken = token;
}

export function hasToken() {
  return Boolean(accessToken);
}

export async function refreshSession() {
  if (!refreshing) {
    refreshing = fetch(`${API_BASE}/api/v1/auth/refresh`, {
      method: "POST",
      credentials: "include",
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Session expired.");
        const payload = await response.json();
        accessToken = payload.accessToken;
        return payload;
      })
      .finally(() => {
        refreshing = null;
      });
  }

  return refreshing;
}

export async function request(path, options = {}, allowRetry = true) {
  const isForm = options.body instanceof FormData;

  const response = await fetch(`${API_BASE}/api/v1${path}`, {
    credentials: "include",
    ...options,
    headers: {
      ...(isForm ? {} : { "Content-Type": "application/json" }),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (response.status === 204) return null;

  const payload = await response.json().catch(() => null);

  if (response.status === 401 && allowRetry && payload?.error?.code === "TOKEN_EXPIRED") {
    await refreshSession();
    return request(path, options, false);
  }

  if (!response.ok) {
    const error = new Error(payload?.error?.message || `Request failed (${response.status})`);
    error.status = response.status;
    error.code = payload?.error?.code;
    throw error;
  }

  return payload;
}

export const auth = {
  login: (email, password) =>
    request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  logout: () => request("/auth/logout", { method: "POST" }),
  me: () => request("/auth/me"),
};

export const admin = {
  resources: () => request("/admin/resources"),
  list: (resource) => request(`/admin/${resource}`),
  create: (resource, data) =>
    request(`/admin/${resource}`, { method: "POST", body: JSON.stringify(data) }),
  update: (resource, id, data) =>
    request(id ? `/admin/${resource}/${id}` : `/admin/${resource}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  patch: (resource, id, data) =>
    request(`/admin/${resource}/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  remove: (resource, id) => request(`/admin/${resource}/${id}`, { method: "DELETE" }),
  reorder: (resource, ids) =>
    request(`/admin/${resource}/reorder`, { method: "PATCH", body: JSON.stringify({ ids }) }),
};

export const inbox = {
  list: ({ status = "inbox", q = "", page = 1 } = {}) => {
    const query = new URLSearchParams({ status, page: String(page) });
    if (q) query.set("q", q);
    return request(`/admin/inbox?${query.toString()}`);
  },
  counts: () => request("/admin/inbox/counts"),
  open: (id) => request(`/admin/inbox/${id}`),
  setStatus: (id, status) =>
    request(`/admin/inbox/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }),
  remove: (id) => request(`/admin/inbox/${id}`, { method: "DELETE" }),
};

export const analytics = {
  summary: (days = 30) => request(`/admin/analytics?days=${days}`),
};

export const resume = {
  versions: () => request("/admin/assets/resume"),
  upload: (file) => {
    const form = new FormData();
    form.append("file", file);
    return request("/admin/assets/resume", { method: "POST", body: form });
  },
  activate: (id) => request(`/admin/assets/resume/${id}/activate`, { method: "POST" }),
  remove: (id) => request(`/admin/assets/resume/${id}`, { method: "DELETE" }),
  publicUrl: `${API_BASE}/api/v1/resume`,
};

export const ask = {
  list: ({ page = 1, limit = 25 } = {}) =>
    request(`/admin/ask?page=${page}&limit=${limit}`),
  remove: (id) => request(`/admin/ask/${id}`, { method: "DELETE" }),
};

async function download(path, body) {
  const response = await fetch(`${API_BASE}/api/v1${path}`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify(body),
  });

  if (response.status === 401) {
    await refreshSession();
    return download(path, body);
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.error?.message || `Export failed (${response.status})`);
  }

  return {
    blob: await response.blob(),
    pages: Number(response.headers.get("X-Resume-Pages")) || 1,
    filename: filenameFromDisposition(response.headers.get("Content-Disposition")),
  };
}

function filenameFromDisposition(value) {
  const match = /filename="([^"]+)"/.exec(String(value || ""));
  return match ? match[1] : "Resume.pdf";
}

export const tailor = {
  source: () => request("/admin/tailor/source"),
  list: () => request("/admin/tailor"),
  create: (selection) =>
    request("/admin/tailor", { method: "POST", body: JSON.stringify(selection) }),
  update: (id, selection) =>
    request(`/admin/tailor/${id}`, { method: "PUT", body: JSON.stringify(selection) }),
  remove: (id) => request(`/admin/tailor/${id}`, { method: "DELETE" }),
  preview: (selection) =>
    request("/admin/tailor/preview", { method: "POST", body: JSON.stringify(selection) }),
  render: (selection) => download("/admin/tailor/render", selection),
  publish: (selection, id) =>
    request(id ? `/admin/tailor/${id}/publish` : "/admin/tailor/publish", {
      method: "POST",
      body: JSON.stringify(selection),
    }),
};

export async function health() {
  try {
    const response = await fetch(`${API_BASE}/api/v1/health`);
    return { ok: response.ok, payload: await response.json().catch(() => null) };
  } catch (error) {
    return { ok: false, payload: null, error: error.message };
  }
}
