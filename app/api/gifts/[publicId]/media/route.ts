import { giftMediaTypeSchema } from "@/lib/gifts/schema";
import { authorizeGiftMediaRequest, GiftMediaError, listGiftMedia, uploadGiftMedia } from "@/lib/gifts/media";
import { SupabaseNotConfiguredError } from "@/lib/supabase/server";

export const runtime = "nodejs";

function json(body: unknown, status: number) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

function mediaError(error: unknown) {
  if (error instanceof GiftMediaError) return json({ error: { code: error.code, message: error.message } }, error.status);
  if (error instanceof SupabaseNotConfiguredError) return json({ error: { code: "gift_service_not_configured", message: "Media storage is not connected yet." } }, 503);
  console.error("Gift media request failed", error);
  return json({ error: { code: "media_failed", message: "Gift media could not be processed right now." } }, 500);
}

export async function GET(request: Request, { params }: { params: Promise<{ publicId: string }> }) {
  const { publicId } = await params;
  if (!/^[A-Za-z0-9_-]{10,24}$/.test(publicId)) return json({ error: { code: "invalid_gift" } }, 400);
  try {
    const target = await authorizeGiftMediaRequest(request, publicId);
    if (!target) return json({ error: { code: "unauthorized", message: "You do not have access to manage this gift's media." } }, 401);
    return json({ media: await listGiftMedia(target.id) }, 200);
  } catch (error) {
    return mediaError(error);
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ publicId: string }> }) {
  const { publicId } = await params;
  if (!/^[A-Za-z0-9_-]{10,24}$/.test(publicId)) return json({ error: { code: "invalid_gift" } }, 400);
  try {
    const target = await authorizeGiftMediaRequest(request, publicId);
    if (!target || target.status === "disabled" || target.status === "archived") return json({ error: { code: "not_editable", message: "This gift cannot accept media right now." } }, target ? 409 : 401);
    let form: FormData;
    try { form = await request.formData(); } catch { return json({ error: { code: "invalid_form", message: "Upload a valid media file." } }, 400); }
    const parsedType = giftMediaTypeSchema.safeParse(form.get("mediaType"));
    const file = form.get("file");
    const caption = typeof form.get("caption") === "string" ? String(form.get("caption")) : null;
    if (!parsedType.success || !(file instanceof File)) return json({ error: { code: "invalid_media", message: "Choose a supported media file." } }, 422);
    const media = await uploadGiftMedia(target.id, parsedType.data, file, caption);
    return json({ media }, 201);
  } catch (error) {
    return mediaError(error);
  }
}
