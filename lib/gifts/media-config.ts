export const giftMediaBucket = "gift-media";
export const maxGiftImages = 3;
export const imageUploadLimitBytes = 8 * 1024 * 1024;
export const backgroundAudioLimitBytes = 15 * 1024 * 1024;
export const voiceMessageLimitBytes = 20 * 1024 * 1024;
export const mediaSignedUrlLifetimeSeconds = 60 * 60;

export const acceptedImageMimes = new Set(["image/jpeg", "image/png", "image/webp"]);
export const acceptedAudioMimes = new Set(["audio/mpeg", "audio/mp4", "audio/ogg", "audio/webm", "audio/wav"]);

export function mediaUploadLimit(mediaType: "image" | "background_audio" | "voice") {
  if (mediaType === "image") return imageUploadLimitBytes;
  return mediaType === "background_audio" ? backgroundAudioLimitBytes : voiceMessageLimitBytes;
}
