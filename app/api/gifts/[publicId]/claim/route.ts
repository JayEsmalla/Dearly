import { getRequestUser } from "@/lib/auth/server";
import { claimManagedGift } from "@/lib/gifts/repository";
import { SupabaseNotConfiguredError } from "@/lib/supabase/server";

function json(body: unknown, status: number) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request, { params }: { params: Promise<{ publicId: string }> }) {
  const managementToken = request.headers.get("x-management-token")?.trim();
  if (!managementToken || managementToken.length < 32 || managementToken.length > 128) {
    return json({ error: { code: "invalid_management_token", message: "A valid private management link is required." } }, 401);
  }

  try {
    const auth = await getRequestUser(request);
    if (auth.state !== "authenticated") return json({ error: { code: "sign_in_required", message: "Sign in before adding this gift to an account." } }, 401);
    const { publicId } = await params;
    const result = await claimManagedGift(publicId, managementToken, auth.user.id);
    if (!result) return json({ error: { code: "not_found", message: "This private gift link is invalid." } }, 404);
    if (result.state === "owned_by_other") return json({ error: { code: "already_claimed", message: "This gift is already attached to another account." } }, 409);
    return json({ gift: result.gift, claimed: result.state === "claimed" }, 200);
  } catch (error) {
    if (error instanceof SupabaseNotConfiguredError) return json({ error: { code: "account_service_not_configured", message: "Account services are not connected yet." } }, 503);
    console.error("Guest gift claim failed", error);
    return json({ error: { code: "claim_failed", message: "This gift could not be added to your account right now." } }, 500);
  }
}
