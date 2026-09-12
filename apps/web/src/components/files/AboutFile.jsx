import { CodeSurface, Line, Blank, Punct, Note } from "../CodeSurface.jsx";
import { formatMonth, pluralise } from "../../lib/format.js";

export default function AboutFile({ content, onOpen }) {
  const { profile, meta } = content;
  const current = content.experience.find((role) => role.current);

  return (
    <CodeSurface label="About">
      <Line>
        <h1 className="md-h1">
          <Punct># </Punct>
          {profile.name}
        </h1>
      </Line>
      <Blank />
      <Line>
        <span className="md-quote">
          <Punct>&gt; </Punct>
          {profile.roleTitle} · {profile.location}
        </span>
      </Line>
      <Blank />
      <Line>
        <p className="md-p">{profile.summary}</p>
      </Line>

      {profile.about.flatMap((paragraph, index) => [
        <Blank key={`gap-${index}`} />,
        <Line key={`para-${index}`}>
          <p className="md-p">{paragraph}</p>
        </Line>,
      ])}

      <Blank />
      <Line>
        <h2 className="md-h2">
          <Punct>## </Punct>Currently
        </h2>
      </Line>
      <Blank />
      <Line>
        <p className="md-p">
          {current
            ? `${current.role} at ${current.company}, since ${formatMonth(current.startDate)}.`
            : "Between roles."}
        </p>
      </Line>
      <Blank />
      <Line>
        <h2 className="md-h2">
          <Punct>## </Punct>By the numbers
        </h2>
      </Line>
      <Blank />
      <Line>
        <span className="md-li">
          <Punct>- </Punct>
          {profile.yearsExperience} years shipping production software
        </span>
      </Line>
      <Line>
        <span className="md-li">
          <Punct>- </Punct>
          {pluralise(meta.counts.projects, "production platform")} delivered
        </span>
      </Line>
      <Line>
        <span className="md-li">
          <Punct>- </Punct>
          {meta.counts.skills} technologies across {meta.counts.skillCategories} disciplines
        </span>
      </Line>
      <Blank />
      <Line>
        <Note>&lt;!-- </Note>
        <button
          type="button"
          className="link link--inline"
          onClick={() => onOpen?.("section:experience")}
        >
          experience.ts
        </button>
        <Note> has the full history, </Note>
        <button
          type="button"
          className="link link--inline"
          onClick={() => onOpen?.("section:projects")}
        >
          projects/
        </button>
        <Note> has the platforms --&gt;</Note>
      </Line>
      <Line>
        <Note>&lt;!-- or open the terminal and type: ask what has he built? --&gt;</Note>
      </Line>
    </CodeSurface>
  );
}
