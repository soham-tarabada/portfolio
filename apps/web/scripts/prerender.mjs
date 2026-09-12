import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnv } from "vite";
import {
  routesFor,
  metaFor,
  renderHead,
  renderNoscript,
  renderSitemap,
  renderRobots,
  DEFAULT_SITE_URL,
} from "../src/lib/seo.js";

const here = dirname(fileURLToPath(import.meta.url));
const dist = join(here, "..", "dist");

const root = join(here, "..");
const env = loadEnv(process.env.NODE_ENV === "development" ? "development" : "production", root, "VITE_");

const API = env.VITE_API_URL || "http://localhost:4000";
const SITE = (env.VITE_SITE_URL || DEFAULT_SITE_URL).replace(/\/+$/, "");

if (/localhost|127\.0\.0\.1/.test(SITE) && process.env.VERCEL) {
  process.stdout.write(
    `\n  VITE_SITE_URL is ${SITE} on a Vercel build.\n` +
      `  Canonical tags, Open Graph URLs and the sitemap would all point at localhost.\n` +
      `  Set VITE_SITE_URL to the public URL and redeploy.\n\n`
  );
  process.exit(1);
}

const template = readFileSync(join(dist, "index.html"), "utf8");

function stripHead(html) {
  return html
    .replace(/\n?\s*<title>[\s\S]*?<\/title>/i, "")
    .replace(/\n?\s*<meta\s+name="description"[\s\S]*?\/>/i, "");
}

function pageFor(route, content) {
  const meta = metaFor(route, content, SITE, API);
  const head = renderHead(meta);

  return stripHead(template)
    .replace("</head>", `  ${head}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root"></div>\n    ${renderNoscript(route, content)}`);
}

function write(relative, body) {
  const target = join(dist, relative);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, body);
  return relative;
}

async function loadContent() {
  const response = await fetch(`${API}/api/v1/content`, { signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error(`the content endpoint answered ${response.status}`);

  const payload = await response.json();
  if (!payload?.profile) throw new Error("the content endpoint returned no profile");

  return payload;
}

let content = null;

try {
  content = await loadContent();
} catch (error) {
  process.stdout.write(
    `\n  prerender skipped — ${error.message}\n` +
      `  ${API} must be reachable at build time or the site ships without per-page SEO.\n` +
      `  npm run verify will fail on this until it is.\n\n`
  );
  write("robots.txt", renderRobots(SITE));
  process.exit(0);
}

const routes = routesFor(content);
const written = [];

for (const route of routes) {
  const target = route.path === "/" ? "index.html" : `${route.path.slice(1)}/index.html`;
  written.push(write(target, pageFor(route, content)));
}

written.push(write("sitemap.xml", renderSitemap(routes, SITE, content.meta?.generatedAt)));
written.push(write("robots.txt", renderRobots(SITE)));

process.stdout.write(`\n  prerendered ${routes.length} routes for ${SITE}\n`);
for (const file of written) process.stdout.write(`    ${file}\n`);
process.stdout.write("\n");
