import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { validate } from "../middleware/validate.js";
import { requireDatabase } from "../middleware/database.js";
import { createMessage } from "../services/message.service.js";
import { recordEvents } from "../services/analytics.service.js";
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

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: env.CONTACT_MAX_PER_HOUR,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: "RATE_LIMITED",
      message: "That is enough messages for one hour. Email me directly instead.",
    },
  },
});

const contactSchema = z.object({
  name: z.string().trim().min(2, "must be at least 2 characters").max(120),
  email: z.string().trim().toLowerCase().email("must be a valid email address").max(200),
  company: z.string().trim().max(160).default(""),
  subject: z.string().trim().max(200).default(""),
  body: z
    .string()
    .trim()
    .min(20, "must be at least 20 characters")
    .max(5000, "must be 5000 characters or fewer"),
  website: z.string().max(200).default(""),
  dwellMs: z.number().int().min(0).max(86_400_000).default(0),
  path: z.string().trim().max(200).default("/"),
  referrer: z.string().trim().max(500).default(""),
  session: z.string().trim().max(64).default(""),
});

router.post("/contact", contactLimiter, requireDatabase, validate(contactSchema), async (req, res) => {
  const payload = req.body;

  if (payload.website.trim()) {
    return res.status(202).json({ accepted: true });
  }

  const suspect = payload.dwellMs > 0 && payload.dwellMs < env.CONTACT_MIN_DWELL_MS;
  const userAgent = req.get("user-agent") || "";

  const item = await createMessage({
    name: payload.name,
    email: payload.email,
    company: payload.company,
    subject: payload.subject,
    body: payload.body,
    status: suspect ? "spam" : "new",
    source: "site",
    fingerprint: pseudonym(clientIp(req), "contact"),
    userAgent: userAgent.slice(0, 300),
    referrer: referrerHost(payload.referrer, env.CORS_ORIGINS.map(hostOf).filter(Boolean)),
    path: trimPath(payload.path),
  });

  await recordEvents([
    {
      type: "contact",
      name: suspect ? "flagged" : "received",
      path: trimPath(payload.path),
      referrer: referrerHost(payload.referrer),
      device: deviceOf(userAgent),
      session: payload.session || pseudonym(clientIp(req), "session"),
      day: dayKey(),
      createdAt: new Date(),
    },
  ]).catch(() => 0);

  return res.status(201).json({ accepted: true, id: item.id });
});

function hostOf(origin) {
  try {
    return new URL(origin).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export default router;
