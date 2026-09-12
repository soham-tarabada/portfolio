import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { validate } from "../middleware/validate.js";
import { requireDatabase } from "../middleware/database.js";
import { getContent } from "../services/content.service.js";
import { answerQuestion, isConfigured } from "../services/ask.service.js";
import { recordEvents } from "../services/analytics.service.js";
import { AskLog } from "../models/AskLog.js";
import { env } from "../config/env.js";
import { clientIp, pseudonym, deviceOf, dayKey, trimPath } from "../utils/fingerprint.js";

const router = Router();

const askLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: env.ASK_MAX_PER_HOUR,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: "RATE_LIMITED",
      message: "That is enough questions for one hour. Try 'help' for the offline commands.",
    },
  },
});

const askSchema = z.object({
  question: z
    .string()
    .trim()
    .min(3, "must be at least 3 characters")
    .max(300, "must be 300 characters or fewer"),
  session: z.string().trim().max(64).default(""),
  path: z.string().trim().max(200).default("/"),
});

router.get("/ask", (req, res) => {
  res.json({
    configured: isConfigured(),
    limits: { perHour: env.ASK_MAX_PER_HOUR, perDay: env.ASK_MAX_PER_DAY, maxLength: 300 },
  });
});

router.post("/ask", askLimiter, requireDatabase, validate(askSchema), async (req, res) => {
  if (!isConfigured()) {
    return res.json({ configured: false, answer: "", remaining: 0 });
  }

  const { question, session, path } = req.body;
  const fingerprint = pseudonym(clientIp(req), "ask");
  const day = dayKey();

  const used = await AskLog.countDocuments({ fingerprint, day });
  if (used >= env.ASK_MAX_PER_DAY) {
    return res.status(429).json({
      error: {
        code: "DAILY_LIMIT",
        message: "That is the daily question budget spent. Run 'mail' to reach Soham directly.",
      },
    });
  }

  const content = await getContent();
  const result = await answerQuestion({ question, content });

  await AskLog.create({
    question,
    answer: result.answer.slice(0, 4000),
    model: result.model,
    day,
    fingerprint,
    session: session.slice(0, 64),
    device: deviceOf(req.get("user-agent") || ""),
    latencyMs: result.latencyMs,
    inputTokens: result.inputTokens,
    outputTokens: result.outputTokens,
    failed: result.failed,
  }).catch(() => null);

  await recordEvents([
    {
      type: "command",
      name: "ask",
      path: trimPath(path),
      device: deviceOf(req.get("user-agent") || ""),
      session: session || fingerprint,
      day,
      createdAt: new Date(),
    },
  ]).catch(() => 0);

  if (result.failed) {
    return result.busy
      ? res.status(429).json({
          error: {
            code: "ASK_BUSY",
            message: "The answer service is rate limited right now. Give it a minute.",
          },
        })
      : res.status(503).json({
          error: {
            code: "ASK_UNAVAILABLE",
            message: "The answer service did not respond. Try again.",
          },
        });
  }

  return res.json({
    configured: true,
    answer: result.answer,
    remaining: Math.max(env.ASK_MAX_PER_DAY - used - 1, 0),
  });
});

export default router;
