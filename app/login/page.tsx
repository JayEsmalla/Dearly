import type { Metadata } from "next";
import Link from "next/link";
import AuthPanel from "./auth-panel";

export const metadata: Metadata = {
  title: "Sign in — Dearly",
  description: "Optional Dearly account access for saved gifts and gifting history.",
};

export default function LoginPage() {
  return (
    <main className="auth-shell">
      <Link className="auth-brand" href="/">♥ Dearly</Link>
      <section className="auth-layout">
        <div className="auth-copy">
          <span className="step-label">Optional account</span>
          <h1>Keep every thoughtful thing <em>close.</em></h1>
          <p>You never need an account to create a gift. Sign in only when you want saved gifts, history, scheduling, reactions, and reusable creations in one place.</p>
          <ul><li>Guest gifting still works</li><li>Recipients never need an account</li><li>Claim a gift you already made as a guest</li></ul>
        </div>
        <AuthPanel />
      </section>
    </main>
  );
}
