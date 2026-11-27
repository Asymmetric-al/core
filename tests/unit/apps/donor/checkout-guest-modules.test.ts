import { describe, expect, it } from "vitest";

import {
  forgetGiftKey,
  GIFT_KEY_STORAGE,
  GIFT_KEY_WINDOW_MS,
  giftKeyFor,
  rememberedPayment,
  rememberPayment,
} from "../../../../apps/donor/app/(public)/(solid)/checkout/checkout-gift-key";
import {
  handOffHref,
  readCheckoutLink,
} from "../../../../apps/donor/app/(public)/(solid)/checkout/checkout-targets";
import {
  CHECKOUT_WORDS,
  intakeRefusalWords,
  paymentStateNotice,
} from "../../../../apps/donor/app/(public)/(solid)/checkout/checkout-words";

const FUND = "11111111-1111-4111-8111-111111111111";
const WORKER = "22222222-2222-4222-8222-222222222222";
const SITE = "33333333-3333-4333-8333-333333333333";

function memory() {
  const store = new Map<string, string>();
  return {
    store,
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  };
}

const inputs = (amountCents = 2500) => ({
  lines: [{ fundId: FUND, amountCents }],
  coverFees: false,
  isAnonymous: false,
  surface: "website",
});

describe("AL-2681 PR 2b: the checkout's words (the coordinator's approved sentences)", () => {
  it.each([
    [
      { status: 503, error: "giving_unavailable" },
      CHECKOUT_WORDS.intakeUnavailable,
    ],
    [{ status: 503, error: "payment_not_started" }, CHECKOUT_WORDS.notStarted],
    [{ status: 400, error: "challenge_required" }, CHECKOUT_WORDS.challenge],
    [{ status: 400, error: "challenge_failed" }, CHECKOUT_WORDS.challenge],
    [{ status: 401, error: "sign_in_required" }, CHECKOUT_WORDS.signInRequired],
    [
      { status: 400, error: "lines_span_entities" },
      CHECKOUT_WORDS.linesSpanEntities,
    ],
    [{ status: 400, error: "target_not_found" }, CHECKOUT_WORDS.targetNotFound],
    [
      { status: 400, error: "contact_required" },
      CHECKOUT_WORDS.contactRequired,
    ],
    [
      { status: 400, error: "reserved_fund_line" },
      CHECKOUT_WORDS.detailsRefused,
    ],
    [
      { status: 400, error: "client_key_invalid" },
      CHECKOUT_WORDS.detailsRefused,
    ],
    [
      { status: 400, error: "source_site_not_admitted" },
      CHECKOUT_WORDS.detailsRefused,
    ],
    [
      { status: 400, error: "fee_cover_out_of_range" },
      CHECKOUT_WORDS.detailsRefused,
    ],
    [{ status: 400, error: "invalid_request" }, CHECKOUT_WORDS.detailsRefused],
    [{ status: 400, error: "actor_not_admitted" }, CHECKOUT_WORDS.actorRefused],
    [{ status: 400, error: "actor_required" }, CHECKOUT_WORDS.actorRefused],
    [
      { status: 409, error: "idempotency_key_reused" },
      CHECKOUT_WORDS.keyReused,
    ],
    [{ status: 409, error: "gift_closed" }, CHECKOUT_WORDS.giftClosed],
    [
      { status: 409, error: "gift_already_completed" },
      "Your gift was received.",
    ],
    [
      { status: 429, error: "too_many_requests", bucket: "address" },
      CHECKOUT_WORDS.addressBucket,
    ],
    [
      { status: 429, error: "too_many_requests", bucket: "person" },
      CHECKOUT_WORDS.personBucket,
    ],
  ])("%j reads its sentence", (refusal, words) => {
    expect(intakeRefusalWords(refusal)).toBe(words);
  });

  it("amount_out_of_range shows the bounds the server sent, in the gift's currency, and types no figure of its own", () => {
    expect(
      intakeRefusalWords({
        status: 400,
        error: "amount_out_of_range",
        minCents: 50,
        maxCents: 99_999_999,
        currency: "usd",
      }),
    ).toBe(
      "Online gifts must be between $0.50 and $999,999.99. Your card wasn't charged.",
    );
    expect(
      intakeRefusalWords({
        status: 400,
        error: "amount_out_of_range",
        minCents: 100,
        maxCents: 2_000,
        currency: "usd",
      }),
    ).toBe(
      "Online gifts must be between $1.00 and $20.00. Your card wasn't charged.",
    );
  });

  it("no sentence promises a receipt, a match or an account, and key reuse never says nothing was charged before", () => {
    for (const text of Object.values(CHECKOUT_WORDS)) {
      expect(text).not.toMatch(/receipt|matched|added to your account/i);
    }
    expect(CHECKOUT_WORDS.keyReused).not.toContain("Your card wasn't charged");
    expect(CHECKOUT_WORDS.received).toBe("Your gift was received.");
    expect(CHECKOUT_WORDS.claimOffer).toBe(
      "Verify your email to claim your giving history.",
    );
  });

  it("a payment's state reads its sentence: received only on success", () => {
    expect(paymentStateNotice("succeeded")).toEqual({
      tone: "success",
      text: "Your gift was received.",
    });
    expect(paymentStateNotice("processing").text).toBe(CHECKOUT_WORDS.pending);
    expect(paymentStateNotice("requires_payment_method").text).toBe(
      CHECKOUT_WORDS.declined,
    );
    expect(paymentStateNotice("canceled").text).not.toBe(
      CHECKOUT_WORDS.received,
    );
  });
});

describe("AL-2681 PR 2b, the inventory ruling 6: one gift key across the browser's tabs", () => {
  it("two tabs with the same inputs send the same key; other inputs make a new one", async () => {
    const shared = memory();
    let n = 0;
    const next = () => `key-${(n += 1)}`;
    const first = await giftKeyFor(inputs(), shared, 1_000, next);
    const second = await giftKeyFor(inputs(), shared, 2_000, next);
    expect(second).toBe(first);
    const other = await giftKeyFor(inputs(3000), shared, 3_000, next);
    expect(other).not.toBe(first);
  });

  it("the key is forgotten when the window passes or a final state is shown, and nothing personal is stored with it", async () => {
    const shared = memory();
    const tab = memory();
    const key = await giftKeyFor(inputs(), shared, 1_000);
    expect(
      await giftKeyFor(inputs(), shared, 1_000 + GIFT_KEY_WINDOW_MS + 1),
    ).not.toBe(key);
    expect(shared.store.get(GIFT_KEY_STORAGE)).not.toMatch(/@|Gail/);
    rememberPayment(tab, {
      key,
      clientSecret: "pi_1_secret_x",
      account: "acct_1",
      publishableKey: "pk_test_1",
    });
    expect(rememberedPayment(tab)).toMatchObject({
      clientSecret: "pi_1_secret_x",
    });
    expect(shared.store.size).toBe(1);
    forgetGiftKey(shared, tab);
    expect(shared.store.size).toBe(0);
    expect(rememberedPayment(tab)).toBeNull();
  });
});

describe("AL-2681 PR 2b: what the checkout reads from its link", () => {
  it("reads a missionary, a fund, an amount, monthly and a source Site, and nothing that is not a UUID", () => {
    expect(
      readCheckoutLink({
        missionary_id: WORKER,
        amount: "25",
        frequency: "monthly",
        sourceSiteId: SITE,
      }),
    ).toEqual({
      target: { kind: "missionary", id: WORKER },
      amountCents: 2500,
      monthly: true,
      sourceSiteId: SITE,
    });
    expect(readCheckoutLink({ fund_id: FUND, amount: "10.50" }).target).toEqual(
      { kind: "fund", id: FUND },
    );
    expect(readCheckoutLink({ workerId: WORKER }).target).toEqual({
      kind: "missionary",
      id: WORKER,
    });
    expect(readCheckoutLink({ fund: "general" }).target).toBeNull();
    expect(
      readCheckoutLink({ fund_id: "x", sourceSiteId: "y", amount: "-3" }),
    ).toEqual({
      target: null,
      amountCents: null,
      monthly: false,
      sourceSiteId: null,
    });
  });

  it("the hand-off to the home carries plain parameters only: the target, the amount, the fee choice and the source Site", () => {
    const href = handOffHref({
      homeHost: "home.give.example.test",
      target: { kind: "fund", id: FUND },
      amountCents: 2500,
      coverFees: true,
      sourceSiteId: SITE,
    });
    const url = new URL(href);
    expect(url.host).toBe("home.give.example.test");
    expect(url.pathname).toBe("/checkout");
    expect(Object.fromEntries(url.searchParams)).toEqual({
      fund_id: FUND,
      amount: "25.00",
      coverFees: "1",
      sourceSiteId: SITE,
    });
  });
});
