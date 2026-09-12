import { FILE_RENDERERS } from "./files/index.js";
import Welcome from "./Welcome.jsx";

function Breadcrumb({ file }) {
  const trail = ["~/portfolio", ...(file.kind === "project" ? ["projects"] : []), file.name];

  return (
    <div className="breadcrumb" aria-hidden="true">
      {trail.map((crumb, index) => (
        <span key={crumb}>
          {index > 0 ? <span className="breadcrumb__sep">›</span> : null}
          <span className="breadcrumb__crumb">{crumb}</span>
        </span>
      ))}
    </div>
  );
}

export default function EditorPane({
  file,
  content,
  onOpen,
  firstFileId,
  track,
  session,
  keys,
  onOpenTerminal,
}) {
  if (!file) {
    return (
      <div className="editor">
        <Welcome
          profile={content.profile}
          onOpen={onOpen}
          firstFileId={firstFileId}
          keys={keys}
          onOpenTerminal={onOpenTerminal}
        />
      </div>
    );
  }

  const Renderer = FILE_RENDERERS[file.kind];

  return (
    <div className="editor" key={file.id}>
      <Breadcrumb file={file} />
      <div className="editor__scroll">
        {Renderer ? (
          <Renderer
            content={content}
            file={file}
            onOpen={onOpen}
            track={track}
            session={session}
          />
        ) : (
          <p className="editor__missing">No renderer for {file.name}.</p>
        )}
      </div>
    </div>
  );
}
