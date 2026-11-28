import { describe, expect, it } from "vitest";

import {
  forgetGiftKey,
  GIFT_KEY_STORAGE,
  GIFT_KEY_WINDOW_MS,
  giftKeyFor,
  rememberedPayment,
  rememberPayment,
  type GiftKeyInputs,
} from "../../../../apps/donor/app/(public)/(solid)/checkout/checkout-gift-key";
import {
  checkoutPath,
  checkoutSurface,
  handOffHref,
  parseTypedAmount,
  readCheckoutLink,
} from "../../../../apps/donor/app/(public)/(solid)/checkout/checkout-targets";
import {
  CHECKOUT_WORDS,
  FINAL_STATES,
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

const inputs = (over: Partial<GiftKeyInputs> = {}): GiftKeyInputs => ({
  lines: [{ fundId: FUND, amountCents: 2500 }],
  coverFees: false,
  isAnonymous: false,
  surface: "website",
  mode: "guest",
  contact: { email: "gail@example.test", firstName: "Gail", lastName: "Guest" },
  sourceSiteId: null,
  ...over,
});

describe("AL-2681 PR 2b: the checkout's words (the coordinator's approved sentences)", () => {
  it.each([
    [
      { status: 503, error: "giving_unavailable" },
      "Giving here is unavailable right now. Nothing was charged.",
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

  it("amount_out_of_range shows the bounds the server sent, in the currency the server names, and types no figure of its own", () => {
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
        currency: "cad",
      }),
    ).toBe(
      "Online gifts must be between CA$1.00 and CA$20.00. Your card wasn't charged.",
    );
    expect(
      intakeRefusalWords({
        status: 400,
        error: "amount_out_of_range",
        minCents: 100,
        maxCents: 2_000,
      }),
    ).toBe(CHECKOUT_WORDS.detailsRefused);
  });

  it("the intake's unavailable sentence says we could not confirm when this browser already held the gift's key (closing round Q5)", () => {
    expect(
      intakeRefusalWords({ status: 503, error: "giving_unavailable" }, true),
    ).toBe(
      "Giving here is unavailable right now, and we could not confirm what happened to your payment. Check your card or bank statement before you give again.",
    );
  });

  it("no sentence promises a receipt, a match, an account or a claim, and key reuse never says nothing was charged before", () => {
    for (const text of Object.values(CHECKOUT_WORDS)) {
      expect(text).not.toMatch(
        /receipt|matched|added to your account|claim your giving history/i,
      );
    }
    expect(CHECKOUT_WORDS.keyReused).not.toContain("Your card wasn't charged");
    expect(CHECKOUT_WORDS.received).toBe("Your gift was received.");
    expect(CHECKOUT_WORDS).not.toHaveProperty("claimOffer");
  });

  it("a payment's state reads its sentence: received only on success, declined only of a card that was tried", () => {
    expect(paymentStateNotice({ status: "succeeded" })).toEqual({
      tone: "success",
      text: "Your gift was received.",
    });
    expect(paymentStateNotice({ status: "processing" }).text).toBe(
      CHECKOUT_WORDS.pending,
    );
    expect(
      paymentStateNotice({
        status: "requires_payment_method",
        last_payment_error: { code: "card_declined", type: "card_error" },
      }).text,
    ).toBe(CHECKOUT_WORDS.declined);
    expect(
      paymentStateNotice({
        status: "requires_payment_method",
        last_payment_error: null,
      }).text,
    ).toBe(CHECKOUT_WORDS.notStarted);
    expect(paymentStateNotice({ status: "requires_confirmation" }).text).toBe(
      CHECKOUT_WORDS.notStarted,
    );
    expect(paymentStateNotice({ status: "requires_action" }).text).toBe(
      "Your bank's card check wasn't finished, so your card wasn't charged. You can try again.",
    );
    expect(
      paymentStateNotice({
        status: "requires_payment_method",
        last_payment_error: {
          code: "payment_intent_authentication_failure",
          type: "card_error",
        },
      }).text,
    ).toBe(CHECKOUT_WORDS.cancelled);
    expect(paymentStateNotice({ status: "canceled" }).text).toBe(
      "This payment was cancelled, so your card wasn't charged. You can start the gift again here.",
    );
    expect(FINAL_STATES.has("canceled")).toBe(false);
  });
});

describe("AL-2681 PR 2b, the inventory ruling 6 and fix round X4: one key for each gift across the browser's tabs", () => {
  it("two tabs with the same gift send the same key; another amount, fee choice or anonymity makes a new one", async () => {
    const shared = memory();
    let n = 0;
    const next = () => `key-${(n += 1)}`;
    const first = await giftKeyFor(inputs(), shared, 1_000, next);
    expect(first).toEqual({ key: "key-1", reused: false });
    expect(await giftKeyFor(inputs(), shared, 2_000, next)).toEqual({
      key: "key-1",
      reused: true,
    });
    const amount = await giftKeyFor(
      inputs({ lines: [{ fundId: FUND, amountCents: 3000 }] }),
      shared,
      3_000,
      next,
    );
    expect(amount.key).not.toBe("key-1");
  });

  it("the key covers the contact as the server normalises it, the mode and the source Site", async () => {
    const shared = memory();
    let n = 0;
    const next = () => `key-${(n += 1)}`;
    const base = (await giftKeyFor(inputs(), shared, 1_000, next)).key;
    const same = await giftKeyFor(
      inputs({
        contact: {
          email: "  GAIL@Example.test ",
          firstName: " Gail ",
          lastName: "Guest",
        },
      }),
      shared,
      1_000,
      next,
    );
    expect(same.key).toBe(base);
    for (const changed of [
      inputs({ contact: { email: "gail@example.org" } }),
      inputs({ contact: { email: "gail@example.test", firstName: "Gale" } }),
      inputs({ mode: "signed_in" }),
      inputs({ sourceSiteId: SITE }),
    ])
      expect((await giftKeyFor(changed, shared, 1_000, next)).key).not.toBe(
        base,
      );
  });

  it("the shared store keeps one key for each gift: a second gift does not take the first's key, and the first gift's key comes back", async () => {
    const shared = memory();
    let n = 0;
    const next = () => `key-${(n += 1)}`;
    const first = (await giftKeyFor(inputs(), shared, 1_000, next)).key;
    const other = (
      await giftKeyFor(
        inputs({ lines: [{ missionaryId: WORKER, amountCents: 2500 }] }),
        shared,
        2_000,
        next,
      )
    ).key;
    expect(other).not.toBe(first);
    expect((await giftKeyFor(inputs(), shared, 3_000, next)).key).toBe(first);
  });

  it("forgetting a key removes only that key; a key is forgotten when the window passes; nothing personal is stored", async () => {
    const shared = memory();
    const tab = memory();
    let n = 0;
    const next = () => `key-${(n += 1)}`;
    const first = (await giftKeyFor(inputs(), shared, 1_000, next)).key;
    const other = (
      await giftKeyFor(
        inputs({ lines: [{ missionaryId: WORKER, amountCents: 2500 }] }),
        shared,
        1_000,
        next,
      )
    ).key;
    forgetGiftKey(shared, first, 1_000);
    expect((await giftKeyFor(inputs(), shared, 1_000, next)).key).not.toBe(
      first,
    );
    expect(
      (
        await giftKeyFor(
          inputs({ lines: [{ missionaryId: WORKER, amountCents: 2500 }] }),
          shared,
          1_000,
          next,
        )
      ).key,
    ).toBe(other);
    expect(
      (
        await giftKeyFor(
          inputs({ lines: [{ missionaryId: WORKER, amountCents: 2500 }] }),
          shared,
          1_000 + GIFT_KEY_WINDOW_MS + 1,
          next,
        )
      ).key,
    ).not.toBe(other);
    expect(shared.store.get(GIFT_KEY_STORAGE)).not.toMatch(/@|Gail|Guest/);
    rememberPayment(tab, {
      key: first,
      clientSecret: "pi_1_secret_x",
      account: "acct_1",
      publishableKey: "pk_test_1",
      target: { kind: "fund", id: FUND },
    });
    expect(rememberedPayment(tab)).toMatchObject({
      clientSecret: "pi_1_secret_x",
      target: { kind: "fund", id: FUND },
    });
  });
});

describe("AL-2681 PR 2b: what the checkout reads from its link", () => {
  it("reads a missionary, a fund, an amount, monthly, the fee choice and a source Site, and nothing that is not a UUID", () => {
    expect(
      readCheckoutLink({
        missionary_id: WORKER,
        amount: "25",
        frequency: "monthly",
        coverFees: "1",
        sourceSiteId: SITE,
      }),
    ).toEqual({
      target: { kind: "missionary", id: WORKER },
      amountCents: 2500,
      monthly: true,
      coverFees: true,
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
      readCheckoutLink({
        fund_id: "x",
        sourceSiteId: "y",
        amount: "-3",
        coverFees: "yes",
      }),
    ).toEqual({
      target: null,
      amountCents: null,
      monthly: false,
      coverFees: false,
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
    expect(
      checkoutPath({
        target: { kind: "missionary", id: WORKER },
        amountCents: 750,
        coverFees: false,
        sourceSiteId: null,
      }),
    ).toBe(`/checkout?missionary_id=${WORKER}&amount=7.50&coverFees=0`);
  });

  it("an address carrying a source Site that arrives at a home is the account surface, whatever else the name serves (fix round X6.1)", () => {
    expect(
      checkoutSurface({
        hostSurface: "website",
        isHome: true,
        sourceSiteId: SITE,
      }),
    ).toBe("donor_account");
    expect(
      checkoutSurface({
        hostSurface: "website",
        isHome: true,
        sourceSiteId: null,
      }),
    ).toBe("website");
    expect(
      checkoutSurface({
        hostSurface: "website",
        isHome: false,
        sourceSiteId: SITE,
      }),
    ).toBe("website");
    expect(
      checkoutSurface({
        hostSurface: "donor_account",
        isHome: true,
        sourceSiteId: null,
      }),
    ).toBe("donor_account");
  });
});

describe("AL-2681 closing round Q6(a): an amount typed with a comma is never another amount", () => {
  it.each([
    ["50,50", null],
    ["5,050", 505_000],
    ["1,000.50", 100_050],
    ["50,5", null],
    ["1,00", null],
    [",50", null],
    ["50,", null],
    ["12,345,678.9", 1_234_567_890],
    ["$1,000", 100_000],
    ["50.50", 5_050],
    ["0", null],
  ] as const)("%s reads as %s cents", (text, cents) => {
    expect(parseTypedAmount(text)).toBe(cents);
  });
});
