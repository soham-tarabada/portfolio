import { Asset } from "../models/Asset.js";
import { badRequest, notFoundError } from "../utils/httpError.js";

const KIND = "resume";

function serialize(document) {
  if (!document) return null;
  const { _id, data, ...rest } = document;
  return { id: String(_id), ...rest };
}

export async function listResumeVersions(req, res) {
  const items = await Asset.find({ kind: KIND }).sort({ version: -1 }).lean();
  res.json({ items: items.map(serialize), count: items.length });
}

export async function uploadResume(req, res) {
  if (!req.file) throw badRequest('Attach a PDF in a field named "file".', "NO_FILE");

  const latest = await Asset.findOne({ kind: KIND }).sort({ version: -1 }).select("version").lean();
  const version = (latest?.version || 0) + 1;

  await Asset.updateMany({ kind: KIND, active: true }, { $set: { active: false } });

  const created = await Asset.create({
    kind: KIND,
    filename: req.file.originalname || `Resume-v${version}.pdf`,
    mimetype: req.file.mimetype,
    size: req.file.size,
    version,
    active: true,
    data: req.file.buffer,
  });

  const { data, ...rest } = created.toObject();
  res.status(201).json({ item: serialize(rest) });
}

export async function activateResume(req, res) {
  const target = await Asset.findOne({ _id: req.params.id, kind: KIND });
  if (!target) throw notFoundError("No resume version with that id.");

  await Asset.updateMany({ kind: KIND, active: true }, { $set: { active: false } });
  target.active = true;
  await target.save();

  const { data, ...rest } = target.toObject();
  res.json({ item: serialize(rest) });
}

export async function deleteResume(req, res) {
  const target = await Asset.findOne({ _id: req.params.id, kind: KIND }).select("active").lean();
  if (!target) throw notFoundError("No resume version with that id.");

  if (target.active) {
    throw badRequest("Activate another version before deleting the current one.", "ASSET_ACTIVE");
  }

  await Asset.deleteOne({ _id: req.params.id });
  res.status(204).end();
}

function toBuffer(value) {
  if (Buffer.isBuffer(value)) return value;
  if (value?.buffer) return Buffer.from(value.buffer);
  return Buffer.from(value);
}

export async function downloadResume(req, res) {
  const asset = await Asset.findOne({ kind: KIND, active: true }).select("+data");

  if (!asset) {
    throw notFoundError("No resume has been uploaded yet.", "NO_RESUME");
  }

  const body = toBuffer(asset.data);

  res.setHeader("Content-Type", asset.mimetype);
  res.setHeader("Content-Length", body.length);
  res.setHeader("Content-Disposition", `inline; filename="${asset.filename}"`);
  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=300");
  res.end(body);
}

export async function resumeMeta(req, res) {
  const asset = await Asset.findOne({ kind: KIND, active: true }).lean();
  res.json({ resume: serialize(asset) });
}
