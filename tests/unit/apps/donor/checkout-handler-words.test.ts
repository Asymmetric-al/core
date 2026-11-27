import { describe, expect, it, vi } from "vitest";

import {
  CHECKOUT_WORDS,
  intakeRefusalWords,
  type IntakeRefusal,
} from "../../../../apps/donor/app/(public)/(solid)/checkout/checkout-words";
import {
  createGuestIntakeHandler,
  type GuestIntakeDeps,
} from "../../../../packages/api/src/donate/guest/intake-handler";

const FUND = "11111111-1111-4111-8111-111111111111";

const OPEN = {
  outcome: "created",
  donation_id: "33333333-3333-4333-8333-333333333333",
  operation_id: "44444444-4444-4444-8444-444444444444",
  tenant_id: "55555555-5555-4555-8555-555555555555",
  amount: 2500,
  currency: "usd",
  provider_account: "acct_alpha1",
  payment_intent: null,
  gift_state: "open",
};

type Answer = {
  data: unknown;
  error: { code?: string; message: string; details?: string } | null;
};

type Case = {
  code: string;
  status: number;
  words: string;
  over?: Partial<GuestIntakeDeps>;
  body?: Record<string, unknown>;
  attempt?: Answer;
  begin?: Answer;
};

const refused = (code: string, message: string, details?: string): Answer => ({
  data: null,
  error: { code, message, ...(details ? { details } : {}) },
});

function mount(c: Case) {
  const sendFirst = vi.fn(async () => ({ paymentIntentId: "pi_first1" }));
  const clientSecret = vi.fn(async () => "pi_first1_secret_abc");
  const rpc = vi.fn(async (fn: string) =>
    fn === "take_intake_attempt"
      ? (c.attempt ?? {
          data: { admitted: true, retry_after_seconds: null },
          error: null,
        })
      : (c.begin ?? { data: OPEN, error: null }),
  );
  const deps: GuestIntakeDeps = {
    enabled: () => true,
    challengeSecret: () => "1x0000000000000000000000000000000AA",
    verifyChallenge: async () => ({ ok: true }),
    rpc: () => rpc as never,
    sendFirst,
    clientSecret,
    isHomeHost: async () => true,
    resolveActor: async () => null,
    ...c.over,
  };
  return { handler: createGuestIntakeHandler(deps), sendFirst, clientSecret };
}

function request(over: Record<string, unknown> = {}) {
  return new Request("https://give.example.test/api/donate", {
    method: "POST",
    headers: {
      host: "give.example.test",
      "content-type": "application/json",
      "x-forwarded-for": "198.51.100.4",
    },
    body: JSON.stringify({
      key: "browser-key-0001",
      lines: [{ fundId: FUND, amountCents: 2500 }],
      coverFees: false,
      paymentMethod: "card",
      isAnonymous: false,
      contact: { email: "gail@example.test", firstName: "Gail" },
      challengeToken: "token-1",
      ...over,
    }),
  });
}

const CASES: Case[] = [
  {
    code: "giving_unavailable",
    status: 503,
    words: CHECKOUT_WORDS.intakeUnavailable,
    over: { enabled: () => false },
  },
  {
    code: "payment_not_started",
    status: 503,
    words: CHECKOUT_WORDS.notStarted,
    begin: refused("57014", "canceling statement due to statement timeout"),
  },
  {
    code: "too_many_requests (address)",
    status: 429,
    words: CHECKOUT_WORDS.addressBucket,
    attempt: {
      data: { admitted: false, retry_after_seconds: 60, bucket: "address" },
      error: null,
    },
  },
  {
    code: "too_many_requests (person)",
    status: 429,
    words: CHECKOUT_WORDS.personBucket,
    attempt: {
      data: { admitted: false, retry_after_seconds: 300, bucket: "person" },
      error: null,
    },
  },
  {
    code: "challenge_required",
    status: 400,
    words: CHECKOUT_WORDS.challenge,
    body: { challengeToken: "" },
  },
  {
    code: "challenge_failed",
    status: 400,
    words: CHECKOUT_WORDS.challenge,
    over: { verifyChallenge: async () => ({ ok: false, reason: "invalid" }) },
  },
  {
    code: "sign_in_required",
    status: 401,
    words: CHECKOUT_WORDS.signInRequired,
    body: { mode: "signed_in", contact: { email: "gail@example.test" } },
  },
  {
    code: "target_not_found",
    status: 400,
    words: CHECKOUT_WORDS.targetNotFound,
    begin: refused("22023", "target_not_found"),
  },
  {
    code: "lines_span_entities",
    status: 400,
    words: CHECKOUT_WORDS.linesSpanEntities,
    begin: refused("22023", "lines_span_entities"),
  },
  {
    code: "amount_out_of_range",
    status: 400,
    words:
      "Online gifts must be between $0.50 and $999,999.99. Your card wasn't charged.",
    begin: refused(
      "22023",
      "amount_out_of_range",
      "Online gifts must be between 50 and 99,999,999 cents",
    ),
  },
  {
    code: "contact_required",
    status: 400,
    words: CHECKOUT_WORDS.contactRequired,
    begin: refused("22023", "contact_required"),
  },
  ...[
    "reserved_fund_line",
    "client_key_invalid",
    "source_site_not_admitted",
    "fee_cover_out_of_range",
  ].map((code): Case => ({
    code,
    status: 400,
    words: CHECKOUT_WORDS.detailsRefused,
    begin: refused("22023", code),
  })),
  {
    code: "invalid_request",
    status: 400,
    words: CHECKOUT_WORDS.detailsRefused,
    body: { paymentMethod: "us_bank_account" },
  },
  ...["actor_not_admitted", "actor_required"].map((code): Case => ({
    code,
    status: 400,
    words: CHECKOUT_WORDS.actorRefused,
    begin: refused("22023", code),
  })),
  {
    code: "idempotency_key_reused",
    status: 409,
    words: CHECKOUT_WORDS.keyReused,
    begin: refused("23505", "idempotency_key_reused"),
  },
  {
    code: "gift_closed",
    status: 409,
    words: CHECKOUT_WORDS.giftClosed,
    begin: { data: { ...OPEN, gift_state: "closed" }, error: null },
  },
  {
    code: "gift_already_completed",
    status: 409,
    words: CHECKOUT_WORDS.received,
    begin: { data: { ...OPEN, gift_state: "paid" }, error: null },
  },
];

describe("AL-2681 PR 2b: each answer of the mounted intake reads its agreed words, and nothing is charged", () => {
  it.each(CASES.map((c) => [c.code, c] as const))("%s", async (_code, c) => {
    const { handler, sendFirst, clientSecret } = mount(c);
    const response = await handler(request(c.body));
    const body = (await response.json()) as Omit<IntakeRefusal, "status">;
    expect(response.status).toBe(c.status);
    expect(intakeRefusalWords({ status: response.status, ...body })).toBe(
      c.words,
    );
    expect(sendFirst).not.toHaveBeenCalled();
    expect(clientSecret).not.toHaveBeenCalled();
  });

  it("names every code the approved table lists", () => {
    expect(new Set(CASES.map((c) => c.code.split(" ")[0]))).toEqual(
      new Set([
        "giving_unavailable",
        "payment_not_started",
        "too_many_requests",
        "challenge_required",
        "challenge_failed",
        "sign_in_required",
        "target_not_found",
        "lines_span_entities",
        "amount_out_of_range",
        "contact_required",
        "reserved_fund_line",
        "client_key_invalid",
        "source_site_not_admitted",
        "fee_cover_out_of_range",
        "invalid_request",
        "actor_not_admitted",
        "actor_required",
        "idempotency_key_reused",
        "gift_closed",
        "gift_already_completed",
      ]),
    );
  });
});
