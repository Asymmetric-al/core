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

const stripe = vi.hoisted(() => ({
  loads: [] as Array<{ key: string; options: unknown }>,
  submit: vi.fn(async () => ({})),
  confirm: vi.fn(async (): Promise<Record<string, unknown>> => ({
    paymentIntent: { status: "succeeded" },
  })),
  retrieve: vi.fn(async (): Promise<Record<string, unknown>> => ({
    paymentIntent: { status: "succeeded" },
  })),
  elementsOptions: [] as unknown[],
}));

const turnstile = vi.hoisted(() => ({ resets: 0 }));

vi.mock("@stripe/stripe-js", () => ({
  loadStripe: async (key: string, options: unknown) => {
    stripe.loads.push({ key, options });
    return {
      confirmPayment: stripe.confirm,
      retrievePaymentIntent: stripe.retrieve,
    };
  },
}));

vi.mock("@stripe/react-stripe-js", () => ({
  Elements: ({
    options,
    children,
  }: {
    options: unknown;
    children: React.ReactNode;
  }) => {
    stripe.elementsOptions.push(options);
    return <div data-testid="elements">{children}</div>;
  },
  PaymentElement: () => <div data-testid="payment-element" />,
  useStripe: () => ({
    confirmPayment: stripe.confirm,
    retrievePaymentIntent: stripe.retrieve,
  }),
  useElements: () => ({ submit: stripe.submit }),
}));

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
        onToken(`token-${resetSignal}`);
      }, [resetSignal, onToken]);
      return <div data-testid="turnstile" />;
    },
  }),
);

const { CheckoutPageClient } =
  await import("../../../../apps/donor/app/(public)/(solid)/checkout/checkout-client");

const FUND = "11111111-1111-4111-8111-111111111111";
const SECRET = "pi_1_secret_abc";

type Call = { url: string; body: Record<string, unknown> };
let calls: Call[] = [];
let donateAnswers: Array<{ status: number; body: unknown }> = [];
let configAnswer: { status: number; body: unknown } = {
  status: 200,
  body: {
    publishableKey: "pk_test_1",
    connectedAccountId: "acct_1",
    wayBackHost: null,
  },
};

function props(
  over: Partial<React.ComponentProps<typeof CheckoutPageClient>> = {},
) {
  return {
    link: {
      target: { kind: "fund" as const, id: FUND },
      amountCents: 2500,
      monthly: false,
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

async function fillAndGive() {
  fireEvent.change(await screen.findByLabelText("Email"), {
    target: { value: "gail@example.test" },
  });
  fireEvent.change(screen.getByLabelText("First name"), {
    target: { value: "Gail" },
  });
  fireEvent.change(screen.getByLabelText("Last name"), {
    target: { value: "Guest" },
  });
  await screen.findByTestId("payment-element");
  fireEvent.click(screen.getByRole("button", { name: /^Give \$/ }));
}

beforeEach(() => {
  calls = [];
  donateAnswers = [
    {
      status: 200,
      body: {
        intakeId: "i-1",
        clientSecret: SECRET,
        connectedAccountId: "acct_1",
        amountCents: 2500,
      },
    },
  ];
  configAnswer = {
    status: 200,
    body: {
      publishableKey: "pk_test_1",
      connectedAccountId: "acct_1",
      wayBackHost: null,
    },
  };
  stripe.loads = [];
  stripe.elementsOptions = [];
  stripe.submit.mockClear();
  stripe.confirm.mockReset();
  stripe.confirm.mockResolvedValue({ paymentIntent: { status: "succeeded" } });
  stripe.retrieve.mockClear();
  turnstile.resets = 0;
  window.localStorage.clear();
  window.sessionStorage.clear();
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body ?? "{}")) as Record<
        string,
        unknown
      >;
      calls.push({ url, body });
      const answer =
        url === "/api/checkout/config"
          ? configAnswer
          : (donateAnswers.shift() ?? donateAnswers[0]!);
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
    expect(calls.filter((c) => c.url === "/api/donate")).toEqual([]);
    await fillAndGive();
    await screen.findByText("Your gift was received.");
    const donate = calls.find((c) => c.url === "/api/donate")!;
    expect(donate.body).toMatchObject({
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
    expect(String(donate.body.key)).toMatch(/^[0-9a-f-]{36}$/);
    expect(stripe.submit).toHaveBeenCalledTimes(1);
    expect(stripe.confirm).toHaveBeenCalledWith(
      expect.objectContaining({
        clientSecret: SECRET,
        redirect: "if_required",
        confirmParams: expect.objectContaining({
          payment_method_data: {
            billing_details: { email: "gail@example.test", name: "Gail Guest" },
          },
        }),
      }),
    );
    expect(
      screen.getByText("Verify your email to claim your giving history."),
    ).toBeTruthy();
  });

  it("a declined card keeps the gift and its key: the next Give sends the same key", async () => {
    stripe.confirm.mockResolvedValueOnce({
      error: { type: "card_error", code: "card_declined", message: "declined" },
    });
    donateAnswers = [
      {
        status: 200,
        body: {
          intakeId: "i-1",
          clientSecret: SECRET,
          connectedAccountId: "acct_1",
          amountCents: 2500,
        },
      },
      {
        status: 200,
        body: {
          intakeId: "i-1",
          clientSecret: SECRET,
          connectedAccountId: "acct_1",
          amountCents: 2500,
        },
      },
    ];
    render(<CheckoutPageClient {...props()} />);
    await fillAndGive();
    await screen.findByText(
      /Your card was declined, and you haven't been charged/,
    );
    fireEvent.click(screen.getByRole("button", { name: /^Give \$/ }));
    await screen.findByText("Your gift was received.");
    const keys = calls
      .filter((c) => c.url === "/api/donate")
      .map((c) => c.body.key);
    expect(keys).toHaveLength(2);
    expect(keys[1]).toBe(keys[0]);
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
    expect(stripe.confirm).not.toHaveBeenCalled();
  });

  it("a 401 on the signed-in path offers to sign in again or give as a guest, keeping the gift", async () => {
    donateAnswers = [{ status: 401, body: { error: "sign_in_required" } }];
    render(
      <CheckoutPageClient
        {...props({ isHome: true, signedInEmail: "dana@example.test" })}
      />,
    );
    expect(await screen.findByText("Giving as dana@example.test")).toBeTruthy();
    await screen.findByTestId("payment-element");
    fireEvent.click(screen.getByRole("button", { name: /^Give \$/ }));
    await screen.findByText(/Your sign-in has ended/);
    expect(
      screen.getByRole("link", { name: "Sign in again" }).getAttribute("href"),
    ).toContain("/login?next=");
    expect(
      within(screen.getByRole("alert")).getByRole("button", {
        name: "Give as a guest instead",
      }),
    ).toBeTruthy();
    expect(calls.find((c) => c.url === "/api/donate")!.body).toMatchObject({
      mode: "signed_in",
    });
  });

  it("a monthly link says monthly is unavailable and gives once only after the explicit switch", async () => {
    render(
      <CheckoutPageClient
        {...props({
          link: {
            target: { kind: "fund", id: FUND },
            amountCents: 2500,
            monthly: true,
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
        /It may be the designation you chose, or online giving may be paused/,
      ),
    ).toBeTruthy();
    expect(screen.queryByTestId("payment-element")).toBeNull();
  });

  it.each([
    ["succeeded", "Your gift was received."],
    [
      "processing",
      "Your payment is processing. You don't need to keep this page open.",
    ],
    [
      "requires_payment_method",
      "Your card was declined, and you haven't been charged. Check the card details or try another card.",
    ],
  ])(
    "a 409 for a key whose payment this tab holds shows that payment's state (%s), never the reuse sentence",
    async (status, sentence) => {
      stripe.confirm.mockResolvedValueOnce({
        error: { type: "api_connection_error" },
      });
      donateAnswers = [
        {
          status: 200,
          body: {
            intakeId: "i-1",
            clientSecret: SECRET,
            connectedAccountId: "acct_1",
            amountCents: 2500,
          },
        },
        { status: 409, body: { error: "idempotency_key_reused" } },
      ];
      stripe.retrieve.mockResolvedValueOnce({ paymentIntent: { status } });
      render(<CheckoutPageClient {...props()} />);
      await fillAndGive();
      await screen.findByText(/We lost the connection/);
      fireEvent.click(screen.getByRole("button", { name: /^Give \$/ }));
      expect(await screen.findByText(sentence)).toBeTruthy();
      expect(
        screen.queryByText(/already started with different details/),
      ).toBeNull();
      expect(stripe.retrieve).toHaveBeenCalledWith(SECRET);
    },
  );

  it("a 409 for a key this tab does not hold says nothing was charged this time, and the next Give makes a new key", async () => {
    donateAnswers = [
      { status: 409, body: { error: "idempotency_key_reused" } },
      {
        status: 200,
        body: {
          intakeId: "i-2",
          clientSecret: SECRET,
          connectedAccountId: "acct_1",
          amountCents: 2500,
        },
      },
    ];
    render(<CheckoutPageClient {...props()} />);
    await fillAndGive();
    await screen.findByText(
      /This gift was already started with different details, so nothing was charged this time/,
    );
    expect(stripe.retrieve).not.toHaveBeenCalled();
    expect(stripe.confirm).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: /^Give \$/ }));
    await screen.findByText("Your gift was received.");
    const keys = calls
      .filter((c) => c.url === "/api/donate")
      .map((c) => c.body.key);
    expect(keys).toHaveLength(2);
    expect(keys[1]).not.toBe(keys[0]);
  });

  it("a reused key whose payment this tab holds reads that payment's state instead of the reuse sentence", async () => {
    window.sessionStorage.setItem(
      "asym.checkout.gift-payment.v1",
      JSON.stringify({
        key: "k-held",
        clientSecret: SECRET,
        account: "acct_1",
        publishableKey: "pk_test_1",
      }),
    );
    window.localStorage.setItem(
      "asym.checkout.gift-key.v1",
      JSON.stringify({ key: "k-held", digest: "x", at: Date.now() }),
    );
    stripe.retrieve.mockResolvedValue({
      paymentIntent: { status: "succeeded" },
    });
    render(<CheckoutPageClient {...props()} />);
    expect(await screen.findByText("Your gift was received.")).toBeTruthy();
    expect(stripe.retrieve).toHaveBeenCalledWith(SECRET);
  });
});
