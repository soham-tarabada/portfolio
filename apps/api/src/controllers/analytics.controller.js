import { summarize, forgetSession, RANGES } from "../services/analytics.service.js";
import { badRequest } from "../utils/httpError.js";

export async function analyticsSummary(req, res) {
  const requested = Number(req.query.days);
  const days = RANGES.includes(requested) ? requested : 30;

  res.json(await summarize({ days }));
}

export async function forgetAnalyticsSession(req, res) {
  const session = String(req.params.session || "").trim();
  if (!session) throw badRequest("Name the session to forget.", "VALIDATION_ERROR");

  res.json({ deleted: await forgetSession(session) });
}
