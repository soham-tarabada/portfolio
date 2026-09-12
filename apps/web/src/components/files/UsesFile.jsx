import { CodeSurface, Line, Blank, Punct, Note } from "../CodeSurface.jsx";

export default function UsesFile({ content }) {
  const uses = content.uses;

  if (!uses) {
    return (
      <CodeSurface label="Uses">
        <Line>
          <Note>Nothing recorded yet.</Note>
        </Line>
      </CodeSurface>
    );
  }

  return (
    <CodeSurface label="Uses">
      <Line>
        <h1 className="md-h1">
          <Punct># </Punct>Uses
        </h1>
      </Line>
      <Blank />
      <Line>
        <p className="md-p">{uses.intro}</p>
      </Line>

      {uses.categories.flatMap((category) => [
        <Blank key={`gap-${category.name}`} />,
        <Line key={`head-${category.name}`}>
          <h2 className="md-h2">
            <Punct>## </Punct>
            {category.name}
          </h2>
        </Line>,
        ...(category.items.length === 0
          ? [
              <Line key={`empty-${category.name}`}>
                <Note>_nothing here yet_</Note>
              </Line>,
            ]
          : category.items.map((item) => (
              <Line key={`${category.name}-${item.name}`}>
                <span className="md-li">
                  <Punct>- </Punct>
                  <strong className="uses-name">{item.name}</strong>
                  {item.note ? <span className="uses-note"> — {item.note}</span> : null}
                </span>
              </Line>
            ))),
      ])}
    </CodeSurface>
  );
}
