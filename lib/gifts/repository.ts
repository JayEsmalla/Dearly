import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import type { PublishGiftInput, PublicGift } from "./schema";

const publicGiftColumns = "public_id, occasion, gift_type, recipient_name, sender_name, message, theme, opens_at, expires_at, published_at";

function createPublicId() {
  return randomBytes(12).toString("base64url");
}

function createManagementToken() {
  return randomBytes(32).toString("base64url");
}

function hashManagementToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function toPublicGift(row: {
  public_id: string;
  occasion: string;
  gift_type: string;
  recipient_name: string;
  sender_name: string;
  message: string;
  theme: "rose" | "wine" | "sage" | "gold";
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
    opensAt: row.opens_at,
    expiresAt: row.expires_at,
    publishedAt: row.published_at,
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

