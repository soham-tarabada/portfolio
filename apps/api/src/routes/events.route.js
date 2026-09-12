import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { validate } from "../middleware/validate.js";
import { requireDatabase } from "../middleware/database.js";
import { recordEvents } from "../services/analytics.service.js";
import { EVENT_TYPES } from "../models/index.js";
import { env } from "../config/env.js";
import {
  clientIp,
  pseudonym,
  deviceOf,
  referrerHost,
  trimPath,
  dayKey,
} from "../utils/fingerprint.js";

const router = Router();

const eventsLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: "RATE_LIMITED", message: "Too many events." } },
});

const eventsSchema = z.object({
  session: z.string().trim().max(64).default(""),
  referrer: z.string().trim().max(500).default(""),
  events: z
    .array(
      z.object({
        type: z.enum(EVENT_TYPES),
        name: z.string().trim().min(1).max(120),
        path: z.string().trim().max(200).default("/"),
      })
    )
    .min(1, "send at least one event")
    .max(20, "send at most 20 events per batch"),
});

router.post("/events", eventsLimiter, requireDatabase, validate(eventsSchema), async (req, res) => {
  if (!env.ANALYTICS_ENABLED) return res.status(202).json({ accepted: 0 });

  const userAgent = req.get("user-agent") || "";
  const device = deviceOf(userAgent);

  if (device === "bot") return res.status(202).json({ accepted: 0 });

  const session = req.body.session || pseudonym(clientIp(req), "session");
  const referrer = referrerHost(req.body.referrer, env.CORS_ORIGINS.map(hostOf).filter(Boolean));
  const day = dayKey();
  const createdAt = new Date();

  const accepted = await recordEvents(
    req.body.events.map((event) => ({
      type: event.type,
      name: event.name,
      path: trimPath(event.path),
      referrer,
      device,
      session,
      day,
      createdAt,
    }))
  );

  return res.status(202).json({ accepted });
});

function hostOf(origin) {
  try {
    return new URL(origin).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export default router;
