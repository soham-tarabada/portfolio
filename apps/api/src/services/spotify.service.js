import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

const TOKEN_URL = "https://accounts.spotify.com/api/token";
const NOW_PLAYING_URL = "https://api.spotify.com/v1/me/player/currently-playing";
const RECENT_URL = "https://api.spotify.com/v1/me/player/recently-played?limit=1";

let token = { value: null, expiresAt: 0 };
let cache = { payload: null, expiresAt: 0 };

export function isConfigured() {
  return Boolean(
    env.SPOTIFY_CLIENT_ID && env.SPOTIFY_CLIENT_SECRET && env.SPOTIFY_REFRESH_TOKEN
  );
}

export function resetSpotifyCache() {
  token = { value: null, expiresAt: 0 };
  cache = { payload: null, expiresAt: 0 };
}

async function accessToken() {
  const now = Date.now();
  if (token.value && token.expiresAt > now) return token.value;

  const basic = Buffer.from(`${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`).toString(
    "base64"
  );

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: env.SPOTIFY_REFRESH_TOKEN,
    }),
    signal: AbortSignal.timeout(6000),
  });

  if (!response.ok) {
    throw new Error(`Spotify refused the refresh token (${response.status}).`);
  }

  const payload = await response.json();
  token = {
    value: payload.access_token,
    expiresAt: now + Math.max((payload.expires_in || 3600) - 60, 60) * 1000,
  };

  return token.value;
}

export function shapeTrack(item, { playing, progressMs = null, playedAt = null } = {}) {
  if (!item) return null;

  return {
    title: item.name,
    artist: (item.artists || []).map((artist) => artist.name).join(", "),
    album: item.album?.name || "",
    artwork: item.album?.images?.slice(-1)[0]?.url || null,
    url: item.external_urls?.spotify || null,
    durationMs: item.duration_ms ?? null,
    progressMs,
    playing,
    playedAt,
  };
}

async function call(url, bearer) {
  return fetch(url, {
    headers: { Authorization: `Bearer ${bearer}` },
    signal: AbortSignal.timeout(6000),
  });
}

export async function getNowPlaying() {
  if (!isConfigured()) return { configured: false, playing: false, track: null };

  const now = Date.now();
  if (cache.payload && cache.expiresAt > now) return cache.payload;

  let result = { configured: true, playing: false, track: null };

  try {
    const bearer = await accessToken();
    const current = await call(NOW_PLAYING_URL, bearer);

    if (current.status === 200) {
      const payload = await current.json();
      if (payload?.item && payload.is_playing) {
        result = {
          configured: true,
          playing: true,
          track: shapeTrack(payload.item, {
            playing: true,
            progressMs: payload.progress_ms ?? null,
          }),
        };
      }
    }

    if (!result.playing) {
      const recent = await call(RECENT_URL, bearer);
      if (recent.ok) {
        const payload = await recent.json();
        const entry = payload?.items?.[0];
        if (entry?.track) {
          result = {
            configured: true,
            playing: false,
            track: shapeTrack(entry.track, { playing: false, playedAt: entry.played_at }),
          };
        }
      }
    }
  } catch (error) {
    logger.warn("spotify unavailable", { message: error.message });
    result = { configured: true, playing: false, track: null, error: "unavailable" };
  }

  cache = { payload: result, expiresAt: now + env.SPOTIFY_CACHE_TTL_MS };
  return result;
}
