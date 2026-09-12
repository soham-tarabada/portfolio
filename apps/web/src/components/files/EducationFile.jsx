import { CodeSurface, Line, Blank, Punct } from "../CodeSurface.jsx";
import { formatRange } from "../../lib/format.js";

export default function EducationFile({ content }) {
  return (
    <CodeSurface label="Education">
      <Line>
        <h1 className="md-h1">
          <Punct># </Punct>Education
        </h1>
      </Line>

      {content.education.flatMap((entry) => [
        <Blank key={`gap-${entry.id}`} />,
        <Line key={`name-${entry.id}`}>
          <h2 className="md-h2">
            <Punct>## </Punct>
            {entry.institution}
          </h2>
        </Line>,
        <Line key={`qual-${entry.id}`}>
          <span className="md-li">
            <Punct>- </Punct>
            {entry.qualification}
          </span>
        </Line>,
        <Line key={`score-${entry.id}`}>
          <span className="md-li">
            <Punct>- </Punct>
            {entry.score}
          </span>
        </Line>,
        <Line key={`when-${entry.id}`}>
          <span className="md-li">
            <Punct>- </Punct>
            {formatRange(entry.startDate, entry.endDate)} · {entry.location}
          </span>
        </Line>,
      ])}
    </CodeSurface>
  );
}
