"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BrandLink } from "@/app/ui/brand";
import { RecipientExperience } from "@/app/ui/recipient-experience";
import { defaultGiftFormatDetails, GiftFormatExperience, GiftFormatFields, type GiftFormatDetails } from "./gift-format-experience";

const themes = [
  { name: "Rose", color: "#d96f68", paper: "#fffaf5" },
  { name: "Wine", color: "#6d263b", paper: "#f8efea" },
  { name: "Sage", color: "#7f8d74", paper: "#f7f6ed" },
  { name: "Gold", color: "#bd8040", paper: "#fff5e3" },
];

const defaultFinalMessage = "No matter the occasion, I hope you remember how much you mean to me.";

type GiftEditorProps = { occasion: string; gift: string };
type PublishedGift = { publicId: string; shareUrl: string };
type LocalGiftDraft = {
  version: 1;
  recipient: string;
  sender: string;
  message: string;
  finalMessage?: string;
  details: GiftFormatDetails;
  themeName: string;
  savedAt: string;
};

const detailKeys: (keyof GiftFormatDetails)[] = [
  "headline", "flower", "memoryOne", "memoryTwo", "memoryThree",
  "surpriseOne", "surpriseTwo", "surpriseThree", "wishOne", "wishTwo", "wishThree",
];

const getDraftKey = (occasion: string, gift: string) => `dearly:draft:v1:${encodeURIComponent(occasion)}:${encodeURIComponent(gift)}`;

function restoreGiftDetails(value: unknown): GiftFormatDetails {
  const restored = { ...defaultGiftFormatDetails };
  if (!value || typeof value !== "object") return restored;
  const source = value as Record<string, unknown>;
  for (const key of detailKeys) {
    const candidate = source[key];
    if (typeof candidate === "string") restored[key] = candidate;
  }
  return restored;
}

export default function GiftEditor({ occasion, gift }: GiftEditorProps) {
  const [recipient, setRecipient] = useState("Mia");
  const [sender, setSender] = useState("Leo");
  const [message, setMessage] = useState("You make ordinary days feel worth remembering.");
  const [finalMessage, setFinalMessage] = useState(defaultFinalMessage);
  const [details, setDetails] = useState(defaultGiftFormatDetails);
  const [theme, setTheme] = useState(themes[0]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [, setHasPreviewed] = useState(false);
  const [, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishedGift, setPublishedGift] = useState<PublishedGift | null>(null);
  const [copied, setCopied] = useState(false);
  const [loadedDraftKey, setLoadedDraftKey] = useState<string | null>(null);
  const [draftStatus, setDraftStatus] = useState("Loading local draft…");
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const draftKey = getDraftKey(occasion, gift);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      let restoredRecipient = "Mia";
      let restoredSender = "Leo";
      let restoredMessage = "You make ordinary days feel worth remembering.";
      let restoredFinalMessage = defaultFinalMessage;
      let restoredDetails = { ...defaultGiftFormatDetails };
      let restoredTheme = themes[0];
      let restoredStatus = "Autosave ready";
      let restoredSavedAt: number | null = null;

      try {
        const stored = window.localStorage.getItem(draftKey);
        if (stored) {
          const draft = JSON.parse(stored) as Partial<LocalGiftDraft>;
          if (draft.version === 1) {
            if (typeof draft.recipient === "string") restoredRecipient = draft.recipient.slice(0, 40);
            if (typeof draft.sender === "string") restoredSender = draft.sender.slice(0, 40);
            if (typeof draft.message === "string") restoredMessage = draft.message.slice(0, 240);
            if (typeof draft.finalMessage === "string") restoredFinalMessage = draft.finalMessage.slice(0, 180);
            restoredDetails = restoreGiftDetails(draft.details);
            restoredTheme = themes.find((option) => option.name === draft.themeName) ?? themes[0];
            const savedTime = typeof draft.savedAt === "string" ? Date.parse(draft.savedAt) : Number.NaN;
            if (!Number.isNaN(savedTime)) restoredSavedAt = savedTime;
            restoredStatus = "Draft restored";
          }
        }
      } catch {
        restoredStatus = "Local storage unavailable";
      }

      setRecipient(restoredRecipient);
      setSender(restoredSender);
      setMessage(restoredMessage);
      setFinalMessage(restoredFinalMessage);
      setDetails(restoredDetails);
      setTheme(restoredTheme);
      setLastSavedAt(restoredSavedAt);
      setDraftStatus(restoredStatus);
      setLoadedDraftKey(draftKey);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [draftKey]);

  useEffect(() => {
    if (loadedDraftKey !== draftKey) return;
    const timeout = window.setTimeout(() => {
      try {
        const savedAt = new Date();
        const draft: LocalGiftDraft = {
          version: 1,
          recipient,
          sender,
          message,
          finalMessage,
          details,
          themeName: theme.name,
          savedAt: savedAt.toISOString(),
        };
        window.localStorage.setItem(draftKey, JSON.stringify(draft));
        setLastSavedAt(savedAt.getTime());
        setDraftStatus("Saved locally");
      } catch {
        setDraftStatus("Local storage unavailable");
      }
    }, 450);
    return () => window.clearTimeout(timeout);
  }, [details, draftKey, finalMessage, loadedDraftKey, message, recipient, sender, theme]);

  useEffect(() => {
    if (!previewOpen) return;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPreviewOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [previewOpen]);

  const openPreview = () => {
    setPreviewOpen(true);
    setHasPreviewed(true);
  };

  const resetPublication = () => {
    setHasPreviewed(false);
    setPublishedGift(null);
    setPublishError(null);
    setCopied(false);
    if (loadedDraftKey === draftKey) setDraftStatus("Unsaved changes");
  };

  const startFreshDraft = () => {
    resetPublication();
    try {
      window.localStorage.removeItem(draftKey);
    } catch {
      setDraftStatus("Local storage unavailable");
    }
    setRecipient("");
    setSender("");
    setMessage("");
    setFinalMessage("");
    setDetails({ ...defaultGiftFormatDetails });
    setTheme(themes[0]);
    setLastSavedAt(null);
    setDraftStatus("Fresh draft started");
  };

  const publishCurrentGift = async () => {
    setPublishing(true);
    setPublishError(null);

    try {
      const response = await fetch("/api/gifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          occasion,
          giftType: gift,
          recipientName: recipient,
          senderName: sender,
          message,
          theme: theme.name.toLowerCase(),
        }),
      });
      const result = await response.json() as {
        gift?: { publicId: string };
        sharePath?: string;
        managementToken?: string;
        error?: { code?: string; message?: string };
      };

      if (!response.ok || !result.gift || !result.sharePath) {
        if (result.error?.code === "gift_service_not_configured") {
          throw new Error("Publishing is ready, but the gift service still needs to be connected.");
        }
        throw new Error(result.error?.message ?? "The gift could not be published. Please try again.");
      }

      if (result.managementToken) {
        window.localStorage.setItem(`dearly:management:${result.gift.publicId}`, result.managementToken);
      }

      setPublishedGift({
        publicId: result.gift.publicId,
        shareUrl: new URL(result.sharePath, window.location.origin).toString(),
      });
    } catch (error) {
      setPublishError(error instanceof Error ? error.message : "The gift could not be published. Please try again.");
    } finally {
      setPublishing(false);
    }
  };

  const copyShareLink = async () => {
    if (!publishedGift) return;
    await navigator.clipboard.writeText(publishedGift.shareUrl);
    setCopied(true);
  };

  const previewStyle = { "--theme-color": theme.color, "--theme-paper": theme.paper } as React.CSSProperties;

  return (
    <main className="editor-shell">
      <header className="editor-header">
        <BrandLink className="workflow-brand" />
        <div className="editor-context"><span>{occasion}</span><i>·</i><span>{gift}</span></div>
        <Link className="workflow-exit" href={`/create?occasion=${encodeURIComponent(occasion)}`}>Back</Link>
      </header>

      <div className="editor-workspace">
        <section className="editor-controls" aria-labelledby="editor-title">
          <div className="editor-heading">
            <span className="step-label">Step 3 of 3</span>
            <h1 id="editor-title">Make it <em>personal.</em></h1>
            <p>Write the part only you could say. Your preview updates as you type.</p>
          </div>

          <div className="draft-status-row" role="status" aria-live="polite">
            <span><i aria-hidden="true" />{draftStatus}{lastSavedAt ? <small> · {new Date(lastSavedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</small> : null}</span>
            <button type="button" onClick={startFreshDraft}>Start fresh</button>
          </div>

          <div className="field-grid">
            <label><span>To</span><input value={recipient} maxLength={40} onChange={(event) => { resetPublication(); setRecipient(event.target.value); }} placeholder="Recipient name" /></label>
            <label><span>From</span><input value={sender} maxLength={40} onChange={(event) => { resetPublication(); setSender(event.target.value); }} placeholder="Your name" /></label>
          </div>

          <label className="message-field">
            <span>{gift === "Digital Letter" ? "Your letter" : gift === "Greeting Card" ? "Inside message" : gift === "Virtual Flowers" ? "Bouquet note" : gift === "Memory Album" ? "Album dedication" : gift === "Gift Box" ? "Final note" : "Jar dedication"} <small>{message.length}/240</small></span>
            <textarea value={message} maxLength={240} rows={4} onChange={(event) => { resetPublication(); setMessage(event.target.value); }} placeholder="Write what you want them to remember…" />
          </label>

          <GiftFormatFields gift={gift} details={details} onChange={(next) => { resetPublication(); setDetails(next); }} />

          <label className="message-field final-message-field">
            <span>Final reveal note <small>{finalMessage.length}/180</small></span>
            <textarea value={finalMessage} maxLength={180} rows={3} onChange={(event) => { resetPublication(); setFinalMessage(event.target.value); }} placeholder="Leave them with one last thought…" />
          </label>

          <fieldset className="theme-picker">
            <legend>Color mood</legend>
            <div className="theme-options">
              {themes.map((option) => (
                <button
                  aria-pressed={theme.name === option.name}
                  className={theme.name === option.name ? "selected" : ""}
                  key={option.name}
                  onClick={() => { resetPublication(); setTheme(option); }}
                  type="button"
                >
                  <i style={{ backgroundColor: option.color }} aria-hidden="true">{theme.name === option.name ? "✓" : ""}</i>
                  <span>{option.name}</span>
                </button>
              ))}
            </div>
          </fieldset>

          {!publishedGift ? (
            <>
              <button className="preview-button" type="button" onClick={openPreview} disabled={!recipient.trim() || !sender.trim() || !message.trim() || !finalMessage.trim()}>
                Wrap & preview <span aria-hidden="true">→</span>
              </button>
              <button className="publish-button" type="button" onClick={publishCurrentGift} disabled>
                Publishing returns after front-end completion
              </button>
              {publishError && <p className="publish-error" role="alert">{publishError}</p>}
              <p className="local-note"><span aria-hidden="true">i</span> Publishing is intentionally inactive while the front-end experience is completed.</p>
            </>
          ) : (
            <section className="share-panel" aria-live="polite">
              <span className="share-success">Gift published</span>
              <h2>Your link is ready.</h2>
              <p>Send this private link directly to {recipient}.</p>
              <input aria-label="Share link" readOnly value={publishedGift.shareUrl} onFocus={(event) => event.currentTarget.select()} />
              <div className="share-actions">
                <button type="button" onClick={copyShareLink}>{copied ? "Copied" : "Copy link"}</button>
                <a href={publishedGift.shareUrl} target="_blank" rel="noreferrer">Open gift ↗</a>
              </div>
            </section>
          )}
        </section>

        <section className="editor-preview" aria-label="Live gift preview" style={previewStyle}>
          <div className="preview-label"><span><i /> Live preview</span><span>Recipient view</span></div>
          <div className="preview-canvas">
            <span className="preview-occasion">{occasion}</span>
            <GiftFormatExperience gift={gift} recipient={recipient} sender={sender} message={message} details={details} compact />
            <span className="preview-watermark">Made with Dearly</span>
          </div>
        </section>
      </div>

      {previewOpen && (
        <div className="gift-modal" role="dialog" aria-modal="true" aria-label="Recipient gift preview" style={previewStyle}>
          <button className="modal-close" type="button" onClick={() => setPreviewOpen(false)} aria-label="Close recipient preview" autoFocus>×</button>
          <RecipientExperience
            recipientName={recipient}
            senderName={sender}
            occasion={occasion}
            giftType={gift}
            finalMessage={finalMessage}
            preview
          >
            <GiftFormatExperience gift={gift} recipient={recipient} sender={sender} message={message} details={details} />
          </RecipientExperience>
        </div>
      )}
    </main>
  );
}
