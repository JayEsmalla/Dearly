"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BrandLink } from "@/app/ui/brand";

const themes = [
  { name: "Rose", color: "#d96f68", paper: "#fffaf5" },
  { name: "Wine", color: "#6d263b", paper: "#f8efea" },
  { name: "Sage", color: "#7f8d74", paper: "#f7f6ed" },
  { name: "Gold", color: "#bd8040", paper: "#fff5e3" },
];

type GiftEditorProps = { occasion: string; gift: string };
type PublishedGift = { publicId: string; shareUrl: string };

export default function GiftEditor({ occasion, gift }: GiftEditorProps) {
  const [recipient, setRecipient] = useState("Mia");
  const [sender, setSender] = useState("Leo");
  const [message, setMessage] = useState("You make ordinary days feel worth remembering.");
  const [theme, setTheme] = useState(themes[0]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [unwrapped, setUnwrapped] = useState(false);
  const [hasPreviewed, setHasPreviewed] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishedGift, setPublishedGift] = useState<PublishedGift | null>(null);
  const [copied, setCopied] = useState(false);

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
    setUnwrapped(false);
    setPreviewOpen(true);
    setHasPreviewed(true);
  };

  const resetPublication = () => {
    setHasPreviewed(false);
    setPublishedGift(null);
    setPublishError(null);
    setCopied(false);
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

          <div className="field-grid">
            <label><span>To</span><input value={recipient} maxLength={40} onChange={(event) => { resetPublication(); setRecipient(event.target.value); }} placeholder="Recipient name" /></label>
            <label><span>From</span><input value={sender} maxLength={40} onChange={(event) => { resetPublication(); setSender(event.target.value); }} placeholder="Your name" /></label>
          </div>

          <label className="message-field">
            <span>Your message <small>{message.length}/240</small></span>
            <textarea value={message} maxLength={240} rows={4} onChange={(event) => { resetPublication(); setMessage(event.target.value); }} placeholder="Write what you want them to remember…" />
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
              <button className="preview-button" type="button" onClick={openPreview} disabled={!recipient.trim() || !sender.trim() || !message.trim()}>
                Wrap & preview <span aria-hidden="true">→</span>
              </button>
              <button className="publish-button" type="button" onClick={publishCurrentGift} disabled={!hasPreviewed || publishing}>
                {publishing ? "Publishing…" : "Publish & get link"}
              </button>
              {publishError && <p className="publish-error" role="alert">{publishError}</p>}
              <p className="local-note"><span aria-hidden="true">i</span> Preview first, then publish when everything feels right.</p>
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
            <article className="editable-gift">
              <p className="editable-to">Dear {recipient || "someone special"},</p>
              <span className="editable-flower" aria-hidden="true">✿</span>
              <blockquote>“{message || "Your message will appear here."}”</blockquote>
              <p className="editable-from">Always, {sender || "you"}</p>
            </article>
            <span className="preview-watermark">Made with Dearly</span>
          </div>
        </section>
      </div>

      {previewOpen && (
        <div className="gift-modal" role="dialog" aria-modal="true" aria-label="Recipient gift preview" style={previewStyle}>
          <button className="modal-close" type="button" onClick={() => setPreviewOpen(false)} aria-label="Close recipient preview" autoFocus>×</button>
          {!unwrapped ? (
            <div className="wrapped-view">
              <p>A little something is waiting for</p>
              <h2>{recipient}</h2>
              <button className="wrapped-gift" type="button" onClick={() => setUnwrapped(true)} aria-label="Open your gift"><span className="gift-lid" /><span className="gift-bow" /><i>♥</i></button>
              <button className="unwrap-button" type="button" onClick={() => setUnwrapped(true)}>Open your gift</button>
              <small>Made with Dearly by {sender}</small>
            </div>
          ) : (
            <div className="unwrapped-view">
              <span className="reveal-heart" aria-hidden="true">♥</span>
              <p className="editable-to">Dear {recipient},</p>
              <blockquote>“{message}”</blockquote>
              <p className="editable-from">Always, {sender}</p>
              <button type="button" onClick={() => setUnwrapped(false)}>Replay opening</button>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
