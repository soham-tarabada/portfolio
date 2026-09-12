import mongoose from "mongoose";

const LANGUAGES = ["markdown", "typescript", "javascript", "json", "shell"];

const sectionSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, trim: true },
    label: { type: String, required: true, trim: true },
    filename: { type: String, required: true, trim: true },
    folder: { type: String, default: null, trim: true },
    language: { type: String, enum: LANGUAGES, default: "markdown" },
    icon: { type: String, default: "file", trim: true },
    order: { type: Number, default: 0, index: true },
    visible: { type: Boolean, default: true },
    openByDefault: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false }
);

sectionSchema.index({ order: 1, key: 1 });

export const Section = mongoose.models.Section || mongoose.model("Section", sectionSchema);
