import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SPRITE_COLS, frameFor, visualActivity } from "./toon/sprite.js";
import {
  boundsFor,
  clamp,
  createMotion,
  hop,
  pickTarget,
  stepMotion,
  throwFrom,
  walkTo,
} from "./toon/physics.js";
import {
  ASK_INTRO,
  ASK_THINKING,
  ASK_UNAVAILABLE,
  askDoneLine,
  askErrorLine,
  dizzyLine,
  greetLine,
  idleLine,
  isDizzy,
  menuFor,
  pokeLine,
} from "./toon/dialogue.js";
import {
  isReturning,
  progressOf,
  nextUnread,
  readMemory,
  withEnabled,
  withLine,
  withSeen,
  withTour,
  withVisit,
  writeMemory,
} from "./toon/memory.js";
import { dwellReaction, reactionFor, REACTION_GAP } from "./toon/reactions.js";
import { TOUR_CLOSER, TOUR_STEP_MS, tourOffer, tourSteps } from "./toon/tour.js";

const SURFACES = [".hint", ".statusbar", ".term"];

const SPRITE_WIDTH = SPRITE_COLS * 4;
const FLOOR_INTERVAL = 0.25;
const STEP_DISTANCE = 7;
const SLEEP_AFTER = 45000;
const POKE_WINDOW = 900;
const CHATTER_GAP = 40000;
const DRAG_THRESHOLD = 4;
const BUBBLE_REACH = 340;
const DWELL_AFTER = 70000;
const DOCKED_FRAME_MS = 160;
const INTRO_DELAY = 1800;

function store() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function measureFloor(compact) {
  const viewport = window.innerHeight;
  let top = viewport;

  for (const selector of SURFACES) {
    if (selector === ".term" && compact) continue;
    const element = document.querySelector(selector);
    if (!element) continue;

    const rect = element.getBoundingClientRect();
    if (rect.height > 0 && rect.top < top && rect.top > 0) top = rect.top;
  }

  return Math.max(0, viewport - top);
}

export function useToon({
  file,
  files,
  keys,
  terminalOpen,
  compact,
  reduced,
  askEnabled = false,
  actions,
}) {
  const memoryRef = useRef(null);
  const returningRef = useRef(false);
  const lastFileRef = useRef(null);

  if (memoryRef.current === null) {
    const loaded = readMemory(store());
    memoryRef.current = loaded;
    returningRef.current = isReturning(loaded, Date.now());
    lastFileRef.current = loaded.lastFile;
  }

  const [enabled, setEnabled] = useState(() => memoryRef.current.enabled);
  const [progress, setProgress] = useState(() => progressOf(memoryRef.current, files || []));
  const [frame, setFrame] = useState("idle");
  const [bubble, setBubble] = useState(null);
  const [eye, setEye] = useState({ dx: 0, dy: 0 });
  const [facing, setFacing] = useState(-1);
  const [side, setSide] = useState("left");
  const [announcement, setAnnouncement] = useState("");

  const docked = Boolean(compact || reduced);

  const wrapRef = useRef(null);
  const shadowRef = useRef(null);
  const motionRef = useRef(createMotion(0));
  const activityRef = useRef("idle");
  const frameRef = useRef("idle");
  const phaseRef = useRef(0);
  const travelRef = useRef(0);
  const floorRef = useRef(0);
  const floorClockRef = useRef(0);
  const blinkRef = useRef(0);
  const landedRef = useRef(0);
  const facingRef = useRef(-1);
  const sideRef = useRef("left");
  const touchedRef = useRef(Date.now());
  const spokeRef = useRef(0);
  const reactedRef = useRef(0);
  const pokeRef = useRef({ count: 0, at: 0 });
  const dragRef = useRef(null);
  const bubbleTimerRef = useRef(0);
  const sequenceRef = useRef([]);
  const tourRef = useRef(null);
  const askRef = useRef(0);
  const dwellRef = useRef({ id: null, at: Date.now(), nudged: false });
  const introRef = useRef(false);
  const bubbleRef = useRef(null);
  bubbleRef.current = bubble;

  const dockedRef = useRef(docked);
  dockedRef.current = docked;

  const actionsRef = useRef(actions);
  actionsRef.current = actions;

  const contextRef = useRef({ file, files, keys, terminalOpen, askEnabled });
  contextRef.current = { file, files, keys, terminalOpen, askEnabled };

  const boundsRef = useRef({ min: 8, max: 8 });
  const placedRef = useRef(false);

  const ready = Array.isArray(files) && files.length > 0;

  const commit = useCallback((next) => {
    memoryRef.current = next;
    writeMemory(store(), next);

    const measured = progressOf(next, contextRef.current.files || []);
    setProgress((current) =>
      current.read === measured.read && current.total === measured.total ? current : measured
    );

    return next;
  }, []);

  const clearSequence = useCallback(() => {
    for (const id of sequenceRef.current) window.clearTimeout(id);
    sequenceRef.current = [];
  }, []);

  const setActivity = useCallback((next) => {
    activityRef.current = next;
  }, []);

  const hideBubble = useCallback(() => {
    window.clearTimeout(bubbleTimerRef.current);
    setBubble(null);
  }, []);

  const say = useCallback((text, options = null, hold = 0) => {
    if (!text) return;

    window.clearTimeout(bubbleTimerRef.current);
    spokeRef.current = Date.now();
    setAnnouncement(text);

    const sticky = Array.isArray(options) && options.length > 0;
    setBubble({ kind: sticky ? "menu" : "say", text, options: sticky ? options : null, sticky });

    if (!sticky) {
      const life = hold || clamp(1600 + text.length * 55, 2200, 6000);
      bubbleTimerRef.current = window.setTimeout(() => setBubble(null), life);
    }
  }, []);

  const wake = useCallback(() => {
    touchedRef.current = Date.now();
    if (activityRef.current === "sleep") setActivity("idle");
  }, [setActivity]);

  const openMenu = useCallback(() => {
    const context = contextRef.current;
    const menu = menuFor({
      file: context.file,
      files: context.files,
      keys: context.keys,
      terminalOpen: context.terminalOpen,
      memory: memoryRef.current,
      askEnabled: context.askEnabled,
    });
    say(menu.text, menu.options);
  }, [say]);

  const cheer = useCallback(
    (hold = 900) => {
      clearSequence();
      setActivity("cheer");
      if (!dockedRef.current) motionRef.current = hop(motionRef.current, 300);
      sequenceRef.current.push(
        window.setTimeout(() => {
          if (activityRef.current === "cheer") setActivity("idle");
        }, hold)
      );
    },
    [clearSequence, setActivity]
  );

  const wave = useCallback(() => {
    clearSequence();
    setActivity("wave");
    sequenceRef.current.push(
      window.setTimeout(() => {
        if (activityRef.current === "wave") setActivity("idle");
      }, 1400)
    );
  }, [clearSequence, setActivity]);

  const come = useCallback(
    (x) => {
      wake();
      if (dockedRef.current) return;

      const bounds = boundsRef.current;
      const target = typeof x === "number" ? x : (bounds.min + bounds.max) / 2;
      motionRef.current = walkTo(motionRef.current, clamp(target, bounds.min, bounds.max));
      activityRef.current = "idle";
    },
    [wake]
  );

  const dance = useCallback(() => {
    wake();
    clearSequence();
    setActivity("cheer");

    if (dockedRef.current) {
      sequenceRef.current.push(window.setTimeout(() => setActivity("idle"), 1600));
      return;
    }

    const bounds = boundsRef.current;
    const origin = motionRef.current.x;
    const steps = [-34, 34, -22, 22, 0];

    steps.forEach((offset, index) => {
      sequenceRef.current.push(
        window.setTimeout(() => {
          motionRef.current = hop(
            walkTo(motionRef.current, clamp(origin + offset, bounds.min, bounds.max)),
            260
          );
        }, index * 320)
      );
    });

    sequenceRef.current.push(
      window.setTimeout(() => setActivity("idle"), steps.length * 320 + 400)
    );
  }, [clearSequence, setActivity, wake]);

  const summon = useCallback(() => {
    setEnabled(true);
    commit(withEnabled(memoryRef.current, true));
    wake();

    const last = (contextRef.current.files || []).find(
      (entry) => entry.id === lastFileRef.current
    );
    say(greetLine(Date.now(), { returning: returningRef.current, lastLabel: last?.name }));
  }, [commit, say, wake]);

  const stopTour = useCallback(
    (state) => {
      if (!tourRef.current) return;
      tourRef.current = null;
      clearSequence();
      commit(withTour(memoryRef.current, state));
    },
    [clearSequence, commit]
  );

  const hide = useCallback(() => {
    stopTour("skipped");
    clearSequence();
    hideBubble();
    setEnabled(false);
    commit(withEnabled(memoryRef.current, false));
  }, [clearSequence, commit, hideBubble, stopTour]);

  const toggle = useCallback(() => (enabled ? hide() : summon()), [enabled, hide, summon]);

  const focus = useCallback(() => {
    if (!enabled) {
      summon();
    } else {
      wake();
      openMenu();
    }

    window.setTimeout(() => {
      wrapRef.current?.querySelector(".toon__body")?.focus();
    }, 0);
  }, [enabled, openMenu, summon, wake]);

  const runTourStep = useCallback(
    (index) => {
      const tour = tourRef.current;
      if (!tour) return;

      if (index >= tour.steps.length) {
        tourRef.current = null;
        commit(withTour(memoryRef.current, "done"));
        setAnnouncement(TOUR_CLOSER);
        setBubble({ kind: "say", text: TOUR_CLOSER, options: null, sticky: false });
        window.clearTimeout(bubbleTimerRef.current);
        bubbleTimerRef.current = window.setTimeout(() => setBubble(null), 5200);
        wave();
        return;
      }

      const step = tour.steps[index];
      tourRef.current = { ...tour, index };

      actionsRef.current.openFile?.(step.fileId);
      spokeRef.current = Date.now();
      setAnnouncement(step.text);
      setBubble({
        kind: "tour",
        text: step.text,
        options: null,
        sticky: true,
        step: index + 1,
        total: tour.steps.length,
      });

      if (!dockedRef.current) motionRef.current = hop(motionRef.current, 240);

      sequenceRef.current.push(window.setTimeout(() => runTourStep(index + 1), TOUR_STEP_MS));
    },
    [commit, wave]
  );

  const startTour = useCallback(() => {
    const steps = tourSteps(contextRef.current.files || []);
    if (steps.length === 0) return;

    clearSequence();
    window.clearTimeout(bubbleTimerRef.current);
    wake();

    tourRef.current = { steps, index: -1 };
    runTourStep(0);
  }, [clearSequence, runTourStep, wake]);

  const openAsk = useCallback(() => {
    window.clearTimeout(bubbleTimerRef.current);
    wake();
    setAnnouncement(ASK_INTRO);
    setBubble({
      kind: "ask",
      text: ASK_INTRO,
      options: null,
      sticky: true,
      status: "idle",
      answer: "",
      remaining: null,
      error: "",
    });
  }, [wake]);

  const submitAsk = useCallback(
    async (question) => {
      const asked = String(question || "").trim();
      if (!asked) return;

      const handler = actionsRef.current.ask;
      if (!handler) return;

      const ticket = askRef.current + 1;
      askRef.current = ticket;

      clearSequence();
      setActivity("think");
      setAnnouncement(ASK_THINKING);
      setBubble((current) => ({
        ...(current || { kind: "ask", options: null, sticky: true }),
        kind: "ask",
        text: ASK_THINKING,
        sticky: true,
        status: "thinking",
        question: asked,
        answer: "",
        error: "",
      }));

      try {
        const result = await handler(asked);
        if (askRef.current !== ticket) return;

        if (!result?.configured) {
          setActivity("idle");
          setBubble((current) =>
            current?.kind === "ask"
              ? {
                  ...current,
                  status: "error",
                  text: ASK_INTRO,
                  error: ASK_UNAVAILABLE,
                }
              : current
          );
          setAnnouncement(ASK_UNAVAILABLE);
          return;
        }

        if (!result.answer) {
          setActivity("idle");
          setBubble((current) =>
            current?.kind === "ask"
              ? { ...current, status: "error", text: ASK_INTRO, error: "Nothing came back. Try rephrasing." }
              : current
          );
          setAnnouncement("Nothing came back. Try rephrasing.");
          return;
        }

        cheer(700);
        setAnnouncement(result.answer);
        setBubble((current) =>
          current?.kind === "ask"
            ? {
                ...current,
                status: "answered",
                text: askDoneLine(result.remaining),
                answer: result.answer,
                remaining: Number.isFinite(result.remaining) ? result.remaining : null,
                error: "",
              }
            : current
        );
      } catch (error) {
        if (askRef.current !== ticket) return;

        setActivity("dizzy");
        sequenceRef.current.push(
          window.setTimeout(() => {
            if (activityRef.current === "dizzy") setActivity("idle");
          }, 1400)
        );

        const detail = askErrorLine(error?.message);
        setAnnouncement(detail);
        setBubble((current) =>
          current?.kind === "ask"
            ? { ...current, status: "error", text: ASK_INTRO, error: detail }
            : current
        );
      }
    },
    [cheer, clearSequence, setActivity]
  );

  const askVia = useCallback(
    (question) => {
      openAsk();

      const text = String(question || "").trim();
      if (text) submitAsk(text);
    },
    [openAsk, submitAsk]
  );

  const react = useCallback(
    (type, payload = {}) => {
      if (!enabled) return;
      if (tourRef.current) return;
      if (bubbleRef.current?.sticky) return;

      const reaction = reactionFor(type, payload);
      if (!reaction) return;

      const now = Date.now();
      if (now - reactedRef.current < REACTION_GAP) return;
      reactedRef.current = now;

      wake();
      clearSequence();
      setActivity(reaction.activity);

      if (reaction.hop && !dockedRef.current) {
        motionRef.current = hop(motionRef.current, 280);
      }

      say(reaction.text, null, reaction.hold);
      commit(withLine(memoryRef.current, reaction.text));

      sequenceRef.current.push(
        window.setTimeout(
          () => {
            if (activityRef.current === reaction.activity) setActivity("idle");
          },
          reaction.activity === "think" ? 2600 : 1500
        )
      );
    },
    [clearSequence, commit, enabled, say, setActivity, wake]
  );

  const runOption = useCallback(
    (option) => {
      wake();
      const handlers = actionsRef.current;

      if (option.action === "ask") {
        openAsk();
        return;
      }

      if (option.action === "tour") {
        startTour();
        return;
      }

      if (option.action === "skip") {
        hideBubble();
        commit(withTour(memoryRef.current, "skipped"));
        return;
      }

      hideBubble();

      const run = {
        open: () => handlers.openFile?.(option.arg),
        terminal: () => handlers.openTerminal?.(),
        palette: () => handlers.openPalette?.(),
        email: () => handlers.copyEmail?.(),
        resume: () => handlers.openResume?.(),
      }[option.action];

      run?.();
      cheer(700);
    },
    [cheer, commit, hideBubble, openAsk, startTour, wake]
  );

  useEffect(() => {
    if (!enabled || docked) return undefined;

    boundsRef.current = boundsFor(window.innerWidth, SPRITE_WIDTH);
    floorRef.current = measureFloor(compact);

    if (!placedRef.current) {
      placedRef.current = true;
      const bounds = boundsRef.current;
      motionRef.current = walkTo(
        createMotion(bounds.max),
        clamp(bounds.max - 140, bounds.min, bounds.max)
      );
    }

    let raf = 0;
    let last = performance.now();

    const tick = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      floorClockRef.current += dt;
      if (floorClockRef.current >= FLOOR_INTERVAL) {
        floorClockRef.current = 0;
        floorRef.current = measureFloor(compact);
        boundsRef.current = boundsFor(window.innerWidth, SPRITE_WIDTH);
      }

      const previous = motionRef.current;
      const dragging = activityRef.current === "drag";
      const next = dragging ? previous : stepMotion(previous, dt, boundsRef.current);
      motionRef.current = next;

      travelRef.current += Math.abs(next.x - previous.x);
      if (travelRef.current >= STEP_DISTANCE) {
        travelRef.current = 0;
        phaseRef.current += 1;
      }

      if (next.landed !== landedRef.current) {
        landedRef.current = next.landed;
        const element = wrapRef.current;
        if (element) {
          element.classList.remove("toon--land");
          void element.offsetWidth;
          element.classList.add("toon--land");
        }
      }

      const lift = floorRef.current + next.y;
      const wrap = wrapRef.current;
      if (wrap) {
        wrap.style.transform = `translate3d(${Math.round(next.x)}px, ${-Math.round(lift)}px, 0)`;
      }

      const shadow = shadowRef.current;
      if (shadow) {
        const spread = clamp(1 - next.y / 220, 0.35, 1);
        shadow.style.transform = `translateY(${Math.round(next.y)}px) scaleX(${spread.toFixed(3)})`;
        shadow.style.opacity = (spread * 0.55).toFixed(3);
      }

      const moving = next.target !== null || next.vx !== 0;
      const visual = visualActivity(activityRef.current, { grounded: next.grounded, moving });
      const blinking = visual === "idle" && now < blinkRef.current;
      const name = blinking ? "blink" : frameFor(visual, phaseRef.current);

      if (name !== frameRef.current) {
        frameRef.current = name;
        setFrame(name);
      }

      if (visual === "idle" && now > blinkRef.current + 600 && Math.random() < 0.006) {
        blinkRef.current = now + 130;
      }

      if (next.facing !== facingRef.current) {
        facingRef.current = next.facing;
        setFacing(next.facing);
      }

      const nextSide = next.x + BUBBLE_REACH <= window.innerWidth ? "right" : "left";
      if (nextSide !== sideRef.current) {
        sideRef.current = nextSide;
        setSide(nextSide);
      }

      raf = window.requestAnimationFrame(tick);
    };

    raf = window.requestAnimationFrame(tick);

    const onResize = () => {
      boundsRef.current = boundsFor(window.innerWidth, SPRITE_WIDTH);
      motionRef.current = {
        ...motionRef.current,
        x: clamp(motionRef.current.x, boundsRef.current.min, boundsRef.current.max),
      };
    };

    window.addEventListener("resize", onResize);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [enabled, compact, docked]);

  useEffect(() => {
    if (!enabled || !docked) return undefined;

    placedRef.current = false;
    dragRef.current = null;

    const wrap = wrapRef.current;
    if (wrap) wrap.style.transform = "";

    const shadow = shadowRef.current;
    if (shadow) {
      shadow.style.transform = "";
      shadow.style.opacity = "";
    }

    if (activityRef.current === "drag") setActivity("idle");
    motionRef.current = createMotion(0);

    setFacing(-1);
    facingRef.current = -1;
    setSide("left");
    sideRef.current = "left";

    const beat = window.setInterval(() => {
      const now = performance.now();
      const visual = visualActivity(activityRef.current, { grounded: true, moving: false });
      const blinking = visual === "idle" && now < blinkRef.current;
      const name = blinking ? "blink" : frameFor(visual, phaseRef.current);

      if (name !== frameRef.current) {
        frameRef.current = name;
        setFrame(name);
      }

      if (!reduced && visual === "idle" && now > blinkRef.current + 900 && Math.random() < 0.05) {
        blinkRef.current = now + DOCKED_FRAME_MS * 2;
      }
    }, DOCKED_FRAME_MS);

    return () => window.clearInterval(beat);
  }, [enabled, docked, reduced, setActivity]);

  const visitedRef = useRef(false);

  useEffect(() => {
    if (visitedRef.current) return;
    visitedRef.current = true;
    commit(withVisit(memoryRef.current, Date.now()));
  }, [commit]);

  useEffect(() => {
    setProgress((current) => {
      const measured = progressOf(memoryRef.current, files || []);
      return current.read === measured.read && current.total === measured.total
        ? current
        : measured;
    });
  }, [files]);

  useEffect(() => {
    if (!enabled || !ready || introRef.current) return undefined;
    introRef.current = true;

    const now = Date.now();
    const memory = memoryRef.current;
    const returning = returningRef.current;

    const timer = window.setTimeout(() => {
      const list = contextRef.current.files || [];
      const steps = tourSteps(list);

      if (!memory.tour && steps.length >= 2) {
        const offer = tourOffer({ returning, steps: steps.length });
        spokeRef.current = Date.now();
        setAnnouncement(offer.text);
        setBubble({ kind: "menu", text: offer.text, options: offer.options, sticky: true });
        wave();
        return;
      }

      const last = list.find((entry) => entry.id === lastFileRef.current);
      say(greetLine(now, { returning, lastLabel: last?.name }));
      wave();
    }, INTRO_DELAY);

    return () => window.clearTimeout(timer);
  }, [enabled, ready, say, wave]);

  useEffect(() => {
    if (!ready || !file?.id) return;
    commit(withSeen(memoryRef.current, file.id, Date.now()));
    dwellRef.current = { id: file.id, at: Date.now(), nudged: false };
  }, [file?.id, ready, commit]);

  useEffect(() => {
    if (!enabled) return undefined;

    const beat = window.setInterval(() => {
      const idle = activityRef.current === "idle";
      const now = Date.now();

      if (!idle || bubbleRef.current || tourRef.current) return;

      if (now - touchedRef.current > SLEEP_AFTER) {
        if (activityRef.current !== "sleep") {
          setActivity("sleep");
          motionRef.current = { ...motionRef.current, target: null, vx: 0 };
        }
        return;
      }

      const dwell = dwellRef.current;
      if (!dwell.nudged && dwell.id && now - dwell.at > DWELL_AFTER) {
        const context = contextRef.current;
        const next = nextUnread(memoryRef.current, context.files || [], dwell.id);
        const reaction = dwellReaction(context.file, next);

        if (reaction) {
          dwellRef.current = { ...dwell, nudged: true };
          say(reaction.text, null, reaction.hold);
          commit(withLine(memoryRef.current, reaction.text));
          wave();
          return;
        }

        dwellRef.current = { ...dwell, nudged: true };
      }

      if (reduced) return;

      if (!dockedRef.current && motionRef.current.target === null && Math.random() < 0.35) {
        motionRef.current = walkTo(
          motionRef.current,
          pickTarget(motionRef.current, boundsRef.current)
        );
        return;
      }

      if (now - spokeRef.current > CHATTER_GAP && Math.random() < 0.12) {
        const text = idleLine(now / 1000, memoryRef.current.lines);
        say(text);
        commit(withLine(memoryRef.current, text));
      }
    }, 2600);

    return () => window.clearInterval(beat);
  }, [enabled, reduced, say, setActivity, commit, wave]);

  useEffect(() => {
    if (!enabled || reduced || docked) return undefined;

    const onMove = (event) => {
      const element = wrapRef.current;
      if (!element || activityRef.current === "sleep") return;

      const rect = element.getBoundingClientRect();
      const dx = Math.sign(event.clientX - (rect.left + rect.width / 2));
      const dy = Math.sign(event.clientY - (rect.top + rect.height / 2));

      setEye((current) => (current.dx === dx && current.dy === dy ? current : { dx, dy }));
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [enabled, reduced, docked]);

  useEffect(() => {
    if (!bubble?.sticky) return undefined;

    const onDown = (event) => {
      if (wrapRef.current?.contains(event.target)) return;
      if (tourRef.current) stopTour("done");
      hideBubble();
    };

    window.addEventListener("pointerdown", onDown);
    return () => window.removeEventListener("pointerdown", onDown);
  }, [bubble, hideBubble, stopTour]);

  useEffect(() => {
    if (!enabled || docked) return;
    if (activityRef.current === "sleep" || activityRef.current === "drag") return;
    motionRef.current = hop(motionRef.current, 250);
  }, [file?.id, enabled, docked]);

  useEffect(
    () => () => {
      clearSequence();
      window.clearTimeout(bubbleTimerRef.current);
    },
    [clearSequence]
  );

  const onPointerDown = useCallback((event) => {
    if (dockedRef.current) return;
    if (event.button !== 0 && event.pointerType === "mouse") return;

    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;

    event.currentTarget.setPointerCapture?.(event.pointerId);
    dragRef.current = {
      id: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      grabX: event.clientX - rect.left,
      grabY: rect.bottom - event.clientY,
      lastX: event.clientX,
      lastY: event.clientY,
      at: performance.now(),
      vx: 0,
      vy: 0,
      moved: false,
    };
  }, []);

  const onPointerMove = useCallback(
    (event) => {
      const drag = dragRef.current;
      if (!drag || drag.id !== event.pointerId) return;

      const travelled =
        Math.abs(event.clientX - drag.startX) + Math.abs(event.clientY - drag.startY);

      if (!drag.moved && travelled < DRAG_THRESHOLD) return;

      if (!drag.moved) {
        drag.moved = true;
        stopTour("skipped");
        clearSequence();
        hideBubble();
        setActivity("drag");
        wake();
      }

      const now = performance.now();
      const span = Math.max(16, now - drag.at);
      drag.vx = ((event.clientX - drag.lastX) / span) * 1000;
      drag.vy = ((drag.lastY - event.clientY) / span) * 1000;
      drag.lastX = event.clientX;
      drag.lastY = event.clientY;
      drag.at = now;

      const bounds = boundsRef.current;
      const floor = floorRef.current;
      const x = clamp(event.clientX - drag.grabX, bounds.min, bounds.max);
      const y = Math.max(0, window.innerHeight - floor - event.clientY - drag.grabY);

      motionRef.current = {
        ...motionRef.current,
        x,
        y,
        vx: 0,
        vy: 0,
        target: null,
        grounded: y <= 0,
        facing: drag.vx === 0 ? motionRef.current.facing : Math.sign(drag.vx),
      };
    },
    [clearSequence, hideBubble, setActivity, stopTour, wake]
  );

  const onPointerUp = useCallback(
    (event) => {
      const drag = dragRef.current;
      if (!drag || drag.id !== event.pointerId) return;
      dragRef.current = null;
      event.currentTarget.releasePointerCapture?.(event.pointerId);

      if (drag.moved) {
        setActivity("idle");
        motionRef.current = throwFrom(motionRef.current, drag.vx, drag.vy);
        return;
      }

      const wasAsleep = activityRef.current === "sleep";
      wake();

      if (wasAsleep) {
        say("…up. Where to?");
        return;
      }

      if (tourRef.current) {
        stopTour("done");
        hideBubble();
        return;
      }

      const now = Date.now();
      const chained = now - pokeRef.current.at < POKE_WINDOW;
      pokeRef.current = { count: chained ? pokeRef.current.count + 1 : 0, at: now };

      if (pokeRef.current.count > 0) {
        const count = pokeRef.current.count;
        if (!dockedRef.current) motionRef.current = hop(motionRef.current, 220);

        if (isDizzy(count)) {
          clearSequence();
          setActivity("dizzy");
          say(dizzyLine(now / 1000));
          pokeRef.current = { count: 0, at: now };
          sequenceRef.current.push(
            window.setTimeout(() => {
              if (activityRef.current === "dizzy") setActivity("idle");
            }, 1800)
          );
          return;
        }

        say(pokeLine(count));
        return;
      }

      if (bubbleRef.current?.sticky) {
        hideBubble();
        return;
      }

      openMenu();
    },
    [clearSequence, hideBubble, openMenu, say, setActivity, stopTour, wake]
  );

  const onKeyDown = useCallback(
    (event) => {
      if (event.key === "Escape" && bubbleRef.current) {
        event.stopPropagation();
        if (tourRef.current) stopTour("done");
        hideBubble();
        wrapRef.current?.querySelector(".toon__body")?.focus();
      }
    },
    [hideBubble, stopTour]
  );

  const onActivate = useCallback(() => {
    wake();

    if (tourRef.current) {
      stopTour("done");
      hideBubble();
      return;
    }

    if (bubbleRef.current?.sticky) hideBubble();
    else openMenu();
  }, [hideBubble, openMenu, stopTour, wake]);

  const controls = useMemo(
    () => ({
      summon,
      hide,
      toggle,
      come,
      dance,
      wave,
      say,
      cheer,
      focus,
      ask: askVia,
      tour: startTour,
      enabled,
    }),
    [summon, hide, toggle, come, dance, wave, say, cheer, focus, askVia, startTour, enabled]
  );

  return {
    enabled,
    docked,
    frame,
    facing,
    side,
    bubble,
    eye,
    progress,
    announcement,
    wrapRef,
    shadowRef,
    controls,
    react,
    runOption,
    submitAsk,
    openAsk,
    hideBubble,
    stopTour,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onKeyDown,
    onActivate,
  };
}
