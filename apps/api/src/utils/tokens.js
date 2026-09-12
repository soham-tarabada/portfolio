import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

const REFRESH_TTL_SECONDS = env.JWT_REFRESH_TTL_DAYS * 24 * 60 * 60;

export function signAccessToken(user) {
  return jwt.sign(
    { sub: String(user._id), email: user.email, type: "access" },
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.JWT_ACCESS_TTL_SECONDS, issuer: env.SERVICE_NAME }
  );
}

export function signRefreshToken(user, tokenId) {
  return jwt.sign({ sub: String(user._id), jti: tokenId, type: "refresh" }, env.JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TTL_SECONDS,
    issuer: env.SERVICE_NAME,
  });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET, { issuer: env.SERVICE_NAME });
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET, { issuer: env.SERVICE_NAME });
}

export function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function newTokenId() {
  return crypto.randomUUID();
}

export function refreshExpiryDate() {
  return new Date(Date.now() + REFRESH_TTL_SECONDS * 1000);
}

export const refreshTtlMs = REFRESH_TTL_SECONDS * 1000;
