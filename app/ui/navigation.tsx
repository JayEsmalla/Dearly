import Link from "next/link";
import { AccountLink } from "@/app/ui/account-link";
import { ArrowIcon, BrandLink, HeartMark } from "@/app/ui/brand";

export function SiteHeader() {
  return (
    <header className="site-header">
      <BrandLink />
      <nav className="header-actions" aria-label="Primary navigation">
        <AccountLink />
        <Link className="header-cta" href="/create">Create gift <ArrowIcon /></Link>
      </nav>
    </header>
  );
}

type WorkspaceHeaderProps = {
  label: string;
  actionHref?: string;
  actionLabel?: string;
  actionTone?: "primary" | "quiet";
};

export function WorkspaceHeader({ label, actionHref, actionLabel, actionTone = "quiet" }: WorkspaceHeaderProps) {
  return (
    <header className="app-header">
      <BrandLink className="app-header-brand" />
      <span className="app-header-context">{label}</span>
      <div className="app-header-actions">
        {actionHref && actionLabel ? (
          <Link className={`app-header-action app-header-action--${actionTone}`} href={actionHref}>{actionLabel}{actionTone === "primary" ? <ArrowIcon /> : null}</Link>
        ) : null}
      </div>
    </header>
  );
}

type WorkflowHeaderProps = {
  step?: number;
  totalSteps?: number;
  context?: string;
  backHref?: string;
  backLabel?: string;
  exitHref?: string;
  exitLabel?: string;
};

export function WorkflowHeader({
  step,
  totalSteps = 5,
  context,
  backHref,
  backLabel = "Back",
  exitHref = "/",
  exitLabel = "Exit",
}: WorkflowHeaderProps) {
  return (
    <header className="workflow-header">
      <span className="workflow-identity" aria-label="Dearly">
        <HeartMark compact />
        <strong>Dearly</strong>
      </span>

      <div className="workflow-center">
        {typeof step === "number" ? (
          <div className="workflow-progress" aria-label={`Setup step ${step} of ${totalSteps}`}>
            {Array.from({ length: totalSteps }, (_, index) => index + 1).map((item) => <span className={step >= item ? "active" : ""} key={item} />)}
          </div>
        ) : (
          <span className="workflow-context">{context}</span>
        )}
      </div>

      <nav className="workflow-actions" aria-label="Creation navigation">
        {backHref ? <Link className="workflow-back" href={backHref}><span aria-hidden="true">←</span> {backLabel}</Link> : null}
        <Link className="workflow-exit" href={exitHref}>{exitLabel}</Link>
      </nav>
    </header>
  );
}
