export const REACTION_ACTIVITIES = ["idle", "cheer", "wave", "dizzy", "think"];

export const REACTION_GAP = 6000;

const COMMAND_REACTIONS = {
  sudo: { text: "Escalated. He is worth the privileges.", activity: "cheer", hop: true },
  rm: { text: "Put that down.", activity: "dizzy" },
  matrix: { text: "Wake up, visitor.", activity: "think" },
  vim: { text: "It is :q!. I have watched people try everything else.", activity: "think" },
  sl: { text: "All aboard. Nobody asked for this train.", activity: "cheer", hop: true },
  neofetch: { text: "Twelve phosphors, one terrible chair.", activity: "wave" },
  ask: { text: "Reading. Give me a second.", activity: "think" },
  resume: { text: "PDF away. Print it if you are old fashioned.", activity: "wave" },
  mail: { text: "Say something true and he will answer.", activity: "wave" },
  email: { text: "Copied. Paste it somewhere useful.", activity: "cheer", hop: true },
  contact: { text: "This is the page that matters.", activity: "wave" },
  socials: { text: "He is quieter on some of those than others.", activity: "idle" },
  theme: { text: "New phosphor. I glow whatever colour you pick.", activity: "cheer", hop: true },
  help: { text: "Start with ask. It is the one that answers back.", activity: "wave" },
  clear: { text: "Clean slate.", activity: "idle" },
  exit: { text: "Exit to where? This is the whole building.", activity: "think" },
  whoami: { text: "That is him. Shorter than the resume, truer than the bio.", activity: "idle" },
  skills: { text: "Nothing on that list is aspirational.", activity: "idle" },
  projects: { text: "Pick one. The architecture opens with it.", activity: "wave" },
  experience: { text: "Every line has a shipping date behind it.", activity: "idle" },
  education: { text: "Vadodara, then everything after it.", activity: "idle" },
  uses: { text: "The tools, the keyboard, the terrible chair.", activity: "idle" },
  spotify: { text: "He codes to this. Judge him gently.", activity: "cheer" },
  uptime: { text: "I have been standing here the whole time.", activity: "idle" },
  keys: { text: "Press ? and you get the pretty version.", activity: "wave" },
  toon: { text: "You rang.", activity: "wave" },
};

const EVENT_REACTIONS = {
  "contact:sent": {
    text: "Sent. He actually reads those.",
    activity: "cheer",
    hop: true,
    hold: 4200,
  },
  "contact:failed": { text: "That did not go through. His email works too.", activity: "dizzy" },
  "resume:download": { text: "Resume is out. Good luck to it.", activity: "wave" },
  "copy:email": { text: "Copied. Paste it somewhere useful.", activity: "cheer", hop: true },
  "ask:thinking": { text: "Reading his pages…", activity: "think", hold: 8000 },
  "ask:answered": { text: "There. Ask me another.", activity: "cheer", hop: true },
  "ask:empty": { text: "Nothing came back. Try rephrasing it.", activity: "think" },
  "ask:failed": { text: "That question did not reach him. Try again shortly.", activity: "dizzy" },
  "route:missing": { text: "Nothing lives at that address. I will take you home.", activity: "think" },
  "theme:changed": {
    text: "New phosphor. I glow whatever colour you pick.",
    activity: "cheer",
    hop: true,
  },
  "terminal:opened": { text: "There it is. Type help, or just ask.", activity: "wave" },
  "tab:closed": { text: "Gone. The tree still has it.", activity: "idle" },
};

const SOCIAL_REACTIONS = {
  github: { text: "The commits are public. So are the bad ones.", activity: "wave" },
  linkedin: { text: "The formal version of all this.", activity: "idle" },
  x: { text: "Fewer opinions than you would expect.", activity: "idle" },
  twitter: { text: "Fewer opinions than you would expect.", activity: "idle" },
};

function normalise(reaction) {
  if (!reaction) return null;
  return {
    text: reaction.text,
    activity: REACTION_ACTIVITIES.includes(reaction.activity) ? reaction.activity : "idle",
    hop: Boolean(reaction.hop),
    hold: Number.isFinite(reaction.hold) ? reaction.hold : 0,
  };
}

export function reactionFor(type, payload = {}) {
  const name = String(payload?.name || "").toLowerCase();

  if (!type) return null;

  if (type === "command") return normalise(COMMAND_REACTIONS[name]);
  if (type === "social") return normalise(SOCIAL_REACTIONS[name] || SOCIAL_REACTIONS.github);

  return normalise(EVENT_REACTIONS[`${type}:${name}`] || EVENT_REACTIONS[type]);
}

export function dwellReaction(file, next) {
  if (!next) return null;

  return normalise({
    text: file
      ? `Still on ${file.name}? ${next.name} is the one nobody reads.`
      : `${next.name} is the one nobody reads.`,
    activity: "wave",
    hold: 5200,
  });
}
