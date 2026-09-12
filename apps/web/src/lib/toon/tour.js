export const TOUR_ROUTE = ["about", "experience", "projects", "contact"];
export const TOUR_STEP_MS = 3600;
export const TOUR_CLOSER = "That is the tour. The shell has the rest — or just poke me.";

const TOUR_LINES = {
  about: "Start here. Who he is, minus the adjectives.",
  experience: "Every line on this page has a shipping date behind it.",
  projects: "The builds. Diagrams, not screenshots — read the boxes.",
  project: "One build, opened up.",
  skills: "Nothing on this list is aspirational.",
  education: "Vadodara, then everything after it.",
  uses: "The tools, the keyboard, the terrible chair.",
  contact: "And this is the page that matters.",
};

export function tourSteps(files = []) {
  const steps = [];

  for (const kind of TOUR_ROUTE) {
    const file = files.find((entry) => entry.kind === kind);
    if (!file || steps.some((step) => step.fileId === file.id)) continue;

    steps.push({
      id: `tour:${file.id}`,
      fileId: file.id,
      text: TOUR_LINES[kind] || `Next: ${file.name}.`,
    });
  }

  return steps;
}

export function tourOffer({ returning = false, steps = 0 } = {}) {
  const text = returning
    ? "Back for the tour? Thirty seconds, same route."
    : `First time here? I can walk you through it — ${steps || 4} stops, thirty seconds.`;

  return {
    text,
    options: [
      { id: "tour:start", label: "Go on then", hint: "30s", action: "tour" },
      { id: "tour:skip", label: "I'll wander myself", action: "skip" },
    ],
  };
}

export function tourProgressLine(index, total) {
  if (total <= 0) return "";
  return `${Math.min(index + 1, total)} of ${total}`;
}
