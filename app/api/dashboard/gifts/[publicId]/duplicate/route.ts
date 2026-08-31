import { getRequestUser } from "@/lib/auth/server";
import { duplicateOwnedGift } from "@/lib/gifts/repository";
import { SupabaseNotConfiguredError } from "@/lib/supabase/server";

function json(body: unknown, status: number) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request, { params }: { params: Promise<{ publicId: string }> }) {
  try {
    const auth = await getRequestUser(request);
    if (auth.state !== "authenticated") return json({ error: { code: "sign_in_required", message: "Sign in to duplicate this gift." } }, 401);
    const { publicId } = await params;
    if (!/^[A-Za-z0-9_-]{10,24}$/.test(publicId)) return json({ error: { code: "invalid_gift" } }, 400);
    const gift = await duplicateOwnedGift(publicId, auth.user.id);
    return gift ? json({ gift }, 201) : json({ error: { code: "not_found", message: "This gift could not be found." } }, 404);
  } catch (error) {
    if (error instanceof SupabaseNotConfiguredError) return json({ error: { code: "account_service_not_configured" } }, 503);
    console.error("Dashboard gift duplication failed", error);
    return json({ error: { code: "duplicate_failed", message: "This gift could not be duplicated right now." } }, 500);
  }
}
