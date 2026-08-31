import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { giftAccessCookieName, verifyGiftAccessTicket } from "@/lib/gifts/access";
import { getGiftAccessPolicy, getGiftAvailability, getPublicGift } from "@/lib/gifts/repository";
import { getRecipientGiftMedia } from "@/lib/gifts/media";
import type { GiftMediaAsset } from "@/lib/gifts/schema";
import { SupabaseNotConfiguredError } from "@/lib/supabase/server";
import PinUnlock from "./pin-unlock";
import ScheduledGift from "./scheduled-gift";
import RecipientGift from "./recipient-gift";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "A gift is waiting for you — Dearly",
  description: "Open a thoughtful digital gift made with Dearly.",
  robots: { index: false, follow: false },
};

type GiftPageProps = {
  params: Promise<{ publicId: string }>;
};

function UnavailableGift({ title, message }: { title: string; message: string }) {
  return (
    <main className="gift-unavailable">
      <span aria-hidden="true">♥</span>
      <p>Dearly</p>
      <h1>{title}</h1>
      <small>{message}</small>
    </main>
  );
}

export default async function GiftPage({ params }: GiftPageProps) {
  const { publicId } = await params;
  if (!/^[A-Za-z0-9_-]{10,24}$/.test(publicId)) notFound();

  let gift;
  let accessPolicy;
  try {
    [gift, accessPolicy] = await Promise.all([getPublicGift(publicId), getGiftAccessPolicy(publicId)]);
  } catch (error) {
    if (error instanceof SupabaseNotConfiguredError) {
      return <UnavailableGift title="This gift service is being prepared." message="Please try this link again after Dearly is connected." />;
    }
    throw error;
  }

  if (!gift || !accessPolicy) notFound();

  const availability = getGiftAvailability(gift);
  if (availability.state === "expired") {
    return <UnavailableGift title="This gift is no longer available." message="The sender chose an expiration time for this gift." />;
  }

  if (availability.state === "scheduled") {
    return <ScheduledGift opensAt={availability.opensAt} />;
  }

  if (accessPolicy.pinProtected) {
    const cookieStore = await cookies();
    const ticket = cookieStore.get(giftAccessCookieName(publicId))?.value;
    if (!verifyGiftAccessTicket(publicId, accessPolicy.accessVersion, ticket)) {
      return <PinUnlock publicId={publicId} />;
    }
  }

  let media: GiftMediaAsset[] = [];
  try {
    media = await getRecipientGiftMedia(publicId, gift.expiresAt);
  } catch (error) {
    console.error("Recipient gift media could not be loaded", error);
  }

  return <RecipientGift gift={gift} media={media} />;
}
