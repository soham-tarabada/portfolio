import { z } from "zod";
import {
  Profile,
  Section,
  SkillCategory,
  Experience,
  Education,
  Project,
  Uses,
} from "../models/index.js";

const trimmed = z.string().trim();
const optionalText = trimmed.default("");
const nullableMonth = z.string().trim().nullable().default(null);

const socialSchema = z.object({
  platform: trimmed.min(1),
  label: trimmed.min(1),
  handle: optionalText,
  url: trimmed.min(1),
  order: z.number().int().default(0),
  visible: z.boolean().default(true),
});

const profileSchema = z.object({
  name: trimmed.min(1),
  roleTitle: trimmed.min(1),
  tagline: optionalText,
  summary: optionalText,
  about: z.array(trimmed).default([]),
  location: optionalText,
  timezone: trimmed.default("Asia/Kolkata"),
  email: trimmed.email(),
  phone: optionalText,
  availability: optionalText,
  yearsExperience: z.number().min(0).default(0),
  socials: z.array(socialSchema).default([]),
});

const sectionSchema = z.object({
  key: trimmed.min(1),
  label: trimmed.min(1),
  filename: trimmed.min(1),
  folder: trimmed.nullable().default(null),
  language: z.enum(["markdown", "typescript", "javascript", "json", "shell"]),
  icon: optionalText,
  order: z.number().int().default(0),
  visible: z.boolean().default(true),
  openByDefault: z.boolean().default(false),
});

const skillCategorySchema = z.object({
  key: trimmed.min(1),
  name: trimmed.min(1),
  skills: z
    .array(z.object({ name: trimmed.min(1), icon: optionalText, url: optionalText }))
    .default([]),
  order: z.number().int().default(0),
  visible: z.boolean().default(true),
});

const experienceSchema = z.object({
  company: trimmed.min(1),
  role: trimmed.min(1),
  employmentType: trimmed.default("Full-time"),
  location: optionalText,
  startDate: trimmed.min(1),
  endDate: nullableMonth,
  current: z.boolean().default(false),
  bullets: z.array(trimmed).default([]),
  tech: z.array(trimmed).default([]),
  order: z.number().int().default(0),
  visible: z.boolean().default(true),
});

const educationSchema = z.object({
  institution: trimmed.min(1),
  qualification: trimmed.min(1),
  field: optionalText,
  score: optionalText,
  location: optionalText,
  startDate: trimmed.min(1),
  endDate: nullableMonth,
  order: z.number().int().default(0),
  visible: z.boolean().default(true),
});

const diagramNodeSchema = z.object({
  id: trimmed.min(1),
  label: trimmed.min(1),
  note: optionalText,
});

const diagramLayerSchema = z.object({
  label: trimmed.min(1),
  note: optionalText,
  via: trimmed.nullable().default(null),
  owned: z.boolean().default(false),
  nodes: z.array(diagramNodeSchema).min(1),
});

const diagramSchema = z
  .object({
    summary: optionalText,
    layers: z.array(diagramLayerSchema).min(1),
    notes: z.array(trimmed).default([]),
  })
  .nullable()
  .default(null);

const projectSchema = z.object({
  slug: trimmed.min(1).toLowerCase(),
  filename: trimmed.min(1),
  title: trimmed.min(1),
  subtitle: optionalText,
  client: optionalText,
  period: optionalText,
  startDate: optionalText,
  endDate: nullableMonth,
  current: z.boolean().default(false),
  role: optionalText,
  summary: optionalText,
  bullets: z.array(trimmed).default([]),
  tech: z.array(trimmed).default([]),
  links: z
    .array(z.object({ label: trimmed.min(1), url: trimmed.min(1), kind: trimmed.default("demo") }))
    .default([]),
  dossier: z
    .object({
      scale: z.array(z.object({ label: trimmed.min(1), value: trimmed.min(1) })).default([]),
      modules: z.array(trimmed).default([]),
      integrations: z.array(z.object({ title: trimmed.min(1), detail: optionalText })).default([]),
      decisions: z.array(z.object({ title: trimmed.min(1), detail: optionalText })).default([]),
    })
    .default({}),
  diagram: diagramSchema,
  confidential: z.boolean().default(false),
  featured: z.boolean().default(false),
  order: z.number().int().default(0),
  visible: z.boolean().default(true),
});

const usesSchema = z.object({
  intro: optionalText,
  categories: z
    .array(
      z.object({
        name: trimmed.min(1),
        order: z.number().int().default(0),
        items: z
          .array(z.object({ name: trimmed.min(1), note: optionalText, url: optionalText }))
          .default([]),
      })
    )
    .default([]),
});

export const RESOURCES = {
  profile: { model: Profile, schema: profileSchema, singleton: "profile", label: "Profile" },
  sections: {
    model: Section,
    schema: sectionSchema,
    reorderable: true,
    fixed: true,
    label: "Sections",
  },
  skills: { model: SkillCategory, schema: skillCategorySchema, reorderable: true, label: "Skills" },
  experience: { model: Experience, schema: experienceSchema, reorderable: true, label: "Experience" },
  education: { model: Education, schema: educationSchema, reorderable: true, label: "Education" },
  projects: { model: Project, schema: projectSchema, reorderable: true, label: "Projects" },
  uses: { model: Uses, schema: usesSchema, singleton: "uses", label: "Uses" },
};

export function getResource(name) {
  return Object.prototype.hasOwnProperty.call(RESOURCES, name) ? RESOURCES[name] : null;
}
