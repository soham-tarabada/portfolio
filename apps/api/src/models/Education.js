import mongoose from "mongoose";

const educationSchema = new mongoose.Schema(
  {
    institution: { type: String, required: true, trim: true },
    qualification: { type: String, required: true, trim: true },
    field: { type: String, default: "", trim: true },
    score: { type: String, default: "", trim: true },
    location: { type: String, default: "", trim: true },
    startDate: { type: String, required: true, trim: true },
    endDate: { type: String, default: null, trim: true },
    order: { type: Number, default: 0, index: true },
    visible: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false }
);

export const Education =
  mongoose.models.Education || mongoose.model("Education", educationSchema);
