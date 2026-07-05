import { z } from "zod";

/**
 * Offline contribution entry contract (Contributions Hub).
 * Source: DONOR_ANONYMITY_GUEST_GIVING_SPEC §6 + §9.3.
 *
 * Offline gifts are cash/check/etc — NO Stripe, NO payment processing. Two
 * intentional modes: `known` (staff has donor identity) and `unknown_offline`
 * (donor truly unavailable — never invent fake donor data, §6.2). This schema
 * is the server-side gate before any mutation; the handler resolves tenant,
 * donor, receipt eligibility, and writes the shared audit event.
 */

const requiredText = (label: string) =>
  z.string().trim().min(1, `${label} is required`);

const normalizedEmail = z.string().trim().toLowerCase().email();

export const offlineAddressSchema = z.object({
  line1: requiredText("Address line 1"),
  line2: z.string().trim().min(1).optional(),
  city: requiredText("City"),
  state: z.string().trim().min(1).optional(),
  postalCode: requiredText("Postal code"),
  country: z.string().trim().length(2).optional(),
});

/** Donor identity supplied inline when staff creates a new donor at entry. */
export const offlineDonorInputSchema = z.object({
  firstName: requiredText("First name"),
  lastName: requiredText("Last name"),
  email: normalizedEmail.optional(),
  phone: z.string().trim().min(1).optional(),
  address: offlineAddressSchema.optional(),
});

const designationSchema = z.object({
  missionaryId: z.string().trim().min(1).optional(),
  fundId: z.string().trim().min(1).optional(),
});

// ISO date (YYYY-MM-DD) or full ISO timestamp — staff-entered received date.
const receivedDate = requiredText("Received date");

const amount = z.coerce
  .number()
  .finite()
  .positive("Amount must be greater than 0");

const knownOffline = z.object({
  donorMode: z.literal("known"),
  donorId: z.string().trim().min(1).optional(),
  donorInput: offlineDonorInputSchema.optional(),
  amount,
  currency: z.literal("usd"),
  receivedDate,
  method: z.enum(["check", "cash", "manual_ach", "wire", "stock", "other"]),
  designation: designationSchema,
  anonymousToRecipient: z.boolean(),
  anonymousToPublic: z.boolean().optional(),
  receiptRequested: z.boolean(),
  batchId: z.string().trim().min(1).optional(),
  referenceNumber: z.string().trim().min(1).optional(),
  internalNote: z.string().trim().min(1).optional(),
});

const unknownOffline = z.object({
  donorMode: z.literal("unknown_offline"),
  amount,
  currency: z.literal("usd"),
  receivedDate,
  // Truly-unknown gifts are cash/other only (§6.2) — a check/wire/ACH/stock
  // carries payer identity and must be entered as `known`.
  method: z.enum(["cash", "other"]),
  designation: designationSchema,
  batchId: z.string().trim().min(1).optional(),
  referenceNumber: z.string().trim().min(1).optional(),
  internalNote: z.string().trim().min(1).optional(),
});

function checkDesignation(
  designation: { missionaryId?: string; fundId?: string },
  ctx: z.RefinementCtx,
) {
  if (Boolean(designation.missionaryId) === Boolean(designation.fundId)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["designation"],
      message: "Provide exactly one designation: missionaryId or fundId",
    });
  }
}

export const offlineContributionSchema = z
  .discriminatedUnion("donorMode", [knownOffline, unknownOffline])
  .superRefine((value, ctx) => {
    checkDesignation(value.designation, ctx);
    if (value.donorMode === "known" && !value.donorId && !value.donorInput) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["donorId"],
        message:
          "Known offline gift requires an existing donorId or donorInput to create/match a donor",
      });
    }
  });

export type OfflineContributionRequest = z.infer<
  typeof offlineContributionSchema
>;
