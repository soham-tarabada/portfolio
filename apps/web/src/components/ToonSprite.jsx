import { SPRITE_COLS, SPRITE_ROWS, getFrame } from "../lib/toon/sprite.js";

const TONES = {
  "#": "var(--phosphor)",
  o: "var(--phosphor-deep)",
  x: "var(--ground)",
};

export default function ToonSprite({ frame = "idle", eye, className = "toon__sprite" }) {
  const sheet = getFrame(frame);
  const shift = sheet.tracks && eye ? eye : { dx: 0, dy: 0 };

  return (
    <svg
      className={className}
      viewBox={`0 0 ${SPRITE_COLS} ${SPRITE_ROWS}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
    >
      {sheet.body.map((run) => (
        <rect
          key={`b${run.y}-${run.x}`}
          x={run.x}
          y={run.y}
          width={run.w}
          height={1}
          fill={TONES[run.key]}
        />
      ))}
      <g transform={`translate(${shift.dx * 0.5} ${shift.dy * 0.5})`}>
        {sheet.eyes.map((run) => (
          <rect
            key={`e${run.y}-${run.x}`}
            x={run.x}
            y={run.y}
            width={run.w}
            height={1}
            fill={TONES.x}
          />
        ))}
      </g>
    </svg>
  );
}
