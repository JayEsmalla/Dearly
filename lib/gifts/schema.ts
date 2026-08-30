import { z } from "zod";

export const giftThemeSchema = z.enum(["rose", "wine", "sage", "gold"]);

export const publishGiftInputSchema = z.object({
  occasion: z.string().trim().min(1).max(80),
  giftType: z.string().trim().min(1).max(80),
  recipientName: z.string().trim().min(1).max(80),
  senderName: z.string().trim().min(1).max(80),
  message: z.string().trim().min(1).max(240),
  theme: giftThemeSchema,
});

export const publicGiftSchema = z.object({
  publicId: z.string().min(10).max(24),
  occasion: z.string(),
  giftType: z.string(),
  recipientName: z.string(),
  senderName: z.string(),
  message: z.string(),
  theme: giftThemeSchema,
  opensAt: z.string().nullable(),
  expiresAt: z.string().nullable(),
  publishedAt: z.string().nullable(),
});

export type PublishGiftInput = z.infer<typeof publishGiftInputSchema>;
export type PublicGift = z.infer<typeof publicGiftSchema>;

