export const A4 = {
  usableHeight: 758,
  contentWidth: 511,
};

const COST = {
  headerBlock: 62,
  sectionHeading: 26,
  roleHeader: 24,
  projectHeader: 24,
  techLine: 12,
  bulletLine: 12,
  bodyLine: 12,
  skillLine: 12,
  educationRow: 14,
  gap: 4,
};

const CHARS_PER_LINE = {
  bullet: 118,
  body: 124,
  skills: 120,
};

function linesFor(text, perLine) {
  const length = String(text || "").length;
  return Math.max(Math.ceil(length / perLine), 1);
}

export function emptySelection(label = "Untitled") {
  return {
    label,
    targetRole: "",
    notes: "",
    headline: "",
    summary: "",
    experience: [],
    projects: [],
    skills: [],
    education: [],
    showTech: true,
    showLinks: true,
  };
}

export function selectionFrom(source) {
  return {
    ...emptySelection(source.suggested?.label || "Full resume"),
    ...source.suggested,
  };
}

export function pickOf(selection, group, id) {
  return (selection[group] || []).find((entry) => String(entry.id) === String(id)) || null;
}

export function isChosen(selection, group, id) {
  return Boolean(pickOf(selection, group, id));
}

export function chosenIndexes(selection, group, id, field) {
  const pick = pickOf(selection, group, id);
  return pick ? pick[field] || [] : [];
}

export function toggleRecord(selection, group, id, allIndexes, field) {
  const current = selection[group] || [];
  const exists = current.some((entry) => String(entry.id) === String(id));

  return {
    ...selection,
    [group]: exists
      ? current.filter((entry) => String(entry.id) !== String(id))
      : [...current, { id: String(id), [field]: [...allIndexes] }],
  };
}

export function toggleIndex(selection, group, id, index, field) {
  const current = selection[group] || [];
  const existing = current.find((entry) => String(entry.id) === String(id));

  if (!existing) {
    return { ...selection, [group]: [...current, { id: String(id), [field]: [index] }] };
  }

  const list = existing[field] || [];
  const next = list.includes(index)
    ? list.filter((value) => value !== index)
    : [...list, index].sort((a, b) => a - b);

  if (next.length === 0) {
    return { ...selection, [group]: current.filter((entry) => String(entry.id) !== String(id)) };
  }

  return {
    ...selection,
    [group]: current.map((entry) =>
      String(entry.id) === String(id) ? { ...entry, [field]: next } : entry
    ),
  };
}

export function toggleEducation(selection, id) {
  const current = selection.education || [];
  const exists = current.includes(String(id));

  return {
    ...selection,
    education: exists
      ? current.filter((entry) => entry !== String(id))
      : [...current, String(id)],
  };
}

export function moveRecord(selection, group, id, direction) {
  const current = [...(selection[group] || [])];
  const index = current.findIndex((entry) => String(entry.id) === String(id));
  const target = index + direction;

  if (index === -1 || target < 0 || target >= current.length) return selection;

  [current[index], current[target]] = [current[target], current[index]];
  return { ...selection, [group]: current };
}

export function countSelected(selection, source) {
  const bullets = (group, records, field) =>
    (selection[group] || []).reduce((total, pick) => {
      const record = records.find((entry) => String(entry.id) === String(pick.id));
      return record ? total + (pick[field] || []).length : total;
    }, 0);

  return {
    experience: (selection.experience || []).length,
    experienceBullets: bullets("experience", source.experience || [], "bullets"),
    projects: (selection.projects || []).length,
    projectBullets: bullets("projects", source.projects || [], "bullets"),
    skillCategories: (selection.skills || []).length,
    skills: bullets("skills", source.skills || [], "items"),
    education: (selection.education || []).length,
  };
}

export function estimateHeight(selection, source) {
  let height = COST.headerBlock;

  const summary = selection.summary || source.profile?.summary || "";
  if (summary) {
    height += COST.sectionHeading + linesFor(summary, CHARS_PER_LINE.body) * COST.bodyLine;
  }

  const withRecords = (group, records, field) =>
    (selection[group] || [])
      .map((pick) => ({
        pick,
        record: records.find((entry) => String(entry.id) === String(pick.id)),
      }))
      .filter((entry) => entry.record);

  const experience = withRecords("experience", source.experience || [], "bullets");
  if (experience.length > 0) {
    height += COST.sectionHeading;
    for (const { pick, record } of experience) {
      height += COST.roleHeader + COST.gap;
      for (const index of pick.bullets || []) {
        height += linesFor(record.bullets?.[index], CHARS_PER_LINE.bullet) * COST.bulletLine;
      }
    }
  }

  const projects = withRecords("projects", source.projects || [], "bullets");
  if (projects.length > 0) {
    height += COST.sectionHeading;
    for (const { pick, record } of projects) {
      height += COST.projectHeader + COST.gap;
      if (selection.showTech !== false && record.tech?.length > 0) height += COST.techLine;
      for (const index of pick.bullets || []) {
        height += linesFor(record.bullets?.[index], CHARS_PER_LINE.bullet) * COST.bulletLine;
      }
    }
  }

  const skills = withRecords("skills", source.skills || [], "items");
  if (skills.length > 0) {
    height += COST.sectionHeading;
    for (const { pick, record } of skills) {
      const text = `${record.name}: ${(pick.items || [])
        .map((index) => record.skills?.[index]?.name)
        .filter(Boolean)
        .join(", ")}`;
      height += linesFor(text, CHARS_PER_LINE.skills) * COST.skillLine;
    }
  }

  if ((selection.education || []).length > 0) {
    height += COST.sectionHeading + (selection.education || []).length * COST.educationRow;
  }

  return height;
}

export function estimateFit(selection, source) {
  const height = estimateHeight(selection, source);
  const fill = height / A4.usableHeight;

  return {
    height,
    fill,
    pages: Math.max(Math.ceil(fill), 1),
    percent: Math.round(fill * 100),
    tone: fill <= 0.97 ? "ok" : fill <= 1.35 ? "warn" : "over",
  };
}

export function toPayload(selection) {
  return {
    label: selection.label?.trim() || "Untitled",
    targetRole: selection.targetRole || "",
    notes: selection.notes || "",
    headline: selection.headline || "",
    summary: selection.summary || "",
    experience: (selection.experience || []).map((pick) => ({
      id: String(pick.id),
      bullets: pick.bullets || [],
    })),
    projects: (selection.projects || []).map((pick) => ({
      id: String(pick.id),
      bullets: pick.bullets || [],
    })),
    skills: (selection.skills || []).map((pick) => ({
      id: String(pick.id),
      items: pick.items || [],
    })),
    education: (selection.education || []).map(String),
    showTech: selection.showTech !== false,
    showLinks: selection.showLinks !== false,
  };
}
