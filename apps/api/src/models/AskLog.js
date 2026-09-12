import mongoose from "mongoose";
import { env } from "../config/env.js";

const askLogSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true, maxlength: 400 },
    answer: { type: String, default: "", trim: true, maxlength: 4000 },
    grounded: { type: Boolean, default: true },
    model: { type: String, default: "", trim: true },
    day: { type: String, required: true, index: true },
    fingerprint: { type: String, default: "", index: true, select: false },
    session: { type: String, default: "", trim: true },
    device: { type: String, default: "unknown", trim: true },
    latencyMs: { type: Number, default: 0 },
    inputTokens: { type: Number, default: 0 },
    outputTokens: { type: Number, default: 0 },
    failed: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false }
);

askLogSchema.index({ createdAt: -1 });
askLogSchema.index({ fingerprint: 1, day: 1 });
askLogSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: env.ASK_RETENTION_DAYS * 24 * 60 * 60, name: "asklog_ttl" }
);

export const AskLog = mongoose.models.AskLog || mongoose.model("AskLog", askLogSchema);
