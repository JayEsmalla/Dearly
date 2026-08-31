"use client";

import { RecipientExperience } from "@/app/ui/recipient-experience";
import { defaultGiftFormatDetails, GiftFormatExperience } from "@/app/create/personalize/gift-format-experience";
import type { GiftMediaAsset, PublicGift } from "@/lib/gifts/schema";
import type { GiftPhoto } from "@/app/create/personalize/builder-config";

const themeColors = {
  rose: { color: "#d96f68", paper: "#fffaf5" },
  wine: { color: "#6d263b", paper: "#f8efea" },
  sage: { color: "#7f8d74", paper: "#f7f6ed" },
  gold: { color: "#bd8040", paper: "#fff5e3" },
} as const;

function AudioGiftMedia({ media, label }: { media?: GiftMediaAsset; label: string }) {
  if (!media) return null;
  return (
    <section className="recipient-media-player" aria-label={label}>
      <div><span aria-hidden="true">♪</span><div><strong>{label}</strong>{media.caption && <small>{media.caption}</small>}</div></div>
      <audio controls preload="metadata" src={media.url}>Your browser does not support audio playback.</audio>
    </section>
  );
}

export default function RecipientGift({ gift, media }: { gift: PublicGift; media: GiftMediaAsset[] }) {
  const theme = themeColors[gift.theme];
  const style = { "--theme-color": theme.color, "--theme-paper": theme.paper } as React.CSSProperties;
  const details = { ...defaultGiftFormatDetails, ...gift.builderData.details };
  const photos: GiftPhoto[] = media.filter((item) => item.mediaType === "image").map((item, index) => ({
    id: item.id,
    name: item.caption || `Gift photo ${index + 1}`,
    dataUrl: item.url,
    caption: item.caption ?? "",
  }));
  const backgroundAudio = media.find((item) => item.mediaType === "background_audio");
  const voiceMessage = media.find((item) => item.mediaType === "voice");

  return (
    <main className="public-gift-page" style={style}>
      <span className="public-brand">♥ <i>Dearly</i></span>
      <RecipientExperience
        recipientName={gift.recipientName}
        senderName={gift.senderName}
        occasion={gift.occasion}
        giftType={gift.giftType}
        finalMessage={gift.builderData.finalMessage || gift.message}
        persistenceKey={gift.publicId}
        revealMedia={<AudioGiftMedia media={backgroundAudio} label="Gift soundtrack" />}
        finalMedia={<AudioGiftMedia media={voiceMessage} label={`Voice message from ${gift.senderName}`} />}
      >
        <GiftFormatExperience
          gift={gift.giftType}
          recipient={gift.recipientName}
          sender={gift.senderName}
          message={gift.message}
          signature={gift.builderData.signature}
          details={details}
          photos={photos}
          presentation={gift.builderData.presentation}
          finalMessage={gift.builderData.finalMessage}
        />
      </RecipientExperience>
    </main>
  );
}
