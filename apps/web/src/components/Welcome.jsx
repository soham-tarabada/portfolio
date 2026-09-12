export default function Welcome({ profile, onOpen, firstFileId, keys, onOpenTerminal }) {
  return (
    <div className="welcome">
      <p className="welcome__mark" aria-hidden="true">
        ▮
      </p>
      <h2 className="welcome__title">No file open</h2>
      <p className="welcome__body">
        Pick something from the explorer, or start with{" "}
        <button type="button" className="welcome__link" onClick={() => onOpen(firstFileId)}>
          about.md
        </button>
        .
      </p>
      {keys ? (
        <p className="welcome__body">
          There is a real shell behind{" "}
          <button type="button" className="welcome__link" onClick={onOpenTerminal}>
            {keys.terminal}
          </button>{" "}
          — it answers questions about this work.
        </p>
      ) : null}
      <p className="welcome__signature">
        {profile.name} · {profile.roleTitle}
      </p>
    </div>
  );
}
