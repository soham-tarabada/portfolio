export default function TabStrip({ files, activeId, onActivate, onClose }) {
  if (files.length === 0) return null;

  return (
    <div className="tabs" role="tablist" aria-label="Open files">
      {files.map((file) => {
        const isActive = file.id === activeId;
        return (
          <div className="tab" data-active={isActive} key={file.id}>
            <button
              type="button"
              className="tab__label"
              role="tab"
              aria-selected={isActive}
              onClick={() => onActivate(file.id)}
            >
              {file.name}
            </button>
            <button
              type="button"
              className="tab__close"
              onClick={() => onClose(file.id)}
              aria-label={`Close ${file.name}`}
            >
              <span aria-hidden="true">✕</span>
            </button>
          </div>
        );
      })}
    </div>
  );
}
