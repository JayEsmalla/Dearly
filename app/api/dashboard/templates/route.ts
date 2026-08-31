import { getRequestUser } from "@/lib/auth/server";
import { saveOwnedGiftAsTemplate } from "@/lib/gifts/repository";
import { saveGiftTemplateInputSchema } from "@/lib/gifts/schema";
import { SupabaseNotConfiguredError } from "@/lib/supabase/server";

function json(body: unknown, status: number) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  try {
    const auth = await getRequestUser(request);
    if (auth.state !== "authenticated") return json({ error: { code: "sign_in_required", message: "Sign in to save a template." } }, 401);
    let body: unknown;
    try { body = await request.json(); } catch { return json({ error: { code: "invalid_json" } }, 400); }
    const parsed = saveGiftTemplateInputSchema.safeParse(body);
    if (!parsed.success) return json({ error: { code: "invalid_template", message: "Give this template a short name." } }, 422);
    const template = await saveOwnedGiftAsTemplate(parsed.data.sourcePublicId, auth.user.id, parsed.data.name);
    return template ? json({ template }, 201) : json({ error: { code: "not_found", message: "The source gift could not be found." } }, 404);
  } catch (error) {
    if (error instanceof SupabaseNotConfiguredError) return json({ error: { code: "account_service_not_configured" } }, 503);
    console.error("Dashboard template save failed", error);
    return json({ error: { code: "template_save_failed", message: "This template could not be saved right now." } }, 500);
  }
}
