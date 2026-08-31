"use client";

import { useEffect, useMemo, useState } from "react";

function remainingParts(target: number, now: number) {
  const total = Math.max(0, Math.floor((target - now) / 1000));
  return {
    total,
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

export default function ScheduledGift({ opensAt }: { opensAt: string }) {
  const target = useMemo(() => new Date(opensAt).getTime(), [opensAt]);
  const [now, setNow] = useState(() => Date.now());
  const remaining = remainingParts(target, now);

  useEffect(() => {
    if (remaining.total <= 0) {
      window.location.reload();
      return;
    }
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [remaining.total]);

  const openingLabel = new Intl.DateTimeFormat(undefined, {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(opensAt));

  return (
    <main className="scheduled-gift-page">
      <section className="scheduled-gift-card" aria-live="polite">
        <span className="scheduled-heart" aria-hidden="true">♥</span>
        <p>Dearly</p>
        <h1>Something thoughtful is waiting.</h1>
        <small>The sender asked us to keep this gift wrapped until <strong>{openingLabel}</strong>.</small>
        <div className="scheduled-countdown" aria-label={`Opens in ${remaining.days} days, ${remaining.hours} hours, ${remaining.minutes} minutes, ${remaining.seconds} seconds`}>
          <div><strong>{String(remaining.days).padStart(2, "0")}</strong><span>Days</span></div>
          <i aria-hidden="true">:</i>
          <div><strong>{String(remaining.hours).padStart(2, "0")}</strong><span>Hours</span></div>
          <i aria-hidden="true">:</i>
          <div><strong>{String(remaining.minutes).padStart(2, "0")}</strong><span>Minutes</span></div>
          <i aria-hidden="true">:</i>
          <div><strong>{String(remaining.seconds).padStart(2, "0")}</strong><span>Seconds</span></div>
        </div>
        <p className="scheduled-note">You can keep this page open. It will refresh when the moment arrives.</p>
      </section>
    </main>
  );
}
