import mongoose from "mongoose";

export const MESSAGE_STATUSES = ["new", "read", "replied", "archived", "spam"];

const messageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 200 },
    company: { type: String, trim: true, default: "", maxlength: 160 },
    subject: { type: String, trim: true, default: "", maxlength: 200 },
    body: { type: String, required: true, trim: true, maxlength: 5000 },
    status: { type: String, enum: MESSAGE_STATUSES, default: "new", index: true },
    source: { type: String, trim: true, default: "site" },
    fingerprint: { type: String, default: "", select: false },
    userAgent: { type: String, default: "", maxlength: 300 },
    referrer: { type: String, default: "", maxlength: 200 },
    path: { type: String, default: "", maxlength: 200 },
    readAt: { type: Date, default: null },
  },
  { timestamps: true, versionKey: false }
);

messageSchema.index({ createdAt: -1 });
messageSchema.index({ status: 1, createdAt: -1 });

export const Message = mongoose.models.Message || mongoose.model("Message", messageSchema);
