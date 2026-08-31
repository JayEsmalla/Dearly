import { z } from "zod";

export const giftThemeSchema = z.enum(["rose", "wine", "sage", "gold"]);
export const giftStatusSchema = z.enum(["draft", "wrapped", "published", "disabled"]);

const giftPresentationSchema = z.object({
  typography: z.enum(["serif", "handwritten", "clean"]),
  background: z.enum(["paper", "blush", "warm", "contrast"]),
  layout: z.enum(["classic", "editorial", "playful"]),
  decoration: z.enum(["hearts", "sparkles", "botanical", "minimal"]),
  effect: z.enum(["none", "hearts", "snow", "confetti", "sparkles", "particles", "fade"]),
});

export const publishedBuilderDataSchema = z.object({
  finalMessage: z.string().max(180).default(""),
  signature: z.string().max(48).default("Always,"),
  details: z.record(z.string(), z.string().max(240)).default({}),
  presentation: giftPresentationSchema.optional(),
});

export const publishGiftInputSchema = z.object({
  occasion: z.string().trim().min(1).max(80),
  giftType: z.string().trim().min(1).max(80),
  recipientName: z.string().trim().min(1).max(80),
  senderName: z.string().trim().min(1).max(80),
  message: z.string().trim().min(1).max(240),
  theme: giftThemeSchema,
  builderData: publishedBuilderDataSchema.optional(),
});

export const manageGiftUpdateSchema = z.object({
  recipientName: z.string().trim().min(1).max(80),
  senderName: z.string().trim().min(1).max(80),
  message: z.string().trim().min(1).max(240),
  theme: giftThemeSchema,
  builderData: publishedBuilderDataSchema.optional(),
});

export const publicGiftSchema = z.object({
  publicId: z.string().min(10).max(24),
  occasion: z.string(),
  giftType: z.string(),
  recipientName: z.string(),
  senderName: z.string(),
  message: z.string(),
  theme: giftThemeSchema,
  builderData: publishedBuilderDataSchema,
  opensAt: z.string().nullable(),
  expiresAt: z.string().nullable(),
  publishedAt: z.string().nullable(),
});

export const managedGiftSchema = publicGiftSchema.extend({
  status: giftStatusSchema,
  updatedAt: z.string(),
});

export type PublishGiftInput = z.infer<typeof publishGiftInputSchema>;
export type ManageGiftUpdate = z.infer<typeof manageGiftUpdateSchema>;
export type PublicGift = z.infer<typeof publicGiftSchema>;
export type ManagedGift = z.infer<typeof managedGiftSchema>;
