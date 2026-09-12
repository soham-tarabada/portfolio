const LANGUAGES = ["markdown", "typescript", "javascript", "json", "shell"];

export const FORMS = {
  profile: {
    label: "Profile",
    singleton: true,
    fields: [
      { name: "name", label: "Name", type: "text" },
      { name: "roleTitle", label: "Role title", type: "text" },
      { name: "tagline", label: "Tagline", type: "text" },
      { name: "summary", label: "Summary", type: "textarea", rows: 4 },
      { name: "about", label: "About paragraphs", type: "textlist", rows: 3 },
      { name: "location", label: "Location", type: "text" },
      { name: "timezone", label: "Timezone", type: "text", default: "Asia/Kolkata" },
      { name: "email", label: "Email", type: "text" },
      { name: "phone", label: "Phone", type: "text" },
      { name: "availability", label: "Availability", type: "text" },
      { name: "yearsExperience", label: "Years of experience", type: "number", step: "0.5" },
      {
        name: "socials",
        label: "Social links",
        type: "objectlist",
        titleField: "label",
        fields: [
          { name: "platform", label: "Platform", type: "text" },
          { name: "label", label: "Label", type: "text" },
          { name: "handle", label: "Handle", type: "text" },
          { name: "url", label: "URL", type: "text" },
          { name: "order", label: "Order", type: "number" },
          { name: "visible", label: "Visible", type: "toggle", default: true },
        ],
      },
    ],
  },

  sections: {
    label: "Sections",
    titleField: "label",
    subtitleField: "filename",
    fields: [
      { name: "key", label: "Key", type: "text", readOnly: true },
      { name: "label", label: "Label", type: "text" },
      { name: "filename", label: "Filename", type: "text" },
      { name: "folder", label: "Folder", type: "text" },
      { name: "language", label: "Language", type: "select", options: LANGUAGES, default: "markdown" },
      { name: "icon", label: "Icon", type: "text" },
      { name: "order", label: "Order", type: "number" },
      { name: "visible", label: "Visible", type: "toggle", default: true },
      { name: "openByDefault", label: "Open by default", type: "toggle" },
    ],
  },

  skills: {
    label: "Skills",
    titleField: "name",
    subtitleField: "key",
    fields: [
      { name: "key", label: "Key", type: "text" },
      { name: "name", label: "Name", type: "text" },
      {
        name: "skills",
        label: "Skills",
        type: "objectlist",
        titleField: "name",
        fields: [
          { name: "name", label: "Name", type: "text" },
          { name: "icon", label: "Icon", type: "text" },
          { name: "url", label: "URL", type: "text" },
        ],
      },
      { name: "order", label: "Order", type: "number" },
      { name: "visible", label: "Visible", type: "toggle", default: true },
    ],
  },

  experience: {
    label: "Experience",
    titleField: "role",
    subtitleField: "company",
    fields: [
      { name: "company", label: "Company", type: "text" },
      { name: "role", label: "Role", type: "text" },
      { name: "employmentType", label: "Employment type", type: "text", default: "Full-time" },
      { name: "location", label: "Location", type: "text" },
      { name: "startDate", label: "Start", type: "month" },
      { name: "endDate", label: "End", type: "month", nullable: true },
      { name: "current", label: "Current role", type: "toggle" },
      { name: "bullets", label: "Bullets", type: "textlist", rows: 3 },
      { name: "tech", label: "Tech", type: "textlist" },
      { name: "order", label: "Order", type: "number" },
      { name: "visible", label: "Visible", type: "toggle", default: true },
    ],
  },

  education: {
    label: "Education",
    titleField: "institution",
    subtitleField: "qualification",
    fields: [
      { name: "institution", label: "Institution", type: "text" },
      { name: "qualification", label: "Qualification", type: "text" },
      { name: "field", label: "Field", type: "text" },
      { name: "score", label: "Score", type: "text" },
      { name: "location", label: "Location", type: "text" },
      { name: "startDate", label: "Start", type: "month" },
      { name: "endDate", label: "End", type: "month", nullable: true },
      { name: "order", label: "Order", type: "number" },
      { name: "visible", label: "Visible", type: "toggle", default: true },
    ],
  },

  projects: {
    label: "Projects",
    titleField: "title",
    subtitleField: "subtitle",
    fields: [
      { name: "title", label: "Title", type: "text" },
      { name: "subtitle", label: "Subtitle", type: "text" },
      { name: "slug", label: "Slug", type: "text" },
      { name: "filename", label: "Filename", type: "text" },
      { name: "client", label: "Client", type: "text" },
      { name: "period", label: "Period label", type: "text" },
      { name: "startDate", label: "Start", type: "month" },
      { name: "endDate", label: "End", type: "month", nullable: true },
      { name: "current", label: "Ongoing", type: "toggle" },
      { name: "role", label: "Role", type: "text" },
      { name: "summary", label: "Summary", type: "textarea", rows: 3 },
      { name: "bullets", label: "Bullets", type: "textlist", rows: 3 },
      { name: "tech", label: "Tech", type: "textlist" },
      {
        name: "links",
        label: "Links",
        type: "objectlist",
        titleField: "label",
        fields: [
          { name: "label", label: "Label", type: "text" },
          { name: "url", label: "URL", type: "text" },
          { name: "kind", label: "Kind", type: "text" },
        ],
      },
      { name: "dossier", label: "Dossier the ask command reads", type: "json", rows: 14 },
      { name: "diagram", label: "Architecture diagram", type: "json", rows: 16 },
      { name: "confidential", label: "Confidential", type: "toggle" },
      { name: "featured", label: "Featured", type: "toggle" },
      { name: "order", label: "Order", type: "number" },
      { name: "visible", label: "Visible", type: "toggle", default: true },
    ],
  },

  uses: {
    label: "Uses",
    singleton: true,
    fields: [
      { name: "intro", label: "Intro", type: "textarea", rows: 3 },
      {
        name: "categories",
        label: "Categories",
        type: "objectlist",
        titleField: "name",
        fields: [
          { name: "name", label: "Name", type: "text" },
          { name: "order", label: "Order", type: "number" },
          {
            name: "items",
            label: "Items",
            type: "objectlist",
            titleField: "name",
            fields: [
              { name: "name", label: "Name", type: "text" },
              { name: "note", label: "Note", type: "text" },
              { name: "url", label: "URL", type: "text" },
            ],
          },
        ],
      },
    ],
  },
};

export const RESOURCE_ORDER = [
  "profile",
  "sections",
  "skills",
  "experience",
  "projects",
  "education",
  "uses",
];

export function emptyValue(field) {
  if (field.default !== undefined) return field.default;

  switch (field.type) {
    case "toggle":
      return false;
    case "number":
      return 0;
    case "textlist":
    case "objectlist":
      return [];
    case "json":
      return null;
    case "select":
      return field.options?.[0] ?? "";
    default:
      return "";
  }
}

export function blankRecord(form) {
  return Object.fromEntries(form.fields.map((field) => [field.name, emptyValue(field)]));
}

export function hydrate(form, record) {
  return Object.fromEntries(
    form.fields.map((field) => [field.name, record?.[field.name] ?? emptyValue(field)])
  );
}

export function toPayload(record, values) {
  return { ...(record || {}), ...values };
}
