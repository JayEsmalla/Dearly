"use client";

import { useState } from "react";
import { defaultPresentation, type GiftPhoto, type GiftPresentation } from "./builder-config";

export type GiftFormatDetails = {
  headline: string;
  flower: string;
  flowerStyle: string;
  memoryOne: string;
  memoryTwo: string;
  memoryThree: string;
  albumMode: string;
  surpriseOne: string;
  surpriseTwo: string;
  surpriseThree: string;
  wishOne: string;
  wishTwo: string;
  wishThree: string;
  wishOrder: string;
};

export const defaultGiftFormatDetails: GiftFormatDetails = {
  headline: "A little celebration for you",
  flower: "Peonies",
  flowerStyle: "Soft",
  memoryOne: "That day we laughed until it hurt.",
  memoryTwo: "The quiet moments that somehow meant the most.",
  memoryThree: "Every ordinary day you made memorable.",
  albumMode: "Gallery",
  surpriseOne: "A note from the heart",
  surpriseTwo: "A bouquet for you",
  surpriseThree: "A favorite photo",
  wishOne: "May this year be gentle with you.",
  wishTwo: "May you always have something to look forward to.",
  wishThree: "May you remember how loved you are.",
  wishOrder: "Ordered",
};

type SharedProps = {
  gift: string;
  recipient: string;
  sender: string;
  message: string;
  details: GiftFormatDetails;
  signature?: string;
  photos?: GiftPhoto[];
  presentation?: GiftPresentation;
  finalMessage?: string;
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
      <div className="format-fields-stack">
        <fieldset className="format-fieldset">
          <legend>Bouquet</legend>
          <div className="format-choice-row">
            {["Peonies", "Tulips", "Daisies", "Wildflowers"].map((flower) => (
              <button key={flower} type="button" className={details.flower === flower ? "selected" : ""} onClick={() => update("flower", flower)} aria-pressed={details.flower === flower}>{flower}</button>
            ))}
          </div>
        </fieldset>
        <fieldset className="format-fieldset">
          <legend>Flower style</legend>
          <div className="format-choice-row format-choice-row--three">
            {["Soft", "Classic", "Wild"].map((style) => (
              <button key={style} type="button" className={details.flowerStyle === style ? "selected" : ""} onClick={() => update("flowerStyle", style)} aria-pressed={details.flowerStyle === style}>{style}</button>
            ))}
          </div>
        </fieldset>
      </div>
    );
  }

  if (gift === "Memory Album") {
    return (
      <div className="format-fields-stack" aria-label="Memory album settings">
        <span className="format-fields-label">Three moments to keep</span>
        {(["memoryOne", "memoryTwo", "memoryThree"] as const).map((key, index) => (
          <label key={key}><span>Memory {index + 1}</span><input value={details[key]} maxLength={72} onChange={(event) => update(key, event.target.value)} /></label>
        ))}
        <fieldset className="format-fieldset">
          <legend>Recipient album view</legend>
          <div className="format-choice-row format-choice-row--three">
            {["Gallery", "Slideshow", "Timeline"].map((mode) => (
              <button key={mode} type="button" className={details.albumMode === mode ? "selected" : ""} onClick={() => update("albumMode", mode)} aria-pressed={details.albumMode === mode}>{mode}</button>
            ))}
          </div>
        </fieldset>
      </div>
    );
  }

  if (gift === "Gift Box") {
    const boxFields = [
      ["surpriseOne", "Letter label"],
      ["surpriseTwo", "Flower label"],
      ["surpriseThree", "Photo label"],
    ] as const;
    return (
      <div className="format-fields-stack" aria-label="Gift box item labels">
        <span className="format-fields-label">Inside the box</span>
        {boxFields.map(([key, label]) => (
          <label key={key}><span>{label}</span><input value={details[key]} maxLength={48} onChange={(event) => update(key, event.target.value)} /></label>
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
        <fieldset className="format-fieldset">
          <legend>Reveal order</legend>
          <div className="format-choice-row">
            {["Ordered", "Random"].map((order) => (
              <button key={order} type="button" className={details.wishOrder === order ? "selected" : ""} onClick={() => update("wishOrder", order)} aria-pressed={details.wishOrder === order}>{order}</button>
            ))}
          </div>
        </fieldset>
      </div>
    );
  }

  return null;
}

function PhotoStrip({ photos, compact = false }: { photos: GiftPhoto[]; compact?: boolean }) {
  if (photos.length === 0) return null;
  return (
    <div className={`gift-photo-strip${compact ? " is-compact" : ""}`} aria-label="Attached photos">
      {photos.slice(0, compact ? 2 : 3).map((photo) => (
        <figure key={photo.id}>
          <div className="gift-photo-image" role="img" aria-label={photo.caption || photo.name} style={{ backgroundImage: `url(${photo.dataUrl})` }} />
          {photo.caption && <figcaption>{photo.caption}</figcaption>}
        </figure>
      ))}
    </div>
  );
}

function EffectLayer({ effect }: { effect: GiftPresentation["effect"] }) {
  if (effect === "none") return null;
  return (
    <div className={`gift-effect-layer gift-effect--${effect}`} aria-hidden="true">
      {Array.from({ length: 10 }, (_, index) => <i key={index} />)}
    </div>
  );
}

function experienceClass(base: string, compact: boolean, presentation: GiftPresentation) {
  return [
    "format-experience",
    base,
    compact ? "is-compact" : "",
    `gift-typography--${presentation.typography}`,
    `gift-background--${presentation.background}`,
    `gift-layout--${presentation.layout}`,
    `gift-decoration--${presentation.decoration}`,
    `gift-motion--${presentation.effect}`,
  ].filter(Boolean).join(" ");
}

function DigitalLetterExperience({ recipient, sender, message, signature, photos, compact, presentation }: {
  recipient: string; sender: string; message: string; signature: string; photos: GiftPhoto[]; compact: boolean; presentation: GiftPresentation;
}) {
  const [opened, setOpened] = useState(compact);
  const className = experienceClass("digital-letter", compact, presentation);
  const signedBy = `${signature.trim() || "Always,"} ${sender}`;

  return (
    <article className={`${className}${opened ? " letter-is-open" : " letter-is-closed"}`}>
      <EffectLayer effect={presentation.effect} />
      {!opened ? (
        <button className="letter-envelope" type="button" onClick={() => setOpened(true)} aria-label={`Open the letter from ${sender}`}>
          <span className="letter-envelope-flap" aria-hidden="true" />
          <small>A letter for</small><strong>{recipient}</strong><i aria-hidden="true">♥</i><em>Open the letter</em>
        </button>
      ) : (
        <div className="letter-sheet">
          <p className="editable-to">Dear {recipient},</p>
          <span className="editable-flower" aria-hidden="true">✿</span>
          <blockquote>“{message}”</blockquote>
          <PhotoStrip photos={photos} compact={compact} />
          <p className="editable-from">{signedBy}</p>
          {!compact && <button className="format-replay-control" type="button" onClick={() => setOpened(false)}>Fold the letter again</button>}
        </div>
      )}
    </article>
  );
}

function GreetingCardExperience({ recipient, sender, message, headline, signature, photos, compact, presentation }: {
  recipient: string; sender: string; message: string; headline: string; signature: string; photos: GiftPhoto[]; compact: boolean; presentation: GiftPresentation;
}) {
  const [opened, setOpened] = useState(compact);
  const className = experienceClass("greeting-card", compact, presentation);
  const signedBy = `${signature.trim() || "With love,"} ${sender}`;

  return (
    <article className={`${className}${opened ? " card-is-open" : " card-is-closed"}`}>
      <EffectLayer effect={presentation.effect} />
      {!opened ? (
        <button className="card-cover-button" type="button" onClick={() => setOpened(true)} aria-label="Open greeting card">
          <span>For {recipient}</span><strong>{headline || "A little celebration for you"}</strong><i aria-hidden="true">♡</i><em>Open card</em>
        </button>
      ) : (
        <>
          <div className="card-front"><span>For {recipient}</span><strong>{headline || "A little celebration for you"}</strong><i aria-hidden="true">♡</i></div>
          <div className="card-inside"><p>{message}</p><PhotoStrip photos={photos} compact={compact} /><small>{signedBy}</small>{!compact && <button className="format-replay-control" type="button" onClick={() => setOpened(false)}>Close card</button>}</div>
        </>
      )}
    </article>
  );
}

function FlowerExperience({ recipient, message, flower, flowerStyle, signature, sender, photos, compact, presentation }: {
  recipient: string; message: string; flower: string; flowerStyle: string; signature: string; sender: string; photos: GiftPhoto[]; compact: boolean; presentation: GiftPresentation;
}) {
  const symbols = flowerStyle === "Wild" ? ["✿", "❀", "❁", "✾", "✽"] : flowerStyle === "Classic" ? ["❀", "❀", "✿", "❀", "✿"] : ["✿", "❁", "✿", "❁", "✿"];
  const signedBy = `${signature.trim() || "With love,"} ${sender}`;
  return (
    <article className={`${experienceClass("flower-gift", compact, presentation)} bouquet-style--${flowerStyle.toLowerCase()}`}>
      <EffectLayer effect={presentation.effect} />
      <div className="bouquet bouquet-reveal" aria-hidden="true">{symbols.map((symbol, index) => <i key={index}>{symbol}</i>)}<span /></div>
      <span className="format-kicker">A {flowerStyle.toLowerCase()} bouquet of {flower.toLowerCase()}</span>
      <h3>For {recipient}</h3><p>{message}</p><PhotoStrip photos={photos} compact={compact} /><small>{signedBy}</small>
    </article>
  );
}

function MemoryFrame({ index, photo, caption }: { index: number; photo?: GiftPhoto; caption: string }) {
  return (
    <div className="memory-photo">
      {photo ? <div className="memory-photo-image" role="img" aria-label={photo.caption || photo.name} style={{ backgroundImage: `url(${photo.dataUrl})` }} /> : <span aria-hidden="true">{index + 1}</span>}
      <p>{photo?.caption || caption}</p>
    </div>
  );
}

function MemoryAlbumExperience({ recipient, sender, message, details, photos, compact, presentation }: {
  recipient: string; sender: string; message: string; details: GiftFormatDetails; photos: GiftPhoto[]; compact: boolean; presentation: GiftPresentation;
}) {
  const [slide, setSlide] = useState(0);
  const memories = [details.memoryOne, details.memoryTwo, details.memoryThree];
  const mode = compact ? "Gallery" : details.albumMode;
  const className = `${experienceClass("memory-album", compact, presentation)} album-mode--${mode.toLowerCase()}`;

  return (
    <article className={className}>
      <EffectLayer effect={presentation.effect} />
      <header><span>Our little album · {mode}</span><h3>{recipient} &amp; {sender}</h3></header>
      {mode === "Slideshow" ? (
        <div className="memory-slideshow">
          <MemoryFrame index={slide} photo={photos[slide]} caption={memories[slide]} />
          <div className="memory-slideshow-controls"><button type="button" onClick={() => setSlide((current) => (current + 2) % 3)}>← Previous</button><span>{slide + 1} / 3</span><button type="button" onClick={() => setSlide((current) => (current + 1) % 3)}>Next →</button></div>
        </div>
      ) : mode === "Timeline" ? (
        <div className="memory-timeline">
          {memories.map((memory, index) => <div className="memory-timeline-entry" key={index}><span>{String(index + 1).padStart(2, "0")}</span><MemoryFrame index={index} photo={photos[index]} caption={memory} /></div>)}
        </div>
      ) : (
        <div className="memory-pages">{memories.map((memory, index) => <MemoryFrame key={index} index={index} photo={photos[index]} caption={memory} />)}</div>
      )}
      <blockquote>{message}</blockquote>
    </article>
  );
}

function GiftBoxExperience({ recipient, sender, message, finalMessage, details, photos, signature, compact, presentation }: {
  recipient: string; sender: string; message: string; finalMessage: string; details: GiftFormatDetails; photos: GiftPhoto[]; signature: string; compact: boolean; presentation: GiftPresentation;
}) {
  const [activeItem, setActiveItem] = useState<number | null>(null);
  const signedBy = `${signature.trim() || "Always,"} ${sender}`;
  const items = [
    { label: details.surpriseOne || "A note from the heart", icon: "✉", kind: "Letter" },
    { label: details.surpriseTwo || "A bouquet for you", icon: "✿", kind: "Flowers" },
    { label: details.surpriseThree || "A favorite photo", icon: "▧", kind: "Photo" },
    { label: "One last note", icon: "♥", kind: "Final" },
  ];

  const itemContent = (index: number) => {
    if (index === 0) return <div className="box-open-content box-open-letter"><span>Dear {recipient},</span><blockquote>“{message}”</blockquote><small>{signedBy}</small></div>;
    if (index === 1) return <div className="box-open-content box-open-flowers"><div aria-hidden="true">✿ ❀ ✿</div><p>A little bouquet, just for you.</p></div>;
    if (index === 2) return photos[0]
      ? <div className="box-open-content box-open-photo"><div role="img" aria-label={photos[0].caption || photos[0].name} style={{ backgroundImage: `url(${photos[0].dataUrl})` }} /><p>{photos[0].caption || "A moment worth keeping."}</p></div>
      : <div className="box-open-content box-open-photo box-open-photo--empty"><div aria-hidden="true">▧</div><p>Add a photo in the builder to reveal it here.</p></div>;
    return <div className="box-open-content box-open-final"><span aria-hidden="true">♥</span><blockquote>“{finalMessage || message}”</blockquote></div>;
  };

  return (
    <article className={experienceClass("box-experience", compact, presentation)}>
      <EffectLayer effect={presentation.effect} />
      <span className="format-kicker">A box of surprises for {recipient}</span>
      {activeItem === null || compact ? (
        <div className="box-items box-items--four">
          {items.map((item, index) => compact ? <div key={item.kind}><i aria-hidden="true">{item.icon}</i><strong>{item.label}</strong></div> : <button type="button" key={item.kind} onClick={() => setActiveItem(index)}><i aria-hidden="true">{item.icon}</i><strong>{item.label}</strong><small>{item.kind}</small></button>)}
        </div>
      ) : (
        <div className="box-item-reveal">{itemContent(activeItem)}<button className="format-replay-control" type="button" onClick={() => setActiveItem(null)}>Back to the box</button></div>
      )}
      {compact && <><PhotoStrip photos={photos} compact /><p>{message}</p><small>{signedBy}</small></>}
    </article>
  );
}

function WishJarExperience({ recipient, sender, message, details, compact, presentation }: {
  recipient: string; sender: string; message: string; details: GiftFormatDetails; compact: boolean; presentation: GiftPresentation;
}) {
  const wishes = [details.wishOne, details.wishTwo, details.wishThree];
  const [opened, setOpened] = useState<number[]>([]);
  const currentIndex = opened.at(-1);

  const openNext = () => {
    const remaining = [0, 1, 2].filter((index) => !opened.includes(index));
    if (remaining.length === 0) return;
    const next = details.wishOrder === "Random" ? remaining[Math.floor(Math.random() * remaining.length)] : remaining[0];
    setOpened((current) => [...current, next]);
  };

  return (
    <article className={experienceClass("wish-jar", compact, presentation)}>
      <EffectLayer effect={presentation.effect} />
      <div className="jar-visual" aria-hidden="true"><span /><i>♡</i></div>
      <span className="format-kicker">A jar of wishes for {recipient}</span>
      {compact ? (
        <div className="wish-notes">{wishes.map((wish, index) => <p key={index}>{wish}</p>)}</div>
      ) : (
        <div className="wish-one-by-one">
          {currentIndex === undefined ? <p className="wish-awaiting">Three notes are waiting inside.</p> : <blockquote key={currentIndex}>“{wishes[currentIndex]}”</blockquote>}
          <div className="wish-open-controls"><button type="button" onClick={openNext} disabled={opened.length === wishes.length}>{opened.length === 0 ? "Open a note" : opened.length === wishes.length ? "All wishes opened" : "Open another note"}</button><span>{opened.length} / {wishes.length}</span></div>
          {opened.length === wishes.length && <button className="format-replay-control" type="button" onClick={() => setOpened([])}>Put the notes back</button>}
        </div>
      )}
      <small>{message} — {sender}</small>
    </article>
  );
}

export function GiftFormatExperience({
  gift,
  recipient,
  sender,
  message,
  details,
  signature = "Always,",
  photos = [],
  presentation = defaultPresentation,
  finalMessage = "",
  compact = false,
}: SharedProps) {
  const safeRecipient = recipient || "someone special";
  const safeSender = sender || "you";
  const safeMessage = message || "Your message will appear here.";

  if (gift === "Greeting Card") return <GreetingCardExperience recipient={safeRecipient} sender={safeSender} message={safeMessage} headline={details.headline} signature={signature} photos={photos} compact={compact} presentation={presentation} />;
  if (gift === "Virtual Flowers") return <FlowerExperience recipient={safeRecipient} sender={safeSender} message={safeMessage} flower={details.flower} flowerStyle={details.flowerStyle} signature={signature} photos={photos} compact={compact} presentation={presentation} />;
  if (gift === "Memory Album") return <MemoryAlbumExperience recipient={safeRecipient} sender={safeSender} message={safeMessage} details={details} photos={photos} compact={compact} presentation={presentation} />;
  if (gift === "Gift Box") return <GiftBoxExperience recipient={safeRecipient} sender={safeSender} message={safeMessage} finalMessage={finalMessage} details={details} photos={photos} signature={signature} compact={compact} presentation={presentation} />;
  if (gift === "Wish Jar") return <WishJarExperience recipient={safeRecipient} sender={safeSender} message={safeMessage} details={details} compact={compact} presentation={presentation} />;
  return <DigitalLetterExperience recipient={safeRecipient} sender={safeSender} message={safeMessage} signature={signature} photos={photos} compact={compact} presentation={presentation} />;
}
