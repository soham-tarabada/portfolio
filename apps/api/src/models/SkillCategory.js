import mongoose from "mongoose";

const skillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    icon: { type: String, default: "", trim: true },
    url: { type: String, default: "", trim: true },
  },
  { _id: false }
);

const skillCategorySchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    skills: { type: [skillSchema], default: [] },
    order: { type: Number, default: 0, index: true },
    visible: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false }
);

export const SkillCategory =
  mongoose.models.SkillCategory || mongoose.model("SkillCategory", skillCategorySchema);
