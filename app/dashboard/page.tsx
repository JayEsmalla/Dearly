import AccountDashboardShell from "./account-dashboard-shell";
import { WorkspaceHeader } from "@/app/ui/navigation";

export default function DashboardPage() {
  return (
    <main className="account-dashboard-placeholder">
      <WorkspaceHeader label="My gifts" actionHref="/create" actionLabel="Create gift" actionTone="primary" />
      <AccountDashboardShell />
    </main>
  );
}
