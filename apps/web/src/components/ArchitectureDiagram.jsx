import { useMemo } from "react";
import { layoutDiagram, DIAGRAM } from "../lib/diagram/layout.js";

function NodeBox({ node }) {
  const titleTop = node.y + DIAGRAM.nodePadY + DIAGRAM.titleFont;
  const noteTop =
    node.y + DIAGRAM.nodePadY + node.titleRows * DIAGRAM.titleLineHeight + DIAGRAM.noteFont + 1;

  return (
    <g>
      <rect
        className="dg__box"
        x={node.x}
        y={node.y}
        width={node.width}
        height={node.height}
        rx="2"
      />
      <text className="dg__title" x={node.centerX} y={titleTop} textAnchor="middle">
        {node.lines.map((line, index) => (
          <tspan key={index} x={node.centerX} dy={index === 0 ? 0 : DIAGRAM.titleLineHeight}>
            {line}
          </tspan>
        ))}
      </text>
      {node.noteLines.map((line, index) => (
        <text
          key={index}
          className="dg__note"
          x={node.centerX}
          y={noteTop + index * DIAGRAM.noteLineHeight}
          textAnchor="middle"
        >
          {line}
        </text>
      ))}
    </g>
  );
}

function Connector({ connector, markerId }) {
  if (connector.straight) {
    const x = connector.fromCenters[0];
    return (
      <>
        <path
          className="dg__line"
          d={`M ${x} ${connector.top} V ${connector.bottom - 5}`}
          markerEnd={`url(#${markerId})`}
        />
        {connector.via ? <ViaLabel connector={connector} center={x} /> : null}
      </>
    );
  }

  const railCenter = (connector.railStart + connector.railEnd) / 2;

  return (
    <>
      {connector.fromCenters.map((x) => (
        <path key={`f${x}`} className="dg__line" d={`M ${x} ${connector.top} V ${connector.railY}`} />
      ))}
      <path
        className="dg__line"
        d={`M ${connector.railStart} ${connector.railY} H ${connector.railEnd}`}
      />
      {connector.toCenters.map((x) => (
        <path
          key={`t${x}`}
          className="dg__line"
          d={`M ${x} ${connector.railY} V ${connector.bottom - 5}`}
          markerEnd={`url(#${markerId})`}
        />
      ))}
      {connector.via ? <ViaLabel connector={connector} center={railCenter} /> : null}
    </>
  );
}

function ViaLabel({ connector, center }) {
  const width = connector.via.length * DIAGRAM.noteFont * DIAGRAM.charRatio + 8;

  return (
    <g>
      <rect
        className="dg__via-bg"
        x={center - width / 2}
        y={connector.railY - 6}
        width={width}
        height="12"
        rx="2"
      />
      <text
        className="dg__via"
        x={center}
        y={connector.railY + 2.5}
        textAnchor="middle"
      >
        {connector.via}
      </text>
    </g>
  );
}

export default function ArchitectureDiagram({ spec, slug, title }) {
  const layout = useMemo(() => layoutDiagram(spec), [spec]);

  if (!layout) return null;

  const markerId = `dg-arrow-${slug}`;
  const description = layout.layers
    .map((layer) => `${layer.label}: ${layer.nodes.map((node) => node.label).join(", ")}`)
    .join(". ");

  return (
    <figure className="dg">
      <svg
        className="dg__svg"
        viewBox={`0 0 ${layout.width} ${layout.height}`}
        role="img"
        aria-labelledby={`${markerId}-title ${markerId}-desc`}
        preserveAspectRatio="xMidYMin meet"
      >
        <title id={`${markerId}-title`}>{`${title} architecture`}</title>
        <desc id={`${markerId}-desc`}>{`${spec.summary} ${description}.`}</desc>

        <defs>
          <marker
            id={markerId}
            viewBox="0 0 8 8"
            refX="7"
            refY="4"
            markerWidth="4.5"
            markerHeight="4.5"
            orient="auto-start-reverse"
          >
            <path className="dg__head" d="M 0 0 L 8 4 L 0 8 z" />
          </marker>
        </defs>

        {layout.connectors.map((connector) => (
          <Connector key={connector.id} connector={connector} markerId={markerId} />
        ))}

        {layout.layers.map((layer, index) => (
          <g key={index} className={layer.owned ? "dg__layer dg__layer--owned" : "dg__layer"}>
            <text
              className="dg__gutter"
              x={layout.gutter - 12}
              y={layer.y + DIAGRAM.nodePadY + DIAGRAM.gutterFont}
              textAnchor="end"
            >
              {layer.labelLines.map((line, position) => (
                <tspan
                  key={position}
                  x={layout.gutter - 12}
                  dy={position === 0 ? 0 : DIAGRAM.noteLineHeight}
                >
                  {line}
                </tspan>
              ))}
            </text>

            {layer.owned ? (
              <text
                className="dg__owned"
                x={layout.gutter - 12}
                y={layer.y + DIAGRAM.nodePadY + DIAGRAM.gutterFont + DIAGRAM.noteLineHeight * layer.labelLines.length}
                textAnchor="end"
              >
                mine
              </text>
            ) : null}

            {layer.captionLines.map((line, position) => (
              <text
                key={position}
                className="dg__caption"
                x={layout.width - DIAGRAM.padRight}
                y={layer.captionY + position * DIAGRAM.noteLineHeight}
                textAnchor="end"
              >
                {line}
              </text>
            ))}

            {layer.nodes.map((node) => (
              <NodeBox key={node.id} node={node} />
            ))}
          </g>
        ))}
      </svg>

      <figcaption className="dg__caption-text">{spec.summary}</figcaption>
    </figure>
  );
}
