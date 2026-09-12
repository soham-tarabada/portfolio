import {
  Profile,
  Section,
  SkillCategory,
  Experience,
  Education,
  Project,
  Uses,
} from "../models/index.js";
import { env } from "../config/env.js";

let cache = { payload: null, expiresAt: 0 };

function serialize(document) {
  if (!document) return null;
  const { _id, createdAt, updatedAt, singleton, ...rest } = document;
  return _id ? { id: String(_id), ...rest } : { ...rest };
}

function serializeAll(documents) {
  return documents.map(serialize);
}

function shapeProfile(document, includeHidden) {
  const profile = serialize(document);
  if (!profile) return null;

  profile.socials = (profile.socials || [])
    .filter((social) => includeHidden || social.visible !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  return profile;
}

function shapeUses(document, includeHidden) {
  const uses = serialize(document);
  if (!uses) return null;

  uses.categories = (uses.categories || [])
    .filter((category) => includeHidden || category.items?.length > 0)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  return uses;
}

export function invalidateContentCache() {
  cache = { payload: null, expiresAt: 0 };
}

export async function getContent({ includeHidden = false } = {}) {
  const now = Date.now();

  if (!includeHidden && cache.payload && cache.expiresAt > now) {
    return cache.payload;
  }

  const scope = includeHidden ? {} : { visible: true };
  const sort = { order: 1 };

  const [profile, sections, skills, experience, education, projects, uses] = await Promise.all([
    Profile.findOne({ singleton: "profile" }).lean(),
    Section.find(scope).sort(sort).lean(),
    SkillCategory.find(scope).sort(sort).lean(),
    Experience.find(scope).sort(sort).lean(),
    Education.find(scope).sort(sort).lean(),
    Project.find(scope).sort(sort).lean(),
    Uses.findOne({ singleton: "uses" }).lean(),
  ]);

  const payload = {
    profile: shapeProfile(profile, includeHidden),
    sections: serializeAll(sections),
    skills: serializeAll(skills),
    experience: serializeAll(experience),
    education: serializeAll(education),
    projects: serializeAll(projects),
    uses: shapeUses(uses, includeHidden),
    meta: {
      generatedAt: new Date().toISOString(),
      version: env.SERVICE_VERSION,
      counts: {
        sections: sections.length,
        skillCategories: skills.length,
        skills: skills.reduce((total, category) => total + (category.skills?.length || 0), 0),
        experience: experience.length,
        projects: projects.length,
        education: education.length,
      },
    },
  };

  if (!includeHidden) {
    cache = { payload, expiresAt: now + env.CONTENT_CACHE_TTL_MS };
  }

  return payload;
}
