"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ManagedGift } from "@/lib/gifts/schema";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

const themeOptions = ["rose", "wine", "sage", "gold"] as const;

type Props = { publicId: string; token: string };

export default function GuestGiftManager({ publicId, token }: Props) {
  const [gift, setGift] = useState<ManagedGift | null>(null);
  const [recipientName, setRecipientName] = useState("");
  const [senderName, setSenderName] = useState("");
  const [message, setMessage] = useState("");
  const [theme, setTheme] = useState<(typeof themeOptions)[number]>("rose");
  const [status, setStatus] = useState(token ? "Loading your private gift…" : "This management link is missing its private token.");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [accountToken, setAccountToken] = useState<string | null>(null);

  const authorizationValue = `Bearer ${token}`;

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    let active = true;
    supabase.auth.getSession().then(({ data }) => { if (active) setAccountToken(data.session?.access_token ?? null); });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setAccountToken(session?.access_token ?? null));
    return () => { active = false; data.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!token) return;

    const controller = new AbortController();
    fetch(`/api/gifts/${encodeURIComponent(publicId)}/manage`, { headers: { Authorization: authorizationValue }, signal: controller.signal, cache: "no-store" })
      .then(async (response) => {
        const result = await response.json() as { gift?: ManagedGift; error?: { message?: string } };
        if (!response.ok || !result.gift) throw new Error(result.error?.message ?? "This private gift link is invalid.");
        setGift(result.gift);
        setRecipientName(result.gift.recipientName);
        setSenderName(result.gift.senderName);
        setMessage(result.gift.message);
        setTheme(result.gift.theme);
        setStatus("Private management link verified.");
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setStatus(error instanceof Error ? error.message : "This private gift link is invalid.");
      });

    return () => controller.abort();
  }, [authorizationValue, publicId, token]);

  const saveGift = async () => {
    if (!gift) return;
    setBusy(true);
    setStatus("Saving changes…");
    try {
      const response = await fetch(`/api/gifts/${encodeURIComponent(publicId)}/manage`, {
        method: "PATCH",
        headers: { Authorization: authorizationValue, "Content-Type": "application/json" },
        body: JSON.stringify({ recipientName, senderName, message, theme, builderData: gift.builderData }),
      });
      const result = await response.json() as { gift?: ManagedGift; error?: { message?: string } };
      if (!response.ok || !result.gift) throw new Error(result.error?.message ?? "The gift could not be updated.");
      setGift(result.gift);
      setStatus("Gift changes saved.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "The gift could not be updated.");
    } finally {
      setBusy(false);
    }
  };

  const disableGift = async () => {
    if (!gift || gift.status === "disabled") return;
    setBusy(true);
    setStatus("Disabling gift…");
    try {
      const response = await fetch(`/api/gifts/${encodeURIComponent(publicId)}/manage`, { method: "DELETE", headers: { Authorization: authorizationValue } });
      const result = await response.json() as { gift?: ManagedGift; error?: { message?: string } };
      if (!response.ok || !result.gift) throw new Error(result.error?.message ?? "The gift could not be disabled.");
      setGift(result.gift);
      setStatus("Gift disabled. The public link no longer opens the gift.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "The gift could not be disabled.");
    } finally {
      setBusy(false);
    }
  };

  const claimGift = async () => {
    if (!gift || !accountToken || gift.ownerId) return;
    setBusy(true);
    setStatus("Adding gift to your account…");
    try {
      const response = await fetch(`/api/gifts/${encodeURIComponent(publicId)}/claim`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accountToken}`, "X-Management-Token": token },
      });
      const result = await response.json() as { gift?: ManagedGift; error?: { message?: string } };
      if (!response.ok || !result.gift) throw new Error(result.error?.message ?? "The gift could not be added to your account.");
      setGift(result.gift);
      setStatus("Gift added to your Dearly account.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "The gift could not be added to your account.");
    } finally {
      setBusy(false);
    }
  };

  const copyGiftLink = async () => {
    const link = `${window.location.origin}/g/${publicId}`;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setStatus("Public gift link copied.");
  };

  if (!gift) {
    return (
      <main className="guest-manager-shell">
        <section className="guest-manager-loading" aria-live="polite">
          <span aria-hidden="true">♥</span><p>Dearly</p><h1>Private gift management</h1><small>{status}</small>
        </section>
      </main>
    );
  }

  const disabled = gift.status === "disabled";

  return (
    <main className="guest-manager-shell">
      <header className="guest-manager-header"><Link href="/">♥ Dearly</Link><span>Private guest management</span></header>
      <div className="guest-manager-layout">
        <aside className="guest-manager-summary">
          <span className="step-label">Guest gift</span>
          <h1>{recipientName || "Your gift"}</h1>
          <p>{gift.occasion} · {gift.giftType}</p>
          <dl>
            <div><dt>Status</dt><dd className={`gift-status gift-status--${gift.status}`}>{gift.status}</dd></div>
            <div><dt>Published</dt><dd>{gift.publishedAt ? new Date(gift.publishedAt).toLocaleString() : "Not yet"}</dd></div>
            <div><dt>Last updated</dt><dd>{new Date(gift.updatedAt).toLocaleString()}</dd></div>
          </dl>
          <button type="button" onClick={copyGiftLink}>{copied ? "Copied public link" : "Copy public link"}</button>
          {!disabled && <a href={`/g/${gift.publicId}`} target="_blank" rel="noreferrer">Open recipient view ↗</a>}
          {!gift.ownerId && accountToken && <button className="guest-claim-action" type="button" disabled={busy} onClick={claimGift}>Add to my account</button>}
          {!gift.ownerId && !accountToken && <Link className="guest-signin-link" href="/login">Sign in to save this gift</Link>}
          {gift.ownerId && <span className="guest-account-owned">✓ Saved to a Dearly account</span>}
        </aside>

        <section className="guest-manager-card" aria-labelledby="manage-title">
          <span className="step-label">Edit gift</span>
          <h2 id="manage-title">Keep it personal.</h2>
          <p>This private link lets you manage the gift without creating an account.</p>
          <div className="guest-manager-fields">
            <label><span>Recipient</span><input value={recipientName} maxLength={80} disabled={disabled} onChange={(event) => setRecipientName(event.target.value)} /></label>
            <label><span>Sender</span><input value={senderName} maxLength={80} disabled={disabled} onChange={(event) => setSenderName(event.target.value)} /></label>
            <label className="guest-manager-message"><span>Message</span><textarea value={message} maxLength={240} rows={5} disabled={disabled} onChange={(event) => setMessage(event.target.value)} /></label>
            <fieldset disabled={disabled}><legend>Color mood</legend><div>{themeOptions.map((option) => <button type="button" key={option} aria-pressed={theme === option} className={theme === option ? "selected" : ""} onClick={() => setTheme(option)}>{option}</button>)}</div></fieldset>
          </div>
          <div className="guest-manager-actions">
            <button className="button button--primary" type="button" disabled={busy || disabled || !recipientName.trim() || !senderName.trim() || !message.trim()} onClick={saveGift}>{busy ? "Working…" : "Save changes"}</button>
            <button className="guest-danger-action" type="button" disabled={busy || disabled} onClick={disableGift}>{disabled ? "Gift disabled" : "Disable public gift"}</button>
          </div>
          <p className="guest-manager-status" role="status" aria-live="polite">{status}</p>
        </section>
      </div>
    </main>
  );
}
