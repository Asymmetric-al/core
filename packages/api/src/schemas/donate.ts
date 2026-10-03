import { z } from "zod";

import { parseMoneyToMinorUnits } from "../money";

const optionalIdentifier = z.preprocess((value) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}, z.string().min(1).optional());

export const donatePostSchema = z.object({
  // Preserve decimal strings until the canonical parser validates exact units.
  amount: z.union([z.number().finite(), z.string()]).refine((value) => {
    try {
      return parseMoneyToMinorUnits(value, "USD") > 0;
    } catch {
      return false;
    }
  }, "Amount must be positive, safe, and exact in currency minor units"),
  currency: z.preprocess((value) => {
    if (typeof value !== "string") return value;
    const normalized = value.trim().toLowerCase();
    return normalized.length > 0 ? normalized : undefined;
  }, z.literal("usd").default("usd")),
  missionary_id: optionalIdentifier,
  fund_id: optionalIdentifier,
  cover_fees: z.boolean().default(false),
  payment_method: z.enum(["card", "ach", "wallet"]).default("card"),
});

export const donateGetQuerySchema = z.object({
  missionary_id: optionalIdentifier,
  fund_id: optionalIdentifier,
});
