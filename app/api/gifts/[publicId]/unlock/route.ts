import { cookies, headers } from "next/headers";
import { z } from "zod";
import { createGiftAccessTicket, giftAccessCookieName, hashAccessClient } from "@/lib/gifts/access";
import { verifyGiftPin } from "@/lib/gifts/repository";
import { SupabaseNotConfiguredError } from "@/lib/supabase/server";

const inputSchema = z.object({ pin: z.string().regex(/^\d{4,8}$/) });

export async function POST(request: Request, { params }: { params: Promise<{ publicId: string }> }) {
  const { publicId } = await params;
  if (!/^[A-Za-z0-9_-]{10,24}$/.test(publicId)) return Response.json({ error: { code: "invalid_gift", message: "This gift link is invalid." } }, { status: 400 });

  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ error: { code: "invalid_json", message: "Enter the gift PIN." } }, { status: 400 }); }
  const parsed = inputSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: { code: "invalid_pin", message: "PINs contain 4 to 8 numbers." } }, { status: 422 });

  try {
    const requestHeaders = await headers();
    const forwarded = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim();
    const clientHash = hashAccessClient(forwarded || requestHeaders.get("user-agent") || "unknown");
    const result = await verifyGiftPin(publicId, parsed.data.pin, clientHash);
    if (result.state === "limited") return Response.json({ error: { code: "rate_limited", message: "Too many incorrect attempts. Try again in a few minutes." } }, { status: 429 });
    if (result.state !== "valid") return Response.json({ error: { code: "wrong_pin", message: "That PIN is not correct." } }, { status: 401 });

    const ticket = createGiftAccessTicket(publicId, result.accessVersion);
    const cookieStore = await cookies();
    cookieStore.set(giftAccessCookieName(publicId), ticket.value, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: ticket.maxAge,
    });
    return Response.json({ unlocked: true }, { status: 200, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof SupabaseNotConfiguredError) return Response.json({ error: { code: "gift_service_not_configured", message: "Gift access is not connected yet." } }, { status: 503 });
    console.error("Gift PIN verification failed", error);
    return Response.json({ error: { code: "unlock_failed", message: "This gift could not be unlocked right now." } }, { status: 500 });
  }
}
