import mongoose from "mongoose";

const pickSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, trim: true },
    bullets: { type: [Number], default: [] },
  },
  { _id: false }
);

const groupSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, trim: true },
    items: { type: [Number], default: [] },
  },
  { _id: false }
);

const resumeVariantSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true, maxlength: 120 },
    targetRole: { type: String, default: "", trim: true, maxlength: 120 },
    notes: { type: String, default: "", trim: true, maxlength: 600 },
    headline: { type: String, default: "", trim: true, maxlength: 160 },
    summary: { type: String, default: "", trim: true, maxlength: 1200 },
    experience: { type: [pickSchema], default: [] },
    projects: { type: [pickSchema], default: [] },
    skills: { type: [groupSchema], default: [] },
    education: { type: [String], default: [] },
    showTech: { type: Boolean, default: true },
    showLinks: { type: Boolean, default: true },
    accent: { type: String, default: "#1a1a1a", trim: true },
    lastRenderedAt: { type: Date, default: null },
  },
  { timestamps: true, versionKey: false }
);

resumeVariantSchema.index({ updatedAt: -1 });

export const ResumeVariant =
  mongoose.models.ResumeVariant || mongoose.model("ResumeVariant", resumeVariantSchema);
