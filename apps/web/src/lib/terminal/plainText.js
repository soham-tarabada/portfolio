import { line, blank, table, wrap } from "./output.js";
import { formatRange, formatMonth } from "../format.js";

function paragraphs(values, tone = "normal") {
  return values.flatMap((value, index) => [
    ...wrap(value).map((row) => line(row, tone)),
    ...(index < values.length - 1 ? [blank()] : []),
  ]);
}

export function aboutText(content) {
  const { profile } = content;
  const current = content.experience.find((role) => role.current);

  return [
    line(profile.name, "accent"),
    line(`${profile.roleTitle} · ${profile.location}`, "dim"),
    blank(),
    ...wrap(profile.summary).map((row) => line(row)),
    blank(),
    ...paragraphs(profile.about),
    blank(),
    line(
      current ? `Currently ${current.role} at ${current.company}.` : "Currently between roles.",
      "dim"
    ),
  ];
}

export function experienceText(content) {
  return content.experience.flatMap((role, index) => [
    line(`${role.role} — ${role.company}`, "accent"),
    line(`${formatRange(role.startDate, role.endDate, role.current)} · ${role.location}`, "dim"),
    blank(),
    ...role.bullets.flatMap((bullet) => wrap(bullet, 76, "  ").map((row, i) =>
      line(i === 0 ? `- ${row.trim()}` : `  ${row.trim()}`)
    )),
    blank(),
    line(`stack: ${role.tech.join(", ")}`, "dim"),
    ...(index < content.experience.length - 1 ? [blank(), line("─".repeat(40), "dim"), blank()] : []),
  ]);
}

export function skillsText(content, filter) {
  const categories = filter
    ? content.skills.filter((category) =>
        category.name.toLowerCase().includes(filter.toLowerCase())
      )
    : content.skills;

  if (categories.length === 0) {
    return [line(`No skill category matches "${filter}".`, "error")];
  }

  return categories.flatMap((category, index) => [
    line(category.name, "accent"),
    ...wrap(category.skills.map((skill) => skill.name).join(", "), 76, "  ").map((row) =>
      line(row)
    ),
    ...(index < categories.length - 1 ? [blank()] : []),
  ]);
}

export function projectsText(content) {
  return content.projects.flatMap((project, index) => [
    line(`${project.filename}`, "accent"),
    line(`${project.title} — ${project.subtitle}`),
    line(`${formatRange(project.startDate, project.endDate, project.current)} · ${project.role}`, "dim"),
    ...wrap(project.tech.join(" · "), 76, "  ").map((row) => line(row, "dim")),
    ...(index < content.projects.length - 1 ? [blank()] : []),
  ]);
}

export function projectText(project) {
  return [
    line(project.title, "accent"),
    line(project.subtitle, "dim"),
    blank(),
    ...table([
      ["client", project.client || "—"],
      ["period", formatRange(project.startDate, project.endDate, project.current)],
      ["role", project.role || "—"],
    ]),
    blank(),
    ...wrap(project.summary).map((row) => line(row)),
    blank(),
    ...project.bullets.flatMap((bullet) =>
      wrap(bullet, 76, "  ").map((row, i) => line(i === 0 ? `- ${row.trim()}` : `  ${row.trim()}`))
    ),
    blank(),
    line(`stack: ${project.tech.join(", ")}`, "dim"),
    ...(project.links.length > 0
      ? [blank(), ...project.links.map((link) => line(`${link.label}: ${link.url}`, "link"))]
      : []),
    ...(project.confidential
      ? [blank(), line("Client interfaces withheld. Architecture only.", "dim")]
      : []),
  ];
}

export function educationText(content) {
  return content.education.flatMap((entry, index) => [
    line(entry.institution, "accent"),
    line(entry.qualification),
    line(`${entry.score} · ${formatRange(entry.startDate, entry.endDate)} · ${entry.location}`, "dim"),
    ...(index < content.education.length - 1 ? [blank()] : []),
  ]);
}

export function usesText(content) {
  if (!content.uses) return [line("Nothing recorded yet.", "dim")];

  return [
    ...wrap(content.uses.intro).map((row) => line(row, "dim")),
    blank(),
    ...content.uses.categories.flatMap((category, index) => [
      line(category.name, "accent"),
      ...(category.items.length === 0
        ? [line("  (empty)", "dim")]
        : category.items.map((item) =>
            line(`  ${item.name}${item.note ? ` — ${item.note}` : ""}`)
          )),
      ...(index < content.uses.categories.length - 1 ? [blank()] : []),
    ]),
  ];
}

export function contactText(content) {
  const { profile } = content;

  return [
    ...table([
      ["email", profile.email],
      ["phone", profile.phone],
      ["location", profile.location],
      ["timezone", profile.timezone],
    ]),
    blank(),
    ...profile.socials.map((social) => line(`${social.label.padEnd(10)}${social.url}`, "link")),
    blank(),
    line("A message form lands here in phase 06.", "dim"),
  ];
}

export function fileText(file, content) {
  switch (file.kind) {
    case "about":
      return aboutText(content);
    case "experience":
      return experienceText(content);
    case "skills":
      return skillsText(content);
    case "education":
      return educationText(content);
    case "uses":
      return usesText(content);
    case "contact":
      return contactText(content);
    case "projects":
      return projectsText(content);
    case "project": {
      const project = content.projects.find((entry) => entry.slug === file.slug);
      return project ? projectText(project) : [line("Project not found.", "error")];
    }
    default:
      return [line(`No preview for ${file.name}.`, "dim")];
  }
}
