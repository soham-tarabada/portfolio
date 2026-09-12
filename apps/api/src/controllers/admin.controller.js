import { RESOURCES, getResource } from "../config/resources.js";
import { invalidateContentCache } from "../services/content.service.js";
import { badRequest, notFoundError, forbidden } from "../utils/httpError.js";

function serialize(document) {
  if (!document) return null;
  const { _id, __v, singleton, ...rest } = document;
  return { id: String(_id), ...rest };
}

function resolve(name) {
  const resource = getResource(name);
  if (!resource) throw notFoundError(`Unknown resource "${name}".`, "UNKNOWN_RESOURCE");
  return resource;
}

export function parse(resource, body, { partial = false } = {}) {
  const schema = partial ? resource.schema.partial() : resource.schema;
  const result = schema.safeParse(body);

  if (!result.success) {
    const detail = result.error.issues
      .map((issue) => `${issue.path.join(".") || "body"}: ${issue.message}`)
      .join("; ");
    throw badRequest(detail, "VALIDATION_ERROR");
  }

  if (!partial) return result.data;

  const sent = body && typeof body === "object" ? body : {};
  return Object.fromEntries(
    Object.entries(result.data).filter(([field]) =>
      Object.prototype.hasOwnProperty.call(sent, field)
    )
  );
}

export function listResources(req, res) {
  res.json({
    resources: Object.entries(RESOURCES).map(([name, resource]) => ({
      name,
      label: resource.label,
      singleton: Boolean(resource.singleton),
      reorderable: Boolean(resource.reorderable),
      fixed: Boolean(resource.fixed),
    })),
  });
}

export async function listResource(req, res) {
  const resource = resolve(req.params.resource);

  if (resource.singleton) {
    const document = await resource.model.findOne({ singleton: resource.singleton }).lean();
    return res.json({ item: serialize(document) });
  }

  const items = await resource.model.find({}).sort({ order: 1, _id: 1 }).lean();
  return res.json({ items: items.map(serialize), count: items.length });
}

export async function getOne(req, res) {
  const resource = resolve(req.params.resource);
  if (resource.singleton) throw badRequest(`${req.params.resource} is a single document.`);

  const document = await resource.model.findById(req.params.id).lean();
  if (!document) throw notFoundError("No record with that id.");

  return res.json({ item: serialize(document) });
}

export async function createOne(req, res) {
  const resource = resolve(req.params.resource);

  if (resource.singleton) throw badRequest(`${req.params.resource} cannot be created.`);
  if (resource.fixed) {
    throw forbidden(`${req.params.resource} entries cannot be added.`, "RESOURCE_FIXED");
  }

  const created = await resource.model.create(parse(resource, req.body));
  invalidateContentCache();

  return res.status(201).json({ item: serialize(created.toObject()) });
}

export async function updateOne(req, res) {
  const resource = resolve(req.params.resource);
  const partial = req.method === "PATCH";
  const payload = parse(resource, req.body, { partial });

  if (resource.singleton) {
    const updated = await resource.model
      .findOneAndUpdate(
        { singleton: resource.singleton },
        { $set: payload },
        { new: true, upsert: true, runValidators: true }
      )
      .lean();

    invalidateContentCache();
    return res.json({ item: serialize(updated) });
  }

  const updated = await resource.model
    .findByIdAndUpdate(req.params.id, { $set: payload }, { new: true, runValidators: true })
    .lean();

  if (!updated) throw notFoundError("No record with that id.");

  invalidateContentCache();
  return res.json({ item: serialize(updated) });
}

export async function deleteOne(req, res) {
  const resource = resolve(req.params.resource);

  if (resource.singleton) throw badRequest(`${req.params.resource} cannot be deleted.`);
  if (resource.fixed) {
    throw forbidden(`${req.params.resource} entries cannot be removed.`, "RESOURCE_FIXED");
  }

  const deleted = await resource.model.findByIdAndDelete(req.params.id);
  if (!deleted) throw notFoundError("No record with that id.");

  invalidateContentCache();
  return res.status(204).end();
}

export async function reorder(req, res) {
  const resource = resolve(req.params.resource);

  if (!resource.reorderable) {
    throw badRequest(`${req.params.resource} cannot be reordered.`, "NOT_REORDERABLE");
  }

  const ids = req.body?.ids;
  if (!Array.isArray(ids) || ids.length === 0) {
    throw badRequest("Send an ids array in the order you want.", "VALIDATION_ERROR");
  }

  const found = await resource.model.find({ _id: { $in: ids } }).select("_id").lean();
  if (found.length !== ids.length) {
    throw badRequest("Some ids do not exist in this collection.", "UNKNOWN_IDS");
  }

  await resource.model.bulkWrite(
    ids.map((id, index) => ({
      updateOne: { filter: { _id: id }, update: { $set: { order: index + 1 } } },
    }))
  );

  invalidateContentCache();

  const items = await resource.model.find({}).sort({ order: 1, _id: 1 }).lean();
  return res.json({ items: items.map(serialize), count: items.length });
}
