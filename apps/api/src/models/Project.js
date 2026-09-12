import mongoose from "mongoose";

const linkSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    kind: { type: String, default: "demo", trim: true },
  },
  { _id: false }
);

const factSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const noteSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    detail: { type: String, default: "", trim: true },
  },
  { _id: false }
);

const dossierSchema = new mongoose.Schema(
  {
    scale: { type: [factSchema], default: [] },
    modules: { type: [String], default: [] },
    integrations: { type: [noteSchema], default: [] },
    decisions: { type: [noteSchema], default: [] },
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    filename: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, default: "", trim: true },
    client: { type: String, default: "", trim: true },
    period: { type: String, default: "", trim: true },
    startDate: { type: String, default: "", trim: true },
    endDate: { type: String, default: null, trim: true },
    current: { type: Boolean, default: false },
    role: { type: String, default: "", trim: true },
    summary: { type: String, default: "", trim: true },
    bullets: { type: [String], default: [] },
    tech: { type: [String], default: [] },
    links: { type: [linkSchema], default: [] },
    dossier: { type: dossierSchema, default: () => ({}) },
    diagram: { type: mongoose.Schema.Types.Mixed, default: null },
    confidential: { type: Boolean, default: false },
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0, index: true },
    visible: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false }
);

export const Project = mongoose.models.Project || mongoose.model("Project", projectSchema);
