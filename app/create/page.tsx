import Link from "next/link";

const occasions = [
  ["Birthday", "Cake, candles, and their favorite people"],
  ["Anniversary", "A chapter worth celebrating together"],
  ["Valentine’s Day", "For the person who has your heart"],
  ["Christmas", "A little warmth for the holidays"],
  ["Graduation", "For everything they worked toward"],
  ["Thank You", "Because some kindness deserves more"],
  ["Friendship", "For the person who always shows up"],
  ["Just Because", "No date needed. They simply matter"],
  ["Congratulations", "A bright moment worth cheering for"],
  ["Other", "Make a moment entirely your own"],
];

const giftTypes = [
  ["Digital Letter", "A keepsake made from your words", "✉"],
  ["Greeting Card", "A small celebration with a big feeling", "♡"],
  ["Virtual Flowers", "A bouquet that never fades", "❀"],
  ["Memory Album", "Favorite moments, beautifully gathered", "▧"],
  ["Gift Box", "A collection of little surprises", "◇"],
  ["Wish Jar", "Notes they can open one by one", "⌇"],
];

type CreatePageProps = {
  searchParams: Promise<{ occasion?: string; gift?: string }>;
};

function Arrow() {
  return <span aria-hidden="true">→</span>;
}

export default async function CreatePage({ searchParams }: CreatePageProps) {
  const { occasion, gift } = await searchParams;
  const hasOccasion = Boolean(occasion);
  const isReady = Boolean(occasion && gift);

  return (
    <main className="create-shell">
      <header className="create-header">
        <Link className="create-brand" href="/" aria-label="Back to Dearly home">
          <span aria-hidden="true">♥</span> Dearly
        </Link>
        <div className="create-progress" aria-label={`Step ${isReady ? 3 : hasOccasion ? 2 : 1} of 3`}>
          <span className="active" />
          <span className={hasOccasion ? "active" : ""} />
          <span className={isReady ? "active" : ""} />
        </div>
        <Link className="create-exit" href="/">Exit</Link>
      </header>

      {!hasOccasion && (
        <section className="choice-stage">
          <div className="choice-heading">
            <span className="choice-step">Step 1 of 3</span>
            <h1>What are we<br /><em>celebrating?</em></h1>
            <p>Choose the moment. We’ll help you find a gift that feels right for it.</p>
          </div>
          <div className="occasion-options">
            {occasions.map(([name, description], index) => (
              <Link
                href={`/create?occasion=${encodeURIComponent(name)}${gift ? `&gift=${encodeURIComponent(gift)}` : ""}`}
                className="occasion-option"
                key={name}
              >
                <span className="option-index">{String(index + 1).padStart(2, "0")}</span>
                <span><strong>{name}</strong><small>{description}</small></span>
                <Arrow />
              </Link>
            ))}
          </div>
        </section>
      )}

      {hasOccasion && !isReady && (
        <section className="choice-stage">
          <div className="choice-heading">
            <Link className="back-link" href="/create">← Change occasion</Link>
            <span className="choice-step">Step 2 of 3 · {occasion}</span>
            <h1>What would you<br />like to <em>make?</em></h1>
            <p>Start with a format. Every color, word, and detail can become yours.</p>
          </div>
          <div className="gift-options">
            {giftTypes.map(([name, description, symbol]) => (
              <Link
                href={`/create?occasion=${encodeURIComponent(occasion!)}&gift=${encodeURIComponent(name)}`}
                className="gift-option"
                key={name}
              >
                <span className="gift-symbol" aria-hidden="true">{symbol}</span>
                <span><strong>{name}</strong><small>{description}</small></span>
                <Arrow />
              </Link>
            ))}
          </div>
        </section>
      )}

      {isReady && (
        <section className="ready-stage">
          <div className="ready-card" aria-hidden="true">
            <span className="ready-label">Made for one special person</span>
            <span className="ready-heart">♥</span>
            <p>{gift}</p>
            <small>for {occasion}</small>
          </div>
          <div className="ready-copy">
            <Link className="back-link" href={`/create?occasion=${encodeURIComponent(occasion!)}`}>← Change gift type</Link>
            <span className="choice-step">Your starting point is ready</span>
            <h1>Now make it<br /><em>mean something.</em></h1>
            <p>You chose a <strong>{gift}</strong> for <strong>{occasion}</strong>. Next, add the words and details only you could give.</p>
            <Link className="ready-button" href={`/create/personalize?occasion=${encodeURIComponent(occasion!)}&gift=${encodeURIComponent(gift!)}`}>
              Personalize your gift <Arrow />
            </Link>
            <Link className="start-over" href="/create">Start over</Link>
          </div>
        </section>
      )}
    </main>
  );
}
