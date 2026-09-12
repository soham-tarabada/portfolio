import mongoose from "mongoose";

const assetSchema = new mongoose.Schema(
  {
    kind: { type: String, required: true, index: true, default: "resume" },
    filename: { type: String, required: true, trim: true },
    mimetype: { type: String, required: true, trim: true },
    size: { type: Number, required: true },
    version: { type: Number, required: true },
    active: { type: Boolean, default: false, index: true },
    data: { type: Buffer, required: true, select: false },
  },
  { timestamps: true, versionKey: false }
);

assetSchema.index({ kind: 1, version: -1 });

export const Asset = mongoose.models.Asset || mongoose.model("Asset", assetSchema);
