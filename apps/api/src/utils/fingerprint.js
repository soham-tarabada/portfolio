import crypto from "node:crypto";
import { env } from "../config/env.js";

export function dayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function clientIp(req) {
  const forwarded = String(req.headers["x-forwarded-for"] || "")
    .split(",")[0]
    .trim();
  return forwarded || req.ip || "";
}

export function pseudonym(value, scope = "") {
  const secret = `${env.ANALYTICS_SALT || "portfolio"}:${dayKey()}:${scope}`;
  return crypto
    .createHmac("sha256", secret)
    .update(String(value || "anonymous"))
    .digest("hex")
    .slice(0, 32);
}

export function deviceOf(userAgent) {
  const agent = String(userAgent || "").toLowerCase();
  if (!agent) return "unknown";
  if (/ipad|tablet|playbook|silk/.test(agent)) return "tablet";
  if (/mobi|iphone|android|phone/.test(agent)) return "mobile";
  if (/bot|crawler|spider|curl|wget|headless/.test(agent)) return "bot";
  return "desktop";
}

export function referrerHost(value, selfHosts = []) {
  const raw = String(value || "").trim();
  if (!raw) return "direct";

  try {
    const host = new URL(raw).hostname.replace(/^www\./, "");
    if (!host) return "direct";
    if (selfHosts.includes(host)) return "direct";
    return host.slice(0, 120);
  } catch {
    return "direct";
  }
}

export function trimPath(value) {
  const raw = String(value || "").trim();
  if (!raw.startsWith("/")) return "/";
  return raw.split("?")[0].split("#")[0].slice(0, 200) || "/";
}
