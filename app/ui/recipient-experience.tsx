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
  revealMedia?: ReactNode;
  finalMedia?: ReactNode;
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
  { label: "This made me smile.", symbol: "☺" },
  { label: "I love this.", symbol: "♥" },
  { label: "This is so thoughtful.", symbol: "✦" },
  { label: "You made my day.", symbol: "☀" },
] as const;

function getResponseKey(persistenceKey: string) {
  return `dearly:recipient-response:v1:${encodeURIComponent(persistenceKey)}`;
}

function getResponseTokenKey(persistenceKey: string) {
  return `dearly:recipient-response-token:v1:${encodeURIComponent(persistenceKey)}`;
}

function createResponseToken() {
  return `${window.crypto.randomUUID()}${window.crypto.randomUUID()}`.replace(/-/g, "");
}

function getOrCreateResponseToken(persistenceKey: string) {
  const key = getResponseTokenKey(persistenceKey);
  try {
    const existing = window.localStorage.getItem(key);
    if (existing && /^[A-Za-z0-9_-]{32,128}$/.test(existing)) return existing;
    const token = createResponseToken();
    window.localStorage.setItem(key, token);
    return token;
  } catch {
    return createResponseToken();
  }
}

export function RecipientExperience({
  recipientName,
  senderName,
  occasion,
  giftType,
  finalMessage,
  children,
  revealMedia,
  finalMedia,
  preview = false,
  persistenceKey,
}: RecipientExperienceProps) {
  const [phase, setPhase] = useState<RecipientPhase>("intro");
  const [reaction, setReaction] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [replySaved, setReplySaved] = useState(false);
  const [responseStatus, setResponseStatus] = useState("");
  const [responseBusy, setResponseBusy] = useState(false);
  const [responseToken, setResponseToken] = useState<string | null>(null);
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
        setResponseToken(getOrCreateResponseToken(persistenceKey));
        const stored = window.localStorage.getItem(getResponseKey(persistenceKey));
        if (!stored) return;
        const saved = JSON.parse(stored) as Partial<SavedRecipientResponse>;
        if (saved.version !== 1) return;
        if (typeof saved.reaction === "string" || saved.reaction === null) setReaction(saved.reaction ?? null);
        if (typeof saved.reply === "string") {
          setReply(saved.reply.slice(0, 500));
          setReplySaved(Boolean(saved.reply.trim()));
        }
      } catch {
        setResponseStatus("This browser could not restore your previous response.");
      }
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [persistenceKey, preview]);

  useEffect(() => {
    if (preview || !persistenceKey || !responseToken) return;
    const controller = new AbortController();
    fetch(`/api/gifts/${encodeURIComponent(persistenceKey)}/response`, {
      cache: "no-store",
      signal: controller.signal,
      headers: { "X-Recipient-Response-Token": responseToken },
    })
      .then(async (serverResponse) => {
        if (!serverResponse.ok) return;
        const result = await serverResponse.json() as { response?: { reaction: string | null; reply: string | null } | null };
        if (!result.response) return;
        setReaction(result.response.reaction);
        setReply(result.response.reply ?? "");
        setReplySaved(Boolean(result.response.reply?.trim()));
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
      });
    return () => controller.abort();
  }, [persistenceKey, preview, responseToken]);

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
    if (!preview && persistenceKey) {
      void fetch(`/api/gifts/${encodeURIComponent(persistenceKey)}/open`, { method: "POST", keepalive: true }).catch(() => undefined);
    }
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

  const sendResponse = async (payload: { reaction?: string | null; reply?: string | null }, nextReaction: string | null, nextReply: string) => {
    const savedLocally = persistResponse(nextReaction, nextReply);
    if (preview || !persistenceKey) {
      if (savedLocally) setResponseStatus(preview ? "Preview response saved." : "Response saved on this device.");
      return;
    }

    setResponseBusy(true);
    try {
      const token = responseToken ?? getOrCreateResponseToken(persistenceKey);
      if (!responseToken) setResponseToken(token);
      const serverResponse = await fetch(`/api/gifts/${encodeURIComponent(persistenceKey)}/response`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Recipient-Response-Token": token },
        body: JSON.stringify(payload),
      });
      const result = await serverResponse.json() as { response?: { reaction: string | null; reply: string | null }; error?: { message?: string } };
      if (!serverResponse.ok || !result.response) throw new Error(result.error?.message ?? "Your response could not be sent.");
      setReaction(result.response.reaction);
      setReply(result.response.reply ?? "");
      setReplySaved(Boolean(result.response.reply?.trim()));
      setResponseStatus(`Response sent privately to ${senderName}.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Your response could not be sent.";
      setResponseStatus(savedLocally ? `${message} Your response is still saved on this device.` : message);
    } finally {
      setResponseBusy(false);
    }
  };

  const chooseReaction = (nextReaction: string) => {
    setReaction(nextReaction);
    void sendResponse({ reaction: nextReaction }, nextReaction, replySaved ? reply : "");
  };

  const submitReply = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanReply = reply.trim().slice(0, 500);
    if (!cleanReply) {
      setReplySaved(false);
      setResponseStatus("Write a short reply before saving it.");
      return;
    }
    setReply(cleanReply);
    void sendResponse({ reaction, reply: cleanReply }, reaction, cleanReply);
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
          {revealMedia}
          <button className="recipient-secondary-action" type="button" onClick={() => goTo("final")}>One more thing <span aria-hidden="true">→</span></button>
        </div>
      )}

      {phase === "final" && (
        <div className="recipient-flow-step recipient-final-step" ref={phaseRef} tabIndex={-1}>
          <span className="reveal-heart" aria-hidden="true">♥</span>
          <span className="recipient-flow-kicker">One last note</span>
          <blockquote>“{finalMessage || "This was made especially for you."}”</blockquote>
          <p className="recipient-final-from">— {senderName}</p>
          {finalMedia}

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
                  disabled={responseBusy}
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
              <textarea id="recipient-reply-message" value={reply} maxLength={500} rows={4} onChange={(event) => { setReply(event.target.value); setReplySaved(false); }} placeholder="Write something they would love to hear…" />
              <small>{reply.length}/500</small>
            </div>
            <button type="submit" disabled={responseBusy}>{responseBusy ? "Sending…" : replySaved ? "Reply sent" : "Send reply"}</button>
          </form>

          {responseStatus && <p className="recipient-reaction-status" role="status" aria-live="polite">{responseStatus}</p>}

          <div className="recipient-final-actions">
            <button className="recipient-primary-action" type="button" onClick={replay}>Replay gift</button>
            <small>{preview ? "Preview only · responses are not sent" : "Your response is shared privately with the sender · no account required"}</small>
            <small>Made with Dearly</small>
          </div>
        </div>
      )}
    </section>
  );
}
