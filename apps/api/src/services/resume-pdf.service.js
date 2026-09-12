import PDFDocument from "pdfkit";

export const PAGE = {
  size: "A4",
  margin: 42,
  width: 595.28,
  height: 841.89,
};

const TYPE = {
  name: 19,
  headline: 10,
  contact: 8.5,
  section: 9.5,
  role: 10,
  meta: 8.5,
  body: 9,
};

const INK = {
  text: "#111111",
  muted: "#4a4a4a",
  rule: "#bdbdbd",
};

const CONTENT_WIDTH = PAGE.width - PAGE.margin * 2;
const PAGE_BOTTOM = PAGE.height - PAGE.margin;

function resetX(doc) {
  doc.x = PAGE.margin;
}

function ensureSpace(doc, needed) {
  if (doc.y + needed > PAGE_BOTTOM) {
    doc.addPage();
    resetX(doc);
  }
}

function heading(doc, label) {
  resetX(doc);
  doc.moveDown(0.55);
  ensureSpace(doc, TYPE.section + 24);

  doc
    .font("Helvetica-Bold")
    .fontSize(TYPE.section)
    .fillColor(INK.text)
    .text(label.toUpperCase(), PAGE.margin, doc.y, { width: CONTENT_WIDTH });

  const y = doc.y + 2;
  doc
    .moveTo(PAGE.margin, y)
    .lineTo(PAGE.width - PAGE.margin, y)
    .lineWidth(0.6)
    .strokeColor(INK.rule)
    .stroke();

  resetX(doc);
  doc.y = y + 5;
}

function bulletList(doc, bullets) {
  for (const bullet of bullets) {
    doc.font("Helvetica").fontSize(TYPE.body).fillColor(INK.text);

    const height = doc.heightOfString(bullet, { width: CONTENT_WIDTH - 13, lineGap: 0.6 });
    ensureSpace(doc, height);

    const top = doc.y;
    doc.text("•", PAGE.margin + 2, top, { width: 10, lineBreak: false });
    doc.text(bullet, PAGE.margin + 13, top, {
      width: CONTENT_WIDTH - 13,
      align: "left",
      lineGap: 0.6,
    });

    resetX(doc);
    doc.moveDown(0.14);
  }
}

function rowWithRight(doc, left, right, { bold = false, size = TYPE.role, color = INK.text } = {}) {
  doc.font("Helvetica").fontSize(TYPE.meta);
  const rightWidth = right ? doc.widthOfString(right) : 0;
  const leftWidth = CONTENT_WIDTH - rightWidth - 12;

  doc.font(bold ? "Helvetica-Bold" : "Helvetica").fontSize(size);
  ensureSpace(doc, doc.heightOfString(left, { width: leftWidth }));

  const top = doc.y;

  if (right) {
    doc
      .font("Helvetica")
      .fontSize(TYPE.meta)
      .fillColor(INK.muted)
      .text(right, PAGE.margin, top, { width: CONTENT_WIDTH, align: "right" });
  }

  doc
    .font(bold ? "Helvetica-Bold" : "Helvetica")
    .fontSize(size)
    .fillColor(color)
    .text(left, PAGE.margin, top, { width: leftWidth });

  resetX(doc);
  doc.y = Math.max(doc.y, top + size + 1);
}

function header(doc, plan) {
  doc
    .font("Helvetica-Bold")
    .fontSize(TYPE.name)
    .fillColor(INK.text)
    .text(plan.name, PAGE.margin, doc.y, { width: CONTENT_WIDTH, align: "center" });

  if (plan.headline) {
    doc
      .font("Helvetica")
      .fontSize(TYPE.headline)
      .fillColor(INK.muted)
      .text(plan.headline, PAGE.margin, doc.y, { width: CONTENT_WIDTH, align: "center" });
  }

  const contactLine = plan.contacts.join("  |  ");
  if (contactLine) {
    doc.moveDown(0.25);
    doc
      .font("Helvetica")
      .fontSize(TYPE.contact)
      .fillColor(INK.text)
      .text(contactLine, PAGE.margin, doc.y, { width: CONTENT_WIDTH, align: "center" });
  }

  if (plan.links.length > 0) {
    const top = doc.y + 1;
    const separator = "  |  ";

    doc.font("Helvetica").fontSize(TYPE.contact).fillColor(INK.muted);

    const labels = plan.links.map((link) => link.label);
    const gap = doc.widthOfString(separator);
    const total = labels.reduce(
      (sum, label, index) => sum + doc.widthOfString(label) + (index > 0 ? gap : 0),
      0
    );

    if (total > CONTENT_WIDTH) {
      doc.text(plan.links.map((link) => link.url).join("  |  "), PAGE.margin, top, {
        width: CONTENT_WIDTH,
        align: "center",
      });
      resetX(doc);
      return;
    }

    let x = PAGE.margin + (CONTENT_WIDTH - total) / 2;

    labels.forEach((label, index) => {
      if (index > 0) {
        doc.text(separator, x, top, { width: gap + 1, lineBreak: false });
        x += gap;
      }

      const width = doc.widthOfString(label);
      doc.text(label, x, top, {
        width: width + 1,
        lineBreak: false,
        link: plan.links[index].url,
      });
      x += width;
    });

    resetX(doc);
    doc.y = top + TYPE.contact + 2;
  }
}

export function composeResume(plan) {
  const doc = new PDFDocument({
    size: PAGE.size,
    margin: PAGE.margin,
    bufferPages: true,
    info: {
      Title: `${plan.name} — Resume`,
      Author: plan.name,
      Subject: plan.targetRole ? `Resume for ${plan.targetRole}` : "Resume",
      Creator: "portfolio-v5",
    },
  });

  header(doc, plan);

  if (plan.summary) {
    heading(doc, "Professional Summary");
    doc
      .font("Helvetica")
      .fontSize(TYPE.body)
      .fillColor(INK.text)
      .text(plan.summary, PAGE.margin, doc.y, {
        width: CONTENT_WIDTH,
        align: "left",
        lineGap: 0.6,
      });
    resetX(doc);
  }

  if (plan.experience.length > 0) {
    heading(doc, "Work Experience");

    plan.experience.forEach((role, index) => {
      if (index > 0) doc.moveDown(0.3);
      rowWithRight(doc, role.company, role.period, { bold: true });
      rowWithRight(doc, role.role, role.location, { size: TYPE.meta, color: INK.muted });
      doc.moveDown(0.12);
      bulletList(doc, role.bullets);
    });
  }

  if (plan.projects.length > 0) {
    heading(doc, "Projects");

    plan.projects.forEach((project, index) => {
      if (index > 0) doc.moveDown(0.3);
      const title = project.subtitle ? `${project.title} — ${project.subtitle}` : project.title;
      rowWithRight(doc, title, project.period, { bold: true });

      if (project.tech.length > 0) {
        doc.font("Helvetica-Oblique").fontSize(TYPE.meta).fillColor(INK.muted);
        const techLine = `Tech: ${project.tech.join(", ")}`;
        ensureSpace(doc, doc.heightOfString(techLine, { width: CONTENT_WIDTH }));
        doc.text(techLine, PAGE.margin, doc.y, { width: CONTENT_WIDTH });
        resetX(doc);
      }

      doc.moveDown(0.12);
      bulletList(doc, project.bullets);
    });
  }

  if (plan.skills.length > 0) {
    heading(doc, "Technical Skills");

    for (const category of plan.skills) {
      const label = `${category.name}: `;
      const items = category.items.join(", ");

      doc.font("Helvetica").fontSize(TYPE.body);
      ensureSpace(doc, doc.heightOfString(label + items, { width: CONTENT_WIDTH, lineGap: 0.4 }));

      doc
        .font("Helvetica-Bold")
        .fontSize(TYPE.body)
        .fillColor(INK.text)
        .text(label, PAGE.margin, doc.y, { width: CONTENT_WIDTH, lineGap: 0.4, continued: true });

      doc.font("Helvetica").fillColor(INK.text).text(items, { continued: false });

      resetX(doc);
      doc.moveDown(0.12);
    }
  }

  if (plan.education.length > 0) {
    heading(doc, "Education");

    plan.education.forEach((entry, index) => {
      if (index > 0) doc.moveDown(0.2);
      const left = [entry.institution, entry.qualification, entry.score].filter(Boolean).join(" — ");
      const right = [entry.period, entry.location].filter(Boolean).join(" | ");
      rowWithRight(doc, left, right, { size: TYPE.body });
    });
  }

  return doc;
}

export function renderResume(plan) {
  return new Promise((resolve, reject) => {
    let doc;

    try {
      doc = composeResume(plan);
    } catch (error) {
      reject(error);
      return;
    }

    const chunks = [];
    const pages = doc.bufferedPageRange().count;

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("error", reject);
    doc.on("end", () => resolve({ buffer: Buffer.concat(chunks), pages }));
    doc.end();
  });
}
