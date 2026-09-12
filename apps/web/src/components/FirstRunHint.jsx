export default function FirstRunHint({ keys, onOpenTerminal, onOpenPalette, onDismiss }) {
  return (
    <aside className="hint" aria-label="How to use this site">
      <span className="hint__mark" aria-hidden="true">
        ▮
      </span>

      <p className="hint__text">
        This is a working IDE.{" "}
        <button type="button" className="hint__key" onClick={onOpenTerminal}>
          {keys.terminal}
        </button>{" "}
        opens a real shell — try <code className="hint__code">ask</code>,{" "}
        <code className="hint__code">projects</code> or{" "}
        <code className="hint__code">neofetch</code>.{" "}
        <button type="button" className="hint__key" onClick={onOpenPalette}>
          {keys.palette}
        </button>{" "}
        jumps to any file.
      </p>

      <button
        type="button"
        className="hint__close"
        onClick={onDismiss}
        aria-label="Dismiss this tip"
      >
        <span aria-hidden="true">✕</span>
      </button>
    </aside>
  );
}
