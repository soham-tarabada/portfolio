import mongoose from "mongoose";

const socialSchema = new mongoose.Schema(
  {
    platform: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
    handle: { type: String, trim: true, default: "" },
    url: { type: String, required: true, trim: true },
    order: { type: Number, default: 0 },
    visible: { type: Boolean, default: true },
  },
  { _id: false }
);

const profileSchema = new mongoose.Schema(
  {
    singleton: { type: String, default: "profile", unique: true, immutable: true },
    name: { type: String, required: true, trim: true },
    roleTitle: { type: String, required: true, trim: true },
    tagline: { type: String, trim: true, default: "" },
    summary: { type: String, trim: true, default: "" },
    about: { type: [String], default: [] },
    location: { type: String, trim: true, default: "" },
    timezone: { type: String, trim: true, default: "Asia/Kolkata" },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true, default: "" },
    availability: { type: String, trim: true, default: "" },
    yearsExperience: { type: Number, default: 0 },
    socials: { type: [socialSchema], default: [] },
  },
  { timestamps: true, versionKey: false }
);

export const Profile = mongoose.models.Profile || mongoose.model("Profile", profileSchema);
