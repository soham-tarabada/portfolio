export default function NowPlaying({ state, onOpen }) {
  if (!state?.configured || !state.track) return null;

  const { track, playing } = state;
  const label = `${track.title} — ${track.artist}`;

  const body = (
    <>
      <span className="np__mark" aria-hidden="true">
        {playing ? "♪" : "⏸"}
      </span>
      <span className="np__text">{label}</span>
    </>
  );

  if (!track.url) {
    return (
      <span className="np" data-playing={playing} title={label}>
        {body}
      </span>
    );
  }

  return (
    <a
      className="np"
      data-playing={playing}
      href={track.url}
      target="_blank"
      rel="noreferrer noopener"
      title={`${playing ? "Playing now" : "Last played"}: ${label}`}
      onClick={onOpen}
    >
      <span className="sr-only">{playing ? "Playing now on Spotify: " : "Last played: "}</span>
      {body}
    </a>
  );
}
