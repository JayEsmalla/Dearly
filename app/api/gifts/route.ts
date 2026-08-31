import { publishGift } from "@/lib/gifts/repository";
import { publishGiftInputSchema } from "@/lib/gifts/schema";
import { SupabaseNotConfiguredError } from "@/lib/supabase/server";

function json(body: unknown, status: number) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return json({ error: { code: "invalid_json", message: "The request body must be valid JSON." } }, 400);
  }

  const parsed = publishGiftInputSchema.safeParse(body);
  if (!parsed.success) {
    return json({
      error: {
        code: "invalid_gift",
        message: "Please check the gift details and try again.",
        fields: parsed.error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })),
      },
    }, 422);
  }

  try {
    const { gift, managementToken } = await publishGift(parsed.data);
    return json({
      gift,
      sharePath: `/g/${gift.publicId}`,
      managementPath: `/manage/${gift.publicId}?token=${encodeURIComponent(managementToken)}`,
      managementToken,
    }, 201);
  } catch (error) {
    if (error instanceof SupabaseNotConfiguredError) {
      return json({ error: { code: "gift_service_not_configured", message: "Publishing is not connected yet." } }, 503);
    }

    console.error("Gift publication failed", error);
    return json({ error: { code: "publish_failed", message: "The gift could not be published. Please try again." } }, 500);
  }
}
