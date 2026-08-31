import Link from "next/link";
import { giftTypes, occasions } from "@/app/data/options";
import { ArrowIcon, BrandLink, HeartMark } from "@/app/ui/brand";
import { AccountLink } from "@/app/ui/account-link";

export default function Home() {
  return (
    <main>
      <a className="skip-link" href="#main-content">Skip to content</a>

      <header className="site-header">
        <BrandLink />
        <nav className="main-nav" aria-label="Main navigation">
          <a href="#formats">Gift formats</a>
          <a href="#how-it-works">How it works</a>
          <a href="#recipient-view">Recipient view</a>
        </nav>
        <div className="header-actions"><AccountLink /><Link className="header-cta" href="/create">Create a gift <ArrowIcon /></Link></div>
      </header>

      <section className="hero" id="main-content">
        <div className="hero-copy">
          <p className="eyebrow"><span /> Thoughtful digital gifting</p>
          <h1>Make a gift that feels <em>made for them.</em></h1>
          <p className="hero-intro">Turn a few honest words into a personal gift they can open, feel, and revisit—right in their browser.</p>
          <div className="hero-actions">
            <Link className="button button--primary" href="/create">Create your gift <ArrowIcon /></Link>
            <a className="button button--quiet" href="#how-it-works">See how it works</a>
          </div>
          <div className="trust-row" aria-label="No app or recipient account required">
            <span><i aria-hidden="true">✓</i> No app to install</span>
            <span><i aria-hidden="true">✓</i> No recipient sign-up</span>
          </div>
        </div>

        <div className="hero-preview" aria-label="A Dearly digital letter preview">
          <div className="preview-shell">
            <div className="preview-toolbar">
              <span className="toolbar-dots"><i /><i /><i /></span>
              <span>Recipient preview</span>
              <span className="preview-status"><i /> Ready</span>
            </div>
            <div className="preview-stage">
              <span className="preview-note">For Mia · Just because</span>
              <article className="letter-preview">
                <span className="letter-flower" aria-hidden="true">✿</span>
                <blockquote>“You make ordinary days feel worth remembering.”</blockquote>
                <p>Always, Leo</p>
              </article>
              <div className="preview-envelope" aria-hidden="true"><span>♥</span></div>
              <span className="preview-caption">Open when you need a smile</span>
            </div>
          </div>
        </div>
      </section>

      <section className="quick-start" aria-labelledby="quick-start-title">
        <div className="quick-start-inner">
          <div><span className="mini-label">Start with the moment</span><h2 id="quick-start-title">What are you celebrating?</h2></div>
          <div className="occasion-chips">
            {occasions.slice(0, 7).map((occasion) => (
              <Link href={`/create?occasion=${encodeURIComponent(occasion.name)}`} key={occasion.name}>{occasion.name}<ArrowIcon /></Link>
            ))}
            <Link className="chip-more" href="/create">More</Link>
          </div>
        </div>
      </section>

      <section className="formats section-shell" id="formats">
        <div className="section-heading section-heading--compact">
          <div><p className="eyebrow"><span /> Six ways to say it</p><h2>Choose the shape of your gift.</h2></div>
          <p>Every format starts with a thoughtful structure, then becomes yours through words, color, and details.</p>
        </div>
        <div className="format-grid">
          {giftTypes.map((gift, index) => (
            <Link className={`format-card format-card--${gift.tone}`} href={`/create?gift=${encodeURIComponent(gift.name)}`} key={gift.name}>
              <div className="format-card-top"><span className="format-symbol" aria-hidden="true">{gift.symbol}</span><span className="format-index">0{index + 1}</span></div>
              <div><h3>{gift.name}</h3><p>{gift.description}</p></div>
              <ArrowIcon diagonal />
            </Link>
          ))}
        </div>
      </section>

      <section className="process-section" id="how-it-works">
        <div className="process-inner">
          <div className="process-heading"><p className="eyebrow eyebrow--light"><span /> Simple by design</p><h2>From idea to “I love it” in three steps.</h2></div>
          <ol className="process-steps">
            <li><span>01</span><div><h3>Choose</h3><p>Pick the moment and a gift format.</p></div></li>
            <li><span>02</span><div><h3>Personalize</h3><p>Add the names, message, and mood.</p></div></li>
            <li><span>03</span><div><h3>Wrap</h3><p>Preview the reveal before you send it.</p></div></li>
          </ol>
          <Link className="button button--paper" href="/create">Start creating <ArrowIcon /></Link>
        </div>
      </section>

      <section className="recipient-proof section-shell" id="recipient-view">
        <div className="recipient-copy">
          <p className="eyebrow"><span /> Their side of the story</p>
          <h2>It arrives like a link.<br />It opens like a <em>gift.</em></h2>
          <p>The recipient sees no editor, forms, or setup. Just their name, a wrapped surprise, and the message you made for them.</p>
          <ul>
            <li><span>01</span><div><strong>Instant to open</strong><small>Works in any modern browser</small></div></li>
            <li><span>02</span><div><strong>Nothing to install</strong><small>No account required for recipients</small></div></li>
            <li><span>03</span><div><strong>Easy to revisit</strong><small>A keepsake, not a disappearing post</small></div></li>
          </ul>
        </div>
        <div className="recipient-demo" aria-hidden="true">
          <div className="recipient-card">
            <span className="demo-kicker">A little something is waiting for</span>
            <strong>Mia</strong>
            <div className="mini-gift"><i /><span>♥</span></div>
            <span className="demo-button">Open your gift</span>
          </div>
          <span className="reaction reaction--one">This made my day 🥹</span>
          <span className="reaction reaction--two">Sent with love</span>
        </div>
      </section>

      <section className="closing-cta">
        <div><span className="mini-label">Someone is going to love this</span><h2>Make their next notification mean something.</h2></div>
        <Link className="button button--primary" href="/create">Create something lovely <ArrowIcon /></Link>
      </section>

      <footer className="site-footer">
        <div className="footer-brand"><HeartMark /><p>Made with feeling. Sent with love.</p></div>
        <div className="footer-links"><a href="#formats">Gift formats</a><a href="#how-it-works">How it works</a><a href="#recipient-view">Recipient view</a></div>
        <p>© {new Date().getFullYear()} Dearly</p>
      </footer>
    </main>
  );
}
