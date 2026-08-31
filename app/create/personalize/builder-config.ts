export type GiftTypography = "serif" | "handwritten" | "clean";
export type GiftBackground = "paper" | "blush" | "warm" | "contrast";
export type GiftLayout = "classic" | "editorial" | "playful";
export type GiftDecoration = "botanical" | "hearts" | "sparkles" | "minimal";
export type GiftEffect = "none" | "hearts" | "snow" | "confetti" | "sparkles" | "particles" | "fade";

export type GiftPresentation = {
  typography: GiftTypography;
  background: GiftBackground;
  layout: GiftLayout;
  decoration: GiftDecoration;
  effect: GiftEffect;
};

export type GiftPhoto = {
  id: string;
  name: string;
  dataUrl: string;
  caption: string;
};

export type TemplatePreset = {
  id: string;
  name: string;
  theme: "Rose" | "Wine" | "Sage" | "Gold";
  layout: GiftLayout;
  decoration: GiftDecoration;
};

export const defaultPresentation: GiftPresentation = {
  typography: "serif",
  background: "paper",
  layout: "classic",
  decoration: "minimal",
  effect: "fade",
};

const styleDefaults: Record<string, Partial<GiftPresentation>> = {
  Romantic: { typography: "serif", background: "blush", decoration: "hearts", effect: "hearts" },
  Cozy: { typography: "handwritten", background: "warm", decoration: "botanical", effect: "particles" },
  Minimal: { typography: "clean", background: "paper", decoration: "minimal", effect: "fade", layout: "editorial" },
  Elegant: { typography: "serif", background: "paper", decoration: "minimal", effect: "sparkles", layout: "editorial" },
  Cute: { typography: "handwritten", background: "blush", decoration: "hearts", effect: "sparkles", layout: "playful" },
  Fun: { typography: "clean", background: "warm", decoration: "sparkles", effect: "confetti", layout: "playful" },
  Heartfelt: { typography: "serif", background: "blush", decoration: "botanical", effect: "hearts" },
  Classic: { typography: "serif", background: "paper", decoration: "botanical", effect: "fade", layout: "classic" },
};

export function getPresentationDefaults(template?: TemplatePreset | null, style?: string) {
  const stylePreset = style ? styleDefaults[style] ?? {} : {};
  return {
    ...defaultPresentation,
    ...stylePreset,
    ...(template ? { layout: template.layout, decoration: template.decoration } : {}),
  } satisfies GiftPresentation;
}

export function getThemeName(template?: TemplatePreset | null, style?: string) {
  if (template) return template.theme;
  if (style === "Elegant" || style === "Minimal") return "Wine";
  if (style === "Cozy") return "Sage";
  if (style === "Fun") return "Gold";
  return "Rose";
}

export const typographyOptions: { value: GiftTypography; label: string }[] = [
  { value: "serif", label: "Editorial" },
  { value: "handwritten", label: "Handwritten" },
  { value: "clean", label: "Clean" },
];

export const backgroundOptions: { value: GiftBackground; label: string }[] = [
  { value: "paper", label: "Paper" },
  { value: "blush", label: "Blush" },
  { value: "warm", label: "Warm" },
  { value: "contrast", label: "Contrast" },
];

export const layoutOptions: { value: GiftLayout; label: string }[] = [
  { value: "classic", label: "Classic" },
  { value: "editorial", label: "Editorial" },
  { value: "playful", label: "Playful" },
];

export const decorationOptions: { value: GiftDecoration; label: string }[] = [
  { value: "botanical", label: "Botanical" },
  { value: "hearts", label: "Hearts" },
  { value: "sparkles", label: "Sparkles" },
  { value: "minimal", label: "Minimal" },
];

export const effectOptions: { value: GiftEffect; label: string; symbol: string }[] = [
  { value: "none", label: "None", symbol: "—" },
  { value: "hearts", label: "Hearts", symbol: "♥" },
  { value: "snow", label: "Snow", symbol: "❄" },
  { value: "confetti", label: "Confetti", symbol: "✦" },
  { value: "sparkles", label: "Sparkles", symbol: "✧" },
  { value: "particles", label: "Particles", symbol: "·" },
  { value: "fade", label: "Fade", symbol: "◌" },
];
