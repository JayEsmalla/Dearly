import { z } from "zod";
import { authorizeGiftMediaRequest, deleteGiftMedia, GiftMediaError, updateGiftMediaCaption } from "@/lib/gifts/media";
import { SupabaseNotConfiguredError } from "@/lib/supabase/server";

export const runtime = "nodejs";

const captionSchema = z.object({ caption: z.string().trim().max(72).nullable() });

function json(body: unknown, status: number) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

function mediaError(error: unknown) {
  if (error instanceof GiftMediaError) return json({ error: { code: error.code, message: error.message } }, error.status);
  if (error instanceof SupabaseNotConfiguredError) return json({ error: { code: "gift_service_not_configured", message: "Media storage is not connected yet." } }, 503);
  console.error("Gift media item request failed", error);
  return json({ error: { code: "media_failed", message: "Gift media could not be updated right now." } }, 500);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ publicId: string; mediaId: string }> }) {
  const { publicId, mediaId } = await params;
  if (!/^[A-Za-z0-9_-]{10,24}$/.test(publicId) || !z.string().uuid().safeParse(mediaId).success) return json({ error: { code: "invalid_media" } }, 400);
  try {
    const target = await authorizeGiftMediaRequest(request, publicId);
    if (!target || target.status === "disabled" || target.status === "archived") return json({ error: { code: "not_editable" } }, target ? 409 : 401);
    let body: unknown;
    try { body = await request.json(); } catch { return json({ error: { code: "invalid_json" } }, 400); }
    const parsed = captionSchema.safeParse(body);
    if (!parsed.success) return json({ error: { code: "invalid_caption", message: "Captions can contain up to 72 characters." } }, 422);
    const media = await updateGiftMediaCaption(target.id, mediaId, parsed.data.caption);
    return media ? json({ media }, 200) : json({ error: { code: "not_found" } }, 404);
  } catch (error) {
    return mediaError(error);
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ publicId: string; mediaId: string }> }) {
  const { publicId, mediaId } = await params;
  if (!/^[A-Za-z0-9_-]{10,24}$/.test(publicId) || !z.string().uuid().safeParse(mediaId).success) return json({ error: { code: "invalid_media" } }, 400);
  try {
    const target = await authorizeGiftMediaRequest(request, publicId);
    if (!target) return json({ error: { code: "unauthorized" } }, 401);
    return await deleteGiftMedia(target.id, mediaId) ? json({ deleted: true }, 200) : json({ error: { code: "not_found" } }, 404);
  } catch (error) {
    return mediaError(error);
  }
}
