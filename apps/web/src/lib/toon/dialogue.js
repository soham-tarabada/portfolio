import { hasSeen, progressOf } from "./memory.js";

export const TOON_NAME = "Bit";

export const TOON_ACTIONS = ["open", "terminal", "palette", "email", "resume", "ask", "tour", "skip"];

export const MAX_MENU_OPTIONS = 5;

const KIND_LINES = {
  about: "That's the short version. The long one is in the shell.",
  experience: "Every line here has a shipping date behind it.",
  projects: "Pick one — the architecture opens with it.",
  project: "Diagrams, not screenshots. Read the boxes.",
  skills: "Nothing on this list is aspirational.",
  education: "Vadodara, then everything after it.",
  uses: "The tools, the keyboard, the terrible chair.",
  contact: "This is the page that matters. Want the address?",
};

const GREETINGS = [
  "I know where everything lives. Ask me.",
  "Need a map, or shall I just wander?",
  "Hello. I am the tour.",
];

const POKES = [
  "Oi.",
  "That tickles.",
  "Still me.",
  "You are enjoying this.",
  "Keep going. See what happens.",
  "…",
  "Fine. You win.",
];

const IDLE_LINES = [
  "The amber one is the good one.",
  "Try `ask` in the shell. It answers.",
  "You can throw me. I do not mind.",
  "Twelve phosphors. I have opinions about three.",
  "There is a whole terminal down here.",
  "`sudo hire-me`. Go on.",
  "Ask me a question. I read the same pages you do.",
  "Press B and I come running.",
];

const DIZZY_LINES = ["Everything is sideways.", "I regret this.", "Ten out of ten. Do not repeat."];

export const ASK_INTRO = "Ask me anything about Soham. I answer from this site's own pages.";
export const ASK_THINKING = "Reading his pages…";
export const ASK_UNAVAILABLE = "Questions are off on this deployment. Everything else still works.";

export function askDoneLine(remaining) {
  if (!Number.isFinite(remaining)) return "Ask me another.";
  if (remaining <= 0) return "That was the last question for today.";
  if (remaining === 1) return "One more question left today.";
  return `${remaining} questions left today.`;
}

export function askErrorLine(message) {
  const detail = String(message || "").trim();
  if (!detail) return "That did not reach him. Try again shortly.";
  return detail.length > 120 ? `${detail.slice(0, 117)}…` : detail;
}

export function greetLine(seed = 0, context = {}) {
  if (context.returning) {
    return context.lastLabel
      ? `Back. You stopped on ${context.lastLabel}.`
      : "Back again. Where were we?";
  }

  return GREETINGS[Math.abs(Math.floor(seed)) % GREETINGS.length];
}

export function pokeLine(count) {
  if (count <= 0) return POKES[0];
  return POKES[Math.min(count, POKES.length) - 1];
}

export function idleLine(seed, spoken = []) {
  const unused = IDLE_LINES.filter((entry) => !spoken.includes(entry));
  const pool = unused.length > 0 ? unused : IDLE_LINES;
  return pool[Math.abs(Math.floor(seed)) % pool.length];
}

export function dizzyLine(seed) {
  return DIZZY_LINES[Math.abs(Math.floor(seed)) % DIZZY_LINES.length];
}

export function isDizzy(count) {
  return count >= POKES.length;
}

export function progressLine(read, total) {
  if (total <= 0) return "";
  if (read <= 0) return "";
  if (read >= total) return "You have read all of it.";
  return `${read} of ${total} read.`;
}

const ROUTES = {
  about: ["projects", "experience"],
  experience: ["projects", "skills"],
  projects: ["experience", "contact"],
  project: ["projects", "contact"],
  skills: ["projects", "uses"],
  education: ["experience", "skills"],
  uses: ["skills", "projects"],
  contact: ["projects", "about"],
};

const LABELS = {
  about: "Who is he?",
  experience: "Where has he worked?",
  projects: "Show me the projects",
  project: "Open a project",
  skills: "What does he know?",
  education: "Where did he study?",
  uses: "What does he use?",
  contact: "How do I reach him?",
};

function labelFor(file) {
  return LABELS[file.kind] || `Open ${file.label || file.name}`;
}

function routeOrder({ file, files, memory }) {
  const currentId = file?.id || null;
  const wanted = ROUTES[file?.kind || null] || ["projects", "about", "contact"];

  const routed = wanted
    .map((kind) => files.find((entry) => entry.kind === kind))
    .filter(Boolean);

  const ordered = [];
  const add = (entry) => {
    if (!entry || entry.id === currentId) return;
    if (ordered.some((existing) => existing.id === entry.id)) return;
    ordered.push(entry);
  };

  const unread = (entry) => !memory || !hasSeen(memory, entry.id);

  for (const entry of routed) if (unread(entry)) add(entry);
  for (const entry of files) if (unread(entry)) add(entry);
  for (const entry of routed) add(entry);
  for (const entry of files) add(entry);

  return ordered;
}

export function menuFor({
  file,
  files = [],
  keys,
  terminalOpen = false,
  memory = null,
  askEnabled = false,
} = {}) {
  const kind = file?.kind || null;
  const progress = memory ? progressOf(memory, files) : null;

  let text = (kind && KIND_LINES[kind]) || "Where are we going?";

  if (progress?.done && files.length > 2) {
    text = "You have read all of it. Ask me something the pages do not cover.";
  } else if (progress && progress.read > 1 && files.length > 2) {
    text = `${text} ${progressLine(progress.read, progress.total)}`;
  }

  const options = [];

  if (askEnabled) {
    options.push({ id: "ask", label: "Ask me about him", hint: "answers", action: "ask" });
  }

  for (const entry of routeOrder({ file, files, memory }).slice(0, 2)) {
    options.push({
      id: `open:${entry.id}`,
      label: labelFor(entry),
      hint: entry.name,
      action: "open",
      arg: entry.id,
    });
  }

  if (kind === "contact") {
    options.push({ id: "email", label: "Copy his email", action: "email" });
  } else {
    options.push({
      id: "terminal",
      label: terminalOpen ? "Hide the shell" : "Open the shell",
      hint: keys?.terminal,
      action: "terminal",
    });
  }

  options.push({
    id: "palette",
    label: "Jump anywhere",
    hint: keys?.palette,
    action: "palette",
  });

  return { text, options: options.slice(0, MAX_MENU_OPTIONS) };
}
