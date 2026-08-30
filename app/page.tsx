import Link from "next/link";

const giftTypes = [
  { number: "01", title: "Digital Letter", description: "Words worth keeping, presented like a treasured note.", className: "gift-card--letter" },
  { number: "02", title: "Greeting Card", description: "A little celebration that opens with a smile.", className: "gift-card--card" },
  { number: "03", title: "Virtual Flowers", description: "A bouquet that stays bright, wherever they are.", className: "gift-card--flowers" },
  { number: "04", title: "Memory Album", description: "Favorite moments gathered into one beautiful place.", className: "gift-card--album" },
  { number: "05", title: "Gift Box", description: "Layer letters, photos, music, and one final surprise.", className: "gift-card--box" },
  { number: "06", title: "Wish Jar", description: "Tiny notes of love they can open one by one.", className: "gift-card--jar" },
];

const occasions = ["Birthday", "Anniversary", "Just because", "Christmas", "Thank you", "Graduation", "Friendship", "Valentine’s"];

function HeartMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="brand-mark" aria-hidden="true">
      <svg viewBox="0 0 36 36" role="img">
        <path d="M18 29.25C13.8 25.5 6 20.18 6 13.48 6 9.67 8.96 7 12.55 7c2.09 0 4.12 1.01 5.45 2.61C19.33 8.01 21.36 7 23.45 7 27.04 7 30 9.67 30 13.48c0 6.7-7.8 12.02-12 15.77Z" />
        <path d="M11.5 13.5c.62-1.8 2.05-2.7 4.2-2.7" />
      </svg>
      {!compact && <span>Dearly</span>}
    </span>
  );
}

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return (
    <svg className={diagonal ? "arrow arrow--diagonal" : "arrow"} viewBox="0 0 20 20" aria-hidden="true">
      <path d="M4 10h12M11.5 5.5 16 10l-4.5 4.5" />
    </svg>
  );
}

export default function Home() {
  return (
    <main>
      <a className="skip-link" href="#main-content">Skip to content</a>

      <header className="site-header">
        <Link className="brand" href="/" aria-label="Dearly home"><HeartMark /></Link>
        <nav className="main-nav" aria-label="Main navigation">
          <a href="#gift-types">Gift ideas</a>
          <a href="#how-it-works">How it works</a>
          <a href="#recipient-experience">For recipients</a>
        </nav>
        <Link className="header-cta" href="/create">Make a gift <Arrow /></Link>
      </header>

      <section className="hero" id="main-content">
        <div className="hero-copy">
          <p className="eyebrow"><span /> A little corner of the internet, made with love</p>
          <h1>A gift they’ll <em>feel</em><br /> before they even open it.</h1>
          <p className="hero-intro">Turn your words, photos, and favorite memories into a digital gift that feels every bit as thoughtful as something wrapped by hand.</p>
          <div className="hero-actions">
            <Link className="button button--primary" href="/create">Create your gift <Arrow /></Link>
            <a className="text-link" href="#how-it-works">See how it works <span aria-hidden="true">↓</span></a>
          </div>
          <div className="hero-promise" aria-label="Dearly works without an app or account">
            <span className="mini-hearts" aria-hidden="true">♥</span>
            <p><strong>No app. No account.</strong><br />Just a link, sent with love.</p>
          </div>
        </div>

        <div className="hero-art" aria-label="Preview of a Dearly digital gift">
          <span className="scribble scribble--one" aria-hidden="true">with all my heart</span>
          <span className="scribble scribble--two" aria-hidden="true">made for you</span>
          <div className="sun-stitch" aria-hidden="true" />
          <div className="gift-scene">
            <div className="gift-card-preview">
              <div className="preview-topline"><span>For Mia</span><span className="preview-heart">♥</span></div>
              <div className="pressed-flower" aria-hidden="true">
                <i className="stem" /><i className="leaf leaf--left" /><i className="leaf leaf--right" />
                <i className="petal petal--one" /><i className="petal petal--two" /><i className="petal petal--three" /><i className="petal petal--four" /><i className="flower-center" />
              </div>
              <blockquote>“You make the ordinary days feel like the ones I want to remember.”</blockquote>
              <p className="signature">Always yours, Leo</p>
              <span className="card-fold" aria-hidden="true" />
            </div>
            <div className="envelope" aria-hidden="true"><div className="envelope-flap" /><div className="wax-seal"><HeartMark compact /></div></div>
            <div className="floating-note floating-note--top"><span>Made for</span><strong>one special person</strong></div>
            <div className="floating-note floating-note--bottom"><span className="sparkle">✦</span><strong>Open when you need a smile</strong></div>
          </div>
        </div>
      </section>

      <section className="occasion-ribbon" aria-label="Supported occasions">
        <div className="occasion-track">
          {[...occasions, ...occasions].map((occasion, index) => <span key={`${occasion}-${index}`}>{occasion} <i aria-hidden="true">♥</i></span>)}
        </div>
      </section>

      <section className="gift-types section-shell" id="gift-types">
        <div className="section-heading">
          <div><p className="eyebrow"><span /> Start with a feeling</p><h2>What do you want to give?</h2></div>
          <p>Choose a format, then make every detail yours. No design experience needed—just someone you care about.</p>
        </div>
        <div className="gift-grid">
          {giftTypes.map((gift) => (
            <Link className={`gift-type-card ${gift.className}`} href={`/create?gift=${encodeURIComponent(gift.title)}`} key={gift.title}>
              <span className="gift-number">{gift.number}</span>
              <div className="gift-illustration" aria-hidden="true">
                <span className="illustration-line illustration-line--one" /><span className="illustration-line illustration-line--two" /><span className="illustration-heart">♥</span>
              </div>
              <div><h3>{gift.title}</h3><p>{gift.description}</p></div>
              <span className="gift-arrow"><Arrow diagonal /></span>
            </Link>
          ))}
        </div>
      </section>

      <section className="how-it-works" id="how-it-works">
        <div className="how-intro">
          <p className="eyebrow eyebrow--light"><span /> Thoughtful, not complicated</p>
          <h2>From your heart to their screen.</h2>
          <p>Dearly guides the making. You bring the memories, the message, and the reason it matters.</p>
          <Link className="button button--paper" href="/create">Start making yours <Arrow /></Link>
        </div>
        <ol className="steps-list">
          <li><span className="step-number">01</span><div><h3>Choose your moment</h3><p>Pick an occasion and a gift style that feels right.</p></div></li>
          <li><span className="step-number">02</span><div><h3>Make it unmistakably yours</h3><p>Add your words, photos, colors, and tiny personal touches.</p></div></li>
          <li><span className="step-number">03</span><div><h3>Wrap it, then send the magic</h3><p>Share one private link and let them enjoy the reveal.</p></div></li>
        </ol>
      </section>

      <section className="recipient-section section-shell" id="recipient-experience">
        <div className="recipient-visual" aria-hidden="true">
          <div className="phone-frame"><div className="phone-speaker" /><div className="phone-screen"><p>A little something<br />is waiting for you</p><div className="tiny-gift"><span /></div><span className="open-pill">Open your gift</span></div></div>
          <div className="reaction-bubble reaction-bubble--one">This made my day 🥹</div>
          <div className="reaction-bubble reaction-bubble--two">Sent with love ♥</div>
        </div>
        <div className="recipient-copy">
          <p className="eyebrow"><span /> The best part</p>
          <h2>Not just viewed.<br /><em>Unwrapped.</em></h2>
          <p className="recipient-lead">Your gift arrives as a private link and opens as an experience—with anticipation, a reveal, and room for a reaction at the end.</p>
          <ul>
            <li><span>01</span><p><strong>Nothing to install</strong>It opens beautifully in any modern browser.</p></li>
            <li><span>02</span><p><strong>No sign-up required</strong>The moment stays focused on the gift—not a form.</p></li>
            <li><span>03</span><p><strong>Made to remember</strong>They can return to it whenever they need the feeling again.</p></li>
          </ul>
        </div>
      </section>

      <section className="closing-cta">
        <span className="closing-kicker">Someone is going to love this.</span>
        <h2>Make their screen feel<br />a little more <em>human.</em></h2>
        <p>A few thoughtful minutes for you. A gift they can keep coming back to.</p>
        <Link className="button button--primary" href="/create">Create something lovely <Arrow /></Link>
        <span className="closing-note">No credit card needed to begin</span>
      </section>

      <footer className="site-footer">
        <div className="footer-brand"><HeartMark /><p>Made with feeling.<br />Sent with love.</p></div>
        <div className="footer-links"><a href="#gift-types">Gift ideas</a><a href="#how-it-works">How it works</a><a href="#recipient-experience">For recipients</a></div>
        <p className="copyright">© {new Date().getFullYear()} Dearly</p>
      </footer>
    </main>
  );
}
