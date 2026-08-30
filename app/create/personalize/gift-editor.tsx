"use client";

import Link from "next/link";
import { useState } from "react";

const themes = [
  { name: "Rose", color: "#dc756d", paper: "#fff9f2" },
  { name: "Burgundy", color: "#711f38", paper: "#f9eee8" },
  { name: "Sage", color: "#788168", paper: "#f7f5eb" },
  { name: "Golden", color: "#bd7a3a", paper: "#fff4df" },
];

type GiftEditorProps = { occasion: string; gift: string };

export default function GiftEditor({ occasion, gift }: GiftEditorProps) {
  const [recipient, setRecipient] = useState("Mia");
  const [sender, setSender] = useState("Leo");
  const [message, setMessage] = useState("You make the ordinary days feel like the ones I want to remember.");
  const [theme, setTheme] = useState(themes[0]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [unwrapped, setUnwrapped] = useState(false);

  const openPreview = () => {
    setUnwrapped(false);
    setPreviewOpen(true);
  };

  return (
    <main className="editor-shell">
      <header className="editor-header">
        <Link className="create-brand" href="/" aria-label="Dearly home"><span aria-hidden="true">♥</span> Dearly</Link>
        <div className="editor-context"><span>{occasion}</span><i>•</i><span>{gift}</span></div>
        <Link className="create-exit" href={`/create?occasion=${encodeURIComponent(occasion)}&gift=${encodeURIComponent(gift)}`}>Back</Link>
      </header>

      <div className="editor-workspace">
        <section className="editor-controls" aria-labelledby="editor-title">
          <p className="choice-step">Step 3 of 3 · Personalize</p>
          <h1 id="editor-title">Give it your<br /><em>own feeling.</em></h1>
          <p className="editor-intro">A few honest words are enough. You can see every change in the preview as you make it.</p>

          <div className="field-grid">
            <label><span>To</span><input value={recipient} maxLength={40} onChange={(event) => setRecipient(event.target.value)} placeholder="Recipient name" /></label>
            <label><span>From</span><input value={sender} maxLength={40} onChange={(event) => setSender(event.target.value)} placeholder="Your name" /></label>
          </div>
          <label className="message-field">
            <span>Your message <small>{message.length}/240</small></span>
            <textarea value={message} maxLength={240} rows={6} onChange={(event) => setMessage(event.target.value)} placeholder="Write what you want them to remember…" />
          </label>

          <fieldset className="theme-picker">
            <legend>Choose a mood</legend>
            <div>
              {themes.map((option) => (
                <button
                  aria-label={`${option.name} theme`}
                  aria-pressed={theme.name === option.name}
                  className={theme.name === option.name ? "selected" : ""}
                  key={option.name}
                  onClick={() => setTheme(option)}
                  style={{ backgroundColor: option.color }}
                  type="button"
                ><span>{option.name}</span></button>
              ))}
            </div>
          </fieldset>

          <button className="preview-button" type="button" onClick={openPreview} disabled={!recipient.trim() || !sender.trim() || !message.trim()}>
            Wrap & preview <span aria-hidden="true">→</span>
          </button>
          <p className="local-note">This Phase 1 preview stays on this device and is not published.</p>
        </section>

        <section className="editor-preview" aria-label="Live gift preview" style={{ "--theme-color": theme.color, "--theme-paper": theme.paper } as React.CSSProperties}>
          <div className="preview-browser">
            <div className="preview-browser-bar"><span /><span /><span /><small>dearly.app/g/your-gift</small></div>
            <div className="preview-canvas">
              <span className="preview-occasion">{occasion}</span>
              <article className="editable-gift">
                <p className="editable-to">Dear {recipient || "someone special"},</p>
                <span className="editable-flower" aria-hidden="true">✿</span>
                <blockquote>“{message || "Your message will appear here."}”</blockquote>
                <p className="editable-from">Always, {sender || "you"}</p>
              </article>
              <p className="live-indicator"><span /> Live preview</p>
            </div>
          </div>
        </section>
      </div>

      {previewOpen && (
        <div className="gift-modal" role="dialog" aria-modal="true" aria-label="Recipient gift preview" style={{ "--theme-color": theme.color, "--theme-paper": theme.paper } as React.CSSProperties}>
          <button className="modal-close" type="button" onClick={() => setPreviewOpen(false)} aria-label="Close preview">×</button>
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
              <button type="button" onClick={() => setUnwrapped(false)}>Replay the opening</button>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
