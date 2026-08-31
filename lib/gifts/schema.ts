import { z } from "zod";

export const giftThemeSchema = z.enum(["rose", "wine", "sage", "gold"]);
export const giftStatusSchema = z.enum(["draft", "wrapped", "published", "opened", "replied", "disabled"]);

const giftPresentationSchema = z.object({
  typography: z.enum(["serif", "handwritten", "clean"]),
  background: z.enum(["paper", "blush", "warm", "contrast"]),
  layout: z.enum(["classic", "editorial", "playful"]),
  decoration: z.enum(["hearts", "sparkles", "botanical", "minimal"]),
  effect: z.enum(["none", "hearts", "snow", "confetti", "sparkles", "particles", "fade"]),
});

const giftPinSchema = z.string().regex(/^\d{4,8}$/, "PINs contain 4 to 8 numbers.");
const optionalDateTimeSchema = z.string().datetime({ offset: true }).nullable().optional();

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
  pin: giftPinSchema.optional(),
  opensAt: optionalDateTimeSchema,
  expiresAt: optionalDateTimeSchema,
}).superRefine((value, context) => {
  const now = Date.now();
  const opensAt = value.opensAt ? new Date(value.opensAt).getTime() : null;
  const expiresAt = value.expiresAt ? new Date(value.expiresAt).getTime() : null;
  if (opensAt !== null && opensAt <= now) context.addIssue({ code: "custom", path: ["opensAt"], message: "Scheduled opening must be in the future." });
  if (expiresAt !== null && expiresAt <= now) context.addIssue({ code: "custom", path: ["expiresAt"], message: "Expiration must be in the future." });
  if (opensAt !== null && expiresAt !== null && opensAt >= expiresAt) context.addIssue({ code: "custom", path: ["expiresAt"], message: "Expiration must be after the scheduled opening." });
});

export const manageGiftUpdateSchema = z.object({
  recipientName: z.string().trim().min(1).max(80),
  senderName: z.string().trim().min(1).max(80),
  message: z.string().trim().min(1).max(240),
  theme: giftThemeSchema,
  builderData: publishedBuilderDataSchema.optional(),
  pin: z.union([giftPinSchema, z.null()]).optional(),
  opensAt: optionalDateTimeSchema,
  expiresAt: optionalDateTimeSchema,
}).superRefine((value, context) => {
  const opensAt = value.opensAt ? new Date(value.opensAt).getTime() : null;
  const expiresAt = value.expiresAt ? new Date(value.expiresAt).getTime() : null;
  if (opensAt !== null && expiresAt !== null && opensAt >= expiresAt) context.addIssue({ code: "custom", path: ["expiresAt"], message: "Expiration must be after the scheduled opening." });
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
  ownerId: z.string().uuid().nullable(),
  pinProtected: z.boolean(),
});

export type PublishGiftInput = z.infer<typeof publishGiftInputSchema>;
export type ManageGiftUpdate = z.infer<typeof manageGiftUpdateSchema>;
export type PublicGift = z.infer<typeof publicGiftSchema>;
export type ManagedGift = z.infer<typeof managedGiftSchema>;
