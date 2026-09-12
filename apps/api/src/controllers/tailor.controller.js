import { z } from "zod";
import { ResumeVariant } from "../models/ResumeVariant.js";
import { Asset } from "../models/Asset.js";
import { getContent } from "../services/content.service.js";
import { buildPlan, defaultSelection, planCounts, filenameFor } from "../services/tailor.service.js";
import { renderResume } from "../services/resume-pdf.service.js";
import { badRequest, notFoundError } from "../utils/httpError.js";

const RESUME_KIND = "resume";

const pickSchema = z.object({
  id: z.string().trim().min(1),
  bullets: z.array(z.number().int().min(0)).default([]),
});

const groupSchema = z.object({
  id: z.string().trim().min(1),
  items: z.array(z.number().int().min(0)).default([]),
});

export const selectionSchema = z.object({
  label: z.string().trim().min(1).max(120),
  targetRole: z.string().trim().max(120).default(""),
  notes: z.string().trim().max(600).default(""),
  headline: z.string().trim().max(160).default(""),
  summary: z.string().trim().max(1200).default(""),
  experience: z.array(pickSchema).default([]),
  projects: z.array(pickSchema).default([]),
  skills: z.array(groupSchema).default([]),
  education: z.array(z.string().trim().min(1)).default([]),
  showTech: z.boolean().default(true),
  showLinks: z.boolean().default(true),
});

function serialize(document) {
  if (!document) return null;
  const { _id, __v, ...rest } = document;
  return { id: String(_id), ...rest };
}

async function planFrom(selection) {
  const content = await getContent({ includeHidden: true });
  return { content, plan: buildPlan(content, selection) };
}

export async function tailorSource(req, res) {
  const content = await getContent({ includeHidden: true });

  res.json({
    profile: content.profile,
    experience: content.experience,
    projects: content.projects,
    skills: content.skills,
    education: content.education,
    suggested: defaultSelection(content),
  });
}

export async function listVariants(req, res) {
  const items = await ResumeVariant.find({}).sort({ updatedAt: -1 }).lean();
  res.json({ items: items.map(serialize), count: items.length });
}

export async function createVariant(req, res) {
  const created = await ResumeVariant.create(req.body);
  res.status(201).json({ item: serialize(created.toObject()) });
}

export async function updateVariant(req, res) {
  const updated = await ResumeVariant.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true }
  ).lean();

  if (!updated) throw notFoundError("No saved variant with that id.");
  res.json({ item: serialize(updated) });
}

export async function deleteVariant(req, res) {
  const deleted = await ResumeVariant.findByIdAndDelete(req.params.id);
  if (!deleted) throw notFoundError("No saved variant with that id.");
  res.status(204).end();
}

export async function previewVariant(req, res) {
  const selection = req.body;
  const { plan } = await planFrom(selection);
  const { buffer, pages } = await renderResume(plan);

  res.json({
    plan,
    pages,
    bytes: buffer.length,
    counts: planCounts(plan),
    filename: filenameFor(plan, selection.label),
  });
}

export async function renderVariant(req, res) {
  const selection = req.body;
  const { plan } = await planFrom(selection);

  if (plan.experience.length === 0 && plan.projects.length === 0) {
    throw badRequest("Select at least one role or project before exporting.", "EMPTY_RESUME");
  }

  const { buffer, pages } = await renderResume(plan);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Length", buffer.length);
  res.setHeader("Content-Disposition", `attachment; filename="${filenameFor(plan, selection.label)}"`);
  res.setHeader("X-Resume-Pages", String(pages));
  res.end(buffer);
}

export async function publishVariant(req, res) {
  const selection = req.body;
  const { plan } = await planFrom(selection);

  if (plan.experience.length === 0 && plan.projects.length === 0) {
    throw badRequest("Select at least one role or project before publishing.", "EMPTY_RESUME");
  }

  const { buffer, pages } = await renderResume(plan);

  const latest = await Asset.findOne({ kind: RESUME_KIND })
    .sort({ version: -1 })
    .select("version")
    .lean();
  const version = (latest?.version || 0) + 1;

  await Asset.updateMany({ kind: RESUME_KIND, active: true }, { $set: { active: false } });

  const created = await Asset.create({
    kind: RESUME_KIND,
    filename: filenameFor(plan, selection.label),
    mimetype: "application/pdf",
    size: buffer.length,
    version,
    active: true,
    data: buffer,
  });

  if (req.params.id) {
    await ResumeVariant.findByIdAndUpdate(req.params.id, {
      $set: { lastRenderedAt: new Date() },
    });
  }

  const { data, _id, ...rest } = created.toObject();
  res.status(201).json({ item: { id: String(_id), ...rest }, pages });
}
