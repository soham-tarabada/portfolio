import mongoose from "mongoose";

const experienceSchema = new mongoose.Schema(
  {
    company: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    employmentType: { type: String, default: "Full-time", trim: true },
    location: { type: String, default: "", trim: true },
    startDate: { type: String, required: true, trim: true },
    endDate: { type: String, default: null, trim: true },
    current: { type: Boolean, default: false },
    bullets: { type: [String], default: [] },
    tech: { type: [String], default: [] },
    order: { type: Number, default: 0, index: true },
    visible: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false }
);

export const Experience =
  mongoose.models.Experience || mongoose.model("Experience", experienceSchema);
