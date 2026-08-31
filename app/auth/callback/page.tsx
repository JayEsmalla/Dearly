"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState(() => getSupabaseBrowser() ? "Finishing your sign-in…" : "Account services are not configured in this environment.");

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    const timeout = window.setTimeout(async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) {
        setStatus(error?.message ?? "We could not finish this sign-in. Please try again.");
        return;
      }
      router.replace("/dashboard");
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [router]);

  return <main className="auth-callback"><span aria-hidden="true">♥</span><p>Dearly</p><h1>{status}</h1><Link href="/login">Return to sign in</Link></main>;
}
