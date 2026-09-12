export function LoadingScreen() {
  return (
    <div className="boot">
      <p className="boot__line">
        <span className="boot__prompt">$</span> loading ~/portfolio
      </p>
      <p className="boot__line boot__line--dim">reading content from the api…</p>
    </div>
  );
}

export function ErrorScreen({ message, onRetry }) {
  return (
    <div className="boot">
      <p className="boot__line boot__line--fail">
        <span className="boot__prompt">$</span> loading ~/portfolio — failed
      </p>
      <p className="boot__line boot__line--dim">{message}</p>
      <button type="button" className="boot__retry" onClick={onRetry}>
        retry
      </button>
    </div>
  );
}
