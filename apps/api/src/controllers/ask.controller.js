import { AskLog } from "../models/AskLog.js";
import { isConfigured, activeModel, activeProvider } from "../services/ask.service.js";
import { env } from "../config/env.js";

const PAGE_SIZE = 25;

function serialize(document) {
  const { _id, __v, ...rest } = document;
  return { id: String(_id), ...rest };
}

export async function listQuestions(req, res) {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || PAGE_SIZE, 100);

  const [items, total, failures] = await Promise.all([
    AskLog.find({})
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    AskLog.countDocuments({}),
    AskLog.countDocuments({ failed: true }),
  ]);

  res.json({
    items: items.map(serialize),
    page,
    limit,
    total,
    failures,
    configured: isConfigured(),
    model: activeModel(),
    provider: activeProvider().label,
    limits: { perHour: env.ASK_MAX_PER_HOUR, perDay: env.ASK_MAX_PER_DAY },
  });
}

export async function deleteQuestion(req, res) {
  await AskLog.findByIdAndDelete(req.params.id);
  res.status(204).end();
}
