import { CodeSurface, Line, Blank, Punct, Note } from "../CodeSurface.jsx";
import { formatRange } from "../../lib/format.js";
import { useMediaQuery } from "../../lib/useMediaQuery.js";
import { lazy, Suspense } from "react";

const ArchitectureDiagram = lazy(() => import("../ArchitectureDiagram.jsx"));

function MetaRow({ label, value }) {
  return (
    <Line>
      <span className="meta-row">
        <span className="meta-row__label">{label}</span>
        <span className="meta-row__value">{value}</span>
      </span>
    </Line>
  );
}

function ArchitecturePanel({ project, stacked }) {
  const spec = project.diagram;

  return (
    <aside className="architecture" aria-label={`Architecture for ${project.title}`}>
      <details className="architecture__disclosure" open={!stacked}>
        <summary className="architecture__head">
          <span className="architecture__head-label">Architecture</span>
          <span className="architecture__head-hint" aria-hidden="true">
            {project.tech.length} in the stack
          </span>
        </summary>

        <div className="architecture__body">
          {spec ? (
            <Suspense
              fallback={
                <div className="architecture__placeholder">
                  <span className="architecture__placeholder-text">drawing…</span>
                </div>
              }
            >
              <ArchitectureDiagram spec={spec} slug={project.slug} title={project.title} />
            </Suspense>
          ) : (
            <div className="architecture__placeholder">
              <span className="architecture__placeholder-mark" aria-hidden="true">
                &#9634;
              </span>
              <p className="architecture__placeholder-text">
                No diagram recorded for this project yet.
              </p>
            </div>
          )}

          {spec?.notes?.length ? (
            <ul className="architecture__notes">
              {spec.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          ) : null}

          <div className="architecture__stack">
            <h3 className="architecture__stack-head">Stack</h3>
            <ul className="architecture__stack-list">
              {project.tech.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          {project.confidential ? (
            <p className="architecture__note">
              Client interfaces are withheld. Architecture and integrations only.
            </p>
          ) : null}
        </div>
      </details>
    </aside>
  );
}

export default function ProjectFile({ content, file }) {
  const stacked = useMediaQuery("(max-width: 68rem)");
  const project = content.projects.find((entry) => entry.slug === file.slug);

  if (!project) {
    return (
      <CodeSurface label="Project">
        <Line>
          <Note>This project is no longer published.</Note>
        </Line>
      </CodeSurface>
    );
  }

  return (
    <div className="split">
      <div className="split__main">
        <CodeSurface label={project.title}>
          <Line sticky>
            <h1 className="md-h1">
              <Punct># </Punct>
              {project.title}
            </h1>
          </Line>
          <Blank />
          <Line>
            <span className="md-quote">
              <Punct>&gt; </Punct>
              {project.subtitle}
            </span>
          </Line>
          <Blank />

          <MetaRow label="Client" value={project.client || "—"} />
          <MetaRow
            label="Period"
            value={formatRange(project.startDate, project.endDate, project.current)}
          />
          <MetaRow label="Role" value={project.role || "—"} />

          <Blank />
          <Line>
            <p className="md-p">{project.summary}</p>
          </Line>
          <Blank />
          <Line>
            <h2 className="md-h2">
              <Punct>## </Punct>What I built
            </h2>
          </Line>
          <Blank />

          {project.bullets.map((bullet, index) => (
            <Line key={`bullet-${index}`}>
              <span className="md-li">
                <Punct>- </Punct>
                {bullet}
              </span>
            </Line>
          ))}

          <Blank />
          <Line>
            <h2 className="md-h2">
              <Punct>## </Punct>Stack
            </h2>
          </Line>
          <Blank />
          <Line>
            <span className="chips">
              {project.tech.map((item) => (
                <span className="chip" key={item}>
                  {item}
                </span>
              ))}
            </span>
          </Line>

          {project.links.length > 0 ? (
            <>
              <Blank />
              <Line>
                <h2 className="md-h2">
                  <Punct>## </Punct>Links
                </h2>
              </Line>
              <Blank />
              {project.links.map((link) => (
                <Line key={link.url}>
                  <span className="md-li">
                    <Punct>- </Punct>
                    <a
                      className="link"
                      href={link.url}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      {link.label}
                    </a>
                    <Note> → {link.url}</Note>
                  </span>
                </Line>
              ))}
            </>
          ) : null}
        </CodeSurface>
      </div>

      <ArchitecturePanel project={project} stacked={stacked} />
    </div>
  );
}
