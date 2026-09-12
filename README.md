# portfolio-v5

Soham Tarabada's portfolio, rebuilt as a terminal/IDE shell with a database behind it
and an admin panel in front of it.

## Layout

```
apps/api      Express 5 + Mongoose, deployed as one Vercel serverless function
apps/web      Vite + React portfolio (the IDE shell)
apps/admin    Vite + React admin panel
packages/theme  Shared CRT design tokens, the four phosphors and the global stylesheet
```

## Requirements

- Node 20 or newer (`.nvmrc` pins 24)
- A MongoDB Atlas cluster

## Setup

```bash
npm install
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
cp apps/admin/.env.example apps/admin/.env
```

Fill in `MONGODB_URI` in `apps/api/.env`, then:

```bash
npm run dev
```

| App   | URL                     |
| ----- | ----------------------- |
| api   | http://localhost:4000   |
| web   | http://localhost:5173   |
| admin | http://localhost:5174   |

Seed the database from the resume data:

```bash
npm run seed
```

By default the seed only inserts what is missing, so it never overwrites content edited
later. `--overwrite` updates existing documents, `--reset` wipes the content collections
first, and `--reset-password` re-hashes the admin password from `ADMIN_PASSWORD`.

## Verifying

With the API running, both frontends check their logic without a browser:

```bash
npm run verify
```

`@portfolio/web` exercises URL round-tripping for every file, the command registry,
argument resolution, output width, and the architecture diagram geometry — box bounds,
overlap, text fit and truncation — against the live content payload. It also drives the
editor's own state: the tab strip opens, steps and closes the way an editor does, a
restored workspace drops files that have since been deleted rather than rendering a hole,
and the shortcut labels are asserted to follow the platform so a Command glyph never
reaches a machine without a Command key.

It also covers the analytics queue — batching, de-duplication, the batch
cap, and that Do Not Track or Global Privacy Control switches collection off entirely —
and asserts the contact form's field limits still match the ones in
`apps/api/src/routes/contact.route.js`.

The `ask` command is covered without spending a request: a fragment or an over-long
question is refused before the network is touched, a deferred answer still prints
something at once, a long answer wraps to the terminal width, and each state the endpoint
can return — unconfigured, empty, rate limited, answered — renders the right line.

It then audits the parts of the site a browser would normally have to judge. Every colour
in `packages/theme/tokens.css` is measured against every surface it sits on, in all four
phosphors, and has to clear WCAG AA — 4.5:1 for text, 3:1 for control outlines. The
stylesheet and `packages/theme/phosphors.js` are held to each other: every palette the
picker offers has a block in the CSS, every block in the CSS is a palette the picker
offers, each one defines its own surfaces rather than inheriting amber's, its accent ramp
darkens from `--phosphor` through `--phosphor-dim` to `--phosphor-deep`, and the swatch
colours baked into the manifest still match the tokens they claim to preview. Every
prerendered route is checked for a unique title, a description that fits a search result,
matching canonical and `og:url`, parseable JSON-LD, and a `<noscript>` block that still
carries the content; hostile content is fed through the same path to prove it comes out
escaped. If the build shipped without prerendering, these fail.

`@portfolio/admin` exercises the form registry against the API's own schemas, the
reordering and hash-routing helpers, the chart geometry and the inbox's relative dates,
and then signs in and drives the real endpoints: anonymous requests are refused, the
refresh cookie rotates, a created record reaches `/api/v1/content` without a redeploy,
hiding removes it again, a drag-order is saved and survives a reload, a no-op save drops
no field, and the live resume downloads as a PDF of the stated byte length.

It then posts to the public endpoints the way a visitor would: a message lands in the
inbox, opening it marks it read, search finds it, the status moves, deleting it puts the
counts back; a honeypot submission is accepted and stored nowhere; a form filled in under
two seconds goes to spam; the flood limit fires; a crawler's events are ignored; and a
batch of page views, file opens and commands shows up in the analytics summary before the
session is erased again. It restores whatever it touched, including after a failed check.

The tailor is checked on both sides. The selection helpers are exercised as pure
functions — ticking a record takes all its bullets, unticking the last one drops the
record, order survives out-of-sequence ticks, reordering loses nothing, a stale id from a
deleted record is ignored, and a hidden social never reaches the header. What the panel
would send is then parsed by the API's own zod schema, so the two cannot drift. Against
the live API it renders a trimmed selection and asserts one page, checks the export is a
complete PDF of the stated byte length, refuses an empty selection, and saves, updates and
deletes a variant, leaving the collection as it found it. It never calls `publish`, which
would replace the live resume. The grounding sent to the model is asserted to carry every
bullet the site shows, to skip empty sections, to mark NDA projects, and to sit inside a
system prompt that forbids invention and ignores instructions inside a question. Every
project is checked to carry scale figures, modules and engineering decisions, and the
public payload is scanned for claims the repositories do not support.

Each run presents itself as a fresh client address, so runs are independent and can be
repeated back to back. Credentials come from `ADMIN_EMAIL` and `ADMIN_PASSWORD`, falling
back to `apps/api/.env`.

CSS layout and rendering are not covered by either; those need looking at.

## Endpoints

| Method | Route                  | Auth   | Purpose                                   |
| ------ | ---------------------- | ------ | ----------------------------------------- |
| GET    | `/api/v1/health`       | public | Service and Atlas status                  |
| GET    | `/api/v1/content`      | public | Whole site payload, cached 30s in-process |
| POST   | `/api/v1/auth/login`   | public | 5 attempts per 15 minutes per IP          |
| POST   | `/api/v1/auth/refresh` | cookie | Rotates the refresh token                 |
| POST   | `/api/v1/auth/logout`  | cookie | Revokes the presented session             |
| GET    | `/api/v1/auth/me`      | bearer | Current admin user                        |
| GET    | `/api/v1/resume`       | public | The live resume PDF                       |
| GET    | `/api/v1/resume/meta`  | public | Filename, size and version of that PDF    |
| POST   | `/api/v1/contact`      | public | Send a message, 5 per hour per address    |
| POST   | `/api/v1/events`       | public | Record up to 20 analytics events          |
| GET    | `/api/v1/now-playing`  | public | Current or last Spotify track, cached 15s |
| GET    | `/api/v1/ask`          | public | Whether the ask command is switched on    |
| POST   | `/api/v1/ask`          | public | Answer a question from the site's content |
| GET    | `/api/v1/admin/resources` | bearer | The seven editable resources and their flags |
| GET    | `/api/v1/admin/:resource` | bearer | List, or the single document          |
| POST   | `/api/v1/admin/:resource` | bearer | Create                                |
| PUT    | `/api/v1/admin/:resource/:id` | bearer | Replace, full schema validation   |
| PATCH  | `/api/v1/admin/:resource/:id` | bearer | Partial update                    |
| DELETE | `/api/v1/admin/:resource/:id` | bearer | Delete                            |
| PATCH  | `/api/v1/admin/:resource/reorder` | bearer | Persist a new order from an id list |
| GET    | `/api/v1/admin/assets/resume` | bearer | Version history                   |
| POST   | `/api/v1/admin/assets/resume` | bearer | Upload a PDF as the next version, made live |
| POST   | `/api/v1/admin/assets/resume/:id/activate` | bearer | Roll back to a version |
| DELETE | `/api/v1/admin/assets/resume/:id` | bearer | Delete an inactive version    |
| GET    | `/api/v1/admin/inbox`  | bearer | Messages, filtered and paged, with counts |
| GET    | `/api/v1/admin/inbox/counts` | bearer | Counts per status only              |
| GET    | `/api/v1/admin/inbox/:id` | bearer | One message, marked read on open       |
| PATCH  | `/api/v1/admin/inbox/:id` | bearer | Move it to another status              |
| DELETE | `/api/v1/admin/inbox/:id` | bearer | Delete it for good                     |
| GET    | `/api/v1/admin/analytics` | bearer | Summary over 7, 30 or 90 days          |
| DELETE | `/api/v1/admin/analytics/sessions/:session` | bearer | Erase one session's events |
| GET    | `/api/v1/admin/ask`    | bearer | What visitors have asked, newest first    |
| DELETE | `/api/v1/admin/ask/:id` | bearer | Delete one logged question               |
| GET    | `/api/v1/admin/tailor/source` | bearer | Every record a resume can draw on   |
| GET    | `/api/v1/admin/tailor` | bearer | Saved resume variants                     |
| POST   | `/api/v1/admin/tailor` | bearer | Save a variant                            |
| PUT    | `/api/v1/admin/tailor/:id` | bearer | Update a saved variant                |
| DELETE | `/api/v1/admin/tailor/:id` | bearer | Delete a saved variant                |
| POST   | `/api/v1/admin/tailor/preview` | bearer | Real page count without downloading |
| POST   | `/api/v1/admin/tailor/render` | bearer | The tailored PDF as a download       |
| POST   | `/api/v1/admin/tailor/publish` | bearer | Render it and make it the live resume |

`projects` is both a folder in the file tree and a file of its own: `/projects` renders an
index of every platform — title, subtitle, client, period and stack — and each project
below it keeps its own route.

`sections` is fixed: its rows can be renamed, reordered and hidden, but not added or
removed, because the site's file tree expects those keys. Every mutation invalidates the
content cache, so an edit is live on the next page load.

Refresh tokens are stored hashed, rotated on every use, and replaying a spent token
revokes every session for that account.

## Messages and analytics

The contact form on `contact.sh` writes to the `messages` collection and nowhere else —
there is no mail relay and no third party in the path. Replies go from your own client,
through the mailto link in the panel. Two filters run before anything is stored: a
honeypot field, whose submissions are accepted and discarded, and a dwell timer, which
files anything sent in under `CONTACT_MIN_DWELL_MS` as spam rather than dropping it. The
sender's IP address is never stored, only a salted hash that changes daily.

Analytics are first-party counts: page views, files opened, terminal commands, resume
opens and outbound profile clicks. No cookie is set. A visitor is a random id held in
`sessionStorage`, which the browser forgets when the tab closes, so the same person
returning tomorrow is a new visitor. Referrers are reduced to a hostname, IP addresses are
never stored, requests that look like crawlers are dropped, and Do Not Track or Global
Privacy Control turns collection off in the browser before anything is sent. Events delete
themselves after `ANALYTICS_RETENTION_DAYS`, and a single session can be erased on demand.

## Asking questions

`ask <question>` in the terminal answers from the site's own database and nothing else.
The API builds a plain-text digest of the content payload — profile, every role and
bullet, every project with its tech and NDA flag, skills, education and the uses page —
and sends it as a cached system prompt with the visitor's question. The model is told to
answer only from that digest, to say so when the answer is not there, to write plain text
because the terminal renders no markdown, and to ignore instructions embedded in the
question itself.

Each project also carries a `dossier` — scale figures, module list, integrations and the
engineering decisions behind it — written from reading the client repositories rather
than from the resume. It is edited as JSON on the project form in the admin panel and is
the reason the command can answer "how many endpoints did Dr Jones have" or "how did he
stop duplicate Stripe webhooks". Nothing in it is private: the grounding is built from
the public content payload, so anything added there is answerable by any visitor. Client
hostnames, credentials, data and security details are deliberately absent.

Three providers are supported, chosen with `ASK_PROVIDER`: `anthropic`, `openai` or
`gemini`. Each supplies its own URL, auth header, request body, answer extractor and
token accounting; everything else — the grounding, the system prompt, the caps, the log
and the terminal — is provider-agnostic. `ASK_MODEL` overrides the provider's default.
Whatever a provider returns is run through a markdown stripper before it reaches the
terminal, which renders none of it.

Gemini 2.5 models think by default and those tokens come out of `maxOutputTokens`, which
truncates a short answer mid-sentence. `ASK_THINKING_BUDGET` is therefore 0 by default.
Raise it only if you switch to a model that needs reasoning and also raise
`ASK_MAX_TOKENS`.

Without a key for the selected provider the endpoint answers `configured: false` and the
command says so; every other command still works. Two caps guard the bill: a per-hour limiter in
process, and a per-day count in MongoDB keyed on the same daily-rotating IP pseudonym the
analytics use, so it survives a restart and works across serverless instances. Questions
and answers are stored for `ASK_RETENTION_DAYS` and shown at the bottom of the Analytics
panel — what people ask a portfolio is worth reading.

## Tailoring a resume

Admin → **Tailor** builds a resume out of the same records the site renders. Tick the
bullets that matter for one role, drop the skill categories that do not, reorder the
roles and projects, override the summary and the headline. A gauge estimates how much of
one page the selection fills as you go; **check fit** renders the PDF server-side and
reports the real page count.

**export pdf** downloads it. **publish as site resume** renders the same file, stores it
as the next resume version and makes it the live download, so `/api/v1/resume` and the
terminal's `resume` command serve it immediately. Selections can be saved as named
variants with a target role and a note.

The PDF is generated with PDFKit in Helvetica at A4, single column, with no letter-spacing
and no tables, so a text extractor reads the section headings as words. Hidden socials
never reach the header, and a bullet index pointing at a record that has since changed is
dropped rather than rendered.

## Environment variables

### apps/api

| Name           | Purpose                                             |
| -------------- | --------------------------------------------------- |
| `NODE_ENV`     | `development` or `production`                        |
| `PORT`         | Local port, ignored on Vercel                        |
| `MONGODB_URI`  | Atlas connection string                              |
| `MONGODB_DB`   | Database name, defaults to `portfolio`               |
| `JWT_ACCESS_SECRET`  | Access token signing secret                    |
| `JWT_REFRESH_SECRET` | Refresh token signing secret, must differ      |
| `JWT_ACCESS_TTL_SECONDS` | Access token lifetime, default 900         |
| `JWT_REFRESH_TTL_DAYS`   | Refresh token lifetime, default 7          |
| `MAX_ACTIVE_SESSIONS`    | Concurrent sessions kept per user, default 5 |
| `ADMIN_EMAIL`  | Seeded admin account                                 |
| `ADMIN_PASSWORD` | Seeded admin password, minimum 12 characters       |
| `CONTENT_CACHE_TTL_MS` | Content cache lifetime, default 30000        |
| `CORS_ORIGINS` | Comma-separated allowed origins for the two frontends |
| `ANALYTICS_ENABLED` | Set to `false` to stop recording events entirely |
| `ANALYTICS_RETENTION_DAYS` | Events expire after this many days, default 180 |
| `ANALYTICS_SALT` | Salt for the daily pseudonym, falls back to the access secret |
| `CONTACT_MAX_PER_HOUR` | Messages accepted per address per hour, default 5 |
| `CONTACT_MIN_DWELL_MS` | Faster than this and the message goes to spam, default 2000 |
| `ASK_PROVIDER` | `anthropic`, `openai` or `gemini`, default `anthropic` |
| `ANTHROPIC_API_KEY` | Key when the provider is `anthropic`                 |
| `OPENAI_API_KEY` | Key when the provider is `openai`                      |
| `GEMINI_API_KEY` | Key when the provider is `gemini`                      |
| `ASK_ENABLED`  | Set to `false` to switch `ask` off with the key still set |
| `ASK_MODEL`    | Overrides the provider's default model                |
| `ASK_MAX_TOKENS` | Cap on answer length, default 400                   |
| `ASK_THINKING_BUDGET` | Gemini thinking tokens, default 0 — they come out of the answer budget |
| `ASK_MAX_PER_HOUR` | Questions per IP per hour, in process, default 8  |
| `ASK_MAX_PER_DAY`  | Questions per IP per day, counted in MongoDB, default 25 |
| `ASK_RETENTION_DAYS` | Logged questions expire after this many days, default 90 |
| `ASK_TIMEOUT_MS` | How long to wait on the model, default 20000        |
| `SPOTIFY_CLIENT_ID` | Spotify app id, leave blank to switch now-playing off |
| `SPOTIFY_CLIENT_SECRET` | Spotify app secret                              |
| `SPOTIFY_REFRESH_TOKEN` | From `npm run spotify-auth -w @portfolio/api`   |
| `SPOTIFY_CACHE_TTL_MS` | How long a track is cached, default 15000        |

### apps/web and apps/admin

| Name            | Purpose                                              |
| --------------- | ---------------------------------------------------- |
| `VITE_API_URL`  | Base URL of the API service                          |
| `VITE_SITE_URL` | Public site URL, used for canonical tags and the sitemap |

## Search engines and sharing

`npm run build` runs `vite build` and then `scripts/prerender.mjs`, which reads
`/api/v1/content` and writes a real HTML file per route — `dist/about/index.html`,
`dist/projects/index.html`, `dist/projects/mav/index.html` and so on. Each carries its own title, description,
canonical URL, Open Graph and Twitter tags, JSON-LD (`Person`, or `CreativeWork` on a
project) and a `<noscript>` block holding the actual text and internal links, so a
crawler that never runs JavaScript still gets the content. `sitemap.xml` and `robots.txt`
are written from the same payload.

Set `VITE_SITE_URL` on the Vercel project to the public URL. If it still points at
localhost, the build stops rather than shipping canonical tags nobody can follow.

**The API has to be reachable when the build runs.** If it is not, the build still
succeeds but ships the plain shell, and `npm run verify` fails on it straight away rather
than letting it go unnoticed. Content edited in the admin panel is live immediately for
visitors, but the prerendered `<head>` and `<noscript>` only catch up on the next deploy —
redeploy the site after renaming a section or adding a project.

`public/og.png` is the 1200×630 share card. It is a committed asset, not generated at
build time, so regenerating it needs ImageMagick locally.

## Now playing

`GET /api/v1/now-playing` returns the current Spotify track, falling back to the last one
played. Without the three `SPOTIFY_*` variables it answers
`{ "configured": false }` and the status bar simply shows nothing — the feature is off,
not broken. To switch it on: create an app at
[developer.spotify.com](https://developer.spotify.com/dashboard), add
`http://127.0.0.1:4599/callback` as a redirect URI, put the id and secret in
`apps/api/.env`, then

```bash
npm run spotify-auth -w @portfolio/api
```

and follow the printed URL. It prints a refresh token to paste into `.env` and set on
Vercel. Spotify credentials never reach the browser; the API holds them and the site only
ever sees a track name.

## Deploying

Three Vercel projects from this one repository.

| Project          | Root directory | Build command   | Output |
| ---------------- | -------------- | --------------- | ------ |
| `soham-api`      | `apps/api`     | none            | none   |
| `soham-portfolio`| `apps/web`     | `npm run build` | `dist` |
| `soham-admin`    | `apps/admin`   | `npm run build` | `dist` |

Deploy the API first, then set `VITE_API_URL` on the two frontends to its URL, and set
`CORS_ORIGINS` on the API to both frontend URLs.

## Phases

| Phase | Scope                                                     | Status |
| ----- | --------------------------------------------------------- | ------ |
| 00    | Monorepo, Atlas, three deploy targets, health check        | done   |
| 01    | Models, resume seed, JWT auth, content endpoint            | done   |
| 02    | The IDE shell                                              | done   |
| 03    | Terminal REPL and command palette                          | done   |
| 04    | Architecture diagrams                                      | done   |
| 05    | Admin panel                                                | done   |
| 06    | Contact inbox and analytics                                | done   |
| 07    | Spotify, /uses, SEO, performance and accessibility passes  | done   |
| 08    | Grounded `ask` command and the resume tailor                | done   |
