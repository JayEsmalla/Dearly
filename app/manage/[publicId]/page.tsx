import type { Metadata } from "next";
import GuestGiftManager from "./guest-gift-manager";

export const metadata: Metadata = {
  title: "Manage your gift — Dearly",
  description: "Private guest gift management for Dearly.",
  robots: { index: false, follow: false },
};

type ManageGiftPageProps = {
  params: Promise<{ publicId: string }>;
  searchParams: Promise<{ token?: string | string[] }>;
};

export default async function ManageGiftPage({ params, searchParams }: ManageGiftPageProps) {
  const { publicId } = await params;
  const query = await searchParams;
  const token = Array.isArray(query.token) ? query.token[0] : query.token;

  return <GuestGiftManager publicId={publicId} token={token ?? ""} />;
}
