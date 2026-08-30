"use client";

export type GiftFormatDetails = {
  headline: string;
  flower: string;
  memoryOne: string;
  memoryTwo: string;
  memoryThree: string;
  surpriseOne: string;
  surpriseTwo: string;
  surpriseThree: string;
  wishOne: string;
  wishTwo: string;
  wishThree: string;
};

export const defaultGiftFormatDetails: GiftFormatDetails = {
  headline: "A little celebration for you",
  flower: "Peonies",
  memoryOne: "That day we laughed until it hurt.",
  memoryTwo: "The quiet moments that somehow meant the most.",
  memoryThree: "Every ordinary day you made memorable.",
  surpriseOne: "A note from the heart",
  surpriseTwo: "A favorite memory",
  surpriseThree: "One last little surprise",
  wishOne: "May this year be gentle with you.",
  wishTwo: "May you always have something to look forward to.",
  wishThree: "May you remember how loved you are.",
};

type SharedProps = {
  gift: string;
  recipient: string;
  sender: string;
  message: string;
  details: GiftFormatDetails;
  compact?: boolean;
};

export function GiftFormatFields({
  gift,
  details,
  onChange,
}: {
  gift: string;
  details: GiftFormatDetails;
  onChange: (next: GiftFormatDetails) => void;
}) {
  const update = (key: keyof GiftFormatDetails, value: string) => onChange({ ...details, [key]: value });

  if (gift === "Greeting Card") {
    return (
      <label className="message-field">
        <span>Front cover message <small>{details.headline.length}/54</small></span>
        <input value={details.headline} maxLength={54} onChange={(event) => update("headline", event.target.value)} placeholder="A little celebration for you" />
      </label>
    );
  }

  if (gift === "Virtual Flowers") {
    return (
      <fieldset className="format-fieldset">
        <legend>Bouquet</legend>
        <div className="format-choice-row">
          {["Peonies", "Tulips", "Daisies", "Wildflowers"].map((flower) => (
            <button key={flower} type="button" className={details.flower === flower ? "selected" : ""} onClick={() => update("flower", flower)} aria-pressed={details.flower === flower}>{flower}</button>
          ))}
        </div>
      </fieldset>
    );
  }

  if (gift === "Memory Album") {
    return (
      <div className="format-fields-stack" aria-label="Memory captions">
        <span className="format-fields-label">Three moments to keep</span>
        {(["memoryOne", "memoryTwo", "memoryThree"] as const).map((key, index) => (
          <label key={key}><span>Memory {index + 1}</span><input value={details[key]} maxLength={72} onChange={(event) => update(key, event.target.value)} /></label>
        ))}
      </div>
    );
  }

  if (gift === "Gift Box") {
    return (
      <div className="format-fields-stack" aria-label="Gift box surprises">
        <span className="format-fields-label">Inside the box</span>
        {(["surpriseOne", "surpriseTwo", "surpriseThree"] as const).map((key, index) => (
          <label key={key}><span>Surprise {index + 1}</span><input value={details[key]} maxLength={48} onChange={(event) => update(key, event.target.value)} /></label>
        ))}
      </div>
    );
  }

  if (gift === "Wish Jar") {
    return (
      <div className="format-fields-stack" aria-label="Wish jar notes">
        <span className="format-fields-label">Notes inside the jar</span>
        {(["wishOne", "wishTwo", "wishThree"] as const).map((key, index) => (
          <label key={key}><span>Wish {index + 1}</span><input value={details[key]} maxLength={72} onChange={(event) => update(key, event.target.value)} /></label>
        ))}
      </div>
    );
  }

  return null;
}

export function GiftFormatExperience({ gift, recipient, sender, message, details, compact = false }: SharedProps) {
  const safeRecipient = recipient || "someone special";
  const safeSender = sender || "you";
  const safeMessage = message || "Your message will appear here.";

  if (gift === "Greeting Card") {
    return (
      <article className={`format-experience greeting-card${compact ? " is-compact" : ""}`}>
        <div className="card-front"><span>For {safeRecipient}</span><strong>{details.headline || "A little celebration for you"}</strong><i aria-hidden="true">♡</i></div>
        <div className="card-inside"><p>{safeMessage}</p><small>With love, {safeSender}</small></div>
      </article>
    );
  }

  if (gift === "Virtual Flowers") {
    return (
      <article className={`format-experience flower-gift${compact ? " is-compact" : ""}`}>
        <div className="bouquet" aria-hidden="true"><i>✿</i><i>❀</i><i>✿</i><i>❁</i><i>✿</i><span /></div>
        <span className="format-kicker">A bouquet of {details.flower.toLowerCase()}</span>
        <h3>For {safeRecipient}</h3>
        <p>{safeMessage}</p>
        <small>Picked with love by {safeSender}</small>
      </article>
    );
  }

  if (gift === "Memory Album") {
    const memories = [details.memoryOne, details.memoryTwo, details.memoryThree];
    return (
      <article className={`format-experience memory-album${compact ? " is-compact" : ""}`}>
        <header><span>Our little album</span><h3>{safeRecipient} &amp; {safeSender}</h3></header>
        <div className="memory-pages">
          {memories.map((memory, index) => <div className="memory-photo" key={index}><span aria-hidden="true">{index + 1}</span><p>{memory}</p></div>)}
        </div>
        <blockquote>{safeMessage}</blockquote>
      </article>
    );
  }

  if (gift === "Gift Box") {
    const surprises = [details.surpriseOne, details.surpriseTwo, details.surpriseThree];
    return (
      <article className={`format-experience box-experience${compact ? " is-compact" : ""}`}>
        <span className="format-kicker">Three little things for {safeRecipient}</span>
        <div className="box-items">
          {surprises.map((surprise, index) => <div key={index}><i aria-hidden="true">{["✉", "♡", "✦"][index]}</i><strong>{surprise}</strong></div>)}
        </div>
        <p>{safeMessage}</p>
        <small>Wrapped by {safeSender}</small>
      </article>
    );
  }

  if (gift === "Wish Jar") {
    const wishes = [details.wishOne, details.wishTwo, details.wishThree];
    return (
      <article className={`format-experience wish-jar${compact ? " is-compact" : ""}`}>
        <div className="jar-visual" aria-hidden="true"><span /><i>♡</i></div>
        <span className="format-kicker">A jar of wishes for {safeRecipient}</span>
        <div className="wish-notes">{wishes.map((wish, index) => <p key={index}>{wish}</p>)}</div>
        <small>{safeMessage} — {safeSender}</small>
      </article>
    );
  }

  return (
    <article className={`format-experience digital-letter${compact ? " is-compact" : ""}`}>
      <p className="editable-to">Dear {safeRecipient},</p>
      <span className="editable-flower" aria-hidden="true">✿</span>
      <blockquote>“{safeMessage}”</blockquote>
      <p className="editable-from">Always, {safeSender}</p>
    </article>
  );
}
