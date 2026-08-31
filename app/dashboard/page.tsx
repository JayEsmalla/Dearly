import Link from "next/link";
import AccountDashboardShell from "./account-dashboard-shell";

export default function DashboardPage() {
  return (
    <main className="account-dashboard-placeholder">
      <header><Link href="/">♥ Dearly</Link><Link href="/create">Create a gift</Link></header>
      <AccountDashboardShell />
    </main>
  );
}
