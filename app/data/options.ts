export const occasions = [
  { name: "Birthday", description: "Their day, made more personal", symbol: "01" },
  { name: "Anniversary", description: "Celebrate another chapter", symbol: "02" },
  { name: "Valentine’s Day", description: "Say what is in your heart", symbol: "03" },
  { name: "Christmas", description: "Send a little holiday warmth", symbol: "04" },
  { name: "Graduation", description: "Honor how far they have come", symbol: "05" },
  { name: "Thank You", description: "Make your gratitude memorable", symbol: "06" },
  { name: "Friendship", description: "For the person who shows up", symbol: "07" },
  { name: "Just Because", description: "No date needed—only a reason", symbol: "08" },
  { name: "Congratulations", description: "Cheer for their bright moment", symbol: "09" },
  { name: "Other", description: "Make the moment entirely yours", symbol: "10" },
] as const;

export const recipientTypes = [
  { name: "Partner", description: "Romantic and close", symbol: "♡" },
  { name: "Best Friend", description: "Warm, playful, familiar", symbol: "☺" },
  { name: "Friend", description: "Thoughtful without overdoing it", symbol: "✦" },
  { name: "Mother", description: "Grateful and heartfelt", symbol: "✿" },
  { name: "Father", description: "Warm and appreciative", symbol: "◇" },
  { name: "Sibling", description: "Personal, fun, and familiar", symbol: "∞" },
  { name: "Family", description: "Made for someone close to home", symbol: "⌂" },
  { name: "Coworker", description: "Polished and friendly", symbol: "•" },
  { name: "Teacher", description: "Respectful and thankful", symbol: "✎" },
  { name: "Someone Special", description: "Keep the relationship open", symbol: "♥" },
] as const;

export const giftTypes = [
  { name: "Digital Letter", short: "Letter", description: "A keepsake made from your words", symbol: "✉", tone: "rose" },
  { name: "Greeting Card", short: "Card", description: "A small celebration with a big feeling", symbol: "♡", tone: "peach" },
  { name: "Virtual Flowers", short: "Flowers", description: "A bouquet that never fades", symbol: "✿", tone: "sage" },
  { name: "Memory Album", short: "Album", description: "Favorite moments, beautifully gathered", symbol: "▧", tone: "paper" },
  { name: "Gift Box", short: "Gift box", description: "A collection of little surprises", symbol: "◇", tone: "wine" },
  { name: "Wish Jar", short: "Wish jar", description: "Notes they can open one by one", symbol: "⌇", tone: "sand" },
] as const;

export const giftStyles = [
  { name: "Romantic", description: "Soft, intimate, expressive", symbol: "♡" },
  { name: "Cozy", description: "Warm, familiar, comforting", symbol: "⌂" },
  { name: "Minimal", description: "Quiet, clean, understated", symbol: "—" },
  { name: "Elegant", description: "Refined, graceful, polished", symbol: "◇" },
  { name: "Cute", description: "Sweet, light, affectionate", symbol: "✿" },
  { name: "Fun", description: "Bright, playful, energetic", symbol: "✦" },
  { name: "Heartfelt", description: "Sincere, personal, emotional", symbol: "♥" },
  { name: "Classic", description: "Timeless and familiar", symbol: "✉" },
] as const;

export type GiftTemplate = {
  id: string;
  name: string;
  giftType: (typeof giftTypes)[number]["name"];
  description: string;
  styles: string[];
  occasions: string[];
  recipients: string[];
  theme: "Rose" | "Wine" | "Sage" | "Gold";
  layout: "classic" | "editorial" | "playful";
  decoration: "botanical" | "hearts" | "sparkles" | "minimal";
};

export const giftTemplates: GiftTemplate[] = [
  { id: "letter-heartfelt", name: "From the Heart", giftType: "Digital Letter", description: "A warm paper letter for the words you do not want rushed.", styles: ["Heartfelt", "Romantic", "Classic"], occasions: ["Anniversary", "Valentine’s Day", "Just Because", "Thank You"], recipients: ["Partner", "Best Friend", "Mother", "Someone Special"], theme: "Rose", layout: "classic", decoration: "botanical" },
  { id: "letter-minimal", name: "Quiet Words", giftType: "Digital Letter", description: "A restrained letter that keeps every bit of attention on the message.", styles: ["Minimal", "Elegant"], occasions: ["Graduation", "Thank You", "Congratulations", "Other"], recipients: ["Friend", "Coworker", "Teacher", "Father"], theme: "Wine", layout: "editorial", decoration: "minimal" },
  { id: "card-celebrate", name: "Little Celebration", giftType: "Greeting Card", description: "A cheerful folded card with a warm inside message.", styles: ["Fun", "Cute", "Classic"], occasions: ["Birthday", "Graduation", "Congratulations", "Christmas"], recipients: ["Best Friend", "Friend", "Sibling", "Family"], theme: "Gold", layout: "playful", decoration: "sparkles" },
  { id: "card-elegant", name: "Simply Yours", giftType: "Greeting Card", description: "A refined card with calm spacing and a keepsake feel.", styles: ["Elegant", "Minimal", "Romantic"], occasions: ["Anniversary", "Valentine’s Day", "Thank You"], recipients: ["Partner", "Mother", "Someone Special", "Teacher"], theme: "Rose", layout: "editorial", decoration: "minimal" },
  { id: "flowers-romantic", name: "Soft Bloom", giftType: "Virtual Flowers", description: "A gentle bouquet reveal with a personal message card.", styles: ["Romantic", "Elegant", "Heartfelt"], occasions: ["Anniversary", "Valentine’s Day", "Birthday", "Just Because"], recipients: ["Partner", "Mother", "Someone Special"], theme: "Rose", layout: "classic", decoration: "botanical" },
  { id: "flowers-bright", name: "Bright Day", giftType: "Virtual Flowers", description: "An upbeat bouquet for congratulations, gratitude, and good news.", styles: ["Fun", "Cute", "Cozy"], occasions: ["Birthday", "Graduation", "Congratulations", "Thank You"], recipients: ["Best Friend", "Friend", "Coworker", "Teacher"], theme: "Sage", layout: "playful", decoration: "sparkles" },
  { id: "album-warm", name: "Our Favorite Days", giftType: "Memory Album", description: "A scrapbook-like collection for photos, captions, and small memories.", styles: ["Cozy", "Heartfelt", "Classic"], occasions: ["Birthday", "Anniversary", "Friendship", "Just Because"], recipients: ["Partner", "Best Friend", "Sibling", "Family"], theme: "Gold", layout: "classic", decoration: "botanical" },
  { id: "album-editorial", name: "A Story in Frames", giftType: "Memory Album", description: "A cleaner gallery-style album that lets each memory breathe.", styles: ["Minimal", "Elegant"], occasions: ["Graduation", "Anniversary", "Thank You", "Other"], recipients: ["Friend", "Father", "Mother", "Teacher"], theme: "Wine", layout: "editorial", decoration: "minimal" },
  { id: "box-playful", name: "Three Little Surprises", giftType: "Gift Box", description: "A playful box that reveals several small digital surprises.", styles: ["Fun", "Cute", "Cozy"], occasions: ["Birthday", "Christmas", "Friendship", "Just Because"], recipients: ["Best Friend", "Sibling", "Friend", "Family"], theme: "Gold", layout: "playful", decoration: "sparkles" },
  { id: "box-elegant", name: "Wrapped for You", giftType: "Gift Box", description: "A polished collection of notes, memories, and a final reveal.", styles: ["Elegant", "Romantic", "Heartfelt"], occasions: ["Anniversary", "Valentine’s Day", "Congratulations"], recipients: ["Partner", "Someone Special", "Mother"], theme: "Wine", layout: "editorial", decoration: "hearts" },
  { id: "jar-heartfelt", name: "Open When You Need It", giftType: "Wish Jar", description: "Small notes to open one at a time whenever they need a lift.", styles: ["Heartfelt", "Cozy", "Classic"], occasions: ["Just Because", "Birthday", "Friendship", "Thank You"], recipients: ["Best Friend", "Friend", "Sibling", "Family"], theme: "Sage", layout: "classic", decoration: "botanical" },
  { id: "jar-sweet", name: "Little Wishes", giftType: "Wish Jar", description: "A sweet collection of tiny wishes, reminders, and affectionate notes.", styles: ["Cute", "Romantic", "Fun"], occasions: ["Birthday", "Valentine’s Day", "Anniversary", "Christmas"], recipients: ["Partner", "Best Friend", "Someone Special"], theme: "Rose", layout: "playful", decoration: "hearts" },
];

export function recommendTemplates({ occasion, recipient, giftType, style }: { occasion?: string; recipient?: string; giftType: string; style?: string }) {
  return giftTemplates
    .filter((template) => template.giftType === giftType)
    .map((template) => {
      let score = 0;
      if (style && template.styles.includes(style)) score += 4;
      if (occasion && template.occasions.includes(occasion)) score += 3;
      if (recipient && template.recipients.includes(recipient)) score += 2;
      return { ...template, score };
    })
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
}
