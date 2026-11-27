import { z } from "zod";

import { quoteGiftProcessingFee } from "../fee-policy";
import {
  verifyGuestChallenge,
  type ChallengeVerdict,
  type VerifyChallengeInput,
} from "./challenge";

export type GuestRpcError = { code?: string; message: string };

export type GuestIntakeRpc = (
  fn: "take_intake_rate_token" | "begin_line_gift",
  args: Record<string, unknown>,
) => Promise<{ data: unknown; error: GuestRpcError | null }>;

export type GuestActor = {
  user_id: string;
  email: string | null;
  email_confirmed: boolean;
};

export type GuestIntakeDeps = {
  enabled: () => boolean;
  challengeSecret: () => string | undefined;
  verifyChallenge?: (input: VerifyChallengeInput) => Promise<ChallengeVerdict>;
  rpc: () => GuestIntakeRpc | null;
  isHomeHost: (host: string) => Promise<boolean>;
  resolveActor?: (request: Request) => Promise<GuestActor | null>;
  sendFirst: (
    operationId: string,
  ) => Promise<{ paymentIntentId: string } | null>;
  clientSecret: (input: {
    account: string;
    paymentIntentId: string;
  }) => Promise<string | null>;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const lineSchema = z
  .object({
    fundId: z.string().regex(UUID).optional(),
    missionaryId: z.string().regex(UUID).optional(),
    amountCents: z.number().int().positive().max(100_000_000_000),
  })
  .refine(
    (line) => (line.fundId === undefined) !== (line.missionaryId === undefined),
  );

const bodySchema = z.object({
  key: z.string().min(1).max(200),
  surface: z.enum(["website", "donor_account"]).default("website"),
  asGuest: z.boolean().default(false),
  lines: z.array(lineSchema).min(1).max(99),
  coverFees: z.boolean(),
  paymentMethod: z.literal("card"),
  isAnonymous: z.boolean(),
  sourceCode: z.string().max(200).nullish(),
  contact: z.object({
    email: z.string().min(3).max(254),
    firstName: z.string().max(200).nullish(),
    lastName: z.string().max(200).nullish(),
    address: z.record(z.string(), z.string().max(500)).nullish(),
  }),
  challengeToken: z.string().nullish(),
});

const intakeSchema = z.object({
  outcome: z.enum(["created", "replayed"]),
  donation_id: z.string().regex(UUID),
  operation_id: z.string().regex(UUID),
  amount: z.number().int().positive(),
  provider_account: z.string().regex(/^acct_[A-Za-z0-9]+$/),
  payment_intent: z
    .string()
    .regex(/^pi_[A-Za-z0-9]+$/)
    .nullable(),
});

const INPUT_REFUSALS = new Set([
  "lines_span_entities",
  "reserved_fund_line",
  "target_not_found",
  "lines_invalid",
  "payment_method_refused",
  "anonymity_required",
  "contact_required",
  "actor_not_admitted",
  "actor_required",
  "client_key_invalid",
]);

const json = (status: number, body: unknown) => Response.json(body, { status });
const unavailable = () => json(503, { error: "giving_unavailable" });
const notStarted = () =>
  json(503, { error: "payment_not_started", retry: true });
const invalid = () => json(400, { error: "invalid_request" });

function clientAddress(request: Request): string | null {
  const first = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return first ? first : null;
}

function refusal(error: GuestRpcError): Response {
  if (error.code === "23505" && error.message === "idempotency_key_reused")
    return json(409, { error: "idempotency_key_reused" });
  if (error.code === "22023")
    return INPUT_REFUSALS.has(error.message)
      ? json(400, { error: error.message })
      : invalid();
  if (error.code === "42501" || error.code === "55000") return unavailable();
  return notStarted();
}

async function call(
  rpc: GuestIntakeRpc,
  fn: "take_intake_rate_token" | "begin_line_gift",
  args: Record<string, unknown>,
) {
  try {
    return await rpc(fn, args);
  } catch {
    return { data: null, error: { message: "rpc_failed" } };
  }
}

export function createGuestIntakeHandler(deps: GuestIntakeDeps) {
  const verify = deps.verifyChallenge ?? verifyGuestChallenge;

  return async function POST(request: Request): Promise<Response> {
    if (!deps.enabled()) return unavailable();
    const secret = deps.challengeSecret()?.trim();
    if (!secret) return unavailable();
    const rpc = deps.rpc();
    if (!rpc) return unavailable();
    const host = request.headers.get("host")?.trim();
    if (!host) return unavailable();
    const address = clientAddress(request);
    if (!address) return unavailable();

    let raw: unknown;
    try {
      raw = await request.json();
    } catch {
      return invalid();
    }
    const parsed = bodySchema.safeParse(raw);
    if (!parsed.success) return invalid();
    const body = parsed.data;

    if (body.asGuest && body.surface === "donor_account") return invalid();

    if (!body.challengeToken?.trim())
      return json(400, { error: "challenge_required" });
    const verdict = await verify({
      token: body.challengeToken,
      remoteIp: address,
      secret,
    });
    if (!verdict.ok)
      return verdict.reason === "unavailable"
        ? notStarted()
        : json(400, { error: "challenge_failed" });

    let actor: GuestActor | null = null;
    if (!body.asGuest) {
      try {
        if (await deps.isHomeHost(host))
          actor = (await deps.resolveActor?.(request)) ?? null;
        else if (body.surface === "donor_account") return unavailable();
      } catch {
        return notStarted();
      }
    }
    if (body.surface === "donor_account" && !actor)
      return json(401, { error: "sign_in_required" });

    const token = await call(rpc, "take_intake_rate_token", {
      p_address: address,
    });
    if (token.error) return notStarted();
    if (token.data !== true) return json(429, { error: "too_many_requests" });

    const giftCents = body.lines.reduce(
      (sum, line) => sum + line.amountCents,
      0,
    );
    const fee = body.coverFees
      ? quoteGiftProcessingFee({
          giftAmountCents: giftCents,
          coverFees: true,
          paymentMethod: body.paymentMethod,
        }).coverAmountCents
      : 0;

    const begun = await call(rpc, "begin_line_gift", {
      p_host: host,
      p_entry_surface: body.surface,
      p_client_key: body.key,
      p_lines: body.lines.map((line) =>
        line.fundId
          ? { fund_id: line.fundId, amount: line.amountCents }
          : { missionary_id: line.missionaryId, amount: line.amountCents },
      ),
      p_fee_cover: fee,
      p_payment_method: body.paymentMethod,
      p_is_anonymous: body.isAnonymous,
      p_source_code: body.sourceCode ?? null,
      p_contact: {
        email: body.contact.email,
        first_name: body.contact.firstName ?? null,
        last_name: body.contact.lastName ?? null,
        address: body.contact.address ?? null,
      },
      p_actor: actor,
      p_site_id: null,
    });
    if (begun.error) return refusal(begun.error);
    const intake = intakeSchema.safeParse(begun.data);
    if (!intake.success) return notStarted();

    let paymentIntentId = intake.data.payment_intent;
    if (!paymentIntentId) {
      const sent = await deps.sendFirst(intake.data.operation_id);
      paymentIntentId = sent?.paymentIntentId ?? null;
    }
    if (!paymentIntentId) return notStarted();
    const clientSecret = await deps.clientSecret({
      account: intake.data.provider_account,
      paymentIntentId,
    });
    if (!clientSecret) return notStarted();

    return json(200, {
      intakeId: intake.data.donation_id,
      clientSecret,
      connectedAccountId: intake.data.provider_account,
      amountCents: intake.data.amount,
    });
  };
}
