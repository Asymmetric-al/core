import { z } from "zod";

const optionalIdentifier = z.preprocess((value) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}, z.string().min(1).optional());

export const donatePostSchema = z.object({
  // Donor-entered gift in dollars. Gift intake recomputes charged cents.
  amount: z.coerce.number().finite().positive("Amount must be greater than 0"),
  currency: z.string().trim().min(1).default("usd"),
  missionary_id: optionalIdentifier,
  fund_id: optionalIdentifier,
  cover_fees: z.boolean().default(false),
  payment_method: z.enum(["card", "ach", "wallet"]).default("card"),
});

export const donateGetQuerySchema = z.object({
  missionary_id: optionalIdentifier,
  fund_id: optionalIdentifier,
});
