const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function monthLabel(value) {
  const match = /^(\d{4})-(\d{2})$/.exec(String(value || "").trim());
  if (!match) return String(value || "").trim();
  const month = MONTHS[Number(match[2]) - 1];
  return month ? `${month} ${match[1]}` : match[1];
}

export function periodLabel(start, end, current) {
  const from = monthLabel(start);
  const to = current ? "Present" : monthLabel(end);
  if (from && to) return `${from} – ${to}`;
  return from || to || "";
}

function pickBullets(bullets = [], indexes) {
  if (!Array.isArray(indexes)) return [...bullets];
  return indexes
    .map((index) => bullets[index])
    .filter((bullet) => typeof bullet === "string" && bullet.trim().length > 0);
}

function orderedPicks(picks, records) {
  const byId = new Map(records.map((record) => [String(record.id), record]));
  return (picks || [])
    .map((pick) => ({ pick, record: byId.get(String(pick.id)) }))
    .filter((entry) => Boolean(entry.record));
}

export function defaultSelection(content) {
  return {
    label: "Full resume",
    targetRole: "",
    headline: content.profile?.roleTitle || "",
    summary: content.profile?.summary || "",
    experience: (content.experience || []).map((role) => ({
      id: role.id,
      bullets: (role.bullets || []).map((bullet, index) => index),
    })),
    projects: (content.projects || []).map((project) => ({
      id: project.id,
      bullets: (project.bullets || []).map((bullet, index) => index),
    })),
    skills: (content.skills || []).map((category) => ({
      id: category.id,
      items: (category.skills || []).map((skill, index) => index),
    })),
    education: (content.education || []).map((entry) => entry.id),
    showTech: true,
    showLinks: true,
  };
}

export function buildPlan(content, selection = {}) {
  const profile = content.profile || {};

  const contacts = [profile.email, profile.phone, profile.location].filter(Boolean);

  const links = selection.showLinks === false
    ? []
    : (profile.socials || [])
        .filter(
          (social) => social.visible !== false && social.platform !== "email" && social.url
        )
        .map((social) => ({ label: social.label, url: social.url }));

  const experience = orderedPicks(selection.experience, content.experience || [])
    .map(({ pick, record }) => ({
      company: record.company,
      role: record.role,
      location: record.location || "",
      period: periodLabel(record.startDate, record.endDate, record.current),
      bullets: pickBullets(record.bullets, pick.bullets),
    }))
    .filter((role) => role.bullets.length > 0);

  const projects = orderedPicks(selection.projects, content.projects || [])
    .map(({ pick, record }) => ({
      title: record.title,
      subtitle: record.subtitle || "",
      period: record.period || periodLabel(record.startDate, record.endDate, record.current),
      tech: selection.showTech === false ? [] : record.tech || [],
      bullets: pickBullets(record.bullets, pick.bullets),
    }))
    .filter((project) => project.bullets.length > 0);

  const skills = orderedPicks(selection.skills, content.skills || [])
    .map(({ pick, record }) => ({
      name: record.name,
      items: (Array.isArray(pick.items)
        ? pick.items.map((index) => record.skills?.[index])
        : record.skills || []
      )
        .filter(Boolean)
        .map((skill) => skill.name),
    }))
    .filter((category) => category.items.length > 0);

  const educationIds = new Set((selection.education || []).map(String));
  const education = (content.education || [])
    .filter((entry) => educationIds.has(String(entry.id)))
    .map((entry) => ({
      institution: entry.institution,
      qualification: entry.qualification,
      score: entry.score || "",
      location: entry.location || "",
      period: periodLabel(entry.startDate, entry.endDate, false),
    }));

  return {
    name: profile.name || "",
    headline: (selection.headline || profile.roleTitle || "").trim(),
    contacts,
    links,
    summary: (selection.summary ?? profile.summary ?? "").trim(),
    experience,
    projects,
    skills,
    education,
    targetRole: (selection.targetRole || "").trim(),
  };
}

export function planCounts(plan) {
  return {
    experience: plan.experience.length,
    experienceBullets: plan.experience.reduce((total, role) => total + role.bullets.length, 0),
    projects: plan.projects.length,
    projectBullets: plan.projects.reduce((total, project) => total + project.bullets.length, 0),
    skillCategories: plan.skills.length,
    skills: plan.skills.reduce((total, category) => total + category.items.length, 0),
    education: plan.education.length,
  };
}

export function filenameFor(plan, variantLabel = "") {
  const parts = [plan.name || "Resume", plan.targetRole || variantLabel]
    .filter(Boolean)
    .map((part) =>
      String(part)
        .replace(/[^A-Za-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
    )
    .filter(Boolean);

  return `${parts.join("-") || "Resume"}.pdf`;
}
