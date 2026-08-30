import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getGiftAvailability, getPublicGift } from "@/lib/gifts/repository";
import { SupabaseNotConfiguredError } from "@/lib/supabase/server";
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
  try {
    gift = await getPublicGift(publicId);
  } catch (error) {
    if (error instanceof SupabaseNotConfiguredError) {
      return <UnavailableGift title="This gift service is being prepared." message="Please try this link again after Dearly is connected." />;
    }
    throw error;
  }

  if (!gift) notFound();

  const availability = getGiftAvailability(gift);
  if (availability.state === "expired") {
    return <UnavailableGift title="This gift is no longer available." message="The sender chose an expiration time for this gift." />;
  }

  if (availability.state === "scheduled") {
    return <UnavailableGift title="Not quite time yet." message={`Come back on ${new Intl.DateTimeFormat("en", { dateStyle: "long", timeStyle: "short" }).format(new Date(availability.opensAt))}.`} />;
  }

  return <RecipientGift gift={gift} />;
}
