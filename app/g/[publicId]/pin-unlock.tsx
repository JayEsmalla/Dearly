"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function PinUnlock({ publicId }: { publicId: string }) {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setStatus("");
    try {
      const response = await fetch(`/api/gifts/${encodeURIComponent(publicId)}/unlock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      const result = await response.json() as { unlocked?: boolean; error?: { message?: string } };
      if (!response.ok || !result.unlocked) throw new Error(result.error?.message ?? "That PIN could not unlock this gift.");
      setStatus("Unlocked. Opening your gift…");
      router.refresh();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "That PIN could not unlock this gift.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="gift-unavailable gift-pin-gate">
      <span aria-hidden="true">♥</span><p>Dearly</p><h1>This gift is private.</h1><small>Enter the PIN the sender shared with you.</small>
      <form onSubmit={submit}>
        <label htmlFor="gift-pin">Gift PIN</label>
        <input id="gift-pin" inputMode="numeric" pattern="[0-9]{4,8}" minLength={4} maxLength={8} autoComplete="one-time-code" required value={pin} onChange={(event) => setPin(event.target.value.replace(/\D/g, "").slice(0, 8))} />
        <button type="submit" disabled={busy || pin.length < 4}>{busy ? "Checking…" : "Unlock gift"}</button>
      </form>
      {status && <div className="gift-pin-status" role="status" aria-live="polite">{status}</div>}
    </main>
  );
}
