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

export const giftTypes = [
  { name: "Digital Letter", short: "Letter", description: "A keepsake made from your words", symbol: "✉", tone: "rose" },
  { name: "Greeting Card", short: "Card", description: "A small celebration with a big feeling", symbol: "♡", tone: "peach" },
  { name: "Virtual Flowers", short: "Flowers", description: "A bouquet that never fades", symbol: "✿", tone: "sage" },
  { name: "Memory Album", short: "Album", description: "Favorite moments, beautifully gathered", symbol: "▧", tone: "paper" },
  { name: "Gift Box", short: "Gift box", description: "A collection of little surprises", symbol: "◇", tone: "wine" },
  { name: "Wish Jar", short: "Wish jar", description: "Notes they can open one by one", symbol: "⌇", tone: "sand" },
] as const;
