"use client";

import { useState } from "react";
import type { PublicGift } from "@/lib/gifts/schema";

const themeColors = {
  rose: { color: "#d96f68", paper: "#fffaf5" },
  wine: { color: "#6d263b", paper: "#f8efea" },
  sage: { color: "#7f8d74", paper: "#f7f6ed" },
  gold: { color: "#bd8040", paper: "#fff5e3" },
} as const;

export default function RecipientGift({ gift }: { gift: PublicGift }) {
  const [opened, setOpened] = useState(false);
  const theme = themeColors[gift.theme];
  const style = { "--theme-color": theme.color, "--theme-paper": theme.paper } as React.CSSProperties;

  return (
    <main className="public-gift-page" style={style}>
      <span className="public-brand">♥ <i>Dearly</i></span>
      {!opened ? (
        <section className="public-wrapped-view">
          <p>A little something is waiting for</p>
          <h1>{gift.recipientName}</h1>
          <button className="public-wrapped-gift" type="button" onClick={() => setOpened(true)} aria-label="Open your gift">
            <span className="gift-lid" /><span className="gift-bow" /><i>♥</i>
          </button>
          <button className="public-open-button" type="button" onClick={() => setOpened(true)}>Open your gift</button>
          <small>Made with Dearly by {gift.senderName}</small>
        </section>
      ) : (
        <section className="public-unwrapped-view">
          <span className="reveal-heart" aria-hidden="true">♥</span>
          <p className="editable-to">Dear {gift.recipientName},</p>
          <blockquote>“{gift.message}”</blockquote>
          <p className="editable-from">Always, {gift.senderName}</p>
          <button type="button" onClick={() => setOpened(false)}>Replay opening</button>
        </section>
      )}
    </main>
  );
}
