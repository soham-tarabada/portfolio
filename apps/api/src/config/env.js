import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(currentDir, "../../.env"), quiet: true });

function parseList(value) {
  return String(value || "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function parseNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseNumber(process.env.PORT, 4000),

  MONGODB_URI: process.env.MONGODB_URI || "",
  MONGODB_DB: process.env.MONGODB_DB || "portfolio",

  CORS_ORIGINS: parseList(
    process.env.CORS_ORIGINS || "http://localhost:5173,http://localhost:5174"
  ),

  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || "",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "",
  JWT_ACCESS_TTL_SECONDS: parseNumber(process.env.JWT_ACCESS_TTL_SECONDS, 900),
  JWT_REFRESH_TTL_DAYS: parseNumber(process.env.JWT_REFRESH_TTL_DAYS, 7),
  MAX_ACTIVE_SESSIONS: parseNumber(process.env.MAX_ACTIVE_SESSIONS, 5),

  ADMIN_EMAIL: process.env.ADMIN_EMAIL || "",
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || "",
  ADMIN_NAME: process.env.ADMIN_NAME || "Soham Tarabada",

  CONTENT_CACHE_TTL_MS: parseNumber(process.env.CONTENT_CACHE_TTL_MS, 30000),

  ANALYTICS_SALT: process.env.ANALYTICS_SALT || process.env.JWT_ACCESS_SECRET || "",
  ANALYTICS_RETENTION_DAYS: parseNumber(process.env.ANALYTICS_RETENTION_DAYS, 180),
  ANALYTICS_ENABLED: process.env.ANALYTICS_ENABLED !== "false",
  CONTACT_MAX_PER_HOUR: parseNumber(process.env.CONTACT_MAX_PER_HOUR, 5),
  CONTACT_MIN_DWELL_MS: parseNumber(process.env.CONTACT_MIN_DWELL_MS, 2000),

  ASK_PROVIDER: (process.env.ASK_PROVIDER || "anthropic").trim().toLowerCase(),
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || "",
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
  ASK_ENABLED: process.env.ASK_ENABLED !== "false",
  ASK_MODEL: process.env.ASK_MODEL || "",
  ASK_MAX_TOKENS: parseNumber(process.env.ASK_MAX_TOKENS, 400),
  ASK_THINKING_BUDGET: parseNumber(process.env.ASK_THINKING_BUDGET, 0),
  ASK_MAX_PER_HOUR: parseNumber(process.env.ASK_MAX_PER_HOUR, 8),
  ASK_MAX_PER_DAY: parseNumber(process.env.ASK_MAX_PER_DAY, 25),
  ASK_RETENTION_DAYS: parseNumber(process.env.ASK_RETENTION_DAYS, 90),
  ASK_TIMEOUT_MS: parseNumber(process.env.ASK_TIMEOUT_MS, 20000),

  SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID || "",
  SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET || "",
  SPOTIFY_REFRESH_TOKEN: process.env.SPOTIFY_REFRESH_TOKEN || "",
  SPOTIFY_CACHE_TTL_MS: parseNumber(process.env.SPOTIFY_CACHE_TTL_MS, 15000),

  SERVICE_NAME: "portfolio-api",
  SERVICE_VERSION: "0.1.0",
};

export const isProduction = env.NODE_ENV === "production";

export function assertEnv() {
  const missing = [];
  if (!env.MONGODB_URI) missing.push("MONGODB_URI");
  if (!env.JWT_ACCESS_SECRET) missing.push("JWT_ACCESS_SECRET");
  if (!env.JWT_REFRESH_SECRET) missing.push("JWT_REFRESH_SECRET");

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }

  if (env.JWT_ACCESS_SECRET === env.JWT_REFRESH_SECRET) {
    throw new Error("JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be different values.");
  }
}
