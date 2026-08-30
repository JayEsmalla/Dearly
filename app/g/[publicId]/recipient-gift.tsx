"use client";

import { RecipientExperience } from "@/app/ui/recipient-experience";
import { defaultGiftFormatDetails, GiftFormatExperience } from "@/app/create/personalize/gift-format-experience";
import type { PublicGift } from "@/lib/gifts/schema";

const themeColors = {
  rose: { color: "#d96f68", paper: "#fffaf5" },
  wine: { color: "#6d263b", paper: "#f8efea" },
  sage: { color: "#7f8d74", paper: "#f7f6ed" },
  gold: { color: "#bd8040", paper: "#fff5e3" },
} as const;

export default function RecipientGift({ gift }: { gift: PublicGift }) {
  const theme = themeColors[gift.theme];
  const style = { "--theme-color": theme.color, "--theme-paper": theme.paper } as React.CSSProperties;

  return (
    <main className="public-gift-page" style={style}>
      <span className="public-brand">♥ <i>Dearly</i></span>
      <RecipientExperience
        recipientName={gift.recipientName}
        senderName={gift.senderName}
        occasion={gift.occasion}
        giftType={gift.giftType}
        finalMessage={gift.message}
      >
        <GiftFormatExperience
          gift={gift.giftType}
          recipient={gift.recipientName}
          sender={gift.senderName}
          message={gift.message}
          details={defaultGiftFormatDetails}
        />
      </RecipientExperience>
    </main>
  );
}
