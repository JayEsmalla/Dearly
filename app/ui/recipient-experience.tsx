"use client";

import { useState, type ReactNode } from "react";

type RecipientPhase = "intro" | "wrapped" | "reveal" | "final";

type RecipientExperienceProps = {
  recipientName: string;
  senderName: string;
  occasion: string;
  giftType: string;
  finalMessage: string;
  children: ReactNode;
  preview?: boolean;
};

const phases: RecipientPhase[] = ["intro", "wrapped", "reveal", "final"];
const reactions = [
  { label: "Loved it", symbol: "♥" },
  { label: "Made me smile", symbol: "☺" },
  { label: "So thoughtful", symbol: "✦" },
  { label: "Surprised me", symbol: "!" },
] as const;

export function RecipientExperience({
  recipientName,
  senderName,
  occasion,
  giftType,
  finalMessage,
  children,
  preview = false,
}: RecipientExperienceProps) {
  const [phase, setPhase] = useState<RecipientPhase>("intro");
  const [reaction, setReaction] = useState<string | null>(null);
  const phaseIndex = phases.indexOf(phase);

  const replay = () => setPhase("intro");

  return (
    <section className={`recipient-flow recipient-flow--${phase}`} aria-label="Gift opening experience">
      <div className="recipient-flow-progress" aria-label={`Step ${phaseIndex + 1} of ${phases.length}`}>
        {phases.map((item, index) => <span className={index <= phaseIndex ? "active" : ""} key={item} />)}
      </div>

      {phase === "intro" && (
        <div className="recipient-flow-step recipient-intro-step">
          <span className="recipient-flow-kicker">{occasion} · {giftType}</span>
          <p>{senderName} made something especially for you.</p>
          <h2>{recipientName}</h2>
          <small>Take a moment. Open it when you are ready.</small>
          <button className="recipient-primary-action" type="button" onClick={() => setPhase("wrapped")}>See what is waiting <span aria-hidden="true">→</span></button>
        </div>
      )}

      {phase === "wrapped" && (
        <div className="recipient-flow-step recipient-wrapped-step">
          <span className="recipient-flow-kicker">Made with feeling</span>
          <p>A little something is waiting for</p>
          <h2>{recipientName}</h2>
          <button className="wrapped-gift recipient-gift-button" type="button" onClick={() => setPhase("reveal")} aria-label="Open your gift">
            <span className="gift-lid" /><span className="gift-bow" /><i>♥</i>
          </button>
          <button className="recipient-primary-action" type="button" onClick={() => setPhase("reveal")}>Open your gift</button>
          <small>From {senderName}</small>
        </div>
      )}

      {phase === "reveal" && (
        <div className="recipient-flow-step recipient-reveal-step">
          <div className="recipient-reveal-heading">
            <span className="recipient-flow-kicker">Just for {recipientName}</span>
            <p>Your gift is open.</p>
          </div>
          <div className="recipient-content-frame">{children}</div>
          <button className="recipient-secondary-action" type="button" onClick={() => setPhase("final")}>One more thing <span aria-hidden="true">→</span></button>
        </div>
      )}

      {phase === "final" && (
        <div className="recipient-flow-step recipient-final-step">
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
                  onClick={() => setReaction(option.label)}
                  type="button"
                >
                  <i aria-hidden="true">{option.symbol}</i>
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </fieldset>

          {reaction && <p className="recipient-reaction-status" role="status">{preview ? "Preview reaction selected." : "Reaction noted on this device."}</p>}

          <div className="recipient-final-actions">
            <button className="recipient-primary-action" type="button" onClick={replay}>Replay gift</button>
            <small>Made with Dearly</small>
          </div>
        </div>
      )}
    </section>
  );
}
