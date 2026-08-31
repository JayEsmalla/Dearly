import { getRequestUser } from "@/lib/auth/server";
import { listOwnedGifts, listOwnedGiftTemplates } from "@/lib/gifts/repository";
import { SupabaseNotConfiguredError } from "@/lib/supabase/server";

function json(body: unknown, status: number) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export async function GET(request: Request) {
  try {
    const auth = await getRequestUser(request);
    if (auth.state !== "authenticated") return json({ error: { code: "sign_in_required", message: "Sign in to view your gifts." } }, 401);

    const [gifts, templates] = await Promise.all([
      listOwnedGifts(auth.user.id),
      listOwnedGiftTemplates(auth.user.id),
    ]);
    const activeGifts = gifts.filter((gift) => !["archived", "disabled"].includes(gift.status));
    return json({
      email: auth.user.email ?? "",
      gifts,
      templates,
      metrics: {
        created: activeGifts.length,
        opened: activeGifts.filter((gift) => Boolean(gift.openedAt)).length,
        reactions: activeGifts.filter((gift) => Boolean(gift.response)).length,
      },
    }, 200);
  } catch (error) {
    if (error instanceof SupabaseNotConfiguredError) return json({ error: { code: "account_service_not_configured", message: "Account services are not connected yet." } }, 503);
    console.error("Dashboard gift list failed", error);
    return json({ error: { code: "dashboard_failed", message: "Your gifts could not be loaded right now." } }, 500);
  }
}
