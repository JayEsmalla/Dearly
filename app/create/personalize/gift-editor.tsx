"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BrandLink } from "@/app/ui/brand";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { RecipientExperience } from "@/app/ui/recipient-experience";
import { ShareTools } from "@/app/ui/share-tools";
import {
  backgroundOptions,
  decorationOptions,
  effectOptions,
  getPresentationDefaults,
  getThemeName,
  layoutOptions,
  typographyOptions,
  type GiftPhoto,
  type GiftPresentation,
  type TemplatePreset,
} from "./builder-config";
import { defaultGiftFormatDetails, GiftFormatExperience, GiftFormatFields, type GiftFormatDetails } from "./gift-format-experience";

const themes = [
  { name: "Rose", color: "#d96f68", paper: "#fffaf5" },
  { name: "Wine", color: "#6d263b", paper: "#f8efea" },
  { name: "Sage", color: "#7f8d74", paper: "#f7f6ed" },
  { name: "Gold", color: "#bd8040", paper: "#fff5e3" },
] as const;

const defaultMessage = "You make ordinary days feel worth remembering.";
const defaultFinalMessage = "No matter the occasion, I hope you remember how much you mean to me.";
const defaultSignature = "Always,";
const allowedPhotoTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxPhotoBytes = 650_000;
const maxPhotos = 3;

type GiftEditorProps = {
  occasion: string;
  gift: string;
  recipientType?: string;
  style?: string;
  templateId?: string;
  template?: TemplatePreset | null;
};

type PublishedGift = { publicId: string; shareUrl: string; managementUrl: string };
type LocalGiftDraft = {
  version: 1;
  recipient: string;
  sender: string;
  message: string;
  finalMessage?: string;
  signature?: string;
  details: GiftFormatDetails;
  themeName: string;
  presentation?: GiftPresentation;
  photos?: GiftPhoto[];
  savedAt: string;
};

type EditorSnapshot = {
  recipient: string;
  sender: string;
  message: string;
  finalMessage: string;
  signature: string;
  details: GiftFormatDetails;
  themeName: string;
  presentation: GiftPresentation;
  photos: GiftPhoto[];
};

const detailKeys: (keyof GiftFormatDetails)[] = [
  "headline", "flower", "flowerStyle", "memoryOne", "memoryTwo", "memoryThree", "albumMode",
  "surpriseOne", "surpriseTwo", "surpriseThree", "wishOne", "wishTwo", "wishThree", "wishOrder",
];

const getDraftKey = (occasion: string, gift: string, templateId?: string) => {
  const base = `dearly:draft:v1:${encodeURIComponent(occasion)}:${encodeURIComponent(gift)}`;
  return templateId ? `${base}:${encodeURIComponent(templateId)}` : base;
};

function restoreGiftDetails(value: unknown): GiftFormatDetails {
  const restored = { ...defaultGiftFormatDetails };
  if (!value || typeof value !== "object") return restored;
  const source = value as Record<string, unknown>;
  for (const key of detailKeys) {
    const candidate = source[key];
    if (typeof candidate === "string") restored[key] = candidate;
  }
  return restored;
}

function restorePresentation(value: unknown, fallback: GiftPresentation): GiftPresentation {
  if (!value || typeof value !== "object") return fallback;
  const candidate = value as Partial<GiftPresentation>;
  return {
    typography: typographyOptions.some((option) => option.value === candidate.typography) ? candidate.typography! : fallback.typography,
    background: backgroundOptions.some((option) => option.value === candidate.background) ? candidate.background! : fallback.background,
    layout: layoutOptions.some((option) => option.value === candidate.layout) ? candidate.layout! : fallback.layout,
    decoration: decorationOptions.some((option) => option.value === candidate.decoration) ? candidate.decoration! : fallback.decoration,
    effect: effectOptions.some((option) => option.value === candidate.effect) ? candidate.effect! : fallback.effect,
  };
}

function restorePhotos(value: unknown): GiftPhoto[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, maxPhotos).flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const item = entry as Partial<GiftPhoto>;
    if (typeof item.dataUrl !== "string" || !/^data:image\/(?:jpeg|png|webp);base64,/i.test(item.dataUrl)) return [];
    return [{
      id: typeof item.id === "string" ? item.id : `restored-${Math.random().toString(36).slice(2)}`,
      name: typeof item.name === "string" ? item.name.slice(0, 80) : "Photo",
      dataUrl: item.dataUrl,
      caption: typeof item.caption === "string" ? item.caption.slice(0, 72) : "",
    }];
  });
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Could not read image."));
    reader.onerror = () => reject(new Error("Could not read image."));
    reader.readAsDataURL(file);
  });
}

function ChoiceRow<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <fieldset className="builder-choice-group">
      <legend>{label}</legend>
      <div className="builder-choice-row">
        {options.map((option) => (
          <button type="button" key={option.value} className={value === option.value ? "selected" : ""} aria-pressed={value === option.value} onClick={() => onChange(option.value)}>{option.label}</button>
        ))}
      </div>
    </fieldset>
  );
}

export default function GiftEditor({ occasion, gift, recipientType, style, templateId, template }: GiftEditorProps) {
  const initialPresentation = getPresentationDefaults(template, style);
  const initialTheme = themes.find((option) => option.name === getThemeName(template, style)) ?? themes[0];

  const [recipient, setRecipient] = useState("Mia");
  const [sender, setSender] = useState("Leo");
  const [message, setMessage] = useState(defaultMessage);
  const [finalMessage, setFinalMessage] = useState(defaultFinalMessage);
  const [signature, setSignature] = useState(defaultSignature);
  const [details, setDetails] = useState(defaultGiftFormatDetails);
  const [theme, setTheme] = useState(initialTheme);
  const [presentation, setPresentation] = useState<GiftPresentation>(initialPresentation);
  const [photos, setPhotos] = useState<GiftPhoto[]>([]);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [hasPreviewed, setHasPreviewed] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishedGift, setPublishedGift] = useState<PublishedGift | null>(null);
  const [loadedDraftKey, setLoadedDraftKey] = useState<string | null>(null);
  const [draftStatus, setDraftStatus] = useState("Loading local draft…");
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [canUndo, setCanUndo] = useState(false);
  const historyRef = useRef<EditorSnapshot[]>([]);
  const previewTriggerRef = useRef<HTMLButtonElement>(null);
  const draftKey = getDraftKey(occasion, gift, templateId);

  const templatePresentation = () => getPresentationDefaults(template, style);
  const templateTheme = () => themes.find((option) => option.name === getThemeName(template, style)) ?? themes[0];

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const fallbackPresentation = getPresentationDefaults(template, style);
      let restoredRecipient = "Mia";
      let restoredSender = "Leo";
      let restoredMessage = defaultMessage;
      let restoredFinalMessage = defaultFinalMessage;
      let restoredSignature = defaultSignature;
      let restoredDetails = { ...defaultGiftFormatDetails };
      let restoredTheme = themes.find((option) => option.name === getThemeName(template, style)) ?? themes[0];
      let restoredPresentation = fallbackPresentation;
      let restoredPhotos: GiftPhoto[] = [];
      let restoredStatus = templateId ? "Template ready" : "Autosave ready";
      let restoredSavedAt: number | null = null;

      try {
        const stored = window.localStorage.getItem(draftKey);
        if (stored) {
          const draft = JSON.parse(stored) as Partial<LocalGiftDraft>;
          if (draft.version === 1) {
            if (typeof draft.recipient === "string") restoredRecipient = draft.recipient.slice(0, 40);
            if (typeof draft.sender === "string") restoredSender = draft.sender.slice(0, 40);
            if (typeof draft.message === "string") restoredMessage = draft.message.slice(0, 240);
            if (typeof draft.finalMessage === "string") restoredFinalMessage = draft.finalMessage.slice(0, 180);
            if (typeof draft.signature === "string") restoredSignature = draft.signature.slice(0, 48);
            restoredDetails = restoreGiftDetails(draft.details);
            restoredTheme = themes.find((option) => option.name === draft.themeName) ?? restoredTheme;
            restoredPresentation = restorePresentation(draft.presentation, fallbackPresentation);
            restoredPhotos = restorePhotos(draft.photos);
            const savedTime = typeof draft.savedAt === "string" ? Date.parse(draft.savedAt) : Number.NaN;
            if (!Number.isNaN(savedTime)) restoredSavedAt = savedTime;
            restoredStatus = "Draft restored";
          }
        }
      } catch {
        restoredStatus = "Local storage unavailable";
      }

      setRecipient(restoredRecipient);
      setSender(restoredSender);
      setMessage(restoredMessage);
      setFinalMessage(restoredFinalMessage);
      setSignature(restoredSignature);
      setDetails(restoredDetails);
      setTheme(restoredTheme);
      setPresentation(restoredPresentation);
      setPhotos(restoredPhotos);
      setPhotoError(null);
      setLastSavedAt(restoredSavedAt);
      setDraftStatus(restoredStatus);
      setLoadedDraftKey(draftKey);
      historyRef.current = [];
      setCanUndo(false);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [draftKey, style, template, templateId]);

  useEffect(() => {
    if (loadedDraftKey !== draftKey) return;
    const timeout = window.setTimeout(() => {
      try {
        const savedAt = new Date();
        const draft: LocalGiftDraft = {
          version: 1,
          recipient,
          sender,
          message,
          finalMessage,
          signature,
          details,
          themeName: theme.name,
          presentation,
          photos,
          savedAt: savedAt.toISOString(),
        };
        window.localStorage.setItem(draftKey, JSON.stringify(draft));
        setLastSavedAt(savedAt.getTime());
        setDraftStatus("Saved locally");
      } catch {
        setDraftStatus("Local storage unavailable");
      }
    }, 450);
    return () => window.clearTimeout(timeout);
  }, [details, draftKey, finalMessage, loadedDraftKey, message, photos, presentation, recipient, sender, signature, theme]);

  useEffect(() => {
    if (!previewOpen) return;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPreviewOpen(false);
        window.setTimeout(() => previewTriggerRef.current?.focus(), 0);
      }
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [previewOpen]);

  const snapshot = (): EditorSnapshot => ({
    recipient,
    sender,
    message,
    finalMessage,
    signature,
    details: { ...details },
    themeName: theme.name,
    presentation: { ...presentation },
    photos: photos.map((photo) => ({ ...photo })),
  });

  const invalidatePublication = () => {
    setHasPreviewed(false);
    setPublishedGift(null);
    setPublishError(null);
    if (loadedDraftKey === draftKey) setDraftStatus("Unsaved changes");
  };

  const beginEdit = () => {
    historyRef.current = [...historyRef.current.slice(-24), snapshot()];
    setCanUndo(true);
    invalidatePublication();
  };

  const undoLastChange = () => {
    const previous = historyRef.current.pop();
    if (!previous) return;
    setRecipient(previous.recipient);
    setSender(previous.sender);
    setMessage(previous.message);
    setFinalMessage(previous.finalMessage);
    setSignature(previous.signature);
    setDetails(previous.details);
    setTheme(themes.find((option) => option.name === previous.themeName) ?? themes[0]);
    setPresentation(previous.presentation);
    setPhotos(previous.photos);
    setCanUndo(historyRef.current.length > 0);
    invalidatePublication();
    setDraftStatus("Previous edit restored");
  };

  const resetTemplate = () => {
    beginEdit();
    setMessage(defaultMessage);
    setFinalMessage(defaultFinalMessage);
    setSignature(defaultSignature);
    setDetails({ ...defaultGiftFormatDetails });
    setTheme(templateTheme());
    setPresentation(templatePresentation());
    setPhotos([]);
    setPhotoError(null);
    setDraftStatus(template ? `${template.name} reset` : "Builder reset");
  };

  const startFreshDraft = () => {
    beginEdit();
    try {
      window.localStorage.removeItem(draftKey);
    } catch {
      setDraftStatus("Local storage unavailable");
    }
    setRecipient("");
    setSender("");
    setMessage("");
    setFinalMessage("");
    setSignature(defaultSignature);
    setDetails({ ...defaultGiftFormatDetails });
    setTheme(templateTheme());
    setPresentation(templatePresentation());
    setPhotos([]);
    setPhotoError(null);
    setLastSavedAt(null);
    setDraftStatus("Fresh draft started");
  };

  const handlePhotoFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const selectedFiles = Array.from(input.files ?? []);
    input.value = "";
    if (selectedFiles.length === 0) return;

    const available = maxPhotos - photos.length;
    if (available <= 0) {
      setPhotoError(`You can attach up to ${maxPhotos} photos.`);
      return;
    }

    const candidates = selectedFiles.slice(0, available);
    const invalid = candidates.find((file) => !allowedPhotoTypes.has(file.type) || file.size > maxPhotoBytes);
    if (invalid) {
      setPhotoError("Use JPG, PNG, or WebP images under 650 KB each.");
      return;
    }

    try {
      const prepared = await Promise.all(candidates.map(async (file) => ({
        id: crypto.randomUUID(),
        name: file.name.slice(0, 80),
        dataUrl: await fileToDataUrl(file),
        caption: "",
      })));
      beginEdit();
      setPhotos((current) => [...current, ...prepared].slice(0, maxPhotos));
      setPhotoError(null);
    } catch {
      setPhotoError("One of those photos could not be read.");
    }
  };

  const updatePhotoCaption = (id: string, caption: string) => {
    beginEdit();
    setPhotos((current) => current.map((photo) => photo.id === id ? { ...photo, caption } : photo));
  };

  const removePhoto = (id: string) => {
    beginEdit();
    setPhotos((current) => current.filter((photo) => photo.id !== id));
    setPhotoError(null);
  };

  const updatePresentation = <K extends keyof GiftPresentation>(key: K, value: GiftPresentation[K]) => {
    beginEdit();
    setPresentation((current) => ({ ...current, [key]: value }));
  };

  const openPreview = () => {
    setPreviewOpen(true);
    setHasPreviewed(true);
  };

  const publishCurrentGift = async () => {
    setPublishing(true);
    setPublishError(null);

    try {
      const session = await getSupabaseBrowser()?.auth.getSession();
      const accessToken = session?.data.session?.access_token;
      const response = await fetch("/api/gifts", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) },
        body: JSON.stringify({
          occasion,
          giftType: gift,
          recipientName: recipient,
          senderName: sender,
          message,
          theme: theme.name.toLowerCase(),
          builderData: { finalMessage, signature, details, presentation },
        }),
      });
      const result = await response.json() as {
        gift?: { publicId: string };
        sharePath?: string;
        managementPath?: string;
        managementToken?: string;
        error?: { code?: string; message?: string };
      };

      if (!response.ok || !result.gift || !result.sharePath || !result.managementPath) {
        if (result.error?.code === "gift_service_not_configured") {
          throw new Error("Publishing is ready, but the gift service still needs to be connected.");
        }
        throw new Error(result.error?.message ?? "The gift could not be published. Please try again.");
      }

      if (result.managementToken) {
        window.localStorage.setItem(`dearly:management:${result.gift.publicId}`, result.managementToken);
      }

      const shareUrl = new URL(result.sharePath, window.location.origin).toString();
      const managementUrl = new URL(result.managementPath, window.location.origin).toString();
      setPublishedGift({ publicId: result.gift.publicId, shareUrl, managementUrl });

      try {
        const stored = window.localStorage.getItem("dearly:guest-gifts:v1");
        const history = stored ? JSON.parse(stored) as { publicId: string; shareUrl: string; managementUrl: string; recipientName: string; savedAt: string }[] : [];
        const next = [{ publicId: result.gift.publicId, shareUrl, managementUrl, recipientName: recipient, savedAt: new Date().toISOString() }, ...history.filter((item) => item.publicId !== result.gift!.publicId)].slice(0, 50);
        window.localStorage.setItem("dearly:guest-gifts:v1", JSON.stringify(next));
      } catch {
        // Publishing succeeded; local management history is only a convenience.
      }
    } catch (error) {
      setPublishError(error instanceof Error ? error.message : "The gift could not be published. Please try again.");
    } finally {
      setPublishing(false);
    }
  };

  const backParams = new URLSearchParams({ occasion });
  if (recipientType) backParams.set("recipient", recipientType);
  if (gift) backParams.set("gift", gift);
  if (style) backParams.set("style", style);
  const previewStyle = { "--theme-color": theme.color, "--theme-paper": theme.paper } as React.CSSProperties;
  const experienceProps = { gift, recipient, sender, message, details, signature, photos, presentation, finalMessage };

  return (
    <main className="editor-shell">
      <header className="editor-header">
        <BrandLink className="workflow-brand" />
        <div className="editor-context"><span>{occasion}</span><i>·</i><span>{gift}</span>{template?.name && <><i>·</i><span>{template.name}</span></>}</div>
        <Link className="workflow-exit" href={`/create?${backParams.toString()}`}>Back</Link>
      </header>

      <nav className="editor-mobile-tabs" aria-label="Gift builder sections">
        <a href="#builder-content">Content</a><a href="#builder-design">Design</a><a href="#builder-effects">Effects</a><a href="#builder-preview">Preview</a>
      </nav>

      <div className="editor-workspace">
        <section className="editor-controls" aria-labelledby="editor-title">
          <div className="editor-heading">
            <span className="step-label">Gift builder{template?.name ? ` · ${template.name}` : templateId === "scratch" ? " · From scratch" : ""}</span>
            <h1 id="editor-title">Make it <em>personal.</em></h1>
            <p>Shape the words, design, photos, and motion. Your preview updates as you edit.</p>
          </div>

          <div className="draft-status-row" role="status" aria-live="polite">
            <span><i aria-hidden="true" />{draftStatus}{lastSavedAt ? <small> · {new Date(lastSavedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</small> : null}</span>
            <button type="button" onClick={startFreshDraft}>Start fresh</button>
          </div>

          <div className="builder-toolbar" aria-label="Editor history controls">
            <button type="button" onClick={undoLastChange} disabled={!canUndo}>↶ Undo</button>
            <button type="button" onClick={resetTemplate}>Reset template</button>
          </div>

          <section className="builder-section" id="builder-content" aria-labelledby="builder-content-title">
            <div className="builder-section-heading"><span>01</span><h2 id="builder-content-title">Content</h2></div>
            {recipientType && <p className="builder-context-note">Suggested for: <strong>{recipientType}</strong>{style ? <> · <strong>{style}</strong></> : null}</p>}

            <div className="field-grid">
              <label><span>To</span><input value={recipient} maxLength={40} onChange={(event) => { beginEdit(); setRecipient(event.target.value); }} placeholder="Recipient name" /></label>
              <label><span>From</span><input value={sender} maxLength={40} onChange={(event) => { beginEdit(); setSender(event.target.value); }} placeholder="Your name" /></label>
            </div>

            <label className="message-field">
              <span>{gift === "Digital Letter" ? "Your letter" : gift === "Greeting Card" ? "Inside message" : gift === "Virtual Flowers" ? "Bouquet note" : gift === "Memory Album" ? "Album dedication" : gift === "Gift Box" ? "Final note" : "Jar dedication"} <small>{message.length}/240</small></span>
              <textarea value={message} maxLength={240} rows={4} onChange={(event) => { beginEdit(); setMessage(event.target.value); }} placeholder="Write what you want them to remember…" />
            </label>

            <GiftFormatFields gift={gift} details={details} onChange={(next) => { beginEdit(); setDetails(next); }} />

            <label className="message-field">
              <span>Signature <small>{signature.length}/48</small></span>
              <input value={signature} maxLength={48} onChange={(event) => { beginEdit(); setSignature(event.target.value); }} placeholder="Always," />
            </label>

            <label className="message-field final-message-field">
              <span>Final reveal note <small>{finalMessage.length}/180</small></span>
              <textarea value={finalMessage} maxLength={180} rows={3} onChange={(event) => { beginEdit(); setFinalMessage(event.target.value); }} placeholder="Leave them with one last thought…" />
            </label>

            <div className="photo-builder">
              <div className="photo-builder-heading"><span>Photos <small>{photos.length}/{maxPhotos}</small></span><label className={photos.length >= maxPhotos ? "disabled" : ""}>Add photos<input type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={photos.length >= maxPhotos} onChange={handlePhotoFiles} /></label></div>
              <p>JPG, PNG, or WebP · up to 650 KB each. Photos stay in this browser draft.</p>
              {photoError && <p className="photo-error" role="alert">{photoError}</p>}
              {photos.length > 0 && (
                <div className="photo-editor-list">
                  {photos.map((photo, index) => (
                    <div className="photo-editor-item" key={photo.id}>
                      <div className="photo-editor-thumb" role="img" aria-label={photo.caption || photo.name} style={{ backgroundImage: `url(${photo.dataUrl})` }}><span>{index + 1}</span></div>
                      <label><span>Caption {index + 1}</span><input value={photo.caption} maxLength={72} onChange={(event) => updatePhotoCaption(photo.id, event.target.value)} placeholder="What should they remember?" /></label>
                      <button type="button" onClick={() => removePhoto(photo.id)} aria-label={`Remove ${photo.name}`}>×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="builder-section" id="builder-design" aria-labelledby="builder-design-title">
            <div className="builder-section-heading"><span>02</span><h2 id="builder-design-title">Design</h2></div>
            <fieldset className="theme-picker">
              <legend>Color mood</legend>
              <div className="theme-options">
                {themes.map((option) => (
                  <button aria-pressed={theme.name === option.name} className={theme.name === option.name ? "selected" : ""} key={option.name} onClick={() => { beginEdit(); setTheme(option); }} type="button">
                    <i style={{ backgroundColor: option.color }} aria-hidden="true">{theme.name === option.name ? "✓" : ""}</i><span>{option.name}</span>
                  </button>
                ))}
              </div>
            </fieldset>
            <ChoiceRow label="Background" value={presentation.background} options={backgroundOptions} onChange={(value) => updatePresentation("background", value)} />
            <ChoiceRow label="Typography" value={presentation.typography} options={typographyOptions} onChange={(value) => updatePresentation("typography", value)} />
            <ChoiceRow label="Layout" value={presentation.layout} options={layoutOptions} onChange={(value) => updatePresentation("layout", value)} />
            <ChoiceRow label="Decorations" value={presentation.decoration} options={decorationOptions} onChange={(value) => updatePresentation("decoration", value)} />
          </section>

          <section className="builder-section" id="builder-effects" aria-labelledby="builder-effects-title">
            <div className="builder-section-heading"><span>03</span><h2 id="builder-effects-title">Effects</h2></div>
            <p className="builder-section-copy">Choose one lightweight reveal effect. Reduced-motion preferences are respected automatically.</p>
            <div className="effect-picker">
              {effectOptions.map((option) => (
                <button type="button" key={option.value} className={presentation.effect === option.value ? "selected" : ""} aria-pressed={presentation.effect === option.value} onClick={() => updatePresentation("effect", option.value)}><i aria-hidden="true">{option.symbol}</i><span>{option.label}</span></button>
              ))}
            </div>
          </section>

          {!publishedGift ? (
            <>
              <button ref={previewTriggerRef} className="preview-button" type="button" onClick={openPreview} disabled={!recipient.trim() || !sender.trim() || !message.trim() || !finalMessage.trim()}>
                Wrap & preview <span aria-hidden="true">→</span>
              </button>
              <button className="publish-button" type="button" onClick={publishCurrentGift} disabled={!hasPreviewed || publishing || !recipient.trim() || !sender.trim() || !message.trim()}>{publishing ? "Publishing…" : hasPreviewed ? "Publish gift" : "Preview before publishing"}</button>
              {publishError && <p className="publish-error" role="alert">{publishError}</p>}
              <p className="local-note"><span aria-hidden="true">i</span> Guest publishing uses a public recipient link and a separate private management link.</p>
            </>
          ) : (
            <section className="share-panel" aria-live="polite">
              <span className="share-success">Gift published</span><h2>Your link is ready.</h2><p>Send this private link directly to {recipient}.</p>
              <input aria-label="Share link" readOnly value={publishedGift.shareUrl} onFocus={(event) => event.currentTarget.select()} />
              <ShareTools url={publishedGift.shareUrl} recipientName={recipient} senderName={sender} />
              <div className="share-actions"><a href={publishedGift.shareUrl} target="_blank" rel="noreferrer">Open recipient gift ↗</a><a href={publishedGift.managementUrl}>Manage privately →</a></div>
              <a className="management-link" href={publishedGift.managementUrl}>Private management link</a>
              <small className="management-warning">Keep the management link private. Anyone with it can edit or disable this gift.</small>
            </section>
          )}
        </section>

        <section className="editor-preview" id="builder-preview" aria-label="Live gift preview" style={previewStyle}>
          <div className="preview-label"><span><i /> Live preview</span><span>{template?.name ?? "Recipient view"}</span></div>
          <div className="preview-canvas">
            <span className="preview-occasion">{occasion}</span>
            <GiftFormatExperience {...experienceProps} compact />
            <span className="preview-watermark">Made with Dearly</span>
          </div>
        </section>
      </div>

      {previewOpen && (
        <div className="gift-modal" role="dialog" aria-modal="true" aria-label="Recipient gift preview" style={previewStyle}>
          <button className="modal-close" type="button" onClick={() => { setPreviewOpen(false); window.setTimeout(() => previewTriggerRef.current?.focus(), 0); }} aria-label="Close recipient preview" autoFocus>×</button>
          <RecipientExperience recipientName={recipient} senderName={sender} occasion={occasion} giftType={gift} finalMessage={finalMessage} preview>
            <GiftFormatExperience {...experienceProps} />
          </RecipientExperience>
        </div>
      )}
    </main>
  );
}
