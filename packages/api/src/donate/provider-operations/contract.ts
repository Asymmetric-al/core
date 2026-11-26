import { z } from "zod";

export const LEASE_SECONDS = 120;
export const CALL_TIMEOUT_MS = 60_000;
export const REPORT_RESERVE_MS = 30_000;
export const MIN_SEND_MS = 10_000;

export const LOWER_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
export const CONNECTED_ACCOUNT = /^acct_[A-Za-z0-9]+$/;
export const PAYMENT_INTENT_ID = /^pi_[A-Za-z0-9]+$/;
export const ERROR_CODE = /^[a-z][a-z0-9_]{0,63}$/;
const CENTS = /^(0|[1-9][0-9]*)$/;

export function retryDelaySeconds(attempt: number): number {
  if (!Number.isSafeInteger(attempt) || attempt < 1)
    throw new RangeError("An attempt is a positive integer.");
  return Math.min(3600, 30 * 2 ** (attempt - 1));
}

const positiveInteger = z
  .number()
  .refine((n) => Number.isSafeInteger(n) && n > 0);

const requestMetadataSchema = z.strictObject({
  asym_operation: z.string().regex(LOWER_UUID),
  asym_intake: z.string().regex(LOWER_UUID),
  gift_amount_cents: z
    .string()
    .regex(CENTS)
    .refine((v) => v !== "0")
    .optional(),
  cover_fees: z.enum(["true", "false"]).optional(),
  payment_method: z.enum(["card", "ach", "wallet"]).optional(),
  cover_amount_cents: z.string().regex(CENTS).optional(),
  estimated_fee_cents: z.string().regex(CENTS).optional(),
});

export const providerRequestSchema = z
  .strictObject({
    amount: positiveInteger,
    currency: z.string().regex(/^[a-z]{3}$/),
    metadata: requestMetadataSchema,
    payment_method_types: z
      .union([
        z.tuple([z.literal("card")]),
        z.tuple([z.literal("us_bank_account")]),
      ])
      .optional(),
    automatic_payment_methods: z
      .strictObject({ enabled: z.literal(true) })
      .optional(),
  })
  .refine((r) => {
    const types = r.payment_method_types !== undefined;
    const automatic = r.automatic_payment_methods !== undefined;
    const method = r.metadata.payment_method;
    if (types === automatic) return false;
    if (types !== (method !== undefined)) return false;
    if (!types) return true;
    return (
      r.payment_method_types?.[0] ===
      (method === "ach" ? "us_bank_account" : "card")
    );
  });

export type ProviderRequest = z.infer<typeof providerRequestSchema>;

export const claimedSchema = z.strictObject({
  outcome: z.literal("claimed"),
  operation_id: z.string().regex(LOWER_UUID),
  tenant_id: z.string().regex(LOWER_UUID),
  attempt: positiveInteger,
  lease_expires_at: z.string(),
  send_deadline: z.string(),
  request_kind: z.string(),
  idempotency_key: z.string(),
  request: providerRequestSchema,
  request_digest: z.string(),
  provider_account: z.string(),
  livemode: z.boolean(),
});

export type ClaimedOperation = z.infer<typeof claimedSchema>;

export const providerResultSchema = z.union([
  z.strictObject({
    result: z.literal("succeeded"),
    provider_object_id: z.string().regex(PAYMENT_INTENT_ID),
  }),
  z.strictObject({
    result: z.literal("refused"),
    error_code: z.string().regex(ERROR_CODE),
  }),
  z.strictObject({
    result: z.enum(["not_performed", "unknown"]),
    retry_delay_seconds: z
      .number()
      .refine((n) => Number.isSafeInteger(n) && n >= 30 && n <= 3600),
    error_code: z.string().regex(ERROR_CODE),
  }),
]);

export type ProviderResult = z.infer<typeof providerResultSchema>;
