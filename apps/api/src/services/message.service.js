import { Message, MESSAGE_STATUSES } from "../models/index.js";

export const FILTERS = ["inbox", "all", ...MESSAGE_STATUSES];

const PAGE_SIZE = 25;

function serialize(document) {
  if (!document) return null;
  const { _id, __v, fingerprint, ...rest } = document;
  return { id: String(_id), ...rest };
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function buildFilter({ status, q } = {}) {
  const filter = {};

  const scope = FILTERS.includes(status) ? status : "inbox";
  if (scope !== "all") {
    filter.status = scope === "inbox" ? { $in: ["new", "read"] } : scope;
  }

  const term = String(q || "").trim();
  if (term) {
    const pattern = new RegExp(escapeRegex(term), "i");
    filter.$or = [
      { name: pattern },
      { email: pattern },
      { subject: pattern },
      { body: pattern },
      { company: pattern },
    ];
  }

  return filter;
}

export async function listMessages({ status, q, page = 1, limit = PAGE_SIZE } = {}) {
  const filter = buildFilter({ status, q });
  const size = Math.min(Math.max(Number(limit) || PAGE_SIZE, 1), 100);
  const current = Math.max(Number(page) || 1, 1);

  const [items, total, counts] = await Promise.all([
    Message.find(filter)
      .sort({ createdAt: -1 })
      .skip((current - 1) * size)
      .limit(size)
      .lean(),
    Message.countDocuments(filter),
    countByStatus(),
  ]);

  return {
    items: items.map(serialize),
    total,
    page: current,
    pages: Math.max(Math.ceil(total / size), 1),
    counts,
  };
}

export async function countByStatus() {
  const rows = await Message.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]);
  const counts = Object.fromEntries(MESSAGE_STATUSES.map((status) => [status, 0]));

  for (const row of rows) {
    if (row._id in counts) counts[row._id] = row.count;
  }

  counts.all = Object.values(counts).reduce((total, value) => total + value, 0);
  counts.inbox = counts.new + counts.read;
  return counts;
}

export async function getMessage(id) {
  const document = await Message.findById(id).lean();
  return serialize(document);
}

export async function markRead(id) {
  const document = await Message.findOneAndUpdate(
    { _id: id, status: "new" },
    { $set: { status: "read", readAt: new Date() } },
    { new: true }
  ).lean();

  return serialize(document);
}

export async function setStatus(id, status) {
  const patch = { status };
  if (status !== "new") patch.readAt = new Date();

  const document = await Message.findByIdAndUpdate(id, { $set: patch }, { new: true }).lean();
  return serialize(document);
}

export async function deleteMessage(id) {
  const deleted = await Message.findByIdAndDelete(id);
  return Boolean(deleted);
}

export async function createMessage(payload) {
  const created = await Message.create(payload);
  return serialize(created.toObject());
}
