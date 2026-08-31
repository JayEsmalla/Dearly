import "server-only";

import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";
import { publishedBuilderDataSchema, type ManageGiftUpdate, type ManagedGift, type PublishGiftInput, type PublicGift, type RecipientResponse, type RecipientResponseInput } from "./schema";

const publicGiftColumns = "public_id, occasion, gift_type, recipient_name, sender_name, message, theme, builder_data, opens_at, expires_at, published_at";
const managedGiftColumns = `${publicGiftColumns}, status, updated_at, owner_id, pin_hash, access_version`;
const publicStatuses = ["published", "opened", "replied"] as const;
const pinAttemptLimit = 5;
const pinAttemptWindowMs = 10 * 60 * 1000;
const responseAttemptLimit = 10;
const responseAttemptWindowMs = 10 * 60 * 1000;

type GiftUpdate = Database["public"]["Tables"]["gifts"]["Update"];

function createPublicId() {
  return randomBytes(12).toString("base64url");
}

function createManagementToken() {
  return randomBytes(32).toString("base64url");
}

function hashManagementToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function hashRecipientResponseToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function derivePinHash(pin: string, salt: string) {
  return new Promise<Buffer>((resolve, reject) => {
    scrypt(pin, salt, 32, (error, derivedKey) => {
      if (error) reject(error);
      else resolve(derivedKey);
    });
  });
}

async function createPinProtection(pin: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = (await derivePinHash(pin, salt)).toString("hex");
  return { hash, salt };
}

async function matchesPin(pin: string, salt: string, storedHash: string) {
  if (!/^[a-f0-9]{64}$/i.test(storedHash)) return false;
  const candidate = await derivePinHash(pin, salt);
  const stored = Buffer.from(storedHash, "hex");
  return candidate.length === stored.length && timingSafeEqual(candidate, stored);
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

function toManagedGift(row: Parameters<typeof toPublicGift>[0] & {
  status: "draft" | "wrapped" | "published" | "opened" | "replied" | "disabled";
  updated_at: string;
  owner_id: string | null;
  pin_hash: string | null;
  access_version: number;
}): ManagedGift {
  return {
    ...toPublicGift(row),
    status: row.status,
    updatedAt: row.updated_at,
    ownerId: row.owner_id,
    pinProtected: Boolean(row.pin_hash),
  };
}

export async function publishGift(input: PublishGiftInput, ownerId: string | null = null) {
  const supabase = createSupabaseAdmin();
  const publicId = createPublicId();
  const managementToken = createManagementToken();
  const protection = input.pin ? await createPinProtection(input.pin) : null;

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
      owner_id: ownerId,
      claimed_at: ownerId ? new Date().toISOString() : null,
      opens_at: input.opensAt ?? null,
      expires_at: input.expiresAt ?? null,
      pin_hash: protection?.hash ?? null,
      pin_salt: protection?.salt ?? null,
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
    .in("status", [...publicStatuses])
    .maybeSingle();

  if (error) throw error;
  return data ? toPublicGift(data) : null;
}

export async function getGiftAccessPolicy(publicId: string) {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("gifts")
    .select("pin_hash, access_version")
    .eq("public_id", publicId)
    .in("status", [...publicStatuses])
    .maybeSingle();

  if (error) throw error;
  return data ? { pinProtected: Boolean(data.pin_hash), accessVersion: data.access_version } : null;
}

export async function verifyGiftPin(publicId: string, pin: string, clientHash: string) {
  const supabase = createSupabaseAdmin();
  const { data: gift, error: giftError } = await supabase
    .from("gifts")
    .select("id, pin_hash, pin_salt, access_version, expires_at")
    .eq("public_id", publicId)
    .in("status", [...publicStatuses])
    .maybeSingle();

  if (giftError) throw giftError;
  if (!gift || (gift.expires_at && new Date(gift.expires_at).getTime() <= Date.now())) return { state: "invalid" as const };
  if (!gift.pin_hash || !gift.pin_salt) return { state: "valid" as const, accessVersion: gift.access_version };

  const windowStart = new Date(Date.now() - pinAttemptWindowMs).toISOString();
  const { count, error: attemptError } = await supabase
    .from("gift_access_attempts")
    .select("id", { count: "exact", head: true })
    .eq("gift_id", gift.id)
    .eq("client_hash", clientHash)
    .gte("attempted_at", windowStart);

  if (attemptError) throw attemptError;
  if ((count ?? 0) >= pinAttemptLimit) return { state: "limited" as const };

  const valid = await matchesPin(pin, gift.pin_salt, gift.pin_hash);
  if (!valid) {
    const { error } = await supabase.from("gift_access_attempts").insert({ gift_id: gift.id, client_hash: clientHash });
    if (error) throw error;
    return { state: "invalid" as const };
  }

  const { error: cleanupError } = await supabase
    .from("gift_access_attempts")
    .delete()
    .eq("gift_id", gift.id)
    .eq("client_hash", clientHash);
  if (cleanupError) throw cleanupError;
  return { state: "valid" as const, accessVersion: gift.access_version };
}

export async function markGiftOpened(publicId: string) {
  const supabase = createSupabaseAdmin();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("gifts")
    .update({ status: "opened", opened_at: now })
    .eq("public_id", publicId)
    .eq("status", "published")
    .select("public_id")
    .maybeSingle();

  if (error) throw error;
  if (data) return true;

  const existing = await supabase
    .from("gifts")
    .select("public_id")
    .eq("public_id", publicId)
    .in("status", ["opened", "replied"])
    .maybeSingle();
  if (existing.error) throw existing.error;
  return Boolean(existing.data);
}

function toRecipientResponse(row: { reaction: RecipientResponse["reaction"]; reply: string | null; updated_at: string }): RecipientResponse {
  return { reaction: row.reaction, reply: row.reply, updatedAt: row.updated_at };
}

export async function getGiftResponse(publicId: string, responseToken: string) {
  const supabase = createSupabaseAdmin();
  const gift = await supabase.from("gifts").select("id").eq("public_id", publicId).in("status", ["opened", "replied"]).maybeSingle();
  if (gift.error) throw gift.error;
  if (!gift.data) return null;
  const response = await supabase
    .from("gift_responses")
    .select("reaction, reply, updated_at")
    .eq("gift_id", gift.data.id)
    .eq("response_token_hash", hashRecipientResponseToken(responseToken))
    .maybeSingle();
  if (response.error) throw response.error;
  return response.data ? toRecipientResponse(response.data) : null;
}

export async function checkGiftResponseRateLimit(publicId: string, clientHash: string) {
  const supabase = createSupabaseAdmin();
  const gift = await supabase.from("gifts").select("id").eq("public_id", publicId).in("status", ["opened", "replied"]).maybeSingle();
  if (gift.error) throw gift.error;
  if (!gift.data) return true;

  const windowStart = new Date(Date.now() - responseAttemptWindowMs).toISOString();
  const attempts = await supabase
    .from("gift_response_attempts")
    .select("id", { count: "exact", head: true })
    .eq("gift_id", gift.data.id)
    .eq("client_hash", clientHash)
    .gte("attempted_at", windowStart);
  if (attempts.error) throw attempts.error;
  if ((attempts.count ?? 0) >= responseAttemptLimit) return false;

  const recorded = await supabase.from("gift_response_attempts").insert({ gift_id: gift.data.id, client_hash: clientHash });
  if (recorded.error) throw recorded.error;

  const cleanupBefore = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const cleanup = await supabase.from("gift_response_attempts").delete().eq("gift_id", gift.data.id).lt("attempted_at", cleanupBefore);
  if (cleanup.error) throw cleanup.error;
  return true;
}

export async function saveGiftResponse(publicId: string, input: RecipientResponseInput, responseToken: string) {
  const supabase = createSupabaseAdmin();
  const gift = await supabase.from("gifts").select("id, status, opened_at").eq("public_id", publicId).in("status", ["opened", "replied"]).maybeSingle();
  if (gift.error) throw gift.error;
  if (!gift.data) return { state: "not_opened" as const };

  const responseTokenHash = hashRecipientResponseToken(responseToken);
  const existing = await supabase.from("gift_responses").select("reaction, reply, response_token_hash").eq("gift_id", gift.data.id).maybeSingle();
  if (existing.error) throw existing.error;
  if (existing.data && existing.data.response_token_hash !== responseTokenHash) return { state: "claimed" as const };

  const reaction = input.reaction !== undefined ? input.reaction : existing.data?.reaction ?? null;
  const reply = input.reply !== undefined ? (input.reply?.trim() || null) : existing.data?.reply ?? null;
  if (!reaction && !reply) return { state: "empty" as const };

  const response = existing.data
    ? await supabase.from("gift_responses").update({ reaction, reply }).eq("gift_id", gift.data.id).eq("response_token_hash", responseTokenHash).select("reaction, reply, updated_at").single()
    : await supabase.from("gift_responses").insert({ gift_id: gift.data.id, response_token_hash: responseTokenHash, reaction, reply }).select("reaction, reply, updated_at").single();
  if (response.error && !existing.data && response.error.code === "23505") return { state: "claimed" as const };
  if (response.error) throw response.error;
  if (gift.data.status !== "replied") {
    const statusUpdate = await supabase.from("gifts").update({ status: "replied", opened_at: gift.data.opened_at ?? new Date().toISOString() }).eq("id", gift.data.id);
    if (statusUpdate.error) throw statusUpdate.error;
  }
  return { state: "saved" as const, response: toRecipientResponse(response.data) };
}

export async function getManagedGiftResponse(publicId: string, managementToken: string) {
  const supabase = createSupabaseAdmin();
  const gift = await supabase.from("gifts").select("id").eq("public_id", publicId).eq("management_token_hash", hashManagementToken(managementToken)).maybeSingle();
  if (gift.error) throw gift.error;
  if (!gift.data) return null;
  const response = await supabase.from("gift_responses").select("reaction, reply, updated_at").eq("gift_id", gift.data.id).maybeSingle();
  if (response.error) throw response.error;
  return response.data ? toRecipientResponse(response.data) : null;
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
  const tokenHash = hashManagementToken(managementToken);
  const existing = await supabase
    .from("gifts")
    .select("id, access_version")
    .eq("public_id", publicId)
    .eq("management_token_hash", tokenHash)
    .neq("status", "disabled")
    .maybeSingle();

  if (existing.error) throw existing.error;
  if (!existing.data) return null;

  const updates: GiftUpdate = {
    recipient_name: input.recipientName,
    sender_name: input.senderName,
    message: input.message,
    theme: input.theme,
    builder_data: input.builderData ?? {},
  };

  if (input.opensAt !== undefined) updates.opens_at = input.opensAt;
  if (input.expiresAt !== undefined) updates.expires_at = input.expiresAt;
  if (input.pin !== undefined) {
    if (input.pin === null) {
      updates.pin_hash = null;
      updates.pin_salt = null;
    } else {
      const protection = await createPinProtection(input.pin);
      updates.pin_hash = protection.hash;
      updates.pin_salt = protection.salt;
    }
    updates.access_version = existing.data.access_version + 1;
  }

  const { data, error } = await supabase
    .from("gifts")
    .update(updates)
    .eq("id", existing.data.id)
    .select(managedGiftColumns)
    .maybeSingle();

  if (error) throw error;
  return data ? toManagedGift(data) : null;
}

export async function claimManagedGift(publicId: string, managementToken: string, ownerId: string) {
  const supabase = createSupabaseAdmin();
  const tokenHash = hashManagementToken(managementToken);
  const existing = await supabase
    .from("gifts")
    .select(managedGiftColumns)
    .eq("public_id", publicId)
    .eq("management_token_hash", tokenHash)
    .maybeSingle();

  if (existing.error) throw existing.error;
  if (!existing.data) return null;
  if (existing.data.owner_id && existing.data.owner_id !== ownerId) return { state: "owned_by_other" as const, gift: toManagedGift(existing.data) };
  if (existing.data.owner_id === ownerId) return { state: "already_owned" as const, gift: toManagedGift(existing.data) };

  const { data, error } = await supabase
    .from("gifts")
    .update({ owner_id: ownerId, claimed_at: new Date().toISOString() })
    .eq("public_id", publicId)
    .eq("management_token_hash", tokenHash)
    .is("owner_id", null)
    .select(managedGiftColumns)
    .maybeSingle();

  if (error) throw error;
  return data ? { state: "claimed" as const, gift: toManagedGift(data) } : null;
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
