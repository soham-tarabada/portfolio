import mongoose from "mongoose";

const usesItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    note: { type: String, default: "", trim: true },
    url: { type: String, default: "", trim: true },
  },
  { _id: false }
);

const usesCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    items: { type: [usesItemSchema], default: [] },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const usesSchema = new mongoose.Schema(
  {
    singleton: { type: String, default: "uses", unique: true, immutable: true },
    intro: { type: String, default: "", trim: true },
    categories: { type: [usesCategorySchema], default: [] },
  },
  { timestamps: true, versionKey: false }
);

export const Uses = mongoose.models.Uses || mongoose.model("Uses", usesSchema);
