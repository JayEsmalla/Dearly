import { z } from "zod";
import { getRequestUser } from "@/lib/auth/server";
import { deleteOwnedGiftTemplate } from "@/lib/gifts/repository";
import { SupabaseNotConfiguredError } from "@/lib/supabase/server";

function json(body: unknown, status: number) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ templateId: string }> }) {
  try {
    const auth = await getRequestUser(request);
    if (auth.state !== "authenticated") return json({ error: { code: "sign_in_required", message: "Sign in to delete this template." } }, 401);
    const { templateId } = await params;
    if (!z.string().uuid().safeParse(templateId).success) return json({ error: { code: "invalid_template" } }, 400);
    const deleted = await deleteOwnedGiftTemplate(templateId, auth.user.id);
    return deleted ? json({ deleted: true }, 200) : json({ error: { code: "not_found", message: "This template could not be found." } }, 404);
  } catch (error) {
    if (error instanceof SupabaseNotConfiguredError) return json({ error: { code: "account_service_not_configured" } }, 503);
    console.error("Dashboard template deletion failed", error);
    return json({ error: { code: "template_delete_failed", message: "This template could not be deleted right now." } }, 500);
  }
}
