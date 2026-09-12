import mongoose from "mongoose";
import { env } from "../config/env.js";

export const EVENT_TYPES = ["view", "file", "command", "resume", "social", "link", "contact"];

const eventSchema = new mongoose.Schema(
  {
    type: { type: String, enum: EVENT_TYPES, required: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    path: { type: String, trim: true, default: "", maxlength: 200 },
    referrer: { type: String, trim: true, default: "", maxlength: 120 },
    device: { type: String, trim: true, default: "desktop" },
    session: { type: String, required: true, maxlength: 64 },
    day: { type: String, required: true, maxlength: 10 },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

eventSchema.index({ day: 1, type: 1 });
eventSchema.index({ type: 1, name: 1 });
eventSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: env.ANALYTICS_RETENTION_DAYS * 24 * 60 * 60, name: "event_ttl" }
);

export const Event = mongoose.models.Event || mongoose.model("Event", eventSchema);
