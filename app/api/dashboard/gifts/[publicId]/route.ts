import { z } from "zod";
import { getRequestUser } from "@/lib/auth/server";
import { deleteOwnedGift, publishOwnedDraft, setOwnedGiftArchived, updateOwnedGift } from "@/lib/gifts/repository";
import { manageGiftUpdateSchema } from "@/lib/gifts/schema";
import { SupabaseNotConfiguredError } from "@/lib/supabase/server";

const actionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("update"), gift: manageGiftUpdateSchema }),
  z.object({ action: z.literal("archive") }),
  z.object({ action: z.literal("restore") }),
  z.object({ action: z.literal("publish") }),
]);

function json(body: unknown, status: number) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

async function owner(request: Request) {
  const auth = await getRequestUser(request);
  return auth.state === "authenticated" ? auth.user : null;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ publicId: string }> }) {
  try {
    const user = await owner(request);
    if (!user) return json({ error: { code: "sign_in_required", message: "Sign in to manage this gift." } }, 401);
    const { publicId } = await params;
    if (!/^[A-Za-z0-9_-]{10,24}$/.test(publicId)) return json({ error: { code: "invalid_gift" } }, 400);

    let body: unknown;
    try { body = await request.json(); } catch { return json({ error: { code: "invalid_json" } }, 400); }
    const parsed = actionSchema.safeParse(body);
    if (!parsed.success) return json({ error: { code: "invalid_action", message: "This gift action is invalid." } }, 422);

    if (parsed.data.action === "update") {
      const gift = await updateOwnedGift(publicId, user.id, parsed.data.gift);
      return gift ? json({ gift }, 200) : json({ error: { code: "not_editable", message: "This gift cannot be edited in its current state." } }, 409);
    }
    if (parsed.data.action === "archive" || parsed.data.action === "restore") {
      const gift = await setOwnedGiftArchived(publicId, user.id, parsed.data.action === "archive");
      return gift ? json({ gift }, 200) : json({ error: { code: "not_found", message: "This gift could not be found." } }, 404);
    }

    const result = await publishOwnedDraft(publicId, user.id);
    if (result.state === "expired") return json({ error: { code: "expired_schedule", message: "Update the expired delivery settings before publishing this draft." } }, 409);
    if (result.state !== "published" || !result.gift) return json({ error: { code: "not_draft", message: "Only drafts can be published from here." } }, 409);
    return json({ gift: result.gift }, 200);
  } catch (error) {
    if (error instanceof SupabaseNotConfiguredError) return json({ error: { code: "account_service_not_configured" } }, 503);
    console.error("Dashboard gift update failed", error);
    return json({ error: { code: "gift_update_failed", message: "This gift could not be updated right now." } }, 500);
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ publicId: string }> }) {
  try {
    const user = await owner(request);
    if (!user) return json({ error: { code: "sign_in_required", message: "Sign in to delete this gift." } }, 401);
    const { publicId } = await params;
    if (!/^[A-Za-z0-9_-]{10,24}$/.test(publicId)) return json({ error: { code: "invalid_gift" } }, 400);
    const deleted = await deleteOwnedGift(publicId, user.id);
    return deleted ? json({ deleted: true }, 200) : json({ error: { code: "not_found", message: "This gift could not be found." } }, 404);
  } catch (error) {
    if (error instanceof SupabaseNotConfiguredError) return json({ error: { code: "account_service_not_configured" } }, 503);
    console.error("Dashboard gift deletion failed", error);
    return json({ error: { code: "gift_delete_failed", message: "This gift could not be deleted right now." } }, 500);
  }
}
