import { cookies } from "next/headers";
import { giftAccessCookieName, verifyGiftAccessTicket } from "@/lib/gifts/access";
import { getGiftAccessPolicy, markGiftOpened } from "@/lib/gifts/repository";
import { SupabaseNotConfiguredError } from "@/lib/supabase/server";

export async function POST(_request: Request, { params }: { params: Promise<{ publicId: string }> }) {
  const { publicId } = await params;
  if (!/^[A-Za-z0-9_-]{10,24}$/.test(publicId)) return Response.json({ error: { code: "invalid_gift" } }, { status: 400 });
  try {
    const accessPolicy = await getGiftAccessPolicy(publicId);
    if (!accessPolicy) return Response.json({ error: { code: "not_found" } }, { status: 404 });
    if (accessPolicy.pinProtected) {
      const ticket = (await cookies()).get(giftAccessCookieName(publicId))?.value;
      if (!verifyGiftAccessTicket(publicId, accessPolicy.accessVersion, ticket)) {
        return Response.json({ error: { code: "locked" } }, { status: 401 });
      }
    }

    const opened = await markGiftOpened(publicId);
    return opened ? Response.json({ opened: true }, { status: 200, headers: { "Cache-Control": "no-store" } }) : Response.json({ error: { code: "not_found" } }, { status: 404 });
  } catch (error) {
    if (error instanceof SupabaseNotConfiguredError) return Response.json({ error: { code: "gift_service_not_configured" } }, { status: 503 });
    console.error("Gift open tracking failed", error);
    return Response.json({ error: { code: "open_tracking_failed" } }, { status: 500 });
  }
}
