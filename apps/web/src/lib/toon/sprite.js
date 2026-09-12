export const SPRITE_COLS = 14;
export const SPRITE_ROWS = 13;

export const BODY = "#";
export const SHADE = "o";
export const EYE = "x";
export const EMPTY = ".";

const FRAMES = {
  idle: [
    "...########...",
    "..##########..",
    "..#########o..",
    "..##x####x#o..",
    "..##x####x#o..",
    "..##x####x#o..",
    "..#########o..",
    "###########o##",
    "###########o##",
    "..#########o..",
    "..#########o..",
    "..##..##..#o..",
    "..##..##..#o..",
  ],
  blink: [
    "...########...",
    "..##########..",
    "..#########o..",
    "..#########o..",
    "..##x####x#o..",
    "..#########o..",
    "..#########o..",
    "###########o##",
    "###########o##",
    "..#########o..",
    "..#########o..",
    "..##..##..#o..",
    "..##..##..#o..",
  ],
  walkA: [
    "...########...",
    "..##########..",
    "..#########o..",
    "..##x####x#o..",
    "..##x####x#o..",
    "..##x####x#o..",
    "..#########o..",
    "###########o##",
    "###########o##",
    "..#########o..",
    "..#########o..",
    "..##..##..#o..",
    "..##......#o..",
  ],
  walkB: [
    "...########...",
    "..##########..",
    "..#########o..",
    "..##x####x#o..",
    "..##x####x#o..",
    "..##x####x#o..",
    "..#########o..",
    "###########o##",
    "###########o##",
    "..#########o..",
    "..#########o..",
    "..##..##..#o..",
    "......##......",
  ],
  wave: [
    "...########...",
    "..##########..",
    "..#########o..",
    "..##x####x#o..",
    "..##x####x#o..",
    "..##x####x#o##",
    "..#########o##",
    "###########o..",
    "###########o..",
    "..#########o..",
    "..#########o..",
    "..##..##..#o..",
    "..##..##..#o..",
  ],
  cheer: [
    "...########...",
    "..##########..",
    "..#########o..",
    "..##xx##xx#o..",
    "..##xx##xx#o..",
    "####xx##xx#o##",
    "###########o##",
    "..#########o..",
    "..#########o..",
    "..#########o..",
    "..#########o..",
    "..##..##..#o..",
    "......##......",
  ],
  squint: [
    "...########...",
    "..##########..",
    "..#########o..",
    "..#########o..",
    "..##o####o#o..",
    "..#########o..",
    "..#########o..",
    "###########o##",
    "###########o##",
    "..#########o..",
    "..#########o..",
    "..##..##..#o..",
    "..##..##..#o..",
  ],
  sleep: [
    "...########...",
    "..##########..",
    "..#########o..",
    "..#########o..",
    "..##xx##xx#o..",
    "..#########o..",
    "..#########o..",
    "###########o##",
    "###########o##",
    "..#########o..",
    "..#########o..",
    "..##..##..#o..",
    "..............",
  ],
};

const TRACKING = new Set(["idle", "walkA", "walkB", "wave", "cheer"]);

export function runsFor(rows) {
  const runs = [];

  rows.forEach((row, y) => {
    let x = 0;

    while (x < row.length) {
      const key = row[x];
      let end = x;
      while (end < row.length && row[end] === key) end += 1;
      if (key !== EMPTY) runs.push({ x, y, w: end - x, key });
      x = end;
    }
  });

  return runs;
}

export const FRAME_NAMES = Object.keys(FRAMES);

export const SPRITE = Object.fromEntries(
  FRAME_NAMES.map((name) => {
    const runs = runsFor(FRAMES[name]);
    return [
      name,
      {
        name,
        rows: FRAMES[name],
        body: runs.filter((run) => run.key !== EYE),
        eyes: runs.filter((run) => run.key === EYE),
        tracks: TRACKING.has(name),
      },
    ];
  })
);

export function frameFor(activity, phase) {
  if (activity === "sleep") return "sleep";
  if (activity === "drag") return "cheer";
  if (activity === "dizzy") return "squint";
  if (activity === "think") return phase % 2 === 0 ? "squint" : "blink";
  if (activity === "cheer") return phase % 2 === 0 ? "cheer" : "wave";
  if (activity === "wave") return "wave";
  if (activity === "walk") return phase % 2 === 0 ? "walkA" : "walkB";
  return "idle";
}

export function getFrame(name) {
  return SPRITE[name] || SPRITE.idle;
}

export function visualActivity(activity, { grounded, moving }) {
  if (activity === "drag" || activity === "sleep" || activity === "dizzy") return activity;
  if (!grounded) return "cheer";
  if (activity === "cheer" || activity === "wave" || activity === "think") return activity;
  if (moving) return "walk";
  return "idle";
}

const ASCII = { "#": "██", o: "▓▓", x: "  ", ".": "  " };

export function asciiFrame(name = "idle") {
  return getFrame(name).rows.map((row) =>
    row
      .split("")
      .map((key) => ASCII[key] || "  ")
      .join("")
      .replace(/\s+$/, "")
  );
}
