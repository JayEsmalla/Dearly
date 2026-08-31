import type { Metadata } from "next";
import { WorkspaceHeader } from "@/app/ui/navigation";
import AuthPanel from "./auth-panel";

export const metadata: Metadata = {
  title: "Sign in — Dearly",
  description: "Optional Dearly account access for saved gifts and gifting history.",
};

type LoginPageProps = {
  searchParams: Promise<{ next?: string | string[] }>;
};

function safeNextPath(value: string | string[] | undefined) {
  const candidate = Array.isArray(value) ? value[0] : value;
  return candidate?.startsWith("/") && !candidate.startsWith("//") ? candidate : "/dashboard";
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const query = await searchParams;
  const nextPath = safeNextPath(query.next);

  return (
    <main className="auth-shell">
      <WorkspaceHeader label="Account" actionHref="/create" actionLabel="Continue as guest" />
      <section className="auth-layout">
        <div className="auth-copy">
          <span className="step-label">Optional account</span>
          <h1>Keep every thoughtful thing <em>close.</em></h1>
          <p>You never need an account to create a gift. Sign in only when you want saved gifts, history, scheduling, reactions, and reusable creations in one place.</p>
          <ul><li>Guest gifting still works</li><li>Recipients never need an account</li><li>Claim a gift you already made as a guest</li></ul>
        </div>
        <AuthPanel nextPath={nextPath} />
      </section>
    </main>
  );
}
