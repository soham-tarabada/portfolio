import { User } from "../models/User.js";
import { env, isProduction } from "../config/env.js";
import { unauthorized } from "../utils/httpError.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
  newTokenId,
  refreshExpiryDate,
  refreshTtlMs,
} from "../utils/tokens.js";

export const REFRESH_COOKIE = "portfolio_refresh";
export const REFRESH_COOKIE_PATH = "/api/v1/auth";

export function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: REFRESH_COOKIE_PATH,
    maxAge: refreshTtlMs,
  };
}

export function publicUser(user) {
  return {
    id: String(user._id),
    email: user.email,
    name: user.name,
    lastLoginAt: user.lastLoginAt,
  };
}

function pruneSessions(user) {
  const now = Date.now();
  const active = (user.refreshTokens || []).filter(
    (entry) => new Date(entry.expiresAt).getTime() > now
  );
  return active.slice(-Math.max(env.MAX_ACTIVE_SESSIONS - 1, 0));
}

async function issueSession(user, userAgent) {
  const tokenId = newTokenId();
  const refreshToken = signRefreshToken(user, tokenId);

  user.refreshTokens = [
    ...pruneSessions(user),
    {
      tokenHash: hashToken(refreshToken),
      userAgent: String(userAgent || "").slice(0, 200),
      createdAt: new Date(),
      expiresAt: refreshExpiryDate(),
    },
  ];

  await user.save();

  return {
    accessToken: signAccessToken(user),
    refreshToken,
    expiresIn: env.JWT_ACCESS_TTL_SECONDS,
  };
}

export async function login({ email, password, userAgent }) {
  const user = await User.findOne({ email }).select("+passwordHash +refreshTokens");

  if (!user || !(await user.verifyPassword(password))) {
    throw unauthorized("Email or password is incorrect.", "INVALID_CREDENTIALS");
  }

  user.lastLoginAt = new Date();
  const session = await issueSession(user, userAgent);

  return { ...session, user: publicUser(user) };
}

export async function refresh({ token, userAgent }) {
  if (!token) {
    throw unauthorized("No refresh token supplied.", "NO_REFRESH_TOKEN");
  }

  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw unauthorized("Refresh token is invalid or expired.", "INVALID_REFRESH_TOKEN");
  }

  if (payload.type !== "refresh") {
    throw unauthorized("Wrong token type.", "INVALID_REFRESH_TOKEN");
  }

  const user = await User.findById(payload.sub).select("+refreshTokens");
  if (!user) {
    throw unauthorized("Account no longer exists.", "ACCOUNT_MISSING");
  }

  const presented = hashToken(token);
  const match = (user.refreshTokens || []).find((entry) => entry.tokenHash === presented);

  if (!match) {
    user.refreshTokens = [];
    await user.save();
    throw unauthorized("Refresh token has been revoked.", "REFRESH_TOKEN_REUSED");
  }

  user.refreshTokens = user.refreshTokens.filter((entry) => entry.tokenHash !== presented);

  const session = await issueSession(user, userAgent);
  return { ...session, user: publicUser(user) };
}

export async function logout(token) {
  if (!token) return;

  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    return;
  }

  const user = await User.findById(payload.sub).select("+refreshTokens");
  if (!user) return;

  const presented = hashToken(token);
  user.refreshTokens = (user.refreshTokens || []).filter(
    (entry) => entry.tokenHash !== presented
  );
  await user.save();
}
