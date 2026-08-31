import Link from "next/link";
import { giftStyles, giftTypes, occasions, recipientTypes, recommendTemplates } from "@/app/data/options";
import { ArrowIcon, BrandLink } from "@/app/ui/brand";

const skipped = "_skip";

type CreatePageProps = {
  searchParams: Promise<{ occasion?: string; recipient?: string; gift?: string; style?: string }>;
};

type GuidedStep = 1 | 2 | 3 | 4 | 5;

function buildCreateHref(values: { occasion?: string; recipient?: string; gift?: string; style?: string }) {
  const params = new URLSearchParams();
  if (values.occasion) params.set("occasion", values.occasion);
  if (values.recipient) params.set("recipient", values.recipient);
  if (values.gift) params.set("gift", values.gift);
  if (values.style) params.set("style", values.style);
  return `/create?${params.toString()}`;
}

function Progress({ step }: { step: GuidedStep }) {
  return (
    <div className="workflow-progress guided-progress" aria-label={`Setup step ${step} of 5`}>
      {[1, 2, 3, 4, 5].map((item) => <span className={step >= item ? "active" : ""} key={item} />)}
    </div>
  );
}

function Summary({ occasion, recipient, gift, style }: { occasion?: string; recipient?: string; gift?: string; style?: string }) {
  return (
    <div className="selection-summary">
      {occasion && <span><small>Occasion</small><strong>{occasion}</strong></span>}
      {recipient && recipient !== skipped && <span><small>For</small><strong>{recipient}</strong></span>}
      {gift && <span><small>Format</small><strong>{gift}</strong></span>}
      {style && style !== skipped && <span><small>Style</small><strong>{style}</strong></span>}
    </div>
  );
}

export default async function CreatePage({ searchParams }: CreatePageProps) {
  const { occasion, recipient, gift, style } = await searchParams;
  const step: GuidedStep = !occasion ? 1 : recipient === undefined && !gift ? 2 : !gift ? 3 : style === undefined ? 4 : 5;
  const actualRecipient = recipient && recipient !== skipped ? recipient : undefined;
  const actualStyle = style && style !== skipped ? style : undefined;
  const templates = gift ? recommendTemplates({ occasion, recipient: actualRecipient, giftType: gift, style: actualStyle }) : [];

  const copy = {
    1: { eyebrow: "Start with the moment", title: <>Choose the <em>occasion.</em></>, body: "Tell us what is happening. We will keep the next choices relevant.", mini: "Pick one to continue", heading: "What are you celebrating?", count: `${occasions.length} occasions` },
    2: { eyebrow: "Optional", title: <>Who is it <em>for?</em></>, body: "This helps Dearly tune the tone and template suggestions. Skip it if you would rather keep things open.", mini: occasion ?? "Recipient", heading: "Who will receive this gift?", count: `${recipientTypes.length} choices` },
    3: { eyebrow: "Choose the shape", title: <>Choose a gift <em>format.</em></>, body: "Pick the format that best fits what you want them to experience.", mini: occasion ?? "Gift format", heading: "What would you like to make?", count: `${giftTypes.length} formats` },
    4: { eyebrow: "Optional", title: <>Set the <em>feeling.</em></>, body: "Choose a visual and emotional direction, or skip this and let the templates speak for themselves.", mini: gift ?? "Style", heading: "What should it feel like?", count: `${giftStyles.length} styles` },
    5: { eyebrow: "Recommended for you", title: <>Pick a <em>starting point.</em></>, body: "These templates are ranked from the choices you made. Everything stays editable in the builder.", mini: gift ?? "Templates", heading: "Choose a template—or start fresh.", count: `${templates.length} matches` },
  } satisfies Record<GuidedStep, { eyebrow: string; title: React.ReactNode; body: string; mini: string; heading: string; count: string }>;

  const current = copy[step];
  const backHref = step === 1 ? "/" : step === 2 ? "/create" : step === 3 ? buildCreateHref({ occasion }) : step === 4 ? buildCreateHref({ occasion, recipient }) : buildCreateHref({ occasion, recipient, gift });

  return (
    <main className="workflow-shell">
      <header className="workflow-header">
        <BrandLink className="workflow-brand" />
        <Progress step={step} />
        <Link className="workflow-exit" href="/">Exit</Link>
      </header>

      <div className="selection-layout">
        <aside className="selection-aside">
          <span className="step-label">Setup {step} of 5 · {current.eyebrow}</span>
          <h1>{current.title}</h1>
          <p>{current.body}</p>
          <Summary occasion={occasion} recipient={recipient} gift={gift} style={style} />
          {step > 1 && <Link className="back-link" href={backHref}>← Back</Link>}
        </aside>

        <section className="selection-content" aria-labelledby="selection-title">
          <div className="selection-topline">
            <div><span className="mini-label">{current.mini}</span><h2 id="selection-title">{current.heading}</h2></div>
            <span className="selection-count">{current.count}</span>
          </div>

          {step === 1 && (
            <div className="occasion-grid">
              {occasions.map((option) => (
                <Link className="occasion-card" href={buildCreateHref({ occasion: option.name })} key={option.name}>
                  <span className="occasion-number">{option.symbol}</span>
                  <span><strong>{option.name}</strong><small>{option.description}</small></span>
                  <ArrowIcon />
                </Link>
              ))}
            </div>
          )}

          {step === 2 && (
            <>
              <div className="guided-option-grid">
                {recipientTypes.map((option) => (
                  <Link className="guided-option-card" href={buildCreateHref({ occasion, recipient: option.name })} key={option.name}>
                    <i aria-hidden="true">{option.symbol}</i>
                    <span><strong>{option.name}</strong><small>{option.description}</small></span>
                    <ArrowIcon />
                  </Link>
                ))}
              </div>
              <Link className="skip-step-link" href={buildCreateHref({ occasion, recipient: skipped })}>Skip recipient suggestion <span aria-hidden="true">→</span></Link>
            </>
          )}

          {step === 3 && (
            <div className="gift-choice-grid">
              {giftTypes.map((option) => (
                <Link className={`gift-choice gift-choice--${option.tone}`} href={buildCreateHref({ occasion, recipient, gift: option.name })} key={option.name}>
                  <span className="gift-choice-symbol" aria-hidden="true">{option.symbol}</span>
                  <span><strong>{option.name}</strong><small>{option.description}</small></span>
                  <ArrowIcon diagonal />
                </Link>
              ))}
            </div>
          )}

          {step === 4 && (
            <>
              <div className="guided-option-grid style-option-grid">
                {giftStyles.map((option) => (
                  <Link className="guided-option-card style-option-card" href={buildCreateHref({ occasion, recipient, gift, style: option.name })} key={option.name}>
                    <i aria-hidden="true">{option.symbol}</i>
                    <span><strong>{option.name}</strong><small>{option.description}</small></span>
                    <ArrowIcon />
                  </Link>
                ))}
              </div>
              <Link className="skip-step-link" href={buildCreateHref({ occasion, recipient, gift, style: skipped })}>Skip style preference <span aria-hidden="true">→</span></Link>
            </>
          )}

          {step === 5 && gift && (
            <div className="template-selection-stack">
              <div className="template-grid">
                {templates.map((template, index) => {
                  const params = new URLSearchParams({ occasion: occasion ?? "Just Because", gift, template: template.id });
                  if (actualRecipient) params.set("recipient", actualRecipient);
                  if (actualStyle) params.set("style", actualStyle);
                  return (
                    <article className="template-card" key={template.id}>
                      <div className={`template-miniature template-miniature--${template.theme.toLowerCase()}`} aria-hidden="true"><span>{template.giftType === "Virtual Flowers" ? "✿" : template.giftType === "Gift Box" ? "◇" : template.giftType === "Memory Album" ? "▧" : template.giftType === "Wish Jar" ? "⌇" : template.giftType === "Greeting Card" ? "♡" : "✉"}</span></div>
                      <div className="template-card-copy">
                        <span className="template-rank">{index === 0 && template.score > 0 ? "Best match" : template.styles[0]}</span>
                        <h3>{template.name}</h3>
                        <p>{template.description}</p>
                        <div className="template-tags"><span>{template.theme}</span><span>{template.layout}</span><span>{template.decoration}</span></div>
                      </div>
                      <Link href={`/create/personalize?${params.toString()}`}>Use this template <span aria-hidden="true">→</span></Link>
                    </article>
                  );
                })}
              </div>
              <div className="scratch-card">
                <div><span className="mini-label">Blank canvas, structured editor</span><h3>Start from scratch</h3><p>Keep the selected format but begin with Dearly’s neutral defaults.</p></div>
                <Link href={`/create/personalize?${new URLSearchParams({ occasion: occasion ?? "Just Because", gift, template: "scratch", ...(actualRecipient ? { recipient: actualRecipient } : {}), ...(actualStyle ? { style: actualStyle } : {}) }).toString()}`}>Start fresh <span aria-hidden="true">→</span></Link>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
