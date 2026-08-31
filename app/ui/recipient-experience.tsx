"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";

type RecipientPhase = "intro" | "wrapped" | "reveal" | "final";

type RecipientExperienceProps = {
  recipientName: string;
  senderName: string;
  occasion: string;
  giftType: string;
  finalMessage: string;
  children: ReactNode;
  preview?: boolean;
  persistenceKey?: string;
};

type SavedRecipientResponse = {
  version: 1;
  reaction: string | null;
  reply: string;
  savedAt: string;
};

const phases: RecipientPhase[] = ["intro", "wrapped", "reveal", "final"];
const reactions = [
  { label: "Loved it", symbol: "♥" },
  { label: "Made me smile", symbol: "☺" },
  { label: "So thoughtful", symbol: "✦" },
  { label: "Surprised me", symbol: "!" },
] as const;

function getResponseKey(persistenceKey: string) {
  return `dearly:recipient-response:v1:${encodeURIComponent(persistenceKey)}`;
}

export function RecipientExperience({
  recipientName,
  senderName,
  occasion,
  giftType,
  finalMessage,
  children,
  preview = false,
  persistenceKey,
}: RecipientExperienceProps) {
  const [phase, setPhase] = useState<RecipientPhase>("intro");
  const [reaction, setReaction] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [replySaved, setReplySaved] = useState(false);
  const [responseStatus, setResponseStatus] = useState("");
  const [opening, setOpening] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const phaseRef = useRef<HTMLDivElement>(null);
  const openingTimerRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const phaseIndex = phases.indexOf(phase);

  useEffect(() => {
    if (preview || !persistenceKey) return;
    const timeout = window.setTimeout(() => {
      try {
        const stored = window.localStorage.getItem(getResponseKey(persistenceKey));
        if (!stored) return;
        const saved = JSON.parse(stored) as Partial<SavedRecipientResponse>;
        if (saved.version !== 1) return;
        if (typeof saved.reaction === "string" || saved.reaction === null) setReaction(saved.reaction ?? null);
        if (typeof saved.reply === "string") {
          setReply(saved.reply.slice(0, 240));
          setReplySaved(Boolean(saved.reply.trim()));
        }
      } catch {
        setResponseStatus("This browser could not restore your previous response.");
      }
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [persistenceKey, preview]);

  useEffect(() => {
    phaseRef.current?.focus({ preventScroll: true });
  }, [phase]);

  useEffect(() => () => {
    if (openingTimerRef.current !== null) window.clearTimeout(openingTimerRef.current);
    void audioContextRef.current?.close();
  }, []);

  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const AudioContextConstructor = window.AudioContext;
      const context = audioContextRef.current ?? new AudioContextConstructor();
      audioContextRef.current = context;
      const now = context.currentTime;
      const gain = context.createGain();
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.06, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.34);
      gain.connect(context.destination);
      [523.25, 659.25].forEach((frequency, index) => {
        const oscillator = context.createOscillator();
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(frequency, now + index * 0.07);
        oscillator.connect(gain);
        oscillator.start(now + index * 0.07);
        oscillator.stop(now + 0.36);
      });
    } catch {
      // Sound is optional; keep the gift fully usable if Web Audio is unavailable.
    }
  };

  const goTo = (next: RecipientPhase) => {
    playChime();
    setPhase(next);
  };

  const openGift = () => {
    if (opening) return;
    playChime();
    setOpening(true);
    openingTimerRef.current = window.setTimeout(() => {
      setOpening(false);
      setPhase("reveal");
      openingTimerRef.current = null;
    }, 520);
  };

  const replay = () => {
    setOpening(false);
    goTo("intro");
  };

  const persistResponse = (nextReaction: string | null, nextReply: string) => {
    if (preview || !persistenceKey) return true;
    try {
      const response: SavedRecipientResponse = {
        version: 1,
        reaction: nextReaction,
        reply: nextReply,
        savedAt: new Date().toISOString(),
      };
      window.localStorage.setItem(getResponseKey(persistenceKey), JSON.stringify(response));
      return true;
    } catch {
      setResponseStatus("Your response could not be saved in this browser.");
      return false;
    }
  };

  const chooseReaction = (nextReaction: string) => {
    setReaction(nextReaction);
    const saved = persistResponse(nextReaction, replySaved ? reply : "");
    if (saved) setResponseStatus(preview ? "Preview reaction selected." : "Reaction saved on this device.");
  };

  const submitReply = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanReply = reply.trim().slice(0, 240);
    if (!cleanReply) {
      setReplySaved(false);
      setResponseStatus("Write a short reply before saving it.");
      return;
    }
    setReply(cleanReply);
    const saved = persistResponse(reaction, cleanReply);
    if (saved) {
      setReplySaved(true);
      setResponseStatus(preview ? "Preview reply saved." : "Reply saved on this device.");
    }
  };

  const toggleSound = () => {
    setSoundEnabled((enabled) => !enabled);
    setResponseStatus(soundEnabled ? "Gift sounds turned off." : "Gift sounds turned on.");
  };

  return (
    <section className={`recipient-flow recipient-flow--${phase}${opening ? " recipient-flow--opening" : ""}`} aria-label="Gift opening experience">
      <div
        className="recipient-flow-progress"
        role="progressbar"
        aria-label="Gift opening progress"
        aria-valuemin={1}
        aria-valuemax={phases.length}
        aria-valuenow={phaseIndex + 1}
        aria-valuetext={`Step ${phaseIndex + 1} of ${phases.length}`}
      >
        {phases.map((item, index) => <span className={index <= phaseIndex ? "active" : ""} key={item} />)}
      </div>

      <button className="recipient-sound-toggle" type="button" aria-pressed={soundEnabled} onClick={toggleSound}>
        <span aria-hidden="true">{soundEnabled ? "♪" : "♩"}</span>{soundEnabled ? "Sound on" : "Sound off"}
      </button>

      {phase === "intro" && (
        <div className="recipient-flow-step recipient-intro-step" ref={phaseRef} tabIndex={-1}>
          <span className="recipient-flow-kicker">{occasion} · {giftType}</span>
          <p>{senderName} made something especially for you.</p>
          <h2>{recipientName}</h2>
          <small>Take a moment. Open it when you are ready.</small>
          <button className="recipient-primary-action" type="button" onClick={() => goTo("wrapped")}>See what is waiting <span aria-hidden="true">→</span></button>
        </div>
      )}

      {phase === "wrapped" && (
        <div className="recipient-flow-step recipient-wrapped-step" ref={phaseRef} tabIndex={-1} aria-busy={opening}>
          <span className="recipient-flow-kicker">Made with feeling</span>
          <p>A little something is waiting for</p>
          <h2>{recipientName}</h2>
          <button className="wrapped-gift recipient-gift-button" type="button" onClick={openGift} aria-label={opening ? "Opening your gift" : "Open your gift"} disabled={opening}>
            <span className="gift-lid" /><span className="gift-bow" /><i>♥</i>
          </button>
          <button className="recipient-primary-action" type="button" onClick={openGift} disabled={opening}>{opening ? "Opening…" : "Open your gift"}</button>
          <small>{opening ? "Unwrapping your surprise…" : `From ${senderName}`}</small>
          {opening && <div className="recipient-opening-indicator" role="status" aria-live="polite"><i /><i /><i /><span>Opening your gift</span></div>}
        </div>
      )}

      {phase === "reveal" && (
        <div className="recipient-flow-step recipient-reveal-step" ref={phaseRef} tabIndex={-1}>
          <div className="recipient-reveal-heading">
            <span className="recipient-flow-kicker">Just for {recipientName}</span>
            <p>Your gift is open.</p>
          </div>
          <div className="recipient-content-frame">{children}</div>
          <button className="recipient-secondary-action" type="button" onClick={() => goTo("final")}>One more thing <span aria-hidden="true">→</span></button>
        </div>
      )}

      {phase === "final" && (
        <div className="recipient-flow-step recipient-final-step" ref={phaseRef} tabIndex={-1}>
          <span className="reveal-heart" aria-hidden="true">♥</span>
          <span className="recipient-flow-kicker">One last note</span>
          <blockquote>“{finalMessage || "This was made especially for you."}”</blockquote>
          <p className="recipient-final-from">— {senderName}</p>

          <fieldset className="recipient-reactions">
            <legend>How did this make you feel?</legend>
            <div>
              {reactions.map((option) => (
                <button
                  aria-pressed={reaction === option.label}
                  className={reaction === option.label ? "selected" : ""}
                  key={option.label}
                  onClick={() => chooseReaction(option.label)}
                  type="button"
                >
                  <i aria-hidden="true">{option.symbol}</i>
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <form className="recipient-reply" onSubmit={submitReply}>
            <label htmlFor="recipient-reply-message">Send a short reply to {senderName}</label>
            <div>
              <textarea id="recipient-reply-message" value={reply} maxLength={240} rows={3} onChange={(event) => { setReply(event.target.value); setReplySaved(false); }} placeholder="Write something they would love to hear…" />
              <small>{reply.length}/240</small>
            </div>
            <button type="submit">{replySaved ? "Reply saved" : "Save reply"}</button>
          </form>

          {responseStatus && <p className="recipient-reaction-status" role="status" aria-live="polite">{responseStatus}</p>}

          <div className="recipient-final-actions">
            <button className="recipient-primary-action" type="button" onClick={replay}>Replay gift</button>
            <small>{preview ? "Preview only · responses are not sent" : "Responses stay on this device until Dearly publishing is connected"}</small>
            <small>Made with Dearly</small>
          </div>
        </div>
      )}
    </section>
  );
}
