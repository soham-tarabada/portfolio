import { findPhosphor } from "@portfolio/theme/phosphors.js";
import { useClock } from "../lib/useClock.js";
import NowPlaying from "./NowPlaying.jsx";
import ToonSprite from "./ToonSprite.jsx";
import { TOON_NAME } from "../lib/toon/dialogue.js";

const LANGUAGE_LABELS = {
  markdown: "Markdown",
  typescript: "TypeScript",
  javascript: "JavaScript",
  json: "JSON",
  shell: "Shell Script",
};

export default function StatusBar({
  file,
  online,
  phosphor,
  onOpenPhosphor,
  onCyclePhosphor,
  openCount,
  terminalOpen,
  onToggleTerminal,
  nowPlaying,
  onOpenTrack,
  toonEnabled,
  toonProgress,
  onToggleToon,
}) {
  const time = useClock();
  const palette = findPhosphor(phosphor);

  return (
    <footer className="statusbar">
      <span className="statusbar__item">⎇ main</span>
      <span className="statusbar__item">
        <span className={online ? "statusbar__dot" : "statusbar__dot statusbar__dot--fail"}>
          ●
        </span>
        {online ? " api online" : " api offline"}
      </span>
      <span className="statusbar__item statusbar__item--hide-sm">
        {openCount} open
      </span>

      <button
        type="button"
        className="statusbar__button"
        onClick={onToggleTerminal}
        aria-pressed={terminalOpen}
      >
        terminal
      </button>

      <button
        type="button"
        className="statusbar__button statusbar__button--toon"
        onClick={onToggleToon}
        aria-pressed={toonEnabled}
        title={
          toonEnabled
            ? `Send ${TOON_NAME} away${
                toonProgress?.total ? ` — ${toonProgress.read} of ${toonProgress.total} files read` : ""
              }`
            : `Bring ${TOON_NAME} back`
        }
      >
        <span className="statusbar__toon" data-away={!toonEnabled} aria-hidden="true">
          <ToonSprite frame="idle" className="statusbar__toon-sprite" />
        </span>
        {TOON_NAME.toLowerCase()}
        {toonEnabled && toonProgress?.total ? (
          <span className="statusbar__toon-count">
            {toonProgress.read}/{toonProgress.total}
          </span>
        ) : null}
      </button>

      <span className="statusbar__spacer" />

      <NowPlaying state={nowPlaying} onOpen={onOpenTrack} />

      {file ? (
        <span className="statusbar__item statusbar__item--hide-sm">
          {LANGUAGE_LABELS[file.language] || file.language}
        </span>
      ) : null}
      <span className="statusbar__item">{time} IST</span>
      <button
        type="button"
        className="statusbar__button statusbar__button--phosphor"
        onClick={(event) => (event.shiftKey ? onCyclePhosphor() : onOpenPhosphor())}
        title="Choose a phosphor — shift-click to cycle"
        aria-label={`Phosphor: ${palette.label}. Choose another.`}
      >
        <span
          className="statusbar__swatch"
          style={{ background: palette.preview.phosphor }}
          aria-hidden="true"
        />
        {phosphor}
      </button>
      <span className="statusbar__item statusbar__item--hide-sm">UTF-8</span>
    </footer>
  );
}
