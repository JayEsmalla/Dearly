import { disableManagedGift, getManagedGift, updateManagedGift } from "@/lib/gifts/repository";
import { manageGiftUpdateSchema } from "@/lib/gifts/schema";
import { SupabaseNotConfiguredError } from "@/lib/supabase/server";

function json(body: unknown, status: number) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

function getManagementToken(request: Request) {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) return null;
  const token = authorization.slice(7).trim();
  return token.length >= 32 && token.length <= 128 ? token : null;
}

function serviceError(error: unknown) {
  if (error instanceof SupabaseNotConfiguredError) {
    return json({ error: { code: "gift_service_not_configured", message: "Gift management is not connected yet." } }, 503);
  }
  console.error("Guest gift management failed", error);
  return json({ error: { code: "management_failed", message: "This gift could not be managed right now." } }, 500);
}

export async function GET(request: Request, { params }: { params: Promise<{ publicId: string }> }) {
  const token = getManagementToken(request);
  if (!token) return json({ error: { code: "unauthorized", message: "A valid private management token is required." } }, 401);
  const { publicId } = await params;

  try {
    const gift = await getManagedGift(publicId, token);
    return gift ? json({ gift }, 200) : json({ error: { code: "not_found", message: "This private gift link is invalid." } }, 404);
  } catch (error) {
    return serviceError(error);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ publicId: string }> }) {
  const token = getManagementToken(request);
  if (!token) return json({ error: { code: "unauthorized", message: "A valid private management token is required." } }, 401);
  const { publicId } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: { code: "invalid_json", message: "The request body must be valid JSON." } }, 400);
  }

  const parsed = manageGiftUpdateSchema.safeParse(body);
  if (!parsed.success) return json({ error: { code: "invalid_gift", message: "Please check the gift details." } }, 422);

  try {
    const gift = await updateManagedGift(publicId, token, parsed.data);
    return gift ? json({ gift }, 200) : json({ error: { code: "not_found", message: "This gift is unavailable or disabled." } }, 404);
  } catch (error) {
    return serviceError(error);
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ publicId: string }> }) {
  const token = getManagementToken(request);
  if (!token) return json({ error: { code: "unauthorized", message: "A valid private management token is required." } }, 401);
  const { publicId } = await params;

  try {
    const gift = await disableManagedGift(publicId, token);
    return gift ? json({ gift }, 200) : json({ error: { code: "not_found", message: "This gift could not be found." } }, 404);
  } catch (error) {
    return serviceError(error);
  }
}
