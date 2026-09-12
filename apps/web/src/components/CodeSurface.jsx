import { Children } from "react";

export function CodeSurface({ children, label }) {
  const lines = Children.toArray(children);

  return (
    <div className="code" aria-label={label}>
      {lines.map((line, index) => (
        <div className="code__row" data-sticky={line.props?.sticky || undefined} key={index}>
          <span className="code__num" aria-hidden="true">
            {index + 1}
          </span>
          <div className="code__line">{line}</div>
        </div>
      ))}
    </div>
  );
}

export function Line({ indent = 0, children }) {
  return (
    <span className="line" data-indent={indent}>
      {children}
    </span>
  );
}

export function Blank() {
  return <span className="line" />;
}

export const Punct = ({ children }) => <span className="tok-punct">{children}</span>;
export const Key = ({ children }) => <span className="tok-key">{children}</span>;
export const Str = ({ children }) => <span className="tok-str">{children}</span>;
export const Note = ({ children }) => <span className="tok-comment">{children}</span>;
export const Value = ({ children }) => <span className="tok-value">{children}</span>;

export function InlineHeading({ level = 3, children }) {
  const Tag = `h${level}`;
  return <Tag className="inline-heading">{children}</Tag>;
}
