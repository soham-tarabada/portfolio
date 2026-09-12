import { CodeSurface, Line, Blank, Punct, Note, InlineHeading } from "../CodeSurface.jsx";
import { formatRange } from "../../lib/format.js";

export default function ProjectsFile({ content, onOpen }) {
  const projects = content.projects;

  return (
    <CodeSurface label="Projects">
      <Line>
        <h1 className="md-h1">
          <Punct># </Punct>Projects
        </h1>
      </Line>
      <Blank />
      <Line>
        <span className="md-quote">
          <Punct>&gt; </Punct>
          {projects.length} production platforms. Open one for the architecture behind it.
        </span>
      </Line>
      <Blank />

      {projects.flatMap((project, index) => [
        <Line key={`title-${project.slug}`} sticky>
          <span className="card">
            <InlineHeading level={2}>
              <button
                type="button"
                className="card__title"
                onClick={() => onOpen?.(`project:${project.slug}`)}
              >
                {project.title}
              </button>
            </InlineHeading>
            <span className="card__file">
              <Note>{project.filename}</Note>
            </span>
          </span>
        </Line>,

        <Line key={`subtitle-${project.slug}`} indent={1}>
          <span className="card__subtitle">{project.subtitle}</span>
        </Line>,

        <Line key={`meta-${project.slug}`} indent={1}>
          <span className="card__meta">
            {[
              project.client,
              formatRange(project.startDate, project.endDate, project.current),
              project.role,
            ]
              .filter(Boolean)
              .join("  ·  ")}
          </span>
        </Line>,

        <Line key={`tech-${project.slug}`} indent={1}>
          <span className="chips">
            {project.tech.slice(0, 8).map((item) => (
              <span className="chip" key={item}>
                {item}
              </span>
            ))}
            {project.tech.length > 8 ? (
              <span className="chip chip--more">+{project.tech.length - 8}</span>
            ) : null}
          </span>
        </Line>,

        ...(index < projects.length - 1 ? [<Blank key={`gap-${project.slug}`} />] : []),
      ])}

      <Blank />
      <Line>
        <Note>&lt;!-- every project is also a file: open dr-jones.md, tata.md, … --&gt;</Note>
      </Line>
    </CodeSurface>
  );
}
