import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

const ticketLifetimeSeconds = 60 * 60 * 12;

function accessSecret() {
  const secret = process.env.GIFT_ACCESS_SECRET;
  if (!secret || secret.length < 32) throw new Error("GIFT_ACCESS_SECRET must be configured with at least 32 characters.");
  return secret;
}

export function giftAccessCookieName(publicId: string) {
  return `dearly_access_${publicId}`;
}

function signature(publicId: string, version: number, expires: number) {
  return createHmac("sha256", accessSecret()).update(`${publicId}.${version}.${expires}`).digest("base64url");
}

export function createGiftAccessTicket(publicId: string, version: number) {
  const expires = Math.floor(Date.now() / 1000) + ticketLifetimeSeconds;
  return { value: `${version}.${expires}.${signature(publicId, version, expires)}`, maxAge: ticketLifetimeSeconds };
}

export function verifyGiftAccessTicket(publicId: string, version: number, ticket?: string) {
  if (!ticket) return false;
  const [ticketVersionRaw, expiresRaw, suppliedSignature] = ticket.split(".");
  const ticketVersion = Number(ticketVersionRaw);
  const expires = Number(expiresRaw);
  if (!Number.isInteger(ticketVersion) || ticketVersion !== version || !Number.isInteger(expires) || expires <= Math.floor(Date.now() / 1000) || !suppliedSignature) return false;
  const expected = signature(publicId, version, expires);
  const expectedBuffer = Buffer.from(expected);
  const suppliedBuffer = Buffer.from(suppliedSignature);
  return expectedBuffer.length === suppliedBuffer.length && timingSafeEqual(expectedBuffer, suppliedBuffer);
}

export function hashAccessClient(value: string) {
  return createHmac("sha256", accessSecret()).update(value || "unknown-client").digest("hex");
}
