"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

type Mode = "signin" | "signup";

export default function AuthPanel() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      setStatus("Account services are not configured in this environment yet.");
      return;
    }

    setBusy(true);
    setStatus("");
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        router.push("/dashboard");
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        });
        if (error) throw error;
        setStatus(data.session ? "Account created. Opening your dashboard…" : "Check your email to confirm your Dearly account.");
        if (data.session) router.push("/dashboard");
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Authentication could not be completed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="auth-card" aria-labelledby="auth-title">
      <div className="auth-mode-tabs" role="tablist" aria-label="Account action">
        <button type="button" role="tab" aria-selected={mode === "signin"} className={mode === "signin" ? "selected" : ""} onClick={() => { setMode("signin"); setStatus(""); }}>Sign in</button>
        <button type="button" role="tab" aria-selected={mode === "signup"} className={mode === "signup" ? "selected" : ""} onClick={() => { setMode("signup"); setStatus(""); }}>Create account</button>
      </div>
      <span className="mini-label">Dearly account</span>
      <h2 id="auth-title">{mode === "signin" ? "Welcome back." : "Save what you make."}</h2>
      <form onSubmit={submit}>
        <label><span>Email</span><input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></label>
        <label><span>Password</span><input type="password" autoComplete={mode === "signin" ? "current-password" : "new-password"} minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" /></label>
        <button className="button button--primary" type="submit" disabled={busy}>{busy ? "Working…" : mode === "signin" ? "Sign in" : "Create account"}</button>
      </form>
      {status && <p className="auth-status" role="status" aria-live="polite">{status}</p>}
      <small>Email and password are the only account sign-in method. Accounts remain optional for gift creation.</small>
    </section>
  );
}
