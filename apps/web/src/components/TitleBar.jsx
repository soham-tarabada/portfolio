export default function TitleBar({
  path,
  onToggleExplorer,
  explorerOpen,
  compact,
  onOpenPalette,
  onOpenShortcuts,
  keys,
}) {
  return (
    <header className="titlebar">
      {compact ? (
        <button
          type="button"
          className="titlebar__menu"
          onClick={onToggleExplorer}
          aria-expanded={explorerOpen}
          aria-controls="explorer"
        >
          <span aria-hidden="true">{explorerOpen ? "✕" : "☰"}</span>
          <span className="sr-only">{explorerOpen ? "Close file tree" : "Open file tree"}</span>
        </button>
      ) : (
        <div className="titlebar__lights" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      )}

      <span className="titlebar__path">{path}</span>
      <span className="titlebar__spacer" />

      {compact ? null : (
        <button
          type="button"
          className="titlebar__hint"
          onClick={onOpenShortcuts}
          title="Keyboard shortcuts"
        >
          {keys.shortcuts}
        </button>
      )}

      <button
        type="button"
        className="titlebar__hint titlebar__hint--wide"
        onClick={onOpenPalette}
        title="Command palette"
      >
        <span aria-hidden="true">{keys.palette}</span>
        <span className="sr-only">Open the command palette</span>
      </button>
    </header>
  );
}
