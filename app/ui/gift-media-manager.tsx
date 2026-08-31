"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import type { GiftMediaAsset, GiftMediaType } from "@/lib/gifts/schema";
import { backgroundAudioLimitBytes, imageUploadLimitBytes, maxGiftImages, voiceMessageLimitBytes } from "@/lib/gifts/media-config";

type Props = {
  publicId: string;
  managementToken?: string;
  disabled?: boolean;
  compact?: boolean;
};

function mb(bytes: number) {
  return `${Math.round(bytes / (1024 * 1024))} MB`;
}

function mediaLabel(type: GiftMediaType) {
  if (type === "image") return "Photo";
  return type === "background_audio" ? "Background audio" : "Voice message";
}

export function GiftMediaManager({ publicId, managementToken, disabled = false, compact = false }: Props) {
  const [media, setMedia] = useState<GiftMediaAsset[]>([]);
  const [captions, setCaptions] = useState<Record<string, string>>({});
  const [status, setStatus] = useState("Loading private media…");
  const [busy, setBusy] = useState(false);

  const getHeaders = useCallback(async () => {
    if (managementToken) return { "X-Management-Token": managementToken } as Record<string, string>;
    const session = await getSupabaseBrowser()?.auth.getSession();
    const token = session?.data.session?.access_token;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [managementToken]);

  const loadMedia = useCallback(async () => {
    const headers = await getHeaders();
    const response = await fetch(`/api/gifts/${encodeURIComponent(publicId)}/media`, { headers, cache: "no-store" });
    const result = await response.json() as { media?: GiftMediaAsset[]; error?: { message?: string } };
    if (!response.ok) throw new Error(result.error?.message ?? "Media could not be loaded.");
    const next = result.media ?? [];
    setMedia(next);
    setCaptions(Object.fromEntries(next.map((item) => [item.id, item.caption ?? ""])));
    setStatus(next.length ? "Private media is ready." : "No private media attached yet.");
  }, [getHeaders, publicId]);

  useEffect(() => {
    let active = true;
    const timeout = window.setTimeout(() => {
      void loadMedia().catch((error) => { if (active) setStatus(error instanceof Error ? error.message : "Media could not be loaded."); });
    }, 0);
    return () => { active = false; window.clearTimeout(timeout); };
  }, [loadMedia]);

  const uploadFiles = async (mediaType: GiftMediaType, files: FileList | null) => {
    if (!files?.length || disabled) return;
    const chosen = Array.from(files);
    const limit = mediaType === "image" ? imageUploadLimitBytes : mediaType === "background_audio" ? backgroundAudioLimitBytes : voiceMessageLimitBytes;
    if (chosen.some((file) => file.size > limit)) {
      setStatus(`${mediaLabel(mediaType)} files must stay under ${mb(limit)}.`);
      return;
    }
    if (mediaType === "image" && chosen.length > maxGiftImages - media.filter((item) => item.mediaType === "image").length) {
      setStatus(`A gift can contain up to ${maxGiftImages} photos.`);
      return;
    }

    setBusy(true);
    setStatus(`Uploading ${mediaLabel(mediaType).toLowerCase()}…`);
    try {
      const headers = await getHeaders();
      for (const file of mediaType === "image" ? chosen : chosen.slice(0, 1)) {
        const form = new FormData();
        form.append("mediaType", mediaType);
        form.append("file", file);
        const response = await fetch(`/api/gifts/${encodeURIComponent(publicId)}/media`, { method: "POST", headers, body: form });
        const result = await response.json() as { error?: { message?: string } };
        if (!response.ok) throw new Error(result.error?.message ?? `${mediaLabel(mediaType)} could not be uploaded.`);
      }
      await loadMedia();
      setStatus(`${mediaLabel(mediaType)} saved privately.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Media could not be uploaded.");
    } finally {
      setBusy(false);
    }
  };

  const saveCaption = async (item: GiftMediaAsset) => {
    setBusy(true);
    try {
      const headers = await getHeaders();
      const response = await fetch(`/api/gifts/${encodeURIComponent(publicId)}/media/${item.id}`, {
        method: "PATCH",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ caption: captions[item.id]?.trim() || null }),
      });
      const result = await response.json() as { error?: { message?: string } };
      if (!response.ok) throw new Error(result.error?.message ?? "Caption could not be saved.");
      await loadMedia();
      setStatus("Caption saved.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Caption could not be saved.");
    } finally {
      setBusy(false);
    }
  };

  const removeMedia = async (item: GiftMediaAsset) => {
    setBusy(true);
    try {
      const headers = await getHeaders();
      const response = await fetch(`/api/gifts/${encodeURIComponent(publicId)}/media/${item.id}`, { method: "DELETE", headers });
      const result = await response.json() as { error?: { message?: string } };
      if (!response.ok) throw new Error(result.error?.message ?? "Media could not be removed.");
      await loadMedia();
      setStatus(`${mediaLabel(item.mediaType)} removed.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Media could not be removed.");
    } finally {
      setBusy(false);
    }
  };

  const images = media.filter((item) => item.mediaType === "image");
  const background = media.find((item) => item.mediaType === "background_audio");
  const voice = media.find((item) => item.mediaType === "voice");

  return (
    <section className={`gift-media-manager${compact ? " gift-media-manager--compact" : ""}`} aria-labelledby={`media-title-${publicId}`}>
      <div className="gift-media-heading"><div><span className="mini-label">Private media</span><h3 id={`media-title-${publicId}`}>Photos & audio</h3></div><small>Signed links only · never public storage</small></div>
      <div className="gift-media-upload-grid">
        <label className={disabled || images.length >= maxGiftImages ? "disabled" : ""}><strong>Add photos</strong><small>{images.length}/{maxGiftImages} · JPG, PNG, WebP · {mb(imageUploadLimitBytes)} max</small><input type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={disabled || busy || images.length >= maxGiftImages} onChange={(event) => { void uploadFiles("image", event.currentTarget.files); event.currentTarget.value = ""; }} /></label>
        <label className={disabled ? "disabled" : ""}><strong>{background ? "Replace soundtrack" : "Add soundtrack"}</strong><small>MP3, M4A, OGG, WebM, WAV · {mb(backgroundAudioLimitBytes)} max</small><input type="file" accept="audio/mpeg,audio/mp4,audio/ogg,audio/webm,audio/wav" disabled={disabled || busy} onChange={(event) => { void uploadFiles("background_audio", event.currentTarget.files); event.currentTarget.value = ""; }} /></label>
        <label className={disabled ? "disabled" : ""}><strong>{voice ? "Replace voice message" : "Add voice message"}</strong><small>Optional · {mb(voiceMessageLimitBytes)} max</small><input type="file" accept="audio/mpeg,audio/mp4,audio/ogg,audio/webm,audio/wav" disabled={disabled || busy} onChange={(event) => { void uploadFiles("voice", event.currentTarget.files); event.currentTarget.value = ""; }} /></label>
      </div>

      {media.length > 0 && <div className="gift-media-list">
        {media.map((item) => <article className={`gift-media-item gift-media-item--${item.mediaType}`} key={item.id}>
          {item.mediaType === "image" ? <div className="gift-media-thumb" role="img" aria-label={item.caption || "Gift photo"} style={{ backgroundImage: `url(${item.thumbnailUrl ?? item.url})` }} /> : <div className="gift-media-audio"><span>{mediaLabel(item.mediaType)}</span><audio controls preload="metadata" src={item.url}>Your browser does not support audio playback.</audio></div>}
          <div className="gift-media-item-copy"><strong>{mediaLabel(item.mediaType)}</strong><small>{Math.max(1, Math.round(item.bytes / 1024))} KB{item.width && item.height ? ` · ${item.width}×${item.height}` : ""}</small><label><span>Caption / label</span><input value={captions[item.id] ?? ""} maxLength={72} disabled={disabled || busy} onChange={(event) => setCaptions((current) => ({ ...current, [item.id]: event.target.value }))} /></label></div>
          <div className="gift-media-actions"><button type="button" disabled={disabled || busy} onClick={() => void saveCaption(item)}>Save label</button><button type="button" disabled={disabled || busy} onClick={() => void removeMedia(item)}>Remove</button></div>
        </article>)}
      </div>}
      <p className="gift-media-status" role="status" aria-live="polite">{busy ? "Working with private media…" : status}</p>
    </section>
  );
}
