import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { publishedBuilderDataSchema, type ManageGiftUpdate, type ManagedGift, type PublishGiftInput, type PublicGift } from "./schema";

const publicGiftColumns = "public_id, occasion, gift_type, recipient_name, sender_name, message, theme, builder_data, opens_at, expires_at, published_at";
const managedGiftColumns = `${publicGiftColumns}, status, updated_at`;

function createPublicId() {
  return randomBytes(12).toString("base64url");
}

function createManagementToken() {
  return randomBytes(32).toString("base64url");
}

function hashManagementToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function normalizeBuilderData(value: unknown) {
  const parsed = publishedBuilderDataSchema.safeParse(value);
  return parsed.success ? parsed.data : publishedBuilderDataSchema.parse({});
}

function toPublicGift(row: {
  public_id: string;
  occasion: string;
  gift_type: string;
  recipient_name: string;
  sender_name: string;
  message: string;
  theme: "rose" | "wine" | "sage" | "gold";
  builder_data: unknown;
  opens_at: string | null;
  expires_at: string | null;
  published_at: string | null;
}): PublicGift {
  return {
    publicId: row.public_id,
    occasion: row.occasion,
    giftType: row.gift_type,
    recipientName: row.recipient_name,
    senderName: row.sender_name,
    message: row.message,
    theme: row.theme,
    builderData: normalizeBuilderData(row.builder_data),
    opensAt: row.opens_at,
    expiresAt: row.expires_at,
    publishedAt: row.published_at,
  };
}

function toManagedGift(row: Parameters<typeof toPublicGift>[0] & { status: "draft" | "wrapped" | "published" | "disabled"; updated_at: string }): ManagedGift {
  return {
    ...toPublicGift(row),
    status: row.status,
    updatedAt: row.updated_at,
  };
}

export async function publishGift(input: PublishGiftInput) {
  const supabase = createSupabaseAdmin();
  const publicId = createPublicId();
  const managementToken = createManagementToken();

  const { data, error } = await supabase
    .from("gifts")
    .insert({
      public_id: publicId,
      management_token_hash: hashManagementToken(managementToken),
      status: "published",
      published_at: new Date().toISOString(),
      occasion: input.occasion,
      gift_type: input.giftType,
      recipient_name: input.recipientName,
      sender_name: input.senderName,
      message: input.message,
      theme: input.theme,
      builder_data: input.builderData ?? {},
    })
    .select(publicGiftColumns)
    .single();

  if (error) throw error;
  return { gift: toPublicGift(data), managementToken };
}

export async function getPublicGift(publicId: string) {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("gifts")
    .select(publicGiftColumns)
    .eq("public_id", publicId)
    .eq("status", "published")
    .maybeSingle();

  if (error) throw error;
  return data ? toPublicGift(data) : null;
}

export async function getManagedGift(publicId: string, managementToken: string) {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("gifts")
    .select(managedGiftColumns)
    .eq("public_id", publicId)
    .eq("management_token_hash", hashManagementToken(managementToken))
    .maybeSingle();

  if (error) throw error;
  return data ? toManagedGift(data) : null;
}

export async function updateManagedGift(publicId: string, managementToken: string, input: ManageGiftUpdate) {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("gifts")
    .update({
      recipient_name: input.recipientName,
      sender_name: input.senderName,
      message: input.message,
      theme: input.theme,
      builder_data: input.builderData ?? {},
    })
    .eq("public_id", publicId)
    .eq("management_token_hash", hashManagementToken(managementToken))
    .neq("status", "disabled")
    .select(managedGiftColumns)
    .maybeSingle();

  if (error) throw error;
  return data ? toManagedGift(data) : null;
}

export async function disableManagedGift(publicId: string, managementToken: string) {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("gifts")
    .update({ status: "disabled" })
    .eq("public_id", publicId)
    .eq("management_token_hash", hashManagementToken(managementToken))
    .select(managedGiftColumns)
    .maybeSingle();

  if (error) throw error;
  return data ? toManagedGift(data) : null;
}

export function getGiftAvailability(gift: PublicGift) {
  const now = Date.now();

  if (gift.expiresAt && new Date(gift.expiresAt).getTime() <= now) {
    return { state: "expired" as const };
  }

  if (gift.opensAt && new Date(gift.opensAt).getTime() > now) {
    return { state: "scheduled" as const, opensAt: gift.opensAt };
  }

  return { state: "available" as const };
}
