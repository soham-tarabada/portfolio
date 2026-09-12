import mongoose from "mongoose";
import { connectDatabase } from "../config/db.js";
import { env, assertEnv } from "../config/env.js";
import { logger } from "../utils/logger.js";
import {
  Profile,
  Section,
  SkillCategory,
  Experience,
  Education,
  Project,
  Uses,
  User,
} from "../models/index.js";
import {
  profile,
  sections,
  skillCategories,
  experiences,
  projects,
  education,
  uses,
} from "./data.js";

const flags = new Set(process.argv.slice(2));
const reset = flags.has("--reset");
const overwrite = flags.has("--overwrite") || reset;
const resetPassword = flags.has("--reset-password");

const CONTENT_MODELS = [Profile, Section, SkillCategory, Experience, Education, Project, Uses];

async function syncCollection(Model, documents, keyOf) {
  if (overwrite) {
    const operations = documents.map((document) => ({
      updateOne: { filter: keyOf(document), update: { $set: document }, upsert: true },
    }));

    const result = await Model.bulkWrite(operations);
    return {
      collection: Model.modelName,
      inserted: result.upsertedCount,
      updated: result.modifiedCount,
      unchanged: result.matchedCount - result.modifiedCount,
    };
  }

  let inserted = 0;
  let unchanged = 0;

  for (const document of documents) {
    if (await Model.exists(keyOf(document))) {
      unchanged += 1;
      continue;
    }
    await Model.create(document);
    inserted += 1;
  }

  return { collection: Model.modelName, inserted, updated: 0, unchanged };
}

async function syncAdminUser() {
  const email = env.ADMIN_EMAIL.toLowerCase();
  const existing = await User.findOne({ email });

  if (!existing) {
    await User.create({
      email,
      name: env.ADMIN_NAME,
      passwordHash: await User.hashPassword(env.ADMIN_PASSWORD),
    });
    return { collection: "User", inserted: 1, updated: 0, unchanged: 0 };
  }

  if (resetPassword) {
    existing.passwordHash = await User.hashPassword(env.ADMIN_PASSWORD);
    existing.refreshTokens = [];
    await existing.save();
    return { collection: "User", inserted: 0, updated: 1, unchanged: 0 };
  }

  return { collection: "User", inserted: 0, updated: 0, unchanged: 1 };
}

async function run() {
  assertEnv();

  if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set before seeding.");
  }
  if (env.ADMIN_PASSWORD.length < 12) {
    throw new Error("ADMIN_PASSWORD must be at least 12 characters.");
  }

  await connectDatabase();

  if (reset) {
    logger.warn("resetting content collections");
    await Promise.all(CONTENT_MODELS.map((Model) => Model.deleteMany({})));
  }

  const report = [];

  report.push(await syncCollection(Profile, [profile], () => ({ singleton: "profile" })));
  report.push(await syncCollection(Section, sections, (doc) => ({ key: doc.key })));
  report.push(await syncCollection(SkillCategory, skillCategories, (doc) => ({ key: doc.key })));
  report.push(
    await syncCollection(Experience, experiences, (doc) => ({
      company: doc.company,
      role: doc.role,
      startDate: doc.startDate,
    }))
  );
  report.push(await syncCollection(Project, projects, (doc) => ({ slug: doc.slug })));
  report.push(
    await syncCollection(Education, education, (doc) => ({
      institution: doc.institution,
      qualification: doc.qualification,
    }))
  );
  report.push(await syncCollection(Uses, [uses], () => ({ singleton: "uses" })));
  report.push(await syncAdminUser());

  const width = Math.max(...report.map((row) => row.collection.length));
  process.stdout.write("\n");
  for (const row of report) {
    process.stdout.write(
      `  ${row.collection.padEnd(width)}  +${row.inserted} inserted  ~${row.updated} updated  =${row.unchanged} unchanged\n`
    );
  }
  process.stdout.write(
    `\n  mode: ${reset ? "reset" : overwrite ? "overwrite" : "insert-missing-only"}\n`
  );
  process.stdout.write(`  admin: ${env.ADMIN_EMAIL}\n\n`);

  await mongoose.disconnect();
}

run().catch((error) => {
  logger.error("seed failed", { message: error.message, stack: error.stack });
  process.exitCode = 1;
  mongoose.disconnect();
});
