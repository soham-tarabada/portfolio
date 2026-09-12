import { CodeSurface, Line, Blank, Punct, Key, Str, InlineHeading } from "../CodeSurface.jsx";
import { formatRange } from "../../lib/format.js";

function Field({ name, children, pad }) {
  return (
    <Line indent={2}>
      <Key>{name}</Key>
      <Punct>:</Punct>
      <span className="pad">{" ".repeat(Math.max(pad - name.length, 1))}</span>
      {children}
      <Punct>,</Punct>
    </Line>
  );
}

export default function ExperienceFile({ content }) {
  const roles = content.experience;
  const pad = 9;

  return (
    <CodeSurface label="Experience">
      <Line>
        <Punct>export const </Punct>
        <Key>experience</Key>
        <Punct> = [</Punct>
      </Line>

      {roles.flatMap((role, index) => [
        <Line key={`open-${role.id}`} indent={1}>
          <Punct>{"{"}</Punct>
        </Line>,

        <Field key={`company-${role.id}`} name="company" pad={pad} sticky>
          <InlineHeading level={2}>
            <Str>&quot;{role.company}&quot;</Str>
          </InlineHeading>
        </Field>,

        <Field key={`role-${role.id}`} name="role" pad={pad}>
          <Str>&quot;{role.role}&quot;</Str>
        </Field>,

        <Field key={`type-${role.id}`} name="type" pad={pad}>
          <Str>&quot;{role.employmentType}&quot;</Str>
        </Field>,

        <Field key={`period-${role.id}`} name="period" pad={pad}>
          <Str>&quot;{formatRange(role.startDate, role.endDate, role.current)}&quot;</Str>
        </Field>,

        <Field key={`where-${role.id}`} name="location" pad={pad}>
          <Str>&quot;{role.location}&quot;</Str>
        </Field>,

        <Line key={`work-open-${role.id}`} indent={2}>
          <Key>work</Key>
          <Punct>: [</Punct>
        </Line>,

        ...role.bullets.map((bullet, bulletIndex) => (
          <Line key={`bullet-${role.id}-${bulletIndex}`} indent={3}>
            <span className="prose">{bullet}</span>
          </Line>
        )),

        <Line key={`work-close-${role.id}`} indent={2}>
          <Punct>],</Punct>
        </Line>,

        <Line key={`stack-${role.id}`} indent={2}>
          <Key>stack</Key>
          <Punct>: [</Punct>
          <span className="chips">
            {role.tech.map((item) => (
              <span className="chip" key={item}>
                {item}
              </span>
            ))}
          </span>
          <Punct>],</Punct>
        </Line>,

        <Line key={`close-${role.id}`} indent={1}>
          <Punct>{"},"}</Punct>
        </Line>,

        ...(index < roles.length - 1 ? [<Blank key={`gap-${role.id}`} />] : []),
      ])}

      <Line>
        <Punct>];</Punct>
      </Line>
    </CodeSurface>
  );
}
