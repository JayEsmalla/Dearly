"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

export function AccountLink() {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    let active = true;
    supabase.auth.getSession().then(({ data }) => { if (active) setSignedIn(Boolean(data.session)); });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setSignedIn(Boolean(session)));
    return () => { active = false; data.subscription.unsubscribe(); };
  }, []);

  return <Link className="account-link" href={signedIn ? "/dashboard" : "/login"}>{signedIn ? "My gifts" : "Sign in"}</Link>;
}
