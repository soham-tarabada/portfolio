import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  PHOSPHORS,
  PHOSPHOR_IDS,
  DEFAULT_PHOSPHOR,
  isPhosphor,
} from "@portfolio/theme/phosphors.js";
import { buildTree, flattenFiles, findFile, defaultFileId } from "../src/lib/workspace.js";
import { tabsReducer, emptyTabs } from "../src/lib/useTabs.js";
import { keysFor } from "../src/lib/useKeys.js";
import { pathForFile, fileForPath } from "../src/lib/router.js";
import { fuzzyFilter, fuzzyScore } from "../src/lib/fuzzy.js";
import { layoutDiagram, wrapLabel, DIAGRAM } from "../src/lib/diagram/layout.js";
import {
  COMMANDS,
  VISIBLE_COMMANDS,
  findCommand,
  looksLikeQuestion,
  resolveFile,
  ROOT,
  PROJECTS_DIR,
} from "../src/lib/terminal/commands.js";
import { createTracker, pushEvent, trackingAllowed, MAX_BATCH } from "../src/lib/analytics.js";
import { validateContact, CONTACT_LIMITS } from "../src/lib/contact.js";
import { validateQuestion, ASK_LIMITS, ASK_SUGGESTIONS } from "../src/lib/ask.js";
import {
  routesFor,
  metaFor,
  renderHead,
  renderNoscript,
  renderSitemap,
  renderRobots,
  escapeHtml,
  trimTo,
  fit,
} from "../src/lib/seo.js";

const API = process.env.VITE_API_URL || "http://localhost:4000";

const results = [];
function check(name, fn) {
  try {
    fn();
    results.push({ name, ok: true });
  } catch (error) {
    results.push({ name, ok: false, message: error.message });
  }
}

async function checkAsync(name, fn) {
  try {
    await fn();
    results.push({ name, ok: true });
  } catch (error) {
    results.push({ name, ok: false, message: error.message });
  }
}

const response = await fetch(`${API}/api/v1/content`);
if (!response.ok) throw new Error(`content endpoint answered ${response.status}`);
const content = await response.json();

const tree = buildTree(content);
const files = flattenFiles(tree);

check("tree contains every section, the projects index and every project", () => {
  assert.equal(files.length, content.sections.length + content.projects.length);
  assert.ok(
    files.some((file) => file.kind === "projects"),
    "the projects folder has no index file"
  );
});

check("every file round-trips file to path to file", () => {
  for (const file of files) {
    const path = pathForFile(file);
    const back = fileForPath(path, files);
    assert.ok(back, `no file for ${path}`);
    assert.equal(back.id, file.id, `${file.name} round-trip mismatch`);
  }
});

check("project paths are namespaced under /projects", () => {
  for (const file of files.filter((entry) => entry.kind === "project")) {
    assert.match(pathForFile(file), /^\/projects\/[a-z0-9-]+$/);
  }
});

check("unknown paths resolve to null", () => {
  assert.equal(fileForPath("/nope", files), null);
  assert.equal(fileForPath("/projects/nope", files), null);
  assert.equal(fileForPath("/", files), null);
});

check("trailing slashes are tolerated", () => {
  const file = files.find((entry) => entry.kind === "about");
  assert.equal(fileForPath("/about/", files).id, file.id);
});

check("GATE: open tata and the explorer click give one URL", () => {
  const viaCommand = resolveFile("tata", files);
  const viaExplorer = files.find((entry) => entry.name === "tata.md");
  assert.ok(viaCommand, "resolveFile('tata') found nothing");
  assert.equal(viaCommand.id, viaExplorer.id);
  assert.equal(pathForFile(viaCommand), pathForFile(viaExplorer));
  assert.equal(pathForFile(viaCommand), "/projects/tata-advanced-systems");
});

check("resolveFile accepts filename, basename, slug, section key", () => {
  const target = files.find((entry) => entry.slug === "dr-jones");
  for (const token of ["dr-jones.md", "dr-jones", "projects/dr-jones.md", "DR-JONES"]) {
    const found = resolveFile(token, files);
    assert.ok(found, `resolveFile(${token}) found nothing`);
    assert.equal(found.id, target.id, `resolveFile(${token}) resolved wrong file`);
  }
  assert.equal(resolveFile("skills", files).kind, "skills");
  assert.equal(resolveFile("does-not-exist", files), null);
});

check("the projects folder opens as its own file", () => {
  const index = files.find((file) => file.kind === "projects");
  assert.ok(index, "the tree has no projects index");
  assert.equal(pathForFile(index), "/projects");
  assert.equal(fileForPath("/projects", files).id, index.id);
  assert.equal(resolveFile("projects", files).id, index.id);
});

check("a restored workspace drops files that no longer exist", () => {
  const known = files.map((file) => file.id);
  const stale = { openIds: [known[0], "project:deleted", known[1]], activeId: "project:deleted" };
  const next = tabsReducer(stale, { type: "reconcile", ids: known });

  assert.deepEqual(next.openIds, [known[0], known[1]]);
  assert.equal(next.activeId, known[1], "the active file did not fall back to a live one");
  assert.equal(
    tabsReducer(next, { type: "reconcile", ids: known }),
    next,
    "a clean reconcile still allocated new state"
  );
});

check("tabs open, step and close the way an editor does", () => {
  const [a, b, c] = files.map((file) => file.id);

  let state = emptyTabs;
  for (const id of [a, b, c]) state = tabsReducer(state, { type: "open", id });
  assert.deepEqual(state.openIds, [a, b, c]);
  assert.equal(state.activeId, c);

  assert.equal(tabsReducer(state, { type: "open", id: a }).openIds.length, 3, "reopening duplicated a tab");
  assert.equal(tabsReducer(state, { type: "step", by: 1 }).activeId, a, "step did not wrap forward");
  assert.equal(tabsReducer(state, { type: "step", by: -1 }).activeId, b, "step did not walk back");

  const closed = tabsReducer(state, { type: "close", id: c });
  assert.deepEqual(closed.openIds, [a, b]);
  assert.equal(closed.activeId, b, "closing the active tab did not fall to a neighbour");

  const inactive = tabsReducer(state, { type: "close", id: a });
  assert.equal(inactive.activeId, c, "closing an inactive tab moved the active one");
  assert.equal(tabsReducer(emptyTabs, { type: "step", by: 1 }), emptyTabs, "step on an empty strip allocated");
});

check("shortcut labels follow the platform", () => {
  const mac = keysFor(true);
  const pc = keysFor(false);

  assert.equal(mac.palette, "⌘K");
  assert.equal(pc.palette, "Ctrl+K");
  assert.notEqual(mac.explorer, pc.explorer);
  assert.equal(pc.closeTab, "Alt+W", "close-tab must avoid the browser's own Ctrl+W");

  for (const label of Object.values(pc)) {
    if (typeof label !== "string") continue;
    assert.ok(!label.includes("⌘"), `${label} shows a Command glyph off Apple hardware`);
  }
});

check("default file is the section flagged openByDefault", () => {
  assert.equal(findFile(tree, defaultFileId(content, tree)).kind, "about");
});

check("fuzzy search finds files by subsequence", () => {
  const names = files.map((file) => ({ label: file.name }));
  assert.equal(fuzzyFilter("drjns", names, (item) => item.label)[0].label, "dr-jones.md");
  assert.equal(fuzzyScore("zzz", "dr-jones.md"), -1);
});

check("command names are unique", () => {
  const names = COMMANDS.map((command) => command.name);
  assert.equal(new Set(names).size, names.length);
});

check("help lists every visible command", () => {
  const text = findCommand("help").run([], {}).lines.map((entry) => entry.text).join("\n");
  for (const command of VISIBLE_COMMANDS) {
    assert.ok(text.includes(command.usage), `help is missing ${command.name}`);
  }
});

function makeContext(overrides = {}) {
  return {
    content,
    tree,
    files,
    cwd: ROOT,
    setCwd: () => {},
    openFile: () => {},
    openResume: () => {},
    nowPlaying: { configured: true, playing: true, track: { title: "Kashmir", artist: "Led Zeppelin", album: "Physical Graffiti", url: "https://open.spotify.com/track/x" } },
    phosphor: "amber",
    setPhosphor: () => {},
    openThemePicker: () => {},
    copyText: () => {},
    ask: async () => ({ configured: true, answer: "He built the data automation platform.", remaining: 24 }),
    toon: {
      summon: () => {},
      hide: () => {},
      come: () => {},
      dance: () => {},
      wave: () => {},
      say: () => {},
      tour: () => {},
      ask: () => {},
    },
    history: ["help", "ls"],
    startedAt: Date.now() - 61000,
    ...overrides,
  };
}

check("the harness stubs every context key a command reaches for", () => {
  const source = readFileSync(new URL("../src/lib/terminal/commands.js", import.meta.url), "utf8");
  const used = new Set([...source.matchAll(/ctx\.([a-zA-Z]+)/g)].map((match) => match[1]));
  const stubbed = new Set(Object.keys(makeContext()));
  for (const key of used) {
    assert.ok(stubbed.has(key), `makeContext is missing ctx.${key}`);
  }
});

check("every command runs without throwing", () => {
  const args = {
    cat: ["about.md"],
    open: ["tata"],
    cd: ["projects"],
    echo: ["hi"],
    sudo: ["hire-me"],
    rm: ["-rf", "/"],
    theme: ["green"],
    skills: ["Backend"],
    ask: ["what", "did", "he", "build", "at", "TATA?"],
  };
  for (const command of COMMANDS) {
    const output = command.run(args[command.name] || [], makeContext());
    assert.ok(output && Array.isArray(output.lines), `${command.name} returned no lines array`);
  }
});

check("cat prints real content from the database", () => {
  const output = findCommand("cat").run(["about.md"], makeContext());
  const text = output.lines.map((entry) => entry.text).join(" ");
  assert.ok(text.includes(content.profile.name), "cat about.md omitted the name");
  assert.ok(output.lines.length > 5);
});

check("cat on a missing file reports an error", () => {
  assert.equal(findCommand("cat").run(["nope.md"], makeContext()).lines[0].tone, "error");
});

check("open triggers openFile with the right id", () => {
  let opened = null;
  findCommand("open").run(["tata"], makeContext({ openFile: (id) => { opened = id; } }));
  assert.equal(opened, files.find((file) => file.name === "tata.md").id);
});

check("theme validates the phosphor argument", () => {
  let set = null;
  const ok = findCommand("theme").run(["green"], makeContext({ setPhosphor: (v) => { set = v; } }));
  assert.equal(set, "green");
  assert.equal(ok.lines[0].tone, "ok");
  assert.equal(findCommand("theme").run(["ultraviolet"], makeContext()).lines[0].tone, "error");

  for (const id of PHOSPHOR_IDS) {
    let applied = null;
    const result = findCommand("theme").run([id], makeContext({ setPhosphor: (v) => { applied = v; } }));
    assert.equal(applied, id, `theme ${id} did not apply`);
    assert.equal(result.lines[0].tone, "ok");
  }
});

check("theme with no argument opens the picker instead of guessing", () => {
  let opened = 0;
  let applied = null;
  const result = findCommand("theme").run([], makeContext({
    openThemePicker: () => { opened += 1; },
    setPhosphor: (v) => { applied = v; },
  }));

  assert.equal(opened, 1, "theme did not open the picker");
  assert.equal(applied, null, "theme changed the phosphor without being asked");
  assert.equal(result.lines[0].tone, "ok");
});

check("theme next walks the ring and theme list names every palette", () => {
  let applied = null;
  findCommand("theme").run(["next"], makeContext({
    phosphor: PHOSPHOR_IDS[PHOSPHOR_IDS.length - 1],
    setPhosphor: (v) => { applied = v; },
  }));
  assert.equal(applied, PHOSPHOR_IDS[0], "next did not wrap to the first phosphor");

  const listed = findCommand("theme").run(["list"], makeContext()).lines
    .map((entry) => entry.text)
    .join("\n");
  for (const id of PHOSPHOR_IDS) {
    assert.ok(listed.includes(id), `theme list omitted ${id}`);
  }
});

check("cd moves between root and projects", () => {
  let cwd = ROOT;
  const ctx = makeContext({ setCwd: (value) => { cwd = value; } });
  findCommand("cd").run(["projects"], ctx);
  assert.equal(cwd, PROJECTS_DIR);
  findCommand("cd").run([".."], ctx);
  assert.equal(cwd, ROOT);
  assert.equal(findCommand("cd").run(["nope"], ctx).lines[0].tone, "error");
});

check("ls reflects the current directory", () => {
  const root = findCommand("ls").run([], makeContext());
  const projects = findCommand("ls").run([], makeContext({ cwd: PROJECTS_DIR }));
  assert.ok(root.lines.some((entry) => entry.text.startsWith("projects/")));
  assert.equal(projects.lines.length, content.projects.length);
});

check("clear and exit signal the runner instead of printing", () => {
  assert.equal(findCommand("clear").run([], makeContext()).clear, true);
  assert.equal(findCommand("exit").run([], makeContext()).close, true);
});

check("email copies the address from the database", () => {
  let copied = null;
  findCommand("email").run([], makeContext({ copyText: (value) => { copied = value; } }));
  assert.equal(copied, content.profile.email);
});

check("no output line exceeds 100 characters", () => {
  const wide = [];
  const names = ["whoami", "experience", "projects", "education", "uses", "contact", "neofetch", "help"];
  for (const name of names) {
    for (const entry of findCommand(name).run([], makeContext()).lines) {
      if (entry.text.length > 100) wide.push(`${name}: ${entry.text.length} chars`);
    }
  }
  assert.deepEqual(wide, []);
});

const diagramProjects = content.projects.map((project) => ({
  project,
  layout: project.diagram ? layoutDiagram(project.diagram) : null,
}));

const textWidth = (text, fontSize) => text.length * fontSize * DIAGRAM.charRatio;

check("every project carries a diagram spec", () => {
  for (const { project } of diagramProjects) {
    assert.ok(project.diagram, `${project.slug} has no diagram`);
    assert.ok(project.diagram.layers.length > 0, `${project.slug} has no layers`);
    for (const layer of project.diagram.layers) {
      assert.ok(layer.nodes.length > 0, `${project.slug}/${layer.label} has no nodes`);
    }
  }
});

check("node ids are unique inside each diagram", () => {
  for (const { project } of diagramProjects) {
    const ids = project.diagram.layers.flatMap((layer) => layer.nodes.map((node) => node.id));
    assert.equal(new Set(ids).size, ids.length, `${project.slug} has duplicate node ids`);
  }
});

check("layout geometry is finite and positive", () => {
  for (const { project, layout } of diagramProjects) {
    assert.ok(layout, `${project.slug} produced no layout`);
    assert.ok(Number.isFinite(layout.height) && layout.height > 0, `${project.slug} bad height`);
    for (const layer of layout.layers) {
      for (const node of layer.nodes) {
        for (const value of [node.x, node.y, node.width, node.height, node.centerX]) {
          assert.ok(Number.isFinite(value), `${project.slug}/${node.id} has a non-finite coordinate`);
        }
        assert.ok(node.width > 0 && node.height > 0, `${project.slug}/${node.id} has no area`);
      }
    }
  }
});

check("node boxes stay inside the canvas", () => {
  for (const { project, layout } of diagramProjects) {
    for (const layer of layout.layers) {
      for (const node of layer.nodes) {
        assert.ok(node.x >= layout.gutter - 0.01, `${project.slug}/${node.id} overlaps the gutter`);
        assert.ok(
          node.x + node.width <= layout.width - DIAGRAM.padRight + 0.01,
          `${project.slug}/${node.id} runs past the right edge`
        );
      }
    }
  }
});

check("nodes never overlap inside a row", () => {
  for (const { project, layout } of diagramProjects) {
    for (const layer of layout.layers) {
      for (const row of layer.rows) {
        const sorted = [...row.nodes].sort((a, b) => a.x - b.x);
        for (let i = 1; i < sorted.length; i += 1) {
          const previous = sorted[i - 1];
          assert.ok(
            sorted[i].x >= previous.x + previous.width - 0.01,
            `${project.slug}/${layer.label}: ${previous.id} and ${sorted[i].id} overlap`
          );
        }
        assert.ok(row.nodes.length <= DIAGRAM.nodesPerRow, `${project.slug}: row too wide`);
      }
    }
  }
});

check("rows never overlap inside a layer", () => {
  for (const { project, layout } of diagramProjects) {
    for (const layer of layout.layers) {
      for (let i = 1; i < layer.rows.length; i += 1) {
        const previous = layer.rows[i - 1];
        assert.ok(
          layer.rows[i].y >= previous.y + previous.height,
          `${project.slug}/${layer.label}: rows overlap`
        );
      }
      const lastRow = layer.rows[layer.rows.length - 1];
      assert.ok(
        layer.y + layer.height >= lastRow.y + lastRow.height - 0.01,
        `${project.slug}/${layer.label}: layer height cuts off its last row`
      );
    }
  }
});

check("label text renders at least 10px on a phone", () => {
  const phoneWidth = 319;
  const scale = phoneWidth / DIAGRAM.width;
  assert.ok(
    DIAGRAM.titleFont * scale >= 10,
    `title renders at ${(DIAGRAM.titleFont * scale).toFixed(1)}px on a 375px screen`
  );
  assert.ok(
    DIAGRAM.noteFont * scale >= 7.5,
    `note renders at ${(DIAGRAM.noteFont * scale).toFixed(1)}px on a 375px screen`
  );
});

check("layers never overlap vertically", () => {
  for (const { project, layout } of diagramProjects) {
    for (let i = 1; i < layout.layers.length; i += 1) {
      const previous = layout.layers[i - 1];
      assert.ok(
        layout.layers[i].y >= previous.y + previous.height,
        `${project.slug}: layer ${layout.layers[i].label} overlaps ${previous.label}`
      );
    }
    const last = layout.layers[layout.layers.length - 1];
    assert.ok(layout.height >= last.y + last.height, `${project.slug}: canvas cuts off the last layer`);
  }
});

check("every node label fits its box", () => {
  for (const { project, layout } of diagramProjects) {
    for (const layer of layout.layers) {
      for (const node of layer.nodes) {
        assert.ok(node.lines.length > 0, `${project.slug}/${node.id} has no label`);
        assert.ok(node.lines.length <= 2, `${project.slug}/${node.id} wrapped past two lines`);
        for (const line of node.lines) {
          assert.ok(
            textWidth(line, DIAGRAM.titleFont) <= node.width - 6,
            `${project.slug}/${node.id}: "${line}" overflows its box`
          );
        }
        for (const line of node.noteLines) {
          assert.ok(
            textWidth(line, DIAGRAM.noteFont) <= node.width - 4,
            `${project.slug}/${node.id}: note "${line}" overflows its box`
          );
        }
      }
    }
  }
});

check("no diagram label is silently truncated", () => {
  const cut = [];
  for (const { project, layout } of diagramProjects) {
    for (const layer of layout.layers) {
      for (const node of layer.nodes) {
        for (const line of [...node.lines, ...node.noteLines]) {
          if (line.includes("\u2026")) cut.push(`${project.slug}/${node.id}: "${line}"`);
        }
      }
      for (const line of [...layer.labelLines, ...layer.captionLines]) {
        if (line.includes("\u2026")) cut.push(`${project.slug}/${layer.label}: "${line}"`);
      }
    }
  }
  assert.deepEqual(cut, []);
});

check("gutter labels fit the gutter", () => {
  for (const { project, layout } of diagramProjects) {
    for (const layer of layout.layers) {
      assert.ok(layer.labelLines.length <= 2, `${project.slug}/${layer.label} gutter label too tall`);
      for (const line of layer.labelLines) {
        assert.ok(
          textWidth(line, DIAGRAM.gutterFont) <= layout.gutter - 12,
          `${project.slug}: gutter label "${line}" overflows`
        );
      }
    }
  }
});

check("layer captions fit the content area", () => {
  for (const { project, layout } of diagramProjects) {
    const available = layout.width - DIAGRAM.padRight - layout.gutter;
    for (const layer of layout.layers) {
      for (const line of layer.captionLines) {
        assert.ok(
          textWidth(line, DIAGRAM.noteFont) <= available,
          `${project.slug}: caption "${line}" overflows`
        );
      }
    }
  }
});

check("connector rails sit between the layers they join", () => {
  for (const { project, layout } of diagramProjects) {
    for (const connector of layout.connectors) {
      assert.ok(
        connector.railY > connector.top && connector.railY < connector.bottom,
        `${project.slug}/${connector.id}: rail is outside the gap`
      );
      assert.ok(
        connector.bottom - connector.top >= 20,
        `${project.slug}/${connector.id}: gap too tight for an arrowhead`
      );
      assert.ok(connector.railStart <= connector.railEnd);
    }
  }
});

check("via labels stay inside the canvas", () => {
  for (const { project, layout } of diagramProjects) {
    for (const connector of layout.connectors) {
      if (!connector.via) continue;
      const center = connector.straight
        ? connector.fromCenters[0]
        : (connector.railStart + connector.railEnd) / 2;
      const width = textWidth(connector.via, DIAGRAM.noteFont) + 8;
      assert.ok(center - width / 2 >= 0, `${project.slug}: via "${connector.via}" clips left`);
      assert.ok(
        center + width / 2 <= layout.width,
        `${project.slug}: via "${connector.via}" clips right`
      );
    }
  }
});

check("diagram heights stay in a sane range", () => {
  for (const { project, layout } of diagramProjects) {
    assert.ok(
      layout.height > 80 && layout.height < 700,
      `${project.slug}: height ${layout.height} is out of range`
    );
  }
});

check("wrapLabel never emits a line over the limit", () => {
  const samples = ["WhatsApp Business API", "supercalifragilisticexpialidocious", "a b c", ""];
  for (const sample of samples) {
    for (const limit of [6, 12, 25]) {
      for (const line of wrapLabel(sample, limit, 2)) {
        assert.ok(line.length <= limit, `"${line}" exceeds limit ${limit}`);
      }
    }
  }
});


function fakeStorage() {
  const store = new Map();
  return {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, value),
  };
}

function fakeTracker(agent = { doNotTrack: null }) {
  const sent = [];
  const tracker = createTracker({
    storage: fakeStorage(),
    agent,
    send: (batch) => sent.push(batch),
    referrer: "https://news.ycombinator.com/",
    schedule: () => 1,
    cancel: () => {},
  });
  return { tracker, sent };
}

check("the tracker batches events and stamps the session on the flush", () => {
  const { tracker, sent } = fakeTracker();

  tracker.track("view", "/about", "/about");
  tracker.track("file", "about.md", "/about");
  assert.equal(tracker.pending(), 2);

  tracker.flush();
  assert.equal(sent.length, 1);
  assert.equal(sent[0].events.length, 2);
  assert.equal(sent[0].session, tracker.session);
  assert.equal(sent[0].referrer, "https://news.ycombinator.com/");
  assert.equal(tracker.pending(), 0);
});

check("a flush with nothing queued sends nothing", () => {
  const { tracker, sent } = fakeTracker();
  tracker.flush();
  assert.equal(sent.length, 0);
});

check("the tracker keeps one session id across events", () => {
  const storage = fakeStorage();
  const first = createTracker({ storage, agent: {}, send: () => {}, schedule: () => 1, cancel: () => {} });
  const second = createTracker({ storage, agent: {}, send: () => {}, schedule: () => 1, cancel: () => {} });

  assert.ok(first.session.length > 8, "session id is too short to be unique");
  assert.equal(first.session, second.session, "a second tab minted a new session id");
});

check("Do Not Track and Global Privacy Control switch collection off", () => {
  for (const agent of [{ doNotTrack: "1" }, { doNotTrack: "yes" }, { globalPrivacyControl: true }]) {
    const sent = [];
    const tracker = createTracker({
      storage: fakeStorage(),
      agent,
      send: (batch) => sent.push(batch),
      schedule: () => 1,
      cancel: () => {},
    });

    tracker.track("view", "/about", "/about");
    tracker.flush();

    assert.equal(tracker.enabled, false, `${JSON.stringify(agent)} was still tracked`);
    assert.equal(sent.length, 0, "an event was sent anyway");
    assert.equal(tracker.session, "", "a session id was minted for an opted-out visitor");
  }
  assert.equal(trackingAllowed(null), false);
});

check("a repeated event is not queued twice in a row", () => {
  const event = { type: "view", name: "/about", path: "/about" };
  const once = pushEvent([], event);
  assert.equal(pushEvent(once, { ...event }), once, "the same view queued twice");
  assert.equal(pushEvent(once, { type: "file", name: "/about", path: "/about" }).length, 2);
});

check("the queue never grows past one batch", () => {
  let queue = [];
  for (let index = 0; index < MAX_BATCH * 3; index += 1) {
    queue = pushEvent(queue, { type: "view", name: `/page-${index}`, path: "/" });
  }
  assert.equal(queue.length, MAX_BATCH);
});

check("events without a type or a name are dropped", () => {
  assert.deepEqual(pushEvent([], { type: "view" }), []);
  assert.deepEqual(pushEvent([], { name: "/about" }), []);
  assert.deepEqual(pushEvent([], null), []);
});

check("the contact form rejects what the API would reject", () => {
  const short = validateContact({ name: "A", email: "nope", body: "too short" });
  assert.deepEqual(Object.keys(short).sort(), ["body", "email", "name"]);

  const clean = validateContact({
    name: "Soham Tarabada",
    email: "hello@example.com",
    body: "x".repeat(CONTACT_LIMITS.body.min),
  });
  assert.deepEqual(clean, {});
});

check("the contact form's limits are the API's limits", () => {
  const source = readFileSync(new URL("../../api/src/routes/contact.route.js", import.meta.url), "utf8");
  const rules = Object.fromEntries(
    [...source.matchAll(/(min|max)\((\d+)[,)]/g)].map((match, index) => [index, match])
  );

  assert.ok(source.includes(`max(${CONTACT_LIMITS.name.max})`), "name max drifted from the API");
  assert.ok(source.includes(`max(${CONTACT_LIMITS.email.max})`), "email max drifted from the API");
  assert.ok(source.includes(`max(${CONTACT_LIMITS.subject.max})`), "subject max drifted");
  assert.ok(source.includes(`max(${CONTACT_LIMITS.company.max})`), "company max drifted");
  assert.ok(source.includes(`min(${CONTACT_LIMITS.body.min},`), "body min drifted from the API");
  assert.ok(source.includes(`max(${CONTACT_LIMITS.body.max},`), "body max drifted from the API");
  assert.ok(Object.keys(rules).length > 0);
});

check("mail opens the contact file rather than printing to the terminal", () => {
  const opened = [];
  const result = findCommand("mail").run([], makeContext({ openFile: (id) => opened.push(id) }));

  assert.equal(opened.length, 1, "mail opened no file");
  assert.equal(opened[0], findFile(tree, "section:contact").id);
  assert.ok(result.lines.length > 0);
});


const SITE = "https://example.test";

function tokenBlock(css, selector) {
  const start = css.indexOf(selector);
  const open = css.indexOf("{", start);
  const close = css.indexOf("}", open);
  return Object.fromEntries(
    [...css.slice(open, close).matchAll(/(--[a-z-]+):\s*(#[0-9a-f]{6})\s*;/gi)].map((match) => [
      match[1],
      match[2],
    ])
  );
}

function channels(hex) {
  const clean = hex.replace("#", "");
  return [0, 2, 4].map((index) => parseInt(clean.slice(index, index + 2), 16) / 255);
}

function relativeLuminance(hex) {
  const [r, g, b] = channels(hex).map((channel) =>
    channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(foreground, background) {
  const a = relativeLuminance(foreground);
  const b = relativeLuminance(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

const tokensCss = readFileSync(
  new URL("../../../packages/theme/tokens.css", import.meta.url),
  "utf8"
);
const amberTokens = tokenBlock(tokensCss, ":root {");
const palettes = PHOSPHORS.map((phosphor) => [
  phosphor.id,
  phosphor.id === DEFAULT_PHOSPHOR
    ? amberTokens
    : { ...amberTokens, ...tokenBlock(tokensCss, `:root[data-phosphor="${phosphor.id}"]`) },
]);
const paletteFor = Object.fromEntries(palettes);

const SURFACES = ["--ground", "--panel", "--panel-raised"];
const TEXT_TOKENS = [
  "--text",
  "--text-muted",
  "--text-dim",
  "--phosphor",
  "--phosphor-dim",
  "--ok",
  "--warn",
  "--alert",
];

check("every text colour clears WCAG AA on every surface it sits on", () => {
  for (const [name, tokens] of palettes) {
    for (const token of TEXT_TOKENS) {
      for (const surface of SURFACES) {
        const ratio = contrast(tokens[token], tokens[surface]);
        assert.ok(
          ratio >= 4.5,
          `${name}: ${token} on ${surface} is ${ratio.toFixed(2)}:1, needs 4.5:1`
        );
      }
    }
  }
});

check("the control outline colour clears the 3:1 non-text threshold", () => {
  for (const [name, tokens] of palettes) {
    for (const surface of ["--ground", "--panel"]) {
      const ratio = contrast(tokens["--phosphor-deep"], tokens[surface]);
      assert.ok(
        ratio >= 3,
        `${name}: --phosphor-deep on ${surface} is ${ratio.toFixed(2)}:1, needs 3:1`
      );
    }
  }
});

check("every phosphor declares its own surfaces, text and accent ramp", () => {
  const REQUIRED = [
    "--ground", "--panel", "--panel-raised", "--rule", "--rule-soft",
    "--text", "--text-muted", "--text-dim",
    "--phosphor", "--phosphor-dim", "--phosphor-deep",
  ];

  for (const phosphor of PHOSPHORS) {
    if (phosphor.id === DEFAULT_PHOSPHOR) continue;
    const own = tokenBlock(tokensCss, `:root[data-phosphor="${phosphor.id}"]`);
    const missing = REQUIRED.filter((token) => !(token in own));
    assert.deepEqual(missing, [], `${phosphor.id} falls back to amber for ${missing.join(", ")}`);
  }
});

check("the accent ramp darkens from phosphor to dim to deep", () => {
  for (const [name, tokens] of palettes) {
    const bright = relativeLuminance(tokens["--phosphor"]);
    const dim = relativeLuminance(tokens["--phosphor-dim"]);
    const deep = relativeLuminance(tokens["--phosphor-deep"]);
    assert.ok(dim < bright, `${name}: --phosphor-dim is not dimmer than --phosphor`);
    assert.ok(deep < dim, `${name}: --phosphor-deep is not dimmer than --phosphor-dim`);
  }
});

check("the picker preview swatches match the stylesheet", () => {
  for (const phosphor of PHOSPHORS) {
    const tokens = paletteFor[phosphor.id];
    for (const [key, token] of Object.entries({
      ground: "--ground",
      panel: "--panel",
      rule: "--rule",
      text: "--text",
      phosphor: "--phosphor",
      phosphorDim: "--phosphor-dim",
    })) {
      assert.equal(
        phosphor.preview[key],
        tokens[token],
        `${phosphor.id}: preview.${key} drifted from ${token}`
      );
    }
  }
});

check("every phosphor id the terminal accepts has a stylesheet block", () => {
  for (const id of PHOSPHOR_IDS) {
    if (id === DEFAULT_PHOSPHOR) continue;
    assert.ok(
      tokensCss.includes(`:root[data-phosphor="${id}"]`),
      `${id} is offered but tokens.css never defines it`
    );
  }
  const declared = [...tokensCss.matchAll(/:root\[data-phosphor="([a-z]+)"\]/g)].map((m) => m[1]);
  for (const id of new Set(declared)) {
    assert.ok(isPhosphor(id), `tokens.css defines ${id} but the manifest never offers it`);
  }
});

const seoRoutes = routesFor(content);

check("every section and project gets its own prerendered route", () => {
  const expected = content.sections.length + content.projects.length + 1;
  assert.equal(seoRoutes.length, expected);

  const paths = seoRoutes.map((route) => route.path);
  assert.equal(new Set(paths).size, paths.length, "two routes claim the same path");
  assert.ok(paths.includes("/"), "the home route is missing");
});

check("every route path matches one the SPA router can resolve", () => {
  for (const route of seoRoutes) {
    if (route.path === "/") continue;
    const file = fileForPath(route.path, files);
    assert.ok(file, `${route.path} prerenders but the app cannot route to it`);
  }
});

check("titles are unique and descriptions fit a search result", () => {
  const titles = seoRoutes.map((route) => route.title);
  assert.equal(new Set(titles).size, titles.length, "two routes share a title");

  for (const route of seoRoutes) {
    assert.ok(route.title.length > 0 && route.title.length <= 70, `${route.path}: title length`);
    assert.ok(route.description.length >= 40, `${route.path}: description is too thin`);
    assert.ok(route.description.length <= 160, `${route.path}: description is too long`);
    assert.ok(!/\s…$/.test(route.description), `${route.path}: description ends mid-space`);
  }
});

check("truncation stops on a word boundary and never exceeds the limit", () => {
  for (const limit of [40, 80, 160]) {
    const long = "The quick brown fox jumps over the lazy dog ".repeat(12);
    const cut = trimTo(long, limit);
    assert.ok(cut.length <= limit, `trimTo returned ${cut.length} for a limit of ${limit}`);
    assert.ok(cut.endsWith("…"));
    assert.ok(!/\s…$/.test(cut), "a space was left before the ellipsis");
  }
  assert.equal(trimTo("short", 100), "short");
  assert.equal(trimTo("  spaced   out  ", 100), "spaced out");
});

check("fit only appends a clause that actually fits", () => {
  assert.equal(fit(["one", "two"], 100), "one two");
  assert.equal(fit(["one", "a much longer trailing clause"], 5), "one");
  assert.ok(fit(["x".repeat(300)], 40).length <= 40);
});

check("everything a visitor typed is escaped before it reaches the page", () => {
  assert.equal(escapeHtml(`<script>"&'`), "&lt;script&gt;&quot;&amp;&#39;");

  const hostile = JSON.parse(JSON.stringify(content));
  hostile.profile.name = '</title><script>alert(1)</script>';
  hostile.profile.summary = 'a "quoted" & <dangerous> summary';

  const route = routesFor(hostile)[0];
  const head = renderHead(metaFor(route, hostile, SITE, API));
  const body = renderNoscript(route, hostile);

  assert.ok(!head.includes("<script>alert"), "an injected tag survived into the head");
  assert.ok(!body.includes("<script>alert"), "an injected tag survived into the noscript block");
});

check("structured data is valid JSON with the fields Google reads", () => {
  for (const route of seoRoutes) {
    const meta = metaFor(route, content, SITE, API);
    const head = renderHead(meta);
    const json = head.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1];

    const parsed = JSON.parse(json.replace(/\\u003c/g, "<"));
    assert.equal(parsed["@context"], "https://schema.org");
    assert.ok(parsed.name, `${route.path}: structured data has no name`);
    assert.ok(!json.includes("</script"), `${route.path}: unescaped closing tag in JSON-LD`);

    if (route.kind === "project") {
      assert.equal(parsed["@type"], "CreativeWork");
    } else {
      assert.equal(parsed["@type"], "Person");
      assert.ok(parsed.sameAs.length > 0, "the Person has no sameAs links");
    }
  }
});

check("canonical and Open Graph URLs are absolute and agree", () => {
  for (const route of seoRoutes) {
    const meta = metaFor(route, content, SITE, API);
    assert.ok(meta.canonical.startsWith(`${SITE}/`), `${route.path}: canonical is not absolute`);
    assert.ok(meta.image.startsWith("https://"), `${route.path}: og image is not absolute`);

    const head = renderHead(meta);
    const canonical = head.match(/rel="canonical" href="([^"]+)"/)[1];
    const ogUrl = head.match(/property="og:url" content="([^"]+)"/)[1];
    assert.equal(canonical, ogUrl, `${route.path}: canonical and og:url disagree`);
  }
});

check("the sitemap lists every route exactly once", () => {
  const xml = renderSitemap(seoRoutes, SITE, content.meta?.generatedAt);
  const locations = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);

  assert.equal(locations.length, seoRoutes.length);
  assert.equal(new Set(locations).size, locations.length, "a URL is listed twice");
  assert.ok(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>'));
  assert.ok(xml.includes("</urlset>"));

  for (const location of locations) {
    assert.ok(location.startsWith(`${SITE}/`), `${location} is not absolute`);
    assert.ok(!location.includes(" "), `${location} contains a space`);
  }

  assert.ok(renderRobots(SITE).includes(`Sitemap: ${SITE}/sitemap.xml`));
});

check("the no-script fallback carries real content and internal links", () => {
  const home = renderNoscript(seoRoutes[0], content);
  assert.ok(home.includes("<h1>"), "no heading in the fallback");
  assert.ok(home.includes(content.profile.email), "no way to make contact without JavaScript");

  for (const project of content.projects) {
    assert.ok(
      home.includes(`/projects/${project.slug}`),
      `${project.slug} is unreachable without JavaScript`
    );
  }

  const skills = renderNoscript(
    seoRoutes.find((route) => route.kind === "skills"),
    content
  );
  assert.ok(skills.includes(content.skills[0].skills[0].name), "skills are missing from /skills");
});

const distUrl = new URL("../dist/", import.meta.url);

function distFile(relative) {
  try {
    return readFileSync(new URL(relative, distUrl), "utf8");
  } catch {
    return null;
  }
}

check("the built site carries per-page SEO for every route", () => {
  const home = distFile("index.html");
  assert.ok(home, "dist/index.html is missing — run npm run build first");
  assert.ok(
    home.includes('rel="canonical"'),
    "the build did not prerender — the API must be reachable when npm run build runs"
  );

  const titles = new Set();

  for (const route of seoRoutes) {
    const relative = route.path === "/" ? "index.html" : `${route.path.slice(1)}/index.html`;
    const html = distFile(relative);
    assert.ok(html, `dist/${relative} was not written`);

    const title = html.match(/<title>([^<]*)<\/title>/)?.[1];
    assert.ok(title, `dist/${relative} has no title`);
    assert.ok(!titles.has(title), `dist/${relative} reuses the title "${title}"`);
    titles.add(title);

    assert.equal(
      (html.match(/<title>/g) || []).length,
      1,
      `dist/${relative} has more than one title`
    );
    assert.equal(
      (html.match(/name="description"/g) || []).length,
      1,
      `dist/${relative} has more than one description`
    );
    assert.ok(
      html.includes('<noscript><div class="fallback">'),
      `dist/${relative} has no no-script fallback`
    );
  }

  assert.ok(distFile("sitemap.xml"), "dist/sitemap.xml was not written");
  assert.ok(distFile("robots.txt"), "dist/robots.txt was not written");
});

check("an empty uses category never reaches the public site", () => {
  for (const category of content.uses?.categories || []) {
    assert.ok(
      category.items.length > 0,
      `"${category.name}" is empty but still published — it would render as a stub`
    );
  }
});

check("a question typed without the ask prefix is recognised", () => {
  for (const typed of [
    "what did he build at TATA?",
    "how does he handle payments",
    "does he know kubernetes",
    "tell me about dr jones",
    "is he available",
  ]) {
    assert.ok(looksLikeQuestion(typed), `"${typed}" was not spotted as a question`);
  }
});

check("a real command is never mistaken for a question", () => {
  for (const typed of [
    "cat about.md",
    "open tata",
    "cd projects",
    "theme green",
    "echo what is this?",
    "skills Backend",
    "help",
    "ls",
    "",
    "   ",
    "nonsense",
  ]) {
    assert.equal(looksLikeQuestion(typed), false, `"${typed}" was misread as a question`);
  }
});

check("ask rejects a fragment before it costs a request", () => {
  assert.ok(validateQuestion("hi"));
  assert.ok(validateQuestion("  "));
  assert.ok(validateQuestion("x".repeat(ASK_LIMITS.max + 1)));
  assert.equal(validateQuestion("what did he build at TATA?"), null);

  let called = false;
  const context = makeContext({ ask: async () => { called = true; return {}; } });

  for (const args of [[], ["hi"], ["x".repeat(ASK_LIMITS.max + 1)]]) {
    const output = findCommand("ask").run(args, context);
    assert.equal(output.resolve, undefined, `ask ${args.join(" ")} reached the network`);
    assert.equal(output.lines[0].tone, "error");
  }

  assert.equal(called, false, "a rejected question still called the endpoint");
});

check("ask suggests questions the site can actually answer", () => {
  const output = findCommand("ask").run([], makeContext());
  const text = output.lines.map((row) => row.text).join(" ");
  for (const example of ASK_SUGGESTIONS) {
    assert.ok(text.includes(example), `the empty-ask help omits "${example}"`);
  }
});

check("ask answers without blocking the prompt", () => {
  const output = findCommand("ask").run(["what", "does", "he", "use?"], makeContext());
  assert.equal(typeof output.resolve, "function", "ask returned no deferred answer");
  assert.ok(output.lines.length > 0, "ask showed nothing while waiting");
  assert.equal(output.lines[0].tone, "dim");
});

await checkAsync("ask copes with every state the endpoint can return", async () => {
  const states = [
    {
      name: "not configured",
      ask: async () => ({ configured: false }),
      expect: (text) => text.includes("not enabled"),
    },
    {
      name: "empty answer",
      ask: async () => ({ configured: true, answer: "", remaining: 3 }),
      expect: (text) => text.includes("rephrasing"),
    },
    {
      name: "rate limited",
      ask: async () => {
        throw new Error("That is enough questions for one hour.");
      },
      expect: (text) => text.includes("enough questions"),
    },
    {
      name: "answered",
      ask: async () => ({ configured: true, answer: "He led the quality module.", remaining: 7 }),
      expect: (text) => text.includes("quality module") && text.includes("7 questions left"),
    },
  ];

  for (const state of states) {
    const output = findCommand("ask").run(["tell", "me"], makeContext({ ask: state.ask }));
    const settled = await output.resolve();
    const text = settled.lines.map((row) => row.text).join(" ");
    assert.ok(state.expect(text), `${state.name} rendered: ${text}`);
  }
});

await checkAsync("a long answer wraps to the terminal width", async () => {
  const answer =
    "He automated an engineering document workflow that ingested drawing registers, " +
    "extracted part numbers and copied matched documents into generated folder structures, " +
    "replacing a manual process that used to take two to three days per cycle.";

  const output = findCommand("ask").run(["what", "about", "tata"], makeContext({
    ask: async () => ({ configured: true, answer, remaining: 1 }),
  }));

  const settled = await output.resolve();
  for (const row of settled.lines) {
    assert.ok(row.text.length <= 78, `answer line ran to ${row.text.length} characters`);
  }
  assert.ok(settled.lines.length > 3, "a long answer collapsed to one line");
});

check("every deferred command still prints something immediately", () => {
  for (const command of COMMANDS) {
    const output = command.run(command.name === "ask" ? ["a", "real", "question"] : [], makeContext());
    if (!output?.resolve) continue;
    assert.ok(output.lines?.length > 0, `${command.name} defers with an empty entry`);
  }
});

check("the spotify command copes with every state the API can return", () => {
  const states = [
    { configured: false, playing: false, track: null },
    { configured: true, playing: false, track: null, error: "unavailable" },
    { configured: true, playing: true, track: { title: "T", artist: "A", album: "", url: null } },
  ];

  for (const nowPlaying of states) {
    const result = findCommand("spotify").run([], makeContext({ nowPlaying }));
    assert.ok(result.lines.length > 0, `no output for ${JSON.stringify(nowPlaying)}`);
    for (const row of result.lines) {
      assert.equal(typeof row.text, "string");
    }
  }
});


const nowPlayingResponse = await fetch(`${API}/api/v1/now-playing`);
const nowPlayingPayload = await nowPlayingResponse.json().catch(() => null);

check("the now-playing endpoint answers whether or not Spotify is connected", () => {
  assert.equal(nowPlayingResponse.status, 200, "the endpoint should never fail the page");
  assert.equal(typeof nowPlayingPayload.configured, "boolean");
  assert.equal(typeof nowPlayingPayload.playing, "boolean");

  if (!nowPlayingPayload.configured) {
    assert.equal(nowPlayingPayload.track, null, "an unconfigured deployment returned a track");
    return;
  }

  if (nowPlayingPayload.track) {
    assert.ok(nowPlayingPayload.track.title, "a track came back with no title");
    assert.equal(typeof nowPlayingPayload.track.artist, "string");
  }
});

check("the status bar stays silent when Spotify is not connected", () => {
  assert.equal(
    nowPlayingPayload.configured || nowPlayingPayload.track === null,
    true,
    "the widget would render an empty track"
  );
});


const { SPRITE, SPRITE_COLS, SPRITE_ROWS, FRAME_NAMES, runsFor, frameFor, visualActivity, asciiFrame } =
  await import("../src/lib/toon/sprite.js");
const toonPhysics = await import("../src/lib/toon/physics.js");
const { menuFor, pokeLine, idleLine, isDizzy, progressLine, TOON_ACTIONS, MAX_MENU_OPTIONS } =
  await import("../src/lib/toon/dialogue.js"
);

check("every sprite frame is the same size and uses only known pixels", () => {
  for (const name of FRAME_NAMES) {
    const rows = SPRITE[name].rows;
    assert.equal(rows.length, SPRITE_ROWS, `${name} is ${rows.length} rows tall`);
    for (const row of rows) {
      assert.equal(row.length, SPRITE_COLS, `${name} has a ${row.length}-wide row`);
      assert.match(row, /^[#ox.]+$/, `${name} uses a pixel the renderer cannot colour`);
    }
  }
});

check("merging pixels into runs never changes what is drawn", () => {
  for (const name of FRAME_NAMES) {
    const canvas = Array.from({ length: SPRITE_ROWS }, () => ".".repeat(SPRITE_COLS).split(""));
    for (const run of runsFor(SPRITE[name].rows)) {
      for (let x = run.x; x < run.x + run.w; x += 1) canvas[run.y][x] = run.key;
    }
    assert.deepEqual(
      canvas.map((row) => row.join("")),
      SPRITE[name].rows,
      `${name} does not survive the round trip`
    );
  }
});

check("the sprite keeps its eyes separate so they can track the cursor", () => {
  for (const name of FRAME_NAMES) {
    const sheet = SPRITE[name];
    assert.equal(
      sheet.body.some((run) => run.key === "x"),
      false,
      `${name} would paint an eye with the body`
    );
    if (sheet.tracks) assert.ok(sheet.eyes.length > 0, `${name} tracks but has no eyes`);
  }
});

check("every activity resolves to a frame that exists", () => {
  const activities = ["idle", "walk", "sleep", "drag", "dizzy", "cheer", "wave", "think"];
  for (const activity of activities) {
    for (const phase of [0, 1, 2, 3]) {
      const name = frameFor(activity, phase);
      assert.ok(SPRITE[name], `${activity} asked for a missing frame: ${name}`);
    }
  }
  assert.equal(visualActivity("idle", { grounded: false, moving: false }), "cheer");
  assert.equal(visualActivity("idle", { grounded: true, moving: true }), "walk");
  assert.equal(visualActivity("sleep", { grounded: true, moving: true }), "sleep");
});

check("the toon can never walk or be thrown off screen", () => {
  const bounds = toonPhysics.boundsFor(1280, 56);
  let motion = toonPhysics.walkTo(toonPhysics.createMotion(600), 99999);
  for (let tick = 0; tick < 4000; tick += 1) {
    motion = toonPhysics.stepMotion(motion, 1 / 60, bounds);
    assert.ok(motion.x >= bounds.min && motion.x <= bounds.max, `walked to x=${motion.x}`);
  }

  motion = toonPhysics.throwFrom(toonPhysics.createMotion(600), 9000, 9000);
  for (let tick = 0; tick < 4000; tick += 1) {
    motion = toonPhysics.stepMotion(motion, 1 / 60, bounds);
    assert.ok(motion.x >= bounds.min && motion.x <= bounds.max, `thrown to x=${motion.x}`);
    assert.ok(motion.y >= 0, `fell through the floor to y=${motion.y}`);
  }
});

check("a thrown toon always settles back on the floor", () => {
  const bounds = toonPhysics.boundsFor(1280, 56);
  for (const speed of [200, 900, 1600, -1600]) {
    let motion = toonPhysics.throwFrom(toonPhysics.createMotion(600), speed, Math.abs(speed));
    let ticks = 0;
    while ((!motion.grounded || motion.vx !== 0) && ticks < 1800) {
      motion = toonPhysics.stepMotion(motion, 1 / 60, bounds);
      ticks += 1;
    }
    assert.ok(ticks < 1800, `a throw at ${speed} never came to rest`);
    assert.equal(motion.y, 0);
    assert.equal(motion.grounded, true);
  }
});

check("a wandering toon always picks a target it can reach", () => {
  const bounds = toonPhysics.boundsFor(1280, 56);
  const motion = toonPhysics.createMotion(600);
  for (const roll of [0, 0.25, 0.5, 0.75, 0.999]) {
    const target = toonPhysics.pickTarget(motion, bounds, () => roll);
    assert.ok(target >= bounds.min && target <= bounds.max, `target ${target} is off screen`);
  }
  const narrow = toonPhysics.boundsFor(100, 56);
  assert.ok(narrow.max >= narrow.min, "a phone-width screen produced inverted bounds");
});

check("the guide never offers the file the visitor is already reading", () => {
  const files = [
    { id: "section:about", kind: "about", name: "about.md" },
    { id: "section:experience", kind: "experience", name: "experience.md" },
    { id: "section:projects", kind: "projects", name: "projects/" },
    { id: "section:skills", kind: "skills", name: "skills.json" },
    { id: "section:uses", kind: "uses", name: "uses.md" },
    { id: "section:education", kind: "education", name: "education.md" },
    { id: "section:contact", kind: "contact", name: "contact.sh" },
  ];

  for (const file of [...files, null]) {
    const menu = menuFor({ file, files, keys: keysFor(false) });
    assert.ok(menu.text.length > 0, "the guide had nothing to say");
    assert.ok(menu.options.length >= 2, "the guide offered nowhere to go");
    assert.ok(
      menu.options.length <= MAX_MENU_OPTIONS,
      "the guide offered too many exits"
    );

    const ids = menu.options.map((option) => option.id);
    assert.equal(new Set(ids).size, ids.length, "the guide repeated itself");

    if (file) {
      assert.equal(
        menu.options.some((option) => option.arg === file.id),
        false,
        `the guide offered to open ${file.name} while it was already open`
      );
    }
  }
});

check("every route the guide offers is one the app knows how to run", () => {
  const files = [
    { id: "section:about", kind: "about", name: "about.md" },
    { id: "section:projects", kind: "projects", name: "projects/" },
    { id: "section:contact", kind: "contact", name: "contact.sh" },
  ];

  for (const kind of [null, "about", "projects", "contact", "project", "skills"]) {
    const menu = menuFor({ file: kind ? { kind } : null, files, keys: keysFor(true) });
    for (const option of menu.options) {
      assert.ok(
        TOON_ACTIONS.includes(option.action),
        `the guide offered an action nothing handles: ${option.action}`
      );
      assert.ok(option.label, "an option reached the bubble with no label");
      if (option.action === "open") {
        assert.ok(
          files.some((file) => file.id === option.arg),
          `the guide pointed at a file that is not in the tree: ${option.arg}`
        );
      }
    }
  }
});

check("the guide keeps a reply ready however hard it is poked", () => {
  const seen = new Set();
  for (let count = 0; count < 40; count += 1) {
    const reply = pokeLine(count);
    assert.equal(typeof reply, "string", `poke ${count} returned nothing`);
    assert.ok(reply.length > 0, `poke ${count} returned an empty line`);
    seen.add(reply);
  }
  assert.ok(seen.size > 3, "the guide only knows one answer");
  assert.equal(isDizzy(0), false);
  assert.ok(isDizzy(20), "the guide never gets dizzy");

  for (const seed of [0, 1.5, 99, 1e6, -3]) {
    assert.ok(idleLine(seed).length > 0, `idle chatter broke on seed ${seed}`);
  }
});

check("the toon command answers every subcommand without throwing", () => {
  const command = findCommand("toon");
  assert.ok(command, "the toon command is not registered");

  const calls = [];
  const stub = {
    summon: () => calls.push("summon"),
    hide: () => calls.push("hide"),
    come: () => calls.push("come"),
    dance: () => calls.push("dance"),
    wave: () => calls.push("wave"),
    say: (text) => calls.push(`say:${text}`),
    tour: () => calls.push("tour"),
    ask: (question) => calls.push(`ask:${question}`),
  };

  const invocations = [
    [],
    ["hide"],
    ["come"],
    ["dance"],
    ["wave"],
    ["tour"],
    ["ask", "does", "he", "know", "kubernetes?"],
    ["ask"],
    ["say", "hello"],
    ["say"],
    ["nope"],
  ];

  for (const args of invocations) {
    const result = command.run(args, { toon: stub });
    assert.ok(Array.isArray(result.lines), `toon ${args.join(" ")} printed nothing`);
    assert.ok(result.lines.length > 0, `toon ${args.join(" ")} printed an empty block`);
  }

  assert.ok(calls.includes("dance"), "toon dance never reached the toon");
  assert.ok(calls.includes("say:hello"), "toon say never reached the toon");
  assert.ok(calls.includes("tour"), "toon tour never reached the toon");
  assert.ok(
    calls.includes("ask:does he know kubernetes?"),
    "toon ask never reached the toon"
  );
  assert.deepEqual(command.run([], { toon: null }).lines.length > 0, true);

  const art = asciiFrame("wave");
  assert.equal(art.length, SPRITE_ROWS, "the terminal portrait lost rows");
  assert.ok(art.some((row) => row.includes("█")), "the terminal portrait is blank");
});

const toonMemory = await import("../src/lib/toon/memory.js");
const { reactionFor, dwellReaction, REACTION_ACTIVITIES } = await import(
  "../src/lib/toon/reactions.js"
);
const { tourSteps, tourOffer, TOUR_ROUTE } = await import("../src/lib/toon/tour.js");

const GUIDE_FILES = [
  { id: "section:about", kind: "about", name: "about.md" },
  { id: "section:experience", kind: "experience", name: "experience.md" },
  { id: "section:projects", kind: "projects", name: "projects/" },
  { id: "section:skills", kind: "skills", name: "skills.json" },
  { id: "section:contact", kind: "contact", name: "contact.sh" },
];

check("what the guide remembers survives a round trip through storage", () => {
  let memory = toonMemory.emptyMemory();
  memory = toonMemory.withVisit(memory, 1000);
  memory = toonMemory.withSeen(memory, "section:about", 2000);
  memory = toonMemory.withLine(memory, "The amber one is the good one.");
  memory = toonMemory.withTour(memory, "done");

  const restored = toonMemory.parseMemory(toonMemory.serialiseMemory(memory));

  assert.equal(restored.visits, 1);
  assert.equal(restored.lastFile, "section:about");
  assert.equal(restored.tour, "done");
  assert.equal(toonMemory.hasSeen(restored, "section:about"), true);
  assert.equal(toonMemory.hasSeen(restored, "section:contact"), false);
  assert.deepEqual(restored.lines, ["The amber one is the good one."]);
});

check("a visitor who toggled the old guide off is still left alone", () => {
  assert.equal(toonMemory.parseMemory("off").enabled, false);
  assert.equal(toonMemory.parseMemory("on").enabled, true);
  assert.equal(toonMemory.parseMemory(null).enabled, true);
});

check("nothing a browser hands back can corrupt what the guide remembers", () => {
  const junk = ["", "{", "[]", "null", '"off "', '{"visits":"lots","seen":[1,2]}', '{"seen":null}'];

  for (const raw of junk) {
    const memory = toonMemory.parseMemory(raw);
    assert.equal(typeof memory.visits, "number", `${raw} produced a strange visit count`);
    assert.ok(memory.visits >= 0, `${raw} produced a negative visit count`);
    assert.equal(typeof memory.seen, "object", `${raw} produced a strange history`);
    assert.ok(Array.isArray(memory.lines), `${raw} produced strange chatter`);
    assert.ok(["done", "skipped", null].includes(memory.tour), `${raw} produced a strange tour`);
  }
});

check("the guide's memory never grows without bound", () => {
  let memory = toonMemory.emptyMemory();

  for (let index = 0; index < 200; index += 1) {
    memory = toonMemory.withSeen(memory, `section:file-${index}`);
    memory = toonMemory.withLine(memory, `line number ${index}`);
  }

  const restored = toonMemory.parseMemory(toonMemory.serialiseMemory(memory));

  assert.ok(
    Object.keys(restored.seen).length <= toonMemory.MAX_REMEMBERED_FILES,
    "the read history grew past its cap"
  );
  assert.ok(
    restored.lines.length <= toonMemory.MAX_REMEMBERED_LINES,
    "the chatter history grew past its cap"
  );
  assert.ok(toonMemory.serialiseMemory(restored).length < 4000, "the memory blob got fat");
});

check("the guide counts what the visitor has actually read", () => {
  let memory = toonMemory.emptyMemory();
  assert.deepEqual(toonMemory.progressOf(memory, GUIDE_FILES), {
    read: 0,
    total: 5,
    done: false,
  });

  memory = toonMemory.withSeen(memory, "section:about");
  memory = toonMemory.withSeen(memory, "section:about");
  assert.deepEqual(toonMemory.progressOf(memory, GUIDE_FILES).read, 1);
  assert.equal(progressLine(1, 5), "1 of 5 read.");

  for (const file of GUIDE_FILES) memory = toonMemory.withSeen(memory, file.id);
  assert.equal(toonMemory.progressOf(memory, GUIDE_FILES).done, true);
  assert.equal(toonMemory.nextUnread(memory, GUIDE_FILES), null);
});

check("the guide never sends the visitor somewhere they have already been", () => {
  let memory = toonMemory.emptyMemory();
  memory = toonMemory.withSeen(memory, "section:projects");
  memory = toonMemory.withSeen(memory, "section:experience");

  const menu = menuFor({
    file: GUIDE_FILES[0],
    files: GUIDE_FILES,
    keys: keysFor(false),
    memory,
  });

  const offered = menu.options.filter((option) => option.action === "open");
  assert.ok(offered.length > 0, "the guide offered nowhere to go");

  for (const option of offered) {
    assert.equal(
      toonMemory.hasSeen(memory, option.arg),
      false,
      `the guide re-offered ${option.arg} while unread files were left`
    );
  }
});

check("the guide still has somewhere to point once everything is read", () => {
  let memory = toonMemory.emptyMemory();
  for (const file of GUIDE_FILES) memory = toonMemory.withSeen(memory, file.id);

  const menu = menuFor({
    file: GUIDE_FILES[0],
    files: GUIDE_FILES,
    keys: keysFor(false),
    memory,
  });

  assert.ok(menu.options.length >= 2, "the guide ran out of options");
  assert.equal(
    menu.options.some((option) => option.arg === GUIDE_FILES[0].id),
    false,
    "the guide offered the open file"
  );
});

check("the guide only offers to answer questions when answering is switched on", () => {
  const off = menuFor({ file: null, files: GUIDE_FILES, keys: keysFor(false) });
  assert.equal(off.options.some((option) => option.action === "ask"), false);

  const on = menuFor({ file: null, files: GUIDE_FILES, keys: keysFor(false), askEnabled: true });
  assert.equal(on.options.some((option) => option.action === "ask"), true);
  assert.ok(on.options.length <= MAX_MENU_OPTIONS, "the ask option pushed the menu over its cap");
});

check("every reaction the guide can have resolves to a frame it owns", () => {
  const events = [
    ["command", "sudo"],
    ["command", "rm"],
    ["command", "vim"],
    ["command", "matrix"],
    ["command", "ask"],
    ["command", "theme"],
    ["contact", "sent"],
    ["contact", "failed"],
    ["resume", "download"],
    ["copy", "email"],
    ["ask", "thinking"],
    ["ask", "answered"],
    ["ask", "failed"],
    ["route", "missing"],
    ["theme", "changed"],
    ["terminal", "opened"],
    ["tab", "closed"],
    ["social", "github"],
  ];

  for (const [type, name] of events) {
    const reaction = reactionFor(type, { name });
    assert.ok(reaction, `${type}:${name} produced no reaction`);
    assert.ok(reaction.text.length > 0, `${type}:${name} had nothing to say`);
    assert.ok(
      REACTION_ACTIVITIES.includes(reaction.activity),
      `${type}:${name} asked for an unknown activity: ${reaction.activity}`
    );

    for (const phase of [0, 1, 2, 3]) {
      const frame = frameFor(reaction.activity, phase);
      assert.ok(SPRITE[frame], `${type}:${name} asked for a missing frame: ${frame}`);
    }
  }
});

check("the guide stays quiet about the commands nobody needs narrated", () => {
  for (const name of ["ls", "cd", "pwd", "cat", "open", "echo", "history", "date"]) {
    assert.equal(reactionFor("command", { name }), null, `the guide interrupted ${name}`);
  }

  assert.equal(reactionFor(null, { name: "sudo" }), null);
  assert.equal(reactionFor("command", {}), null);
  assert.equal(reactionFor("nonsense", { name: "nonsense" }), null);
  assert.equal(dwellReaction({ name: "about.md" }, null), null);
});

check("the tour only visits files the workspace actually has", () => {
  const steps = tourSteps(GUIDE_FILES);
  assert.ok(steps.length >= 2, "the tour had nowhere to go");
  assert.ok(steps.length <= TOUR_ROUTE.length, "the tour grew extra stops");

  const ids = steps.map((step) => step.fileId);
  assert.equal(new Set(ids).size, ids.length, "the tour visited the same file twice");

  for (const step of steps) {
    assert.ok(
      GUIDE_FILES.some((file) => file.id === step.fileId),
      `the tour pointed at a file that is not in the tree: ${step.fileId}`
    );
    assert.ok(step.text.length > 0, `${step.fileId} had no line to read`);
  }

  assert.deepEqual(tourSteps([]), [], "an empty workspace still produced a tour");
  assert.deepEqual(tourSteps([{ id: "x", kind: "uses", name: "uses.md" }]), []);
});

check("the tour offer is something the guide knows how to run", () => {
  for (const returning of [true, false]) {
    const offer = tourOffer({ returning, steps: 4 });
    assert.ok(offer.text.length > 0, "the offer had no words");
    assert.equal(offer.options.length, 2, "the offer needs a yes and a no");

    for (const option of offer.options) {
      assert.ok(
        TOON_ACTIONS.includes(option.action),
        `the offer used an action nothing handles: ${option.action}`
      );
      assert.ok(option.label, "an offer option reached the bubble with no label");
    }
  }
});

const failed = results.filter((entry) => !entry.ok);
const width = Math.max(...results.map((entry) => entry.name.length));

process.stdout.write("\n");
for (const entry of results) {
  const detail = entry.ok ? "" : `  ${entry.message}`;
  process.stdout.write(`  ${entry.ok ? "PASS" : "FAIL"}  ${entry.name.padEnd(width)}${detail}\n`);
}
process.stdout.write(`\n  ${results.length - failed.length}/${results.length} passed\n\n`);

process.exitCode = failed.length > 0 ? 1 : 0;
