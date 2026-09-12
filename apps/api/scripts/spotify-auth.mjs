import { createServer } from "node:http";
import { env } from "../src/config/env.js";

const PORT = Number(process.env.SPOTIFY_AUTH_PORT || 4599);
const REDIRECT = `http://127.0.0.1:${PORT}/callback`;
const SCOPES = "user-read-currently-playing user-read-recently-played";

if (!env.SPOTIFY_CLIENT_ID || !env.SPOTIFY_CLIENT_SECRET) {
  process.stdout.write(
    "\n  Put SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in apps/api/.env first.\n" +
      "  Create the app at https://developer.spotify.com/dashboard and add this\n" +
      `  redirect URI to it, exactly:\n\n    ${REDIRECT}\n\n`
  );
  process.exit(1);
}

const authorizeUrl = `https://accounts.spotify.com/authorize?${new URLSearchParams({
  response_type: "code",
  client_id: env.SPOTIFY_CLIENT_ID,
  scope: SCOPES,
  redirect_uri: REDIRECT,
  state: Math.random().toString(36).slice(2),
})}`;

async function exchange(code) {
  const basic = Buffer.from(`${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`).toString(
    "base64"
  );

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: REDIRECT,
    }),
  });

  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error_description || JSON.stringify(payload));

  return payload.refresh_token;
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${PORT}`);
  if (url.pathname !== "/callback") {
    res.writeHead(404).end("not here");
    return;
  }

  const error = url.searchParams.get("error");
  if (error) {
    res.writeHead(400, { "Content-Type": "text/plain" }).end(`Spotify said: ${error}`);
    process.stdout.write(`\n  Spotify refused: ${error}\n\n`);
    server.close();
    return;
  }

  try {
    const refreshToken = await exchange(url.searchParams.get("code"));
    res
      .writeHead(200, { "Content-Type": "text/plain" })
      .end("Done. The refresh token is in your terminal. You can close this tab.");

    process.stdout.write(
      `\n  Add this line to apps/api/.env, then set the same value on Vercel:\n\n` +
        `    SPOTIFY_REFRESH_TOKEN=${refreshToken}\n\n`
    );
  } catch (failure) {
    res.writeHead(500, { "Content-Type": "text/plain" }).end(failure.message);
    process.stdout.write(`\n  Token exchange failed: ${failure.message}\n\n`);
  }

  server.close();
});

server.listen(PORT, "127.0.0.1", () => {
  process.stdout.write(
    `\n  1. Make sure this redirect URI is registered on your Spotify app:\n\n` +
      `       ${REDIRECT}\n\n` +
      `  2. Open this URL in your browser and approve:\n\n` +
      `       ${authorizeUrl}\n\n` +
      `  Waiting for the callback on port ${PORT}…\n\n`
  );
});
