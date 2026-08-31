"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

export default function AccountDashboardShell() {
  const router = useRouter();
  const [state, setState] = useState<"loading" | "signed-in" | "guest" | "unconfigured">("loading");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      const timeout = window.setTimeout(() => setState("unconfigured"), 0);
      return () => window.clearTimeout(timeout);
    }
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setEmail(data.session?.user.email ?? "");
      setState(data.session ? "signed-in" : "guest");
    });
    return () => { active = false; };
  }, []);

  const signOut = async () => {
    await getSupabaseBrowser()?.auth.signOut();
    router.push("/");
  };

  return (
    <section className="account-dashboard-intro">
      <span className="step-label">Your Dearly account</span>
      <h1>{state === "signed-in" ? "Your gifts, together." : "Account dashboard"}</h1>
      {state === "loading" && <p>Loading your account…</p>}
      {state === "signed-in" && <><p>Signed in as {email}. Your full gift dashboard arrives in Phase 14; account ownership is active now.</p><div><Link className="button button--primary" href="/create">Create another gift</Link><button className="button button--quiet" type="button" onClick={signOut}>Sign out</button></div></>}
      {state === "guest" && <><p>Sign in to see account-owned gifts and future reactions.</p><Link className="button button--primary" href="/login">Sign in</Link></>}
      {state === "unconfigured" && <p>Account services need Supabase browser environment variables before sign-in can run.</p>}
    </section>
  );
}
