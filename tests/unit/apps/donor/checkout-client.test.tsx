// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type * as OwnApi from "@asym/database/own-api";

vi.mock("@asym/database/own-api", async (importOriginal) => ({
  ...(await importOriginal<typeof OwnApi>()),
  ownApiFetch: (path: string, init?: RequestInit) =>
    globalThis.fetch(path, init),
}));

type Intent = {
  status: string;
  last_payment_error?: { code: string; type: string } | null;
};
type Outcome =
  | "succeed"
  | "decline"
  | "authentication_failure"
  | "lost"
  | "lost_after_success";

const stripe = vi.hoisted(() => ({
  loads: [] as Array<{ key: string; options: { stripeAccount?: string } }>,
  submit: vi.fn(async () => ({})),
  confirms: [] as Array<Record<string, unknown>>,
  refused: [] as string[],
  outcomes: [] as Outcome[],
  intents: new Map<string, Intent>(),
  retrieved: [] as Array<{ secret: string; key: string; account?: string }>,
  elementsOptions: [] as unknown[],
  paymentElementOptions: [] as Array<Record<string, unknown>>,
  failLoad: false,
  retrieveGate: null as Promise<void> | null,
}));

const turnstile = vi.hoisted(() => ({ resets: 0, issued: 0 }));

function instance(key: string, options: { stripeAccount?: string }) {
  return {
    key,
    account: options.stripeAccount,
    async confirmPayment(params: {
      clientSecret: string;
      confirmParams: {
        payment_method_data?: { billing_details?: Record<string, unknown> };
      };
    }) {
      stripe.confirms.push({ ...params, key, account: options.stripeAccount });
      const fields =
        (
          stripe.paymentElementOptions.at(-1)?.fields as
            { billingDetails?: Record<string, string> } | undefined
        )?.billingDetails ?? {};
      const details =
        params.confirmParams.payment_method_data?.billing_details ?? {};
      for (const [field, rule] of Object.entries(fields)) {
        const given = details[field];
        if (rule === "never" && !(typeof given === "string" && given !== "")) {
          stripe.refused.push(field);
          throw new Error(
            `IntegrationError: billing_details.${field} is required when fields.billingDetails.${field} is never`,
          );
        }
      }
      const outcome = stripe.outcomes.shift() ?? "succeed";
      const secret = params.clientSecret;
      if (outcome === "decline") {
        stripe.intents.set(secret, {
          status: "requires_payment_method",
          last_payment_error: { code: "card_declined", type: "card_error" },
        });
        return {
          error: { type: "card_error", code: "card_declined", message: "x" },
        };
      }
      if (outcome === "authentication_failure") {
        stripe.intents.set(secret, {
          status: "requires_payment_method",
          last_payment_error: {
            code: "payment_intent_authentication_failure",
            type: "card_error",
          },
        });
        return {
          error: {
            type: "card_error",
            code: "payment_intent_authentication_failure",
          },
        };
      }
      if (outcome === "lost")
        return { error: { type: "api_connection_error" } };
      stripe.intents.set(secret, { status: "succeeded" });
      if (outcome === "lost_after_success")
        return { error: { type: "api_connection_error" } };
      return { paymentIntent: { status: "succeeded" } };
    },
    async retrievePaymentIntent(secret: string) {
      if (stripe.retrieveGate) await stripe.retrieveGate;
      stripe.retrieved.push({ secret, key, account: options.stripeAccount });
      return {
        paymentIntent: stripe.intents.get(secret) ?? {
          status: "requires_payment_method",
          last_payment_error: null,
        },
      };
    },
  };
}

vi.mock("@stripe/stripe-js", () => ({
  loadStripe: async (key: string, options: { stripeAccount?: string }) => {
    stripe.loads.push({ key, options });
    if (stripe.failLoad) throw new Error("Stripe.js failed to load");
    return instance(key, options);
  },
}));

vi.mock("@stripe/react-stripe-js", async () => {
  const { createContext, useContext, useEffect, useState } =
    await import("react");
  const Ctx = createContext<unknown>(null);
  return {
    Elements: ({
      stripe: promise,
      options,
      children,
    }: {
      stripe: Promise<unknown> | null;
      options: unknown;
      children: React.ReactNode;
    }) => {
      const [ready, setReady] = useState<unknown>(null);
      useEffect(() => {
        void promise?.then(setReady);
      }, [promise]);
      stripe.elementsOptions.push(options);
      return (
        <Ctx.Provider value={ready}>
          <div data-testid="elements">{children}</div>
        </Ctx.Provider>
      );
    },
    PaymentElement: ({ options }: { options: Record<string, unknown> }) => {
      stripe.paymentElementOptions.push(options);
      return <div data-testid="payment-element" />;
    },
    useStripe: () => useContext(Ctx),
    useElements: () => ({ submit: stripe.submit }),
  };
});

vi.mock(
  "../../../../apps/donor/app/(public)/(solid)/checkout/checkout-turnstile",
  () => ({
    CheckoutTurnstile: ({
      onToken,
      resetSignal,
    }: {
      onToken: (token: string | null) => void;
      resetSignal: number;
    }) => {
      React.useEffect(() => {
        if (resetSignal > 0) turnstile.resets += 1;
        onToken(`token-${turnstile.issued}`);
        turnstile.issued += 1;
      }, [resetSignal, onToken]);
      return <div data-testid="turnstile" />;
    },
  }),
);

const { CheckoutPageClient } =
  await import("../../../../apps/donor/app/(public)/(solid)/checkout/checkout-client");
const { GIFT_KEY_STORAGE, GIFT_PAYMENT_STORAGE } =
  await import("../../../../apps/donor/app/(public)/(solid)/checkout/checkout-gift-key");

const FUND = "11111111-1111-4111-8111-111111111111";
const OTHER_FUND = "22222222-2222-4222-8222-222222222222";
const SITE = "33333333-3333-4333-8333-333333333333";
const SECRET = "pi_1_secret_abc";

type Call = { url: string; body: Record<string, unknown> };
type Answer = { status: number; body: unknown };
let calls: Call[] = [];
let donateAnswers: Answer[] = [];
let configAnswer: Answer;
let verified: Set<string>;
let completedKeys: Set<string>;
let completeNextKey: boolean;

const created = (secret = SECRET, account = "acct_1"): Answer => ({
  status: 200,
  body: {
    intakeId: "i-1",
    clientSecret: secret,
    connectedAccountId: account,
    amountCents: 2500,
  },
});

function props(
  over: Partial<React.ComponentProps<typeof CheckoutPageClient>> = {},
) {
  return {
    link: {
      target: { kind: "fund" as const, id: FUND },
      amountCents: 2500,
      monthly: false,
      coverFees: false,
      sourceSiteId: null,
    },
    surface: "website" as const,
    isHome: false,
    homeHost: null,
    siteId: null,
    turnstileSiteKey: "1x00000000000000000000AA",
    ...over,
  };
}

const giveButton = () =>
  screen.getByRole("button", { name: /^Give( \$\S+)?$/ });

async function fill(
  email = "gail@example.test",
  first = "Gail",
  last = "Guest",
) {
  fireEvent.change(await screen.findByLabelText("Email"), {
    target: { value: email },
  });
  fireEvent.change(screen.getByLabelText("First name"), {
    target: { value: first },
  });
  fireEvent.change(screen.getByLabelText("Last name"), {
    target: { value: last },
  });
  await screen.findByTestId("payment-element");
  await waitFor(() =>
    expect(giveButton()).not.toHaveProperty("disabled", true),
  );
}

async function fillAndGive(email?: string, first?: string, last?: string) {
  await fill(email, first, last);
  fireEvent.click(giveButton());
}

function typeInto(input: HTMLElement, text: string) {
  const field = input as HTMLInputElement;
  fireEvent.change(field, { target: { value: "" } });
  for (const ch of text)
    fireEvent.change(field, { target: { value: field.value + ch } });
}

const donates = () => calls.filter((c) => c.url === "/api/donate");

beforeEach(() => {
  calls = [];
  verified = new Set();
  completedKeys = new Set();
  completeNextKey = false;
  donateAnswers = [created()];
  configAnswer = {
    status: 200,
    body: {
      publishableKey: "pk_test_1",
      connectedAccountId: "acct_1",
      wayBackHost: null,
    },
  };
  stripe.loads = [];
  stripe.confirms = [];
  stripe.refused = [];
  stripe.outcomes = [];
  stripe.intents = new Map();
  stripe.retrieved = [];
  stripe.elementsOptions = [];
  stripe.paymentElementOptions = [];
  stripe.failLoad = false;
  stripe.retrieveGate = null;
  stripe.submit.mockClear();
  turnstile.resets = 0;
  turnstile.issued = 0;
  window.localStorage.clear();
  window.sessionStorage.clear();
  window.history.replaceState({}, "", "/checkout");
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body ?? "{}")) as Record<
        string,
        unknown
      >;
      calls.push({ url, body });
      if (url === "/api/checkout/config") {
        if (configAnswer.status === 0) throw new TypeError("Failed to fetch");
        return new Response(JSON.stringify(configAnswer.body), {
          status: configAnswer.status,
        });
      }
      const token = String(body.challengeToken ?? "");
      if (!token || verified.has(token))
        return new Response(JSON.stringify({ error: "challenge_failed" }), {
          status: 400,
        });
      verified.add(token);
      const key = String(body.key);
      if (completeNextKey) {
        completeNextKey = false;
        completedKeys.add(key);
      }
      if (completedKeys.has(key))
        return new Response(
          JSON.stringify({ error: "gift_already_completed" }),
          { status: 409 },
        );
      const answer = donateAnswers.shift() ?? created();
      return new Response(JSON.stringify(answer.body), {
        status: answer.status,
        headers: answer.status === 429 ? { "retry-after": "40" } : {},
      });
    }),
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("AL-2681 PR 2b: the guest checkout page", () => {
  it("asks only for email, name, the card in Stripe's element and an unticked anonymity choice; says one gift covers one legal entity; shows no country, postal code, bank or wallet field of its own", async () => {
    render(<CheckoutPageClient {...props()} />);
    expect(await screen.findByLabelText("Email")).toBeTruthy();
    expect(screen.getByLabelText("First name")).toBeTruthy();
    expect(screen.getByLabelText("Last name")).toBeTruthy();
    expect(
      (
        screen.getByRole("checkbox", {
          name: /anonymously/i,
        }) as HTMLInputElement
      ).getAttribute("aria-checked") ?? "false",
    ).toBe("false");
    expect(
      screen.getByText(
        "Each gift goes to one legal entity of this ministry. Designations of different entities need separate gifts.",
      ),
    ).toBeTruthy();
    expect(screen.queryByLabelText(/country|postal|zip/i)).toBeNull();
    expect(screen.queryByText(/bank|apple pay|google pay/i)).toBeNull();
    expect(await screen.findByTestId("payment-element")).toBeTruthy();
    expect(screen.queryByText(/receipt/i)).toBeNull();
  });

  it("reads the config for its target and surface, and loads Stripe on the connected account with cards only", async () => {
    render(<CheckoutPageClient {...props()} />);
    await screen.findByTestId("payment-element");
    expect(calls[0]).toEqual({
      url: "/api/checkout/config",
      body: { targets: [{ fundId: FUND }], surface: "website" },
    });
    expect(stripe.loads).toEqual([
      { key: "pk_test_1", options: { stripeAccount: "acct_1" } },
    ]);
    expect(stripe.elementsOptions.at(-1)).toMatchObject({
      mode: "payment",
      amount: 2500,
      currency: "usd",
      allowedPaymentMethodTypes: ["card"],
    });
  });

  it("creates the gift only on Give, with a gift key, and confirms on the same page with the e-mail and name typed", async () => {
    render(<CheckoutPageClient {...props()} />);
    await screen.findByTestId("payment-element");
    expect(donates()).toEqual([]);
    await fillAndGive();
    await screen.findByText("Your gift was received.");
    expect(donates()[0]!.body).toMatchObject({
      mode: "guest",
      surface: "website",
      lines: [{ fundId: FUND, amountCents: 2500 }],
      paymentMethod: "card",
      isAnonymous: false,
      contact: {
        email: "gail@example.test",
        firstName: "Gail",
        lastName: "Guest",
      },
      challengeToken: "token-0",
    });
    expect(String(donates()[0]!.body.key)).toMatch(/^[0-9a-f-]{36}$/);
    expect(stripe.submit).toHaveBeenCalledTimes(1);
    expect(stripe.confirms[0]).toMatchObject({
      clientSecret: SECRET,
      redirect: "if_required",
      confirmParams: {
        payment_method_data: {
          billing_details: { email: "gail@example.test", name: "Gail Guest" },
        },
      },
    });
  });

  it("a 429 shows the bucket's sentence, keeps what was typed and asks for a fresh challenge", async () => {
    donateAnswers = [
      {
        status: 429,
        body: {
          error: "too_many_requests",
          retryAfterSeconds: 40,
          bucket: "address",
        },
      },
    ];
    render(<CheckoutPageClient {...props()} />);
    await fillAndGive();
    await screen.findByText(/Many people are giving from this network/);
    expect((screen.getByLabelText("Email") as HTMLInputElement).value).toBe(
      "gail@example.test",
    );
    await waitFor(() => expect(turnstile.resets).toBe(1));
    expect(stripe.confirms).toEqual([]);
  });

  it("a monthly link says monthly is unavailable and gives once only after the explicit switch", async () => {
    render(
      <CheckoutPageClient
        {...props({
          link: {
            target: { kind: "fund", id: FUND },
            amountCents: 2500,
            monthly: true,
            coverFees: false,
            sourceSiteId: null,
          },
        })}
      />,
    );
    expect(
      await screen.findByText(
        "Monthly giving isn't available online yet. You can give once now instead.",
      ),
    ).toBeTruthy();
    expect(screen.queryByRole("button", { name: /^Give \$/ })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Give once instead" }));
    expect(
      await screen.findByRole("button", { name: /^Give \$/ }),
    ).toBeTruthy();
  });

  it("with no designation it asks the donor to choose one and shows no payment", async () => {
    render(
      <CheckoutPageClient
        {...props({
          link: {
            target: null,
            amountCents: null,
            monthly: false,
            coverFees: false,
            sourceSiteId: null,
          },
        })}
      />,
    );
    expect(
      await screen.findByText(
        "Choose a missionary or project to give to, then come back to give.",
      ),
    ).toBeTruthy();
    expect(screen.queryByTestId("payment-element")).toBeNull();
    expect(calls).toEqual([]);
  });

  it("a config read that is unavailable says so for the designation as well, and offers no payment", async () => {
    configAnswer = { status: 503, body: { error: "giving_unavailable" } };
    render(<CheckoutPageClient {...props()} />);
    expect(
      await screen.findByText(
        "Giving here is unavailable right now. Nothing was charged.",
      ),
    ).toBeTruthy();
    expect(screen.queryByTestId("payment-element")).toBeNull();
  });
});

describe("AL-2681 B fix round X2: a fresh challenge after every answer, and a second card on the same open payment", () => {
  it("a declined card, then a second card: Stripe confirms the same open payment directly, with no second request, challenge or key", async () => {
    stripe.outcomes = ["decline", "succeed"];
    render(<CheckoutPageClient {...props()} />);
    await fillAndGive();
    await screen.findByText(
      /Your card was declined, and you haven't been charged/,
    );
    fireEvent.click(giveButton());
    await screen.findByText("Your gift was received.");
    expect(donates()).toHaveLength(1);
    expect(stripe.confirms.map((c) => c.clientSecret)).toEqual([
      SECRET,
      SECRET,
    ]);
  });

  it.each([
    [401, { error: "sign_in_required" }],
    [409, { error: "idempotency_key_reused" }],
    [503, { error: "giving_unavailable" }],
  ])(
    "after a %s answer the next Give carries a new challenge token, never the spent one",
    async (status, body) => {
      donateAnswers = [{ status, body }, created()];
      render(
        <CheckoutPageClient
          {...props(
            status === 401
              ? { isHome: true, signedInEmail: "dana@example.test" }
              : {},
          )}
        />,
      );
      if (status === 401) {
        await screen.findByTestId("payment-element");
        await waitFor(() =>
          expect(giveButton()).not.toHaveProperty("disabled", true),
        );
        fireEvent.click(giveButton());
      } else await fillAndGive();
      await waitFor(() => expect(donates()).toHaveLength(1));
      await waitFor(() => expect(turnstile.resets).toBe(1));
      fireEvent.click(giveButton());
      await waitFor(() => expect(donates()).toHaveLength(2));
      expect(donates().map((c) => c.body.challengeToken)).toEqual([
        "token-0",
        "token-1",
      ]);
    },
  );
});

describe("AL-2681 B fix round X3: what the element is told never to collect, the page always sends", () => {
  it("the element collects neither the e-mail nor a wallet, and Link is off", async () => {
    render(<CheckoutPageClient {...props()} />);
    await screen.findByTestId("payment-element");
    expect(stripe.paymentElementOptions.at(-1)).toEqual({
      wallets: { applePay: "never", googlePay: "never", link: "never" },
      fields: { billingDetails: { email: "never" } },
    });
  });

  it("a signed-in gift confirms with the e-mail the page shows, and is received", async () => {
    render(
      <CheckoutPageClient
        {...props({ isHome: true, signedInEmail: "dana@example.test" })}
      />,
    );
    expect(await screen.findByText("Giving as dana@example.test")).toBeTruthy();
    await screen.findByTestId("payment-element");
    await waitFor(() =>
      expect(giveButton()).not.toHaveProperty("disabled", true),
    );
    fireEvent.click(giveButton());
    await screen.findByText("Your gift was received.");
    expect(stripe.refused).toEqual([]);
    expect(donates()[0]!.body).toMatchObject({
      mode: "signed_in",
      contact: { email: "dana@example.test" },
    });
  });

  it("a guest who leaves both names empty can give", async () => {
    render(<CheckoutPageClient {...props()} />);
    await fillAndGive("gail@example.test", "", "");
    await screen.findByText("Your gift was received.");
    expect(stripe.refused).toEqual([]);
  });
});

describe("AL-2681 B fix round X4: one gift, one key", () => {
  it("a decline, then a corrected e-mail, then a second card: the card is tried under a new key", async () => {
    stripe.outcomes = ["decline", "succeed"];
    donateAnswers = [created(SECRET), created("pi_2_secret_def")];
    render(<CheckoutPageClient {...props()} />);
    await fillAndGive("gail@exmaple.test");
    await screen.findByText(/Your card was declined/);
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "gail@example.test" },
    });
    await waitFor(() => expect(turnstile.resets).toBe(1));
    fireEvent.click(giveButton());
    await screen.findByText("Your gift was received.");
    expect(donates()).toHaveLength(2);
    expect(donates()[1]!.body.key).not.toBe(donates()[0]!.body.key);
    expect(stripe.confirms.at(-1)?.clientSecret).toBe("pi_2_secret_def");
  });

  it("two pages in one browser with two different gifts, then Give again in the first: the first gift's key is sent again", async () => {
    stripe.outcomes = ["lost", "lost", "succeed"];
    donateAnswers = [
      created(SECRET),
      created("pi_2_secret_def"),
      { status: 409, body: { error: "idempotency_key_reused" } },
    ];
    const first = render(<CheckoutPageClient {...props()} />);
    await fillAndGive();
    await screen.findByText(/We lost the connection/);
    const firstKey = donates()[0]!.body.key;
    first.unmount();
    window.sessionStorage.clear();
    const second = render(
      <CheckoutPageClient
        {...props({
          link: {
            target: { kind: "fund", id: OTHER_FUND },
            amountCents: 2500,
            monthly: false,
            coverFees: false,
            sourceSiteId: null,
          },
        })}
      />,
    );
    await fillAndGive();
    await screen.findByText(/We lost the connection/);
    second.unmount();
    window.sessionStorage.clear();
    render(<CheckoutPageClient {...props()} />);
    await fillAndGive();
    await waitFor(() => expect(donates()).toHaveLength(3));
    expect(donates()[2]!.body.key).toBe(firstKey);
  });

  it.each([
    ["succeeded", "Your gift was received."],
    [
      "processing",
      "Your payment is processing. You don't need to keep this page open.",
    ],
  ])(
    "a 409 for a key whose payment this tab holds in a final state (%s) shows that state",
    async (status, sentence) => {
      stripe.outcomes = ["lost"];
      donateAnswers = [
        created(),
        { status: 409, body: { error: "idempotency_key_reused" } },
      ];
      render(<CheckoutPageClient {...props()} />);
      await fillAndGive();
      await screen.findByText(/We lost the connection/);
      stripe.intents.set(SECRET, { status });
      fireEvent.click(giveButton());
      expect(await screen.findByText(sentence)).toBeTruthy();
      expect(
        screen.queryByText(/already started with different details/),
      ).toBeNull();
    },
  );
});

describe("AL-2681 B fix round X5: the amount can be typed", () => {
  it("select, type, clear, type again, tab away: the typed amount is the gift, the form stays while the field is empty, and Give waits for a valid amount", async () => {
    render(<CheckoutPageClient {...props()} />);
    await fill();
    const amount = screen.getByLabelText("Amount (USD)");
    typeInto(amount, "50");
    expect(giveButton().textContent).toBe("Give $50.00");
    typeInto(amount, "");
    expect(screen.getByLabelText("Email")).toBeTruthy();
    expect(screen.getByTestId("payment-element")).toBeTruthy();
    expect(giveButton()).toHaveProperty("disabled", true);
    typeInto(amount, "7.5");
    expect(giveButton().textContent).toBe("Give $7.50");
    fireEvent.blur(amount);
    expect((amount as HTMLInputElement).value).toBe("7.50");
    fireEvent.click(giveButton());
    await screen.findByText("Your gift was received.");
    expect(donates()[0]!.body.lines).toEqual([
      { fundId: FUND, amountCents: 750 },
    ]);
  });
});

describe("AL-2681 B fix round X6: the hand-off and the sign-in keep the gift", () => {
  it("on the website surface a source Site in the address is not sent", async () => {
    render(
      <CheckoutPageClient
        {...props({
          link: {
            target: { kind: "fund", id: FUND },
            amountCents: 2500,
            monthly: false,
            coverFees: false,
            sourceSiteId: SITE,
          },
        })}
      />,
    );
    await fillAndGive();
    await screen.findByText("Your gift was received.");
    expect(calls[0]!.body).not.toHaveProperty("sourceSiteId");
    expect(donates()[0]!.body).not.toHaveProperty("sourceSiteId");
  });

  it("signed out on the account surface, the sign-in link keeps the designation, amount, fee choice and source Site", async () => {
    render(
      <CheckoutPageClient
        {...props({
          surface: "donor_account",
          isHome: true,
          link: {
            target: { kind: "fund", id: FUND },
            amountCents: 4000,
            monthly: false,
            coverFees: true,
            sourceSiteId: SITE,
          },
        })}
      />,
    );
    const link = await screen.findByRole("link", {
      name: "Sign in to give from your account",
    });
    const next = new URL(
      link.getAttribute("href")!,
      "https://home.example.test",
    ).searchParams.get("next")!;
    const query = new URL(next, "https://home.example.test").searchParams;
    expect(Object.fromEntries(query)).toEqual({
      fund_id: FUND,
      amount: "40.00",
      coverFees: "1",
      sourceSiteId: SITE,
    });
  });

  it("on the account surface 'Give as a guest instead' goes to the Site the donor came from, with the gift's details; with no way back it is not offered", async () => {
    configAnswer = {
      status: 200,
      body: {
        publishableKey: "pk_test_1",
        connectedAccountId: "acct_1",
        wayBackHost: "site.example.test",
      },
    };
    const accountProps = props({
      surface: "donor_account",
      isHome: true,
      signedInEmail: "dana@example.test",
      link: {
        target: { kind: "fund", id: FUND },
        amountCents: 2500,
        monthly: false,
        coverFees: false,
        sourceSiteId: SITE,
      },
    });
    const view = render(<CheckoutPageClient {...accountProps} />);
    const guest = await screen.findByRole("link", {
      name: "Give as a guest instead",
    });
    expect(guest.getAttribute("href")).toBe(
      `https://site.example.test/checkout?fund_id=${FUND}&amount=25.00&coverFees=0`,
    );
    view.unmount();
    configAnswer = {
      status: 200,
      body: {
        publishableKey: "pk_test_1",
        connectedAccountId: "acct_1",
        wayBackHost: null,
      },
    };
    render(<CheckoutPageClient {...accountProps} />);
    await screen.findByTestId("payment-element");
    expect(screen.queryByText("Give as a guest instead")).toBeNull();
  });

  it("the fee choice the hand-off carries is taken", async () => {
    render(
      <CheckoutPageClient
        {...props({
          link: {
            target: { kind: "fund", id: FUND },
            amountCents: 2500,
            monthly: false,
            coverFees: true,
            sourceSiteId: null,
          },
        })}
      />,
    );
    expect(
      (
        await screen.findByRole("checkbox", { name: /Add the card fee/ })
      ).getAttribute("aria-checked"),
    ).toBe("true");
  });

  it("'Sign in again' after a 401 keeps the typed amount and the fee choice", async () => {
    donateAnswers = [{ status: 401, body: { error: "sign_in_required" } }];
    render(
      <CheckoutPageClient
        {...props({ isHome: true, signedInEmail: "dana@example.test" })}
      />,
    );
    await screen.findByTestId("payment-element");
    typeInto(screen.getByLabelText("Amount (USD)"), "60");
    fireEvent.click(screen.getByRole("checkbox", { name: /Add the card fee/ }));
    await waitFor(() =>
      expect(giveButton()).not.toHaveProperty("disabled", true),
    );
    fireEvent.click(giveButton());
    await screen.findByText(/Your sign-in has ended/);
    const again = screen.getByRole("link", { name: "Sign in again" });
    const next = new URL(
      again.getAttribute("href")!,
      "https://home.example.test",
    ).searchParams.get("next")!;
    expect(
      Object.fromEntries(new URL(next, "https://h.example.test").searchParams),
    ).toMatchObject({ fund_id: FUND, amount: "60.00", coverFees: "1" });
    expect(
      within(screen.getByRole("alert")).getByRole("button", {
        name: "Give as a guest instead",
      }),
    ).toBeTruthy();
  });
});

describe("AL-2681 B fix round X7: the page says what happened to the payment, and goes on saying it", () => {
  const held = (over: Record<string, unknown> = {}) =>
    window.sessionStorage.setItem(
      GIFT_PAYMENT_STORAGE,
      JSON.stringify({
        key: "k-held",
        clientSecret: SECRET,
        account: "acct_held",
        publishableKey: "pk_test_held",
        target: { kind: "fund", id: FUND },
        ...over,
      }),
    );

  it("a payment this tab holds is read with its own key and account although the config read now fails, and its state is what the page says", async () => {
    held();
    stripe.intents.set(SECRET, { status: "succeeded" });
    configAnswer = { status: 503, body: { error: "giving_unavailable" } };
    render(<CheckoutPageClient {...props()} />);
    expect(await screen.findByText("Your gift was received.")).toBeTruthy();
    expect(stripe.retrieved).toEqual([
      { secret: SECRET, key: "pk_test_held", account: "acct_held" },
    ]);
    expect(screen.queryByText(/haven't been charged/)).toBeNull();
  });

  it("after a gift, a reload of the page shows the same thank-you", async () => {
    const first = render(<CheckoutPageClient {...props()} />);
    await fillAndGive();
    await screen.findByText("Your gift was received.");
    first.unmount();
    render(<CheckoutPageClient {...props()} />);
    expect(await screen.findByText("Your gift was received.")).toBeTruthy();
    expect(screen.queryByLabelText("Email")).toBeNull();
  });

  it("the thank-you offers no claim of giving history", async () => {
    render(<CheckoutPageClient {...props()} />);
    await fillAndGive();
    await screen.findByText("Your gift was received.");
    expect(screen.queryByText(/claim your giving history/)).toBeNull();
  });

  it("a cancelled card check says so, though Stripe reports it as a card error", async () => {
    stripe.outcomes = ["authentication_failure"];
    render(<CheckoutPageClient {...props()} />);
    await fillAndGive();
    expect(
      await screen.findByText(
        "The card check was cancelled, so your card wasn't charged. You can try again.",
      ),
    ).toBeTruthy();
  });

  it("when the intake answers another account than the config read, nothing is confirmed and the page says so", async () => {
    donateAnswers = [created(SECRET, "acct_moved")];
    render(<CheckoutPageClient {...props()} />);
    await fillAndGive();
    expect(
      await screen.findByText(
        "This ministry's payment details changed while you were giving. Nothing was charged. Reload this page to give.",
      ),
    ).toBeTruthy();
    expect(stripe.confirms).toEqual([]);
  });

  it("a confirm error that is not a decline reads the payment: one that already succeeded ends in received", async () => {
    stripe.outcomes = ["lost_after_success"];
    render(<CheckoutPageClient {...props()} />);
    await fillAndGive();
    expect(await screen.findByText("Your gift was received.")).toBeTruthy();
  });

  it("Stripe.js failing to load while a payment is held says the connection was lost", async () => {
    held({ account: "acct_1", publishableKey: "pk_test_1" });
    stripe.failLoad = true;
    render(<CheckoutPageClient {...props()} />);
    expect(await screen.findAllByText(/We lost the connection/)).not.toEqual(
      [],
    );
  });

  it("a key this browser holds for the gift, with no payment in this tab, turns the unavailable sentence into the one that says we could not confirm", async () => {
    window.localStorage.setItem(
      GIFT_KEY_STORAGE,
      JSON.stringify({ d: { key: "k-other-tab", at: Date.now() } }),
    );
    configAnswer = { status: 503, body: { error: "giving_unavailable" } };
    render(<CheckoutPageClient {...props()} />);
    expect(
      await screen.findByText(
        "Giving here is unavailable right now, and we could not confirm what happened to your payment. Check your card or bank statement before you give again.",
      ),
    ).toBeTruthy();
  });
});

describe("AL-2681 B fix round X8: a client secret never stays in the address", () => {
  it("a client secret in the address is taken out of it on load, and the held payment's state is shown", async () => {
    window.sessionStorage.setItem(
      GIFT_PAYMENT_STORAGE,
      JSON.stringify({
        key: "k-held",
        clientSecret: SECRET,
        account: "acct_1",
        publishableKey: "pk_test_1",
        target: { kind: "fund", id: FUND },
      }),
    );
    stripe.intents.set(SECRET, { status: "succeeded" });
    window.history.replaceState(
      {},
      "",
      `/checkout?fund_id=${FUND}&payment_intent=pi_1&payment_intent_client_secret=${SECRET}&redirect_status=succeeded`,
    );
    render(<CheckoutPageClient {...props()} />);
    expect(await screen.findByText("Your gift was received.")).toBeTruthy();
    expect(window.location.search).toBe(`?fund_id=${FUND}`);
  });
});

const ACCOUNT_CHANGED =
  "This ministry's payment details changed while you were giving. Nothing was charged. Reload this page to give.";
const UNAVAILABLE =
  "Giving here is unavailable right now. Nothing was charged.";
const UNCONFIRMED =
  "Giving here is unavailable right now, and we could not confirm what happened to your payment. Check your card or bank statement before you give again.";
const NOT_CHARGED = /haven't been charged|Nothing was charged/;

describe("AL-2681 closing round Q2: after 'this gift is already complete', Give again starts a new gift", () => {
  it("the first gift's key completed elsewhere: the page says received; Give again sends a new key and a second payment is confirmed", async () => {
    completeNextKey = true;
    donateAnswers = [created("pi_2_secret_def")];
    render(<CheckoutPageClient {...props()} />);
    await fillAndGive();
    await screen.findByText("Your gift was received.");
    fireEvent.click(screen.getByRole("button", { name: "Give again" }));
    await waitFor(() => expect(turnstile.resets).toBe(1));
    await waitFor(() =>
      expect(giveButton()).not.toHaveProperty("disabled", true),
    );
    fireEvent.click(giveButton());
    await waitFor(() => expect(stripe.confirms).toHaveLength(1));
    await screen.findByText("Your gift was received.");
    expect(donates()).toHaveLength(2);
    expect(donates()[1]!.body.key).not.toBe(donates()[0]!.body.key);
    expect(stripe.confirms[0]!.clientSecret).toBe("pi_2_secret_def");
  });
});

describe("AL-2681 closing round Q3: a replay on another account than the page loaded is read before anything is said", () => {
  async function replayOnOldAccount(status: string) {
    stripe.outcomes = ["lost"];
    const first = render(<CheckoutPageClient {...props()} />);
    await fillAndGive();
    await screen.findByText(/We lost the connection/);
    first.unmount();
    window.sessionStorage.clear();
    stripe.intents.set(SECRET, { status });
    configAnswer = {
      status: 200,
      body: {
        publishableKey: "pk_test_1",
        connectedAccountId: "acct_2",
        wayBackHost: null,
      },
    };
    donateAnswers = [created(SECRET, "acct_1")];
    render(<CheckoutPageClient {...props()} />);
    await fillAndGive();
  }

  it("a payment that went through on the earlier account is received, never 'nothing was charged'", async () => {
    await replayOnOldAccount("succeeded");
    expect(await screen.findByText("Your gift was received.")).toBeTruthy();
    expect(stripe.retrieved.at(-1)).toMatchObject({
      secret: SECRET,
      account: "acct_1",
    });
    expect(stripe.confirms).toHaveLength(1);
    expect(screen.queryByText(NOT_CHARGED)).toBeNull();
  });

  it("a payment the read shows unpaid on the earlier account says the details changed and nothing was charged", async () => {
    await replayOnOldAccount("requires_payment_method");
    expect(await screen.findByText(ACCOUNT_CHANGED)).toBeTruthy();
    expect(stripe.retrieved.at(-1)).toMatchObject({ account: "acct_1" });
    expect(stripe.confirms).toHaveLength(1);
  });
});

describe("AL-2681 closing round Q4: a held payment of this key is read before the intake is asked again", () => {
  it("held on another account and still open: read with its own key and account, nothing is posted, and the page says the details changed", async () => {
    stripe.outcomes = ["lost"];
    render(<CheckoutPageClient {...props()} />);
    await fillAndGive();
    await screen.findByText(/We lost the connection/);
    const stored = JSON.parse(
      window.sessionStorage.getItem(GIFT_PAYMENT_STORAGE)!,
    ) as Record<string, unknown>;
    window.sessionStorage.setItem(
      GIFT_PAYMENT_STORAGE,
      JSON.stringify({ ...stored, account: "acct_other" }),
    );
    await waitFor(() => expect(turnstile.resets).toBe(1));
    fireEvent.click(giveButton());
    expect(await screen.findByText(ACCOUNT_CHANGED)).toBeTruthy();
    expect(donates()).toHaveLength(1);
    expect(stripe.retrieved.at(-1)).toMatchObject({ account: "acct_other" });
  });

  it("held, and its read fails: the page says it could not confirm, and nothing is posted", async () => {
    stripe.outcomes = ["lost"];
    render(<CheckoutPageClient {...props()} />);
    await fillAndGive();
    await screen.findByText(/We lost the connection/);
    stripe.failLoad = true;
    await waitFor(() => expect(turnstile.resets).toBe(1));
    fireEvent.click(giveButton());
    await waitFor(() => expect(stripe.loads.length).toBeGreaterThan(1));
    expect(await screen.findByText(/We lost the connection/)).toBeTruthy();
    expect(donates()).toHaveLength(1);
    expect(stripe.confirms).toHaveLength(1);
  });
});

describe("AL-2681 closing round Q5: 'unavailable' says 'nothing was charged' only when the page knows", () => {
  const liveKey = () =>
    window.localStorage.setItem(
      GIFT_KEY_STORAGE,
      JSON.stringify({ d: { key: "k-other-tab", at: Date.now() } }),
    );

  it("the config read fails on the network while this browser holds a live key: we could not confirm", async () => {
    liveKey();
    configAnswer = { status: 0, body: null };
    render(<CheckoutPageClient {...props()} />);
    expect(await screen.findByText(UNCONFIRMED)).toBeTruthy();
    expect(screen.queryByText(NOT_CHARGED)).toBeNull();
  });

  it("Stripe.js fails to load while this browser holds a live key and no payment: we could not confirm", async () => {
    liveKey();
    stripe.failLoad = true;
    render(<CheckoutPageClient {...props()} />);
    expect(await screen.findByText(UNCONFIRMED)).toBeTruthy();
    expect(screen.queryByText(NOT_CHARGED)).toBeNull();
  });

  it("a reload during a suspension: the fast 503 waits for the held payment's read, and a payment that went through is received", async () => {
    window.sessionStorage.setItem(
      GIFT_PAYMENT_STORAGE,
      JSON.stringify({
        key: "k-held",
        clientSecret: SECRET,
        account: "acct_held",
        publishableKey: "pk_test_held",
        target: { kind: "fund", id: FUND },
      }),
    );
    stripe.intents.set(SECRET, { status: "succeeded" });
    let release!: () => void;
    stripe.retrieveGate = new Promise<void>((resolve) => {
      release = resolve;
    });
    configAnswer = { status: 503, body: { error: "giving_unavailable" } };
    render(<CheckoutPageClient {...props()} />);
    await waitFor(() => expect(calls.length).toBeGreaterThan(0));
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(screen.queryByText(NOT_CHARGED)).toBeNull();
    expect(screen.queryByText(UNAVAILABLE)).toBeNull();
    release();
    expect(await screen.findByText("Your gift was received.")).toBeTruthy();
    expect(screen.queryByText(NOT_CHARGED)).toBeNull();
  });

  it("with no key and no payment in this browser, the page knows: unavailable, nothing was charged", async () => {
    configAnswer = { status: 0, body: null };
    render(<CheckoutPageClient {...props()} />);
    expect(await screen.findByText(UNAVAILABLE)).toBeTruthy();
  });
});

describe("AL-2681 closing round Q6: smaller things", () => {
  it("(a) an amount with a comma that is not a thousands separator is refused with the amount's own message, never another amount", async () => {
    render(<CheckoutPageClient {...props()} />);
    await fill();
    typeInto(screen.getByLabelText("Amount (USD)"), "50,50");
    expect(giveButton()).toHaveProperty("disabled", true);
    expect(
      screen.getByText("Enter the amount in dollars, like 25 or 1,000.50."),
    ).toBeTruthy();
    typeInto(screen.getByLabelText("Amount (USD)"), "5,050");
    expect(giveButton().textContent).toBe("Give $5,050.00");
  });

  it("(b) a cancelled payment is not a final state: the form stays, with no Give again and no 'your details are saved'", async () => {
    window.sessionStorage.setItem(
      GIFT_PAYMENT_STORAGE,
      JSON.stringify({
        key: "k-held",
        clientSecret: SECRET,
        account: "acct_1",
        publishableKey: "pk_test_1",
        target: { kind: "fund", id: FUND },
      }),
    );
    stripe.intents.set(SECRET, { status: "canceled" });
    render(<CheckoutPageClient {...props()} />);
    expect(
      await screen.findByText(
        "This payment was cancelled, so your card wasn't charged. You can start the gift again here.",
      ),
    ).toBeTruthy();
    expect(await screen.findByLabelText("Email")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Give again" })).toBeNull();
    expect(screen.queryByText(/details are saved/)).toBeNull();
  });

  it("(d) a shared home with no source Site still offers the sign-in link to a donor who is signed out", async () => {
    render(<CheckoutPageClient {...props({ isHome: true })} />);
    await screen.findByTestId("payment-element");
    expect(
      screen.getByRole("link", { name: "Sign in to give from your account" }),
    ).toBeTruthy();
  });

  it("(d) a 401 on the account surface with no guest way back does not offer to give as a guest", async () => {
    donateAnswers = [{ status: 401, body: { error: "sign_in_required" } }];
    render(
      <CheckoutPageClient
        {...props({
          surface: "donor_account",
          isHome: true,
          signedInEmail: "dana@example.test",
        })}
      />,
    );
    await screen.findByTestId("payment-element");
    await waitFor(() =>
      expect(giveButton()).not.toHaveProperty("disabled", true),
    );
    fireEvent.click(giveButton());
    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toMatch(/Your sign-in has ended/);
    expect(alert.textContent).not.toMatch(/guest/i);
  });
});
