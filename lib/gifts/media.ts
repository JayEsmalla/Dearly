import "server-only";

import { randomUUID } from "node:crypto";
import { fileTypeFromBuffer } from "file-type";
import sharp from "sharp";
import { getRequestUser } from "@/lib/auth/server";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";
import { authorizeGiftMedia } from "./repository";
import type { GiftMediaAsset, GiftMediaType } from "./schema";
import {
  acceptedAudioMimes,
  acceptedImageMimes,
  giftMediaBucket,
  maxGiftImages,
  mediaSignedUrlLifetimeSeconds,
  mediaUploadLimit,
} from "./media-config";

type MediaRow = Database["public"]["Tables"]["gift_media"]["Row"];

export class GiftMediaError extends Error {
  constructor(public code: string, message: string, public status = 400) {
    super(message);
    this.name = "GiftMediaError";
  }
}

function extensionForMime(mime: string) {
  if (mime === "audio/mpeg") return "mp3";
  if (mime === "audio/mp4") return "m4a";
  if (mime === "audio/ogg") return "ogg";
  if (mime === "audio/webm") return "webm";
  if (mime === "audio/wav") return "wav";
  return "bin";
}

function normalizeCaption(value: string | null | undefined) {
  const clean = value?.trim().slice(0, 72) ?? "";
  return clean || null;
}

async function signedUrl(path: string | null, expiresInSeconds = mediaSignedUrlLifetimeSeconds) {
  if (!path) return null;
  const { data, error } = await createSupabaseAdmin().storage.from(giftMediaBucket).createSignedUrl(path, expiresInSeconds);
  if (error) throw error;
  return data.signedUrl;
}

async function toGiftMediaAsset(row: MediaRow, expiresInSeconds = mediaSignedUrlLifetimeSeconds): Promise<GiftMediaAsset> {
  const [url, thumbnailUrl] = await Promise.all([signedUrl(row.storage_path, expiresInSeconds), signedUrl(row.thumbnail_path, expiresInSeconds)]);
  if (!url) throw new GiftMediaError("media_unavailable", "This media file is unavailable.", 404);
  return {
    id: row.id,
    mediaType: row.media_type,
    url,
    thumbnailUrl,
    mimeType: row.mime_type,
    bytes: row.bytes,
    width: row.width,
    height: row.height,
    caption: row.caption,
    sortOrder: row.sort_order,
  };
}

export async function authorizeGiftMediaRequest(request: Request, publicId: string) {
  const managementToken = request.headers.get("x-management-token")?.trim() ?? null;
  const auth = await getRequestUser(request);
  const ownerId = auth.state === "authenticated" ? auth.user.id : null;
  if (!managementToken && auth.state === "invalid") return null;
  return authorizeGiftMedia(publicId, managementToken, ownerId);
}

export async function listGiftMedia(giftId: string, expiresInSeconds = mediaSignedUrlLifetimeSeconds) {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("gift_media")
    .select("id, gift_id, media_type, storage_path, thumbnail_path, mime_type, bytes, width, height, caption, sort_order, created_at, updated_at")
    .eq("gift_id", giftId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return Promise.all(data.map((row) => toGiftMediaAsset(row, expiresInSeconds)));
}

export async function getRecipientGiftMedia(publicId: string, expiresAt: string | null = null) {
  const supabase = createSupabaseAdmin();
  const gift = await supabase.from("gifts").select("id").eq("public_id", publicId).in("status", ["published", "opened", "replied"]).maybeSingle();
  if (gift.error) throw gift.error;
  if (!gift.data) return [];
  const remainingLifetime = expiresAt ? Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000) : mediaSignedUrlLifetimeSeconds;
  const expiresInSeconds = Math.max(1, Math.min(mediaSignedUrlLifetimeSeconds, remainingLifetime));
  return listGiftMedia(gift.data.id, expiresInSeconds);
}

async function cleanupGiftMediaOrphans(giftId: string) {
  const supabase = createSupabaseAdmin();
  const [objects, rows] = await Promise.all([
    supabase.storage.from(giftMediaBucket).list(giftId, { limit: 100 }),
    supabase.from("gift_media").select("storage_path, thumbnail_path").eq("gift_id", giftId),
  ]);
  if (objects.error || rows.error) return;

  const expected = new Set<string>();
  for (const row of rows.data) {
    expected.add(row.storage_path.split("/").at(-1) ?? row.storage_path);
    if (row.thumbnail_path) expected.add(row.thumbnail_path.split("/").at(-1) ?? row.thumbnail_path);
  }
  const cutoff = Date.now() - 10 * 60 * 1000;
  const orphanPaths = objects.data.flatMap((entry) => {
    const createdAt = (entry as { created_at?: string }).created_at;
    if (expected.has(entry.name) || !createdAt || new Date(createdAt).getTime() > cutoff) return [];
    return [`${giftId}/${entry.name}`];
  });
  if (orphanPaths.length) await supabase.storage.from(giftMediaBucket).remove(orphanPaths);
}

async function uploadStorage(path: string, body: Buffer, contentType: string) {
  const result = await createSupabaseAdmin().storage.from(giftMediaBucket).upload(path, body, {
    contentType,
    cacheControl: "3600",
    upsert: false,
  });
  if (result.error) throw result.error;
}

export async function uploadGiftMedia(giftId: string, mediaType: GiftMediaType, file: File, caption?: string | null) {
  const limit = mediaUploadLimit(mediaType);
  if (!file.size || file.size > limit) {
    const mb = Math.floor(limit / (1024 * 1024));
    throw new GiftMediaError("file_too_large", `Keep this ${mediaType === "image" ? "image" : "audio file"} under ${mb} MB.`, 413);
  }

  const source = Buffer.from(await file.arrayBuffer());
  const detected = await fileTypeFromBuffer(source);
  if (!detected) throw new GiftMediaError("unknown_media", "This file type could not be verified.", 415);
  const supabase = createSupabaseAdmin();
  const cleanCaption = normalizeCaption(caption);

  if (mediaType === "image") {
    if (!acceptedImageMimes.has(detected.mime)) throw new GiftMediaError("invalid_image", "Use a JPG, PNG, or WebP image.", 415);
    const existing = await supabase.from("gift_media").select("id, sort_order", { count: "exact" }).eq("gift_id", giftId).eq("media_type", "image").order("sort_order", { ascending: false });
    if (existing.error) throw existing.error;
    if ((existing.count ?? existing.data.length) >= maxGiftImages) throw new GiftMediaError("image_limit", `A gift can contain up to ${maxGiftImages} images.`, 409);

    let processed: { data: Buffer; info: { width: number; height: number } };
    let thumbnail: Buffer;
    try {
      processed = await sharp(source).rotate().resize({ width: 1800, height: 1800, fit: "inside", withoutEnlargement: true }).webp({ quality: 82 }).toBuffer({ resolveWithObject: true });
      thumbnail = await sharp(source).rotate().resize({ width: 640, height: 640, fit: "inside", withoutEnlargement: true }).webp({ quality: 76 }).toBuffer();
    } catch {
      throw new GiftMediaError("invalid_image", "This image could not be safely processed.", 415);
    }

    const id = randomUUID();
    const storagePath = `${giftId}/${id}.webp`;
    const thumbnailPath = `${giftId}/${id}-thumb.webp`;
    await uploadStorage(storagePath, processed.data, "image/webp");
    try {
      await uploadStorage(thumbnailPath, thumbnail, "image/webp");
      const inserted = await supabase.from("gift_media").insert({
        gift_id: giftId,
        media_type: "image",
        storage_path: storagePath,
        thumbnail_path: thumbnailPath,
        mime_type: "image/webp",
        bytes: processed.data.byteLength,
        width: processed.info.width,
        height: processed.info.height,
        caption: cleanCaption,
        sort_order: (existing.data[0]?.sort_order ?? -1) + 1,
      }).select("id, gift_id, media_type, storage_path, thumbnail_path, mime_type, bytes, width, height, caption, sort_order, created_at, updated_at").single();
      if (inserted.error) throw inserted.error;
      await cleanupGiftMediaOrphans(giftId);
      return toGiftMediaAsset(inserted.data);
    } catch (error) {
      await supabase.storage.from(giftMediaBucket).remove([storagePath, thumbnailPath]);
      throw error;
    }
  }

  if (!acceptedAudioMimes.has(detected.mime)) throw new GiftMediaError("invalid_audio", "Use MP3, M4A/MP4, OGG, WebM, or WAV audio.", 415);
  const existing = await supabase.from("gift_media").select("id, gift_id, media_type, storage_path, thumbnail_path, mime_type, bytes, width, height, caption, sort_order, created_at, updated_at").eq("gift_id", giftId).eq("media_type", mediaType).maybeSingle();
  if (existing.error) throw existing.error;

  const id = randomUUID();
  const storagePath = `${giftId}/${id}.${extensionForMime(detected.mime)}`;
  await uploadStorage(storagePath, source, detected.mime);
  try {
    const values = {
      gift_id: giftId,
      media_type: mediaType,
      storage_path: storagePath,
      thumbnail_path: null,
      mime_type: detected.mime,
      bytes: source.byteLength,
      width: null,
      height: null,
      caption: cleanCaption,
      sort_order: mediaType === "background_audio" ? 100 : 101,
    };
    const saved = existing.data
      ? await supabase.from("gift_media").update(values).eq("id", existing.data.id).eq("gift_id", giftId).select("id, gift_id, media_type, storage_path, thumbnail_path, mime_type, bytes, width, height, caption, sort_order, created_at, updated_at").single()
      : await supabase.from("gift_media").insert(values).select("id, gift_id, media_type, storage_path, thumbnail_path, mime_type, bytes, width, height, caption, sort_order, created_at, updated_at").single();
    if (saved.error) throw saved.error;
    if (existing.data?.storage_path && existing.data.storage_path !== storagePath) await supabase.storage.from(giftMediaBucket).remove([existing.data.storage_path]);
    await cleanupGiftMediaOrphans(giftId);
    return toGiftMediaAsset(saved.data);
  } catch (error) {
    await supabase.storage.from(giftMediaBucket).remove([storagePath]);
    throw error;
  }
}

export async function updateGiftMediaCaption(giftId: string, mediaId: string, caption: string | null) {
  const supabase = createSupabaseAdmin();
  const updated = await supabase.from("gift_media").update({ caption: normalizeCaption(caption) }).eq("gift_id", giftId).eq("id", mediaId).select("id, gift_id, media_type, storage_path, thumbnail_path, mime_type, bytes, width, height, caption, sort_order, created_at, updated_at").maybeSingle();
  if (updated.error) throw updated.error;
  return updated.data ? toGiftMediaAsset(updated.data) : null;
}

export async function deleteGiftMedia(giftId: string, mediaId: string) {
  const supabase = createSupabaseAdmin();
  const removed = await supabase.from("gift_media").delete().eq("gift_id", giftId).eq("id", mediaId).select("storage_path, thumbnail_path").maybeSingle();
  if (removed.error) throw removed.error;
  if (!removed.data) return false;
  const paths = [removed.data.storage_path, removed.data.thumbnail_path].filter((path): path is string => Boolean(path));
  if (paths.length) {
    const storageDelete = await supabase.storage.from(giftMediaBucket).remove(paths);
    if (storageDelete.error) console.error("Gift media storage cleanup failed", storageDelete.error);
  }
  await cleanupGiftMediaOrphans(giftId);
  return true;
}
