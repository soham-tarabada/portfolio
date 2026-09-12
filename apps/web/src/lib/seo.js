export const DEFAULT_SITE_URL = "https://soham-portfolio.vercel.app";

export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function trimTo(value, limit) {
  const flat = String(value ?? "").replace(/\s+/g, " ").trim();
  if (flat.length <= limit) return flat;

  const cut = flat.slice(0, limit - 1);
  const lastSpace = cut.lastIndexOf(" ");
  const stem = lastSpace > limit * 0.6 ? cut.slice(0, lastSpace) : cut;

  return `${stem.replace(/[\s,;:.\-–—]+$/, "")}…`;
}

export function fit(parts, limit) {
  let text = "";

  for (const part of parts.filter(Boolean)) {
    const candidate = text ? `${text} ${part}` : String(part);
    if (candidate.length > limit) break;
    text = candidate;
  }

  return text || trimTo(parts.find(Boolean) || "", limit);
}

export function routesFor(content) {
  if (!content?.profile) return [];

  const { profile, sections = [], projects = [] } = content;
  const who = `${profile.name} — ${profile.roleTitle}`;

  const routes = [
    {
      path: "/",
      kind: "home",
      title: who,
      description: fit(
        [profile.summary || profile.tagline, profile.location && `Based in ${profile.location}.`],
        160
      ),
    },
  ];

  const describe = {
    about: () => trimTo(profile.summary || profile.about?.[0] || profile.tagline, 160),
    experience: () =>
      trimTo(
        `Roles ${profile.name} has held, what each team shipped, and the stack behind it.`,
        160
      ),
    skills: () =>
      trimTo(
        `The languages, frameworks and infrastructure ${profile.name} works with day to day.`,
        160
      ),
    education: () =>
      trimTo(`Where ${profile.name} studied, and the qualifications behind the work.`, 160),
    uses: () => trimTo(content.uses?.intro || `The tools ${profile.name} reaches for daily.`, 160),
    projects: () =>
      fit(
        [
          `Every platform ${profile.name} has shipped.`,
          projects.length
            ? `${projects.length} of them, with the client, the stack and the architecture behind each one.`
            : "",
        ],
        160
      ),
    contact: () =>
      trimTo(
        `Send ${profile.name} a message, or take the email address, phone number and profile links directly.`,
        160
      ),
  };

  for (const section of sections) {
    routes.push({
      path: `/${section.key}`,
      kind: section.key,
      title: `${section.label} — ${profile.name}`,
      description: describe[section.key]?.() || trimTo(`${section.label} — ${who}`, 160),
    });
  }

  for (const project of projects) {
    routes.push({
      path: `/projects/${project.slug}`,
      kind: "project",
      slug: project.slug,
      title: `${project.title} — ${profile.name}`,
      description: fit(
        [
          project.summary || project.subtitle,
          project.tech?.length ? `Built with ${project.tech.slice(0, 4).join(", ")}.` : "",
        ],
        160
      ),
    });
  }

  return routes;
}

export function personJsonLd(content, siteUrl) {
  const { profile, experience = [], education = [], skills = [] } = content;

  const worksFor = experience.find((role) => role.current) || experience[0];

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    jobTitle: profile.roleTitle,
    email: `mailto:${profile.email}`,
    url: siteUrl,
    description: profile.summary || profile.tagline,
    address: profile.location
      ? { "@type": "PostalAddress", addressLocality: profile.location }
      : undefined,
    worksFor: worksFor ? { "@type": "Organization", name: worksFor.company } : undefined,
    alumniOf: education.map((entry) => ({
      "@type": "EducationalOrganization",
      name: entry.institution,
    })),
    knowsAbout: skills.flatMap((category) => category.skills.map((skill) => skill.name)),
    sameAs: (profile.socials || []).map((social) => social.url),
  };
}

export function projectJsonLd(project, content, siteUrl) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    headline: project.title,
    description: project.summary || project.subtitle,
    url: `${siteUrl}/projects/${project.slug}`,
    author: { "@type": "Person", name: content.profile.name, url: siteUrl },
    keywords: (project.tech || []).join(", "),
  };
}

export function metaFor(route, content, siteUrl, apiUrl) {
  const canonical = route.path === "/" ? `${siteUrl}/` : `${siteUrl}${route.path}`;
  const project =
    route.kind === "project"
      ? content.projects.find((entry) => entry.slug === route.slug)
      : null;

  const jsonLd = project
    ? projectJsonLd(project, content, siteUrl)
    : personJsonLd(content, siteUrl);

  return {
    title: route.title,
    description: route.description,
    canonical,
    image: `${siteUrl}/og.png`,
    apiOrigin: apiUrl ? new URL(apiUrl).origin : null,
    jsonLd: JSON.parse(JSON.stringify(jsonLd)),
  };
}

export function renderHead(meta) {
  const tags = [
    `<title>${escapeHtml(meta.title)}</title>`,
    `<meta name="description" content="${escapeHtml(meta.description)}" />`,
    `<link rel="canonical" href="${escapeHtml(meta.canonical)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="Soham Tarabada" />`,
    `<meta property="og:title" content="${escapeHtml(meta.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(meta.description)}" />`,
    `<meta property="og:url" content="${escapeHtml(meta.canonical)}" />`,
    `<meta property="og:image" content="${escapeHtml(meta.image)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(meta.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(meta.description)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(meta.image)}" />`,
  ];

  if (meta.apiOrigin) {
    tags.push(`<link rel="preconnect" href="${escapeHtml(meta.apiOrigin)}" crossorigin />`);
    tags.push(`<link rel="dns-prefetch" href="${escapeHtml(meta.apiOrigin)}" />`);
  }

  tags.push(
    `<script type="application/ld+json">${JSON.stringify(meta.jsonLd).replace(/</g, "\\u003c")}</script>`
  );

  return tags.join("\n    ");
}

function list(items, render) {
  return items.map(render).join("");
}

export function renderNoscript(route, content) {
  const { profile } = content;
  const heading = `<h1>${escapeHtml(profile.name)} — ${escapeHtml(profile.roleTitle)}</h1>`;
  const blocks = [heading];

  const contactBlock = `<p>${escapeHtml(profile.location)} · <a href="mailto:${escapeHtml(
    profile.email
  )}">${escapeHtml(profile.email)}</a></p><ul>${list(
    profile.socials || [],
    (social) =>
      `<li><a href="${escapeHtml(social.url)}" rel="me">${escapeHtml(social.label)}</a></li>`
  )}</ul>`;

  if (route.kind === "project") {
    const project = content.projects.find((entry) => entry.slug === route.slug);
    if (project) {
      blocks.push(
        `<h2>${escapeHtml(project.title)}</h2>`,
        project.summary ? `<p>${escapeHtml(project.summary)}</p>` : "",
        `<ul>${list(project.bullets || [], (bullet) => `<li>${escapeHtml(bullet)}</li>`)}</ul>`,
        project.tech?.length ? `<p>Stack: ${escapeHtml(project.tech.join(", "))}</p>` : ""
      );
    }
  } else if (route.kind === "experience") {
    blocks.push(
      `<h2>Experience</h2>`,
      list(
        content.experience || [],
        (role) =>
          `<h3>${escapeHtml(role.role)} — ${escapeHtml(role.company)}</h3><ul>${list(
            role.bullets || [],
            (bullet) => `<li>${escapeHtml(bullet)}</li>`
          )}</ul>`
      )
    );
  } else if (route.kind === "skills") {
    blocks.push(
      `<h2>Skills</h2>`,
      list(
        content.skills || [],
        (category) =>
          `<h3>${escapeHtml(category.name)}</h3><p>${escapeHtml(
            category.skills.map((skill) => skill.name).join(", ")
          )}</p>`
      )
    );
  } else if (route.kind === "education") {
    blocks.push(
      `<h2>Education</h2>`,
      list(
        content.education || [],
        (entry) =>
          `<p>${escapeHtml(entry.qualification)} — ${escapeHtml(entry.institution)}</p>`
      )
    );
  } else if (route.kind === "uses") {
    blocks.push(
      `<h2>Uses</h2>`,
      list(
        content.uses?.categories || [],
        (category) =>
          `<h3>${escapeHtml(category.name)}</h3><p>${escapeHtml(
            category.items.map((item) => item.name).join(", ")
          )}</p>`
      )
    );
  } else {
    blocks.push(
      profile.summary ? `<p>${escapeHtml(profile.summary)}</p>` : "",
      `<h2>Projects</h2><ul>${list(
        content.projects || [],
        (project) =>
          `<li><a href="/projects/${escapeHtml(project.slug)}">${escapeHtml(
            project.title
          )}</a> — ${escapeHtml(project.subtitle || project.summary || "")}</li>`
      )}</ul>`
    );
  }

  blocks.push(contactBlock);
  blocks.push(`<p>This page needs JavaScript for the full interface.</p>`);

  return `<noscript><div class="fallback">${blocks.filter(Boolean).join("")}</div></noscript>`;
}

export function renderSitemap(routes, siteUrl, lastmod) {
  const stamp = (lastmod || new Date().toISOString()).slice(0, 10);

  const entries = routes
    .map((route) => {
      const loc = route.path === "/" ? `${siteUrl}/` : `${siteUrl}${route.path}`;
      const priority = route.path === "/" ? "1.0" : route.kind === "project" ? "0.8" : "0.6";
      return `  <url>\n    <loc>${escapeHtml(loc)}</loc>\n    <lastmod>${stamp}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;
}

export function renderRobots(siteUrl) {
  return `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`;
}
