import { z } from "zod";
import { getRequestUser } from "@/lib/auth/server";
import { createOwnedDraftFromTemplate } from "@/lib/gifts/repository";
import { SupabaseNotConfiguredError } from "@/lib/supabase/server";

function json(body: unknown, status: number) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request, { params }: { params: Promise<{ templateId: string }> }) {
  try {
    const auth = await getRequestUser(request);
    if (auth.state !== "authenticated") return json({ error: { code: "sign_in_required", message: "Sign in to use this template." } }, 401);
    const { templateId } = await params;
    if (!z.string().uuid().safeParse(templateId).success) return json({ error: { code: "invalid_template" } }, 400);
    const gift = await createOwnedDraftFromTemplate(templateId, auth.user.id);
    return gift ? json({ gift }, 201) : json({ error: { code: "not_found", message: "This template could not be found." } }, 404);
  } catch (error) {
    if (error instanceof SupabaseNotConfiguredError) return json({ error: { code: "account_service_not_configured" } }, 503);
    console.error("Dashboard template use failed", error);
    return json({ error: { code: "template_use_failed", message: "A draft could not be created from this template." } }, 500);
  }
}
