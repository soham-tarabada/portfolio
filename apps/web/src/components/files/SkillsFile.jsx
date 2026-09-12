import { CodeSurface, Line, Blank, Punct, Str, InlineHeading } from "../CodeSurface.jsx";

export default function SkillsFile({ content }) {
  const categories = content.skills;

  return (
    <CodeSurface label="Skills">
      <Line>
        <Punct>{"{"}</Punct>
      </Line>

      {categories.flatMap((category, index) => [
        <Line key={`key-${category.id}`} indent={1}>
          <InlineHeading level={2}>
            <Str>&quot;{category.name}&quot;</Str>
          </InlineHeading>
          <Punct>: [</Punct>
        </Line>,

        <Line key={`values-${category.id}`} indent={2}>
          <span className="skill-list">
            {category.skills.map((skill, skillIndex) => (
              <span className="skill" key={skill.name}>
                <Str>&quot;{skill.name}&quot;</Str>
                {skillIndex < category.skills.length - 1 ? <Punct>,</Punct> : null}
              </span>
            ))}
          </span>
        </Line>,

        <Line key={`close-${category.id}`} indent={1}>
          <Punct>{index < categories.length - 1 ? "]," : "]"}</Punct>
        </Line>,

        ...(index < categories.length - 1 ? [<Blank key={`gap-${category.id}`} />] : []),
      ])}

      <Line>
        <Punct>{"}"}</Punct>
      </Line>
    </CodeSurface>
  );
}
