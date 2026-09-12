import { useEffect, useRef, useState } from "react";
import ToonSprite from "./ToonSprite.jsx";
import { TOON_NAME } from "../lib/toon/dialogue.js";
import { ASK_LIMITS, ASK_SUGGESTIONS, validateQuestion } from "../lib/ask.js";

function Foot({ onClose, onDismiss }) {
  return (
    <div className="toon__foot">
      <button type="button" className="toon__quiet" onClick={onClose}>
        Nothing, thanks
      </button>
      <button type="button" className="toon__quiet" onClick={onDismiss}>
        Send me away
      </button>
    </div>
  );
}

function MenuBubble({ bubble, onRun, onClose, onDismiss }) {
  return (
    <>
      <p className="toon__line">{bubble.text}</p>

      <ul className="toon__options">
        {bubble.options.map((option) => (
          <li key={option.id}>
            <button type="button" className="toon__option" onClick={() => onRun(option)}>
              <span className="toon__option-label">{option.label}</span>
              {option.hint ? <span className="toon__option-hint">{option.hint}</span> : null}
            </button>
          </li>
        ))}
      </ul>

      <Foot onClose={onClose} onDismiss={onDismiss} />
    </>
  );
}

function TourBubble({ bubble, onStop }) {
  return (
    <>
      <p className="toon__line">{bubble.text}</p>

      <div className="toon__tour">
        <span className="toon__tour-count">
          {bubble.step} of {bubble.total}
        </span>
        <button type="button" className="toon__quiet" onClick={onStop}>
          Stop the tour
        </button>
      </div>
    </>
  );
}

function AskBubble({ bubble, onSubmit, onClose, onDismiss }) {
  const [value, setValue] = useState("");
  const [problem, setProblem] = useState("");
  const inputRef = useRef(null);
  const thinking = bubble.status === "thinking";

  useEffect(() => {
    if (bubble.status === "idle") inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (bubble.status === "answered") setValue("");
  }, [bubble.status]);

  const send = (question) => {
    const found = validateQuestion(question);
    if (found) {
      setProblem(found);
      return;
    }

    setProblem("");
    onSubmit(question);
  };

  return (
    <>
      <p className="toon__line">{bubble.text}</p>

      {bubble.question && bubble.status !== "idle" ? (
        <p className="toon__asked">“{bubble.question}”</p>
      ) : null}

      {bubble.answer ? <p className="toon__answer">{bubble.answer}</p> : null}

      {bubble.error ? (
        <p className="toon__error" role="alert">
          {bubble.error}
        </p>
      ) : null}

      <form
        className="toon__ask"
        onSubmit={(event) => {
          event.preventDefault();
          send(value);
        }}
      >
        <input
          ref={inputRef}
          className="toon__input"
          type="text"
          value={value}
          maxLength={ASK_LIMITS.max}
          placeholder="what did he build at TATA?"
          aria-label={`Ask ${TOON_NAME} about Soham`}
          disabled={thinking}
          onChange={(event) => {
            setValue(event.target.value);
            if (problem) setProblem("");
          }}
        />
        <button type="submit" className="toon__send" disabled={thinking || value.trim().length === 0}>
          {thinking ? "…" : "ask"}
        </button>
      </form>

      {problem ? (
        <p className="toon__error" role="alert">
          {problem}
        </p>
      ) : null}

      {!bubble.answer && !thinking ? (
        <ul className="toon__chips">
          {ASK_SUGGESTIONS.map((suggestion) => (
            <li key={suggestion}>
              <button
                type="button"
                className="toon__chip"
                onClick={() => {
                  setValue(suggestion);
                  send(suggestion);
                }}
              >
                {suggestion}
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <Foot onClose={onClose} onDismiss={onDismiss} />
    </>
  );
}

function Bubble({ bubble, side, onRun, onSubmit, onClose, onDismiss, onStop }) {
  return (
    <div className="toon__bubble" data-side={side} data-kind={bubble.kind} role="group">
      {bubble.kind === "ask" ? (
        <AskBubble bubble={bubble} onSubmit={onSubmit} onClose={onClose} onDismiss={onDismiss} />
      ) : null}

      {bubble.kind === "tour" ? <TourBubble bubble={bubble} onStop={onStop} /> : null}

      {bubble.kind === "menu" ? (
        <MenuBubble bubble={bubble} onRun={onRun} onClose={onClose} onDismiss={onDismiss} />
      ) : null}

      {bubble.kind === "say" ? <p className="toon__line">{bubble.text}</p> : null}
    </div>
  );
}

export default function Toon({ toon, hidden }) {
  if (!toon.enabled || hidden) return null;

  const label = toon.progress?.total
    ? `${TOON_NAME}, your guide. ${toon.progress.read} of ${toon.progress.total} files read. Open the menu.`
    : `${TOON_NAME}, your guide. Open the navigation menu.`;

  return (
    <div className="toon-layer" data-docked={toon.docked || undefined}>
      <p className="toon__live" aria-live="polite" role="status">
        {toon.announcement}
      </p>

      <div className="toon" ref={toon.wrapRef} onKeyDown={toon.onKeyDown}>
        {toon.bubble ? (
          <Bubble
            bubble={toon.bubble}
            side={toon.side}
            onRun={toon.runOption}
            onSubmit={toon.submitAsk}
            onClose={toon.hideBubble}
            onDismiss={toon.controls.hide}
            onStop={() => {
              toon.stopTour("done");
              toon.hideBubble();
            }}
          />
        ) : null}

        <span className="toon__shadow" ref={toon.shadowRef} aria-hidden="true" />

        {toon.frame === "sleep" ? (
          <span className="toon__zzz" aria-hidden="true">
            z
          </span>
        ) : null}

        <button
          type="button"
          className="toon__body"
          data-frame={toon.frame}
          onPointerDown={toon.onPointerDown}
          onPointerMove={toon.onPointerMove}
          onPointerUp={toon.onPointerUp}
          onPointerCancel={toon.onPointerUp}
          onClick={(event) => {
            if (event.detail === 0 || toon.docked) toon.onActivate();
          }}
          aria-label={label}
          aria-expanded={Boolean(toon.bubble?.sticky)}
        >
          <span className="toon__flip" style={{ transform: `scaleX(${toon.facing})` }}>
            <ToonSprite frame={toon.frame} eye={toon.eye} />
          </span>
        </button>
      </div>
    </div>
  );
}
