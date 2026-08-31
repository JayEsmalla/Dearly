import { cookies, headers } from "next/headers";
import { giftAccessCookieName, hashAccessClient, verifyGiftAccessTicket } from "@/lib/gifts/access";
import { checkGiftResponseRateLimit, getGiftAccessPolicy, getGiftAvailability, getGiftResponse, getPublicGift, saveGiftResponse } from "@/lib/gifts/repository";
import { recipientResponseInputSchema } from "@/lib/gifts/schema";
import { SupabaseNotConfiguredError } from "@/lib/supabase/server";

function json(body: unknown, status: number) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

function getResponseToken(request: Request) {
  const token = request.headers.get("x-recipient-response-token")?.trim();
  return token && /^[A-Za-z0-9_-]{32,128}$/.test(token) ? token : null;
}

async function canRespond(publicId: string) {
  const [gift, policy] = await Promise.all([getPublicGift(publicId), getGiftAccessPolicy(publicId)]);
  if (!gift || !policy) return { ok: false as const, status: 404 };
  const availability = getGiftAvailability(gift);
  if (availability.state === "scheduled") return { ok: false as const, status: 423 };
  if (availability.state === "expired") return { ok: false as const, status: 410 };
  if (policy.pinProtected) {
    const ticket = (await cookies()).get(giftAccessCookieName(publicId))?.value;
    if (!verifyGiftAccessTicket(publicId, policy.accessVersion, ticket)) return { ok: false as const, status: 401 };
  }
  return { ok: true as const };
}

export async function GET(request: Request, { params }: { params: Promise<{ publicId: string }> }) {
  const { publicId } = await params;
  if (!/^[A-Za-z0-9_-]{10,24}$/.test(publicId)) return json({ error: { code: "invalid_gift" } }, 400);
  const responseToken = getResponseToken(request);
  if (!responseToken) return json({ response: null }, 200);
  try {
    const access = await canRespond(publicId);
    if (!access.ok) return json({ error: { code: "unavailable" } }, access.status);
    return json({ response: await getGiftResponse(publicId, responseToken) }, 200);
  } catch (error) {
    if (error instanceof SupabaseNotConfiguredError) return json({ error: { code: "gift_service_not_configured" } }, 503);
    console.error("Gift response read failed", error);
    return json({ error: { code: "response_read_failed" } }, 500);
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ publicId: string }> }) {
  const { publicId } = await params;
  if (!/^[A-Za-z0-9_-]{10,24}$/.test(publicId)) return json({ error: { code: "invalid_gift" } }, 400);
  const responseToken = getResponseToken(request);
  if (!responseToken) return json({ error: { code: "missing_response_token", message: "This browser could not create a private response token." } }, 400);

  let body: unknown;
  try { body = await request.json(); } catch { return json({ error: { code: "invalid_json" } }, 400); }
  const parsed = recipientResponseInputSchema.safeParse(body);
  if (!parsed.success) return json({ error: { code: "invalid_response", message: "Please check your reaction or reply." } }, 422);

  try {
    const access = await canRespond(publicId);
    if (!access.ok) return json({ error: { code: "unavailable" } }, access.status);
    const requestHeaders = await headers();
    const forwarded = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim();
    const clientHash = hashAccessClient(forwarded || requestHeaders.get("user-agent") || "unknown");
    if (!await checkGiftResponseRateLimit(publicId, clientHash)) {
      return json({ error: { code: "rate_limited", message: "Too many response updates. Try again in a few minutes." } }, 429);
    }

    const result = await saveGiftResponse(publicId, parsed.data, responseToken);
    if (result.state === "not_opened") return json({ error: { code: "gift_not_opened", message: "Open the gift before responding." } }, 409);
    if (result.state === "claimed") return json({ error: { code: "response_already_claimed", message: "A response to this gift is already linked to another browser." } }, 409);
    if (result.state === "empty") return json({ error: { code: "empty_response", message: "Choose a reaction or write a reply first." } }, 422);
    return json({ response: result.response }, 200);
  } catch (error) {
    if (error instanceof SupabaseNotConfiguredError) return json({ error: { code: "gift_service_not_configured" } }, 503);
    console.error("Gift response save failed", error);
    return json({ error: { code: "response_save_failed", message: "Your response could not be saved right now." } }, 500);
  }
}
