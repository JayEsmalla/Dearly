import Link from "next/link";
import { giftTypes, occasions } from "@/app/data/options";
import { ArrowIcon, BrandLink } from "@/app/ui/brand";

type CreatePageProps = {
  searchParams: Promise<{ occasion?: string; gift?: string }>;
};

function Progress({ step }: { step: 1 | 2 }) {
  return (
    <div className="workflow-progress" aria-label={`Step ${step} of 3`}>
      <span className="active" /><span className={step >= 2 ? "active" : ""} /><span />
    </div>
  );
}

export default async function CreatePage({ searchParams }: CreatePageProps) {
  const { occasion, gift } = await searchParams;
  const step = occasion ? 2 : 1;

  return (
    <main className="workflow-shell">
      <header className="workflow-header">
        <BrandLink className="workflow-brand" />
        <Progress step={step} />
        <Link className="workflow-exit" href="/">Exit</Link>
      </header>

      <div className="selection-layout">
        <aside className="selection-aside">
          <span className="step-label">Step {step} of 3</span>
          <h1>{occasion ? <>Choose a gift <em>format.</em></> : <>Choose the <em>moment.</em></>}</h1>
          <p>{occasion ? "Pick the shape that best fits what you want to say." : "Tell us what is happening. We’ll keep the next choices relevant."}</p>

          <div className="selection-summary">
            {occasion && <span><small>Occasion</small><strong>{occasion}</strong></span>}
            {gift && <span><small>Starting format</small><strong>{gift}</strong></span>}
          </div>

          {occasion && <Link className="back-link" href={gift ? `/create?gift=${encodeURIComponent(gift)}` : "/create"}>← Change occasion</Link>}
        </aside>

        <section className="selection-content" aria-labelledby="selection-title">
          <div className="selection-topline">
            <div><span className="mini-label">{occasion ? occasion : "Pick one to continue"}</span><h2 id="selection-title">{occasion ? "What would you like to make?" : "What are you celebrating?"}</h2></div>
            <span className="selection-count">{occasion ? "6 formats" : "10 occasions"}</span>
          </div>

          {!occasion ? (
            <div className="occasion-grid">
              {occasions.map((option) => {
                const href = gift
                  ? `/create/personalize?occasion=${encodeURIComponent(option.name)}&gift=${encodeURIComponent(gift)}`
                  : `/create?occasion=${encodeURIComponent(option.name)}`;
                return (
                  <Link className="occasion-card" href={href} key={option.name}>
                    <span className="occasion-number">{option.symbol}</span>
                    <span><strong>{option.name}</strong><small>{option.description}</small></span>
                    <ArrowIcon />
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="gift-choice-grid">
              {giftTypes.map((option) => (
                <Link
                  className={`gift-choice gift-choice--${option.tone}`}
                  href={`/create/personalize?occasion=${encodeURIComponent(occasion)}&gift=${encodeURIComponent(option.name)}`}
                  key={option.name}
                >
                  <span className="gift-choice-symbol" aria-hidden="true">{option.symbol}</span>
                  <span><strong>{option.name}</strong><small>{option.description}</small></span>
                  <ArrowIcon diagonal />
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
