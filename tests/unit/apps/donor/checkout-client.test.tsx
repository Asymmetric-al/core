// @vitest-environment jsdom

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import React from "react";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

type CheckoutPageClientComponent =
  (typeof import("../../../../apps/donor/app/(public)/checkout/checkout-client"))["CheckoutPageClient"]; // eslint-disable-line @typescript-eslint/consistent-type-imports -- Keep the component import deferred until after mocks are registered.

const stripeState = vi.hoisted(() => ({
  cardElement: {},
  elements: {
    getElement: vi.fn(),
  },
  stripe: {
    confirmCardPayment: vi.fn(),
  },
}));

const stripeJsState = vi.hoisted(() => ({
  loadStripe: vi.fn(() => Promise.resolve({})),
}));

const omitMotionProps = (props: Record<string, unknown>) => {
  const {
    animate,
    exit,
    initial,
    transition,
    whileHover,
    whileTap,
    ...domProps
  } = props;
  void animate;
  void exit;
  void initial;
  void transition;
  void whileHover;
  void whileTap;
  return domProps;
};

vi.mock("@asym/lib/motion", () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  motion: new Proxy(
    {},
    {
      get:
        (_target, tag: string) =>
        ({
          children,
          ...props
        }: React.PropsWithChildren<Record<string, unknown>>) =>
          React.createElement(tag, omitMotionProps(props), children),
    },
  ),
}));

vi.mock("@asym/lib/utils", () => ({
  formatCurrency: (amount: number) => `$${amount.toFixed(2)}`,
}));

vi.mock("@asym/ui/lib/utils", () => ({
  cn: (...values: Array<string | false | null | undefined>) =>
    values.filter(Boolean).join(" "),
}));

vi.mock("@asym/ui/components/shadcn/avatar", () => ({
  Avatar: ({ children, ...props }: React.PropsWithChildren) => (
    <div {...props}>{children}</div>
  ),
  AvatarFallback: ({ children, ...props }: React.PropsWithChildren) => (
    <div {...props}>{children}</div>
  ),
  AvatarImage: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img alt="" {...props} />
  ),
}));

vi.mock("@asym/ui/components/shadcn/badge", () => ({
  Badge: ({ children, ...props }: React.PropsWithChildren) => (
    <span {...props}>{children}</span>
  ),
}));

vi.mock("@asym/ui/components/shadcn/button", () => ({
  Button: ({
    children,
    ...props
  }: React.PropsWithChildren<
    React.ButtonHTMLAttributes<HTMLButtonElement>
  >) => (
    <button type="button" {...props}>
      {children}
    </button>
  ),
  buttonVariants: () => "",
}));

vi.mock("@asym/ui/components/shadcn/input", () => ({
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} />
  ),
}));

vi.mock("@asym/ui/components/shadcn/label", () => ({
  Label: ({
    children,
    ...props
  }: React.PropsWithChildren<React.LabelHTMLAttributes<HTMLLabelElement>>) => (
    <label {...props}>{children}</label>
  ),
}));

vi.mock("@asym/ui/components/shadcn/separator", () => ({
  Separator: (props: React.HTMLAttributes<HTMLDivElement>) => (
    <div {...props} />
  ),
}));

vi.mock("@asym/ui/components/shadcn/switch", () => ({
  Switch: ({
    checked,
    onCheckedChange,
    ...props
  }: {
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
  }) => (
    <input
      {...props}
      type="checkbox"
      checked={checked}
      onChange={(event) => onCheckedChange?.(event.currentTarget.checked)}
    />
  ),
}));

vi.mock("@stripe/react-stripe-js", () => {
  const CardElement = () => <div data-testid="stripe-card-element" />;
  return {
    CardElement,
    Elements: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    useElements: () => stripeState.elements,
    useStripe: () => stripeState.stripe,
  };
});

vi.mock("@stripe/stripe-js", () => ({
  loadStripe: stripeJsState.loadStripe,
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: React.PropsWithChildren<{ href: string }>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("../../../../apps/donor/lib/mock-data", () => ({
  getFieldWorkerById: (id: string) => ({
    id,
    image: undefined,
    title: "Unit Test Worker",
  }),
}));

let CheckoutPageClient: CheckoutPageClientComponent;

const TEST_FUND_ID = "40000000-0000-0000-0000-000000000001";
const TEST_OTHER_FUND_ID = "40000000-0000-0000-0000-000000000003";
const TEST_MISSIONARY_ID = "20000000-0000-0000-0000-000000000001";
const TEST_WORKER_ID = "worker_1";

beforeAll(async () => {
  const module =
    await import("../../../../apps/donor/app/(public)/checkout/checkout-client");
  CheckoutPageClient = module.CheckoutPageClient;
});

beforeEach(() => {
  let uuidCounter = 0;
  Object.defineProperty(globalThis, "crypto", {
    configurable: true,
    value: {
      randomUUID: vi.fn(() => {
        uuidCounter += 1;
        return `idem-${uuidCounter}`;
      }),
    },
  });
  Object.defineProperty(window, "scrollTo", {
    configurable: true,
    value: vi.fn(),
  });
  globalThis.fetch = vi.fn();
  stripeState.cardElement = {};
  stripeState.elements.getElement.mockReturnValue(stripeState.cardElement);
  stripeState.stripe.confirmCardPayment.mockReset();
  stripeJsState.loadStripe.mockClear();
  stripeJsState.loadStripe.mockImplementation(() => Promise.resolve({}));
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const initializedDonationResponse = (
  publishableKey: unknown = "pk_test_unit",
) => {
  const effectivePublishableKey =
    publishableKey === null ||
    (typeof publishableKey === "string" &&
      (publishableKey.startsWith("pk_") || publishableKey.trim().length === 0))
      ? publishableKey
      : "pk_test_unit";

  return Promise.resolve(
    new Response(
      JSON.stringify({
        clientSecret: "cs_test_123",
        donationId: "don_123",
        paymentIntentId: "pi_123",
        publishableKey: effectivePublishableKey,
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      },
    ),
  );
};

const checkoutConfigResponse = (publishableKey: string | null) =>
  Promise.resolve(
    new Response(JSON.stringify({ publishableKey }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    }),
  );

const processingDonationResponse = () =>
  Promise.resolve(
    new Response(JSON.stringify({ donationId: "don_processing" }), {
      headers: { "Content-Type": "application/json" },
      status: 202,
    }),
  );

const serverErrorResponse = (message = "Server rejected the donation") =>
  Promise.resolve(
    new Response(JSON.stringify({ error: message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    }),
  );

const renderCheckout = (
  searchParams: React.ComponentProps<CheckoutPageClientComponent>["searchParams"] = {
    amount: "100",
    missionary_id: TEST_MISSIONARY_ID,
    workerId: TEST_WORKER_ID,
  },
) =>
  render(
    <CheckoutPageClient
      searchParams={searchParams}
      stripeOverride={{
        cardElement: <div data-testid="stripe-card-element" />,
        elements: stripeState.elements,
        mode: "live",
        publishableKey: "pk_test_unit",
        stripe: stripeState.stripe,
      }}
    />,
  );

const renderCheckoutWithRuntimeConfig = (
  searchParams: React.ComponentProps<CheckoutPageClientComponent>["searchParams"] = {
    amount: "100",
    missionary_id: TEST_MISSIONARY_ID,
    workerId: TEST_WORKER_ID,
  },
) => render(<CheckoutPageClient searchParams={searchParams} />);

const advanceToPayment = () => {
  fireEvent.click(screen.getByRole("button", { name: /next step/i }));
  fireEvent.change(screen.getByLabelText(/first name/i), {
    target: { value: "Ada" },
  });
  fireEvent.change(screen.getByLabelText(/last name/i), {
    target: { value: "Lovelace" },
  });
  fireEvent.change(screen.getByLabelText(/email address/i), {
    target: { value: "ada@example.com" },
  });
  fireEvent.click(screen.getByRole("button", { name: /continue to payment/i }));
};

const fillPostalCode = (value: string) => {
  fireEvent.change(screen.getByLabelText(/postal code/i), {
    target: { value },
  });
};

const confirmPayment = () => {
  fireEvent.click(screen.getByRole("button", { name: /confirm/i }));
};

const fetchMock = () => vi.mocked(globalThis.fetch);

const requestAt = (index: number) => {
  const request = fetchMock().mock.calls[index];
  if (!request) {
    throw new Error(`Missing fetch call at index ${index}`);
  }
  return {
    body: JSON.parse(String(request[1]?.body)),
    headers: request[1]?.headers as Record<string, string>,
  };
};

const fetchCallsByMethod = (method: string) =>
  fetchMock().mock.calls.filter(([, init]) => init?.method === method);

describe("CheckoutPageClient donation designations", () => {
  it("does not expose the payment flow for a worker-only legacy checkout URL", () => {
    renderCheckout({
      amount: "100",
      workerId: TEST_WORKER_ID,
    });

    expect(
      screen.getByRole("heading", { name: /target unspecified/i }),
    ).toBeTruthy();
    expect(screen.queryByRole("button", { name: /next step/i })).toBeNull();
    expect(screen.queryByTestId("stripe-card-element")).toBeNull();
    expect(fetchMock()).not.toHaveBeenCalled();
  });

  it("posts no designation fields for the semantic general fund alias", async () => {
    fetchMock().mockImplementation(initializedDonationResponse);
    stripeState.stripe.confirmCardPayment.mockResolvedValue({
      paymentIntent: { status: "succeeded" },
    });

    renderCheckout({
      amount: "100",
      fund: "general",
    });
    advanceToPayment();
    confirmPayment();

    await waitFor(() => expect(fetchMock()).toHaveBeenCalledTimes(1));
    expect(requestAt(0).body).toEqual({
      amount: 100,
      currency: "usd",
    });
    expect(
      screen.queryByRole("heading", { name: /target unspecified/i }),
    ).toBeNull();
  });

  it("posts canonical fund UUID designations unchanged", async () => {
    fetchMock().mockImplementation(initializedDonationResponse);
    stripeState.stripe.confirmCardPayment.mockResolvedValue({
      paymentIntent: { status: "succeeded" },
    });

    renderCheckout({
      amount: "100",
      fund_id: TEST_FUND_ID,
    });
    advanceToPayment();
    confirmPayment();

    await waitFor(() => expect(fetchMock()).toHaveBeenCalledTimes(1));
    expect(requestAt(0).body).toEqual({
      amount: 100,
      currency: "usd",
      fund_id: TEST_FUND_ID,
    });
  });
});

describe("CheckoutPageClient live card confirmation", () => {
  it("loads checkout configuration from the tenant publishable key when no bundled env key exists", async () => {
    delete process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    fetchMock().mockImplementation((_input, init) => {
      return init?.method === "POST"
        ? initializedDonationResponse("pk_live_tenant")
        : checkoutConfigResponse("pk_live_tenant");
    });

    renderCheckoutWithRuntimeConfig();
    advanceToPayment();

    expect(await screen.findByTestId("stripe-card-panel")).toBeTruthy();
    expect(fetchMock()).toHaveBeenCalledTimes(1);
    expect(fetchMock().mock.calls[0]?.[1]?.method).toBe("GET");
    expect(screen.queryByText(/test mode/i)).toBeNull();
  });

  it("shows a configuration error when runtime config returns no publishable key", async () => {
    fetchMock().mockImplementation((_input, init) => {
      return init?.method === "POST"
        ? initializedDonationResponse("pk_live_tenant")
        : checkoutConfigResponse(null);
    });

    renderCheckoutWithRuntimeConfig();
    advanceToPayment();

    const configurationError = await screen.findByRole("alert");
    expect(configurationError.textContent).toMatch(/checkout configuration/i);
    expect(
      screen.getByRole("heading", { name: /secure payment/i }),
    ).toBeTruthy();
    expect(fetchCallsByMethod("POST")).toHaveLength(0);
    expect(stripeState.stripe.confirmCardPayment).not.toHaveBeenCalled();
    expect(
      screen.queryByRole("heading", { name: /contribution confirmed/i }),
    ).toBeNull();
  });

  it("remounts with the server returned publishable key and prevents confirmation when keys differ", async () => {
    fetchMock().mockImplementation(() =>
      initializedDonationResponse("pk_test_rotated"),
    );

    render(
      <CheckoutPageClient
        searchParams={{
          amount: "100",
          missionary_id: TEST_MISSIONARY_ID,
          workerId: TEST_WORKER_ID,
        }}
        stripeOverride={{
          cardElement: <div data-testid="stripe-card-element" />,
          elements: stripeState.elements,
          mode: "live",
          publishableKey: "pk_test_initial",
          stripe: stripeState.stripe,
        }}
      />,
    );
    advanceToPayment();
    confirmPayment();

    await waitFor(() => expect(fetchMock()).toHaveBeenCalledTimes(1));
    expect(stripeState.stripe.confirmCardPayment).not.toHaveBeenCalled();

    const retryableError = await screen.findByRole("alert");
    expect(retryableError.textContent).toMatch(/configuration changed/i);
    expect(retryableError.textContent).toMatch(/try again/i);
  });

  it.each([null, "   "])(
    "does not confirm or show success when POST returns unusable publishable key %s",
    async (publishableKey) => {
      fetchMock().mockImplementation((_input, init) => {
        return init?.method === "POST"
          ? initializedDonationResponse(publishableKey)
          : checkoutConfigResponse("pk_live_tenant");
      });

      renderCheckoutWithRuntimeConfig();
      advanceToPayment();

      await screen.findByTestId("stripe-card-panel");
      confirmPayment();

      await waitFor(() => expect(fetchCallsByMethod("POST")).toHaveLength(1));
      expect(stripeState.stripe.confirmCardPayment).not.toHaveBeenCalled();
      expect(
        screen.queryByRole("heading", { name: /contribution confirmed/i }),
      ).toBeNull();

      const configurationError = await screen.findByRole("alert");
      expect(configurationError.textContent).toMatch(/configuration/i);
    },
  );

  it("does not show success for /api/donate initialization until Stripe confirms the PaymentIntent", async () => {
    let resolveConfirmation:
      | ((value: { paymentIntent: { status: string } }) => void)
      | null = null;
    const confirmationPromise = new Promise<{
      paymentIntent: { status: string };
    }>((resolve) => {
      resolveConfirmation = resolve;
    });
    fetchMock().mockImplementation(initializedDonationResponse);
    stripeState.stripe.confirmCardPayment.mockReturnValue(confirmationPromise);

    renderCheckout();
    advanceToPayment();
    confirmPayment();

    await waitFor(() => expect(fetchMock()).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(stripeState.stripe.confirmCardPayment).toHaveBeenCalledTimes(1),
    );
    expect(
      screen.queryByRole("heading", { name: /contribution confirmed/i }),
    ).toBeNull();

    resolveConfirmation?.({ paymentIntent: { status: "succeeded" } });

    expect(
      await screen.findByRole("heading", { name: /contribution confirmed/i }),
    ).toBeTruthy();
    expect(screen.getByText("$100.00")).toBeTruthy();
    expect(screen.getByText(/ada@example\.com/i)).toBeTruthy();
    expect(screen.getByText(/unit test worker/i)).toBeTruthy();
  });

  it("passes the entered postal code to Stripe billing details", async () => {
    fetchMock().mockImplementation(initializedDonationResponse);
    stripeState.stripe.confirmCardPayment.mockResolvedValue({
      paymentIntent: { status: "succeeded" },
    });

    renderCheckout();
    advanceToPayment();
    fillPostalCode(" 94103 ");
    confirmPayment();

    await waitFor(() => expect(fetchMock()).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(stripeState.stripe.confirmCardPayment).toHaveBeenCalledTimes(1),
    );
    expect(stripeState.stripe.confirmCardPayment).toHaveBeenCalledWith(
      "cs_test_123",
      {
        payment_method: {
          billing_details: {
            address: {
              postal_code: "94103",
            },
            email: "ada@example.com",
            name: "Ada Lovelace",
          },
          card: stripeState.cardElement,
        },
      },
    );
  });

  it("renders the original attempt snapshot after checkout params rerender", async () => {
    let resolveConfirmation:
      | ((value: { paymentIntent: { status: string } }) => void)
      | null = null;
    const confirmationPromise = new Promise<{
      paymentIntent: { status: string };
    }>((resolve) => {
      resolveConfirmation = resolve;
    });
    fetchMock().mockImplementation(initializedDonationResponse);
    stripeState.stripe.confirmCardPayment.mockReturnValue(confirmationPromise);

    const view = renderCheckout({
      amount: "100",
      fund_id: TEST_FUND_ID,
    });
    advanceToPayment();
    confirmPayment();

    await waitFor(() =>
      expect(stripeState.stripe.confirmCardPayment).toHaveBeenCalledTimes(1),
    );

    const backButton = screen.getByRole("button", { name: /^back$/i });
    expect((backButton as HTMLButtonElement).disabled).toBe(true);

    fireEvent.click(backButton);

    expect(
      screen.getByRole("heading", { name: /secure payment/i }),
    ).toBeTruthy();
    expect(screen.queryByLabelText(/first name/i)).toBeNull();

    view.rerender(
      <CheckoutPageClient
        searchParams={{
          amount: "250",
          missionary_id: TEST_MISSIONARY_ID,
          workerId: TEST_WORKER_ID,
        }}
        stripeOverride={{
          cardElement: <div data-testid="stripe-card-element" />,
          elements: stripeState.elements,
          mode: "live",
          publishableKey: "pk_test_unit",
          stripe: stripeState.stripe,
        }}
      />,
    );

    await act(async () => {
      resolveConfirmation?.({ paymentIntent: { status: "succeeded" } });
      await confirmationPromise;
    });

    expect(
      await screen.findByRole("heading", { name: /contribution confirmed/i }),
    ).toBeTruthy();
    expect(screen.getByText("$100.00")).toBeTruthy();
    expect(screen.queryByText("$250.00")).toBeNull();
    expect(screen.getByText(/our global mission/i)).toBeTruthy();
    expect(screen.queryByText(/unit test worker/i)).toBeNull();
    expect(screen.queryByRole("alert")).toBeNull();
    expect(fetchMock()).toHaveBeenCalledTimes(1);
  });

  it("keeps a stale non-success Stripe confirmation retryable after checkout params rerender", async () => {
    let resolveConfirmation:
      | ((value: { paymentIntent: { status: string } }) => void)
      | null = null;
    const confirmationPromise = new Promise<{
      paymentIntent: { status: string };
    }>((resolve) => {
      resolveConfirmation = resolve;
    });
    fetchMock().mockImplementation(initializedDonationResponse);
    stripeState.stripe.confirmCardPayment.mockReturnValue(confirmationPromise);

    const view = renderCheckout({
      amount: "100",
      fund_id: TEST_FUND_ID,
    });
    advanceToPayment();
    confirmPayment();

    await waitFor(() =>
      expect(stripeState.stripe.confirmCardPayment).toHaveBeenCalledTimes(1),
    );

    view.rerender(
      <CheckoutPageClient
        searchParams={{ amount: "100", fund_id: TEST_OTHER_FUND_ID }}
        stripeOverride={{
          cardElement: <div data-testid="stripe-card-element" />,
          elements: stripeState.elements,
          mode: "live",
          publishableKey: "pk_test_unit",
          stripe: stripeState.stripe,
        }}
      />,
    );

    await act(async () => {
      resolveConfirmation?.({
        paymentIntent: { status: "requires_payment_method" },
      });
      await confirmationPromise;
    });

    expect(
      screen.queryByRole("heading", { name: /contribution confirmed/i }),
    ).toBeNull();
    expect(
      screen.getByRole("heading", { name: /secure payment/i }),
    ).toBeTruthy();

    const retryableError = await screen.findByRole("alert");
    expect(retryableError.textContent).toMatch(/checkout details changed/i);
    expect(retryableError.textContent).toMatch(/try again/i);
    expect(fetchMock()).toHaveBeenCalledTimes(1);

    const unlockedBackButton = screen.getByRole("button", { name: /^back$/i });
    const unlockedConfirmButton = screen.getByRole("button", {
      name: /confirm/i,
    });
    expect((unlockedBackButton as HTMLButtonElement).disabled).toBe(false);
    expect((unlockedConfirmButton as HTMLButtonElement).disabled).toBe(false);
  });

  it("unlocks a stale failed request after checkout params rerender", async () => {
    let rejectDonationRequest: ((reason?: unknown) => void) | null = null;
    const donationRequestPromise = new Promise<Response>((_resolve, reject) => {
      rejectDonationRequest = reject;
    });
    fetchMock().mockReturnValue(donationRequestPromise);

    const view = renderCheckout({
      amount: "100",
      fund_id: TEST_FUND_ID,
    });
    advanceToPayment();
    confirmPayment();

    await waitFor(() => expect(fetchMock()).toHaveBeenCalledTimes(1));

    await act(async () => {
      view.rerender(
        <CheckoutPageClient
          searchParams={{ amount: "100", fund_id: TEST_OTHER_FUND_ID }}
          stripeOverride={{
            cardElement: <div data-testid="stripe-card-element" />,
            elements: stripeState.elements,
            mode: "live",
            publishableKey: "pk_test_unit",
            stripe: stripeState.stripe,
          }}
        />,
      );
    });

    await act(async () => {
      rejectDonationRequest?.(new Error("Network unavailable"));
      await donationRequestPromise.catch(() => null);
    });

    const retryableError = await screen.findByRole("alert");
    expect(retryableError.textContent).toMatch(/checkout details changed/i);
    expect(retryableError.textContent).toMatch(/try again/i);
    expect(stripeState.stripe.confirmCardPayment).not.toHaveBeenCalled();

    const unlockedBackButton = screen.getByRole("button", { name: /^back$/i });
    const unlockedConfirmButton = screen.getByRole("button", {
      name: /confirm/i,
    });
    expect((unlockedBackButton as HTMLButtonElement).disabled).toBe(false);
    expect((unlockedConfirmButton as HTMLButtonElement).disabled).toBe(false);
  });

  it("keeps the donor on payment with a visible error when Stripe confirmation fails", async () => {
    fetchMock().mockImplementation(initializedDonationResponse);
    stripeState.stripe.confirmCardPayment.mockResolvedValue({
      error: { message: "Your card was declined." },
    });

    renderCheckout();
    advanceToPayment();
    confirmPayment();

    expect((await screen.findByRole("alert")).textContent).toContain(
      "Your card was declined.",
    );
    expect(
      screen.getByRole("heading", { name: /secure payment/i }),
    ).toBeTruthy();
    expect(
      screen.queryByRole("heading", { name: /contribution confirmed/i }),
    ).toBeNull();
  });

  it("keeps the donor on payment when Stripe returns a processing PaymentIntent", async () => {
    fetchMock().mockImplementation(initializedDonationResponse);
    stripeState.stripe.confirmCardPayment.mockResolvedValue({
      paymentIntent: { status: "processing" },
    });

    renderCheckout();
    advanceToPayment();
    confirmPayment();

    expect((await screen.findByRole("alert")).textContent).toMatch(
      /still processing/i,
    );
    expect(
      screen.getByRole("heading", { name: /secure payment/i }),
    ).toBeTruthy();
    expect(
      screen.queryByRole("heading", { name: /contribution confirmed/i }),
    ).toBeNull();
  });

  it("coerces monthly input to one-time request behavior and one-time success copy", async () => {
    fetchMock().mockImplementation(initializedDonationResponse);
    stripeState.stripe.confirmCardPayment.mockResolvedValue({
      paymentIntent: { status: "succeeded" },
    });

    renderCheckout({
      amount: "100",
      frequency: "monthly",
      missionary_id: TEST_MISSIONARY_ID,
      workerId: TEST_WORKER_ID,
    });

    expect(screen.getAllByText(/one-time gift/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/monthly partner/i)).toBeNull();

    advanceToPayment();
    confirmPayment();

    expect(
      await screen.findByRole("heading", { name: /contribution confirmed/i }),
    ).toBeTruthy();

    expect(requestAt(0).body).toEqual({
      amount: 100,
      currency: "usd",
      missionary_id: TEST_MISSIONARY_ID,
    });
    expect(screen.queryByText(/monthly support/i)).toBeNull();
    expect(screen.queryByText(/recurring/i)).toBeNull();
  });
});

describe("CheckoutPageClient idempotency retry keys", () => {
  it("reuses the same idempotency key for an exact retry after an error", async () => {
    fetchMock()
      .mockImplementationOnce(() => serverErrorResponse("Try again"))
      .mockImplementationOnce(() => serverErrorResponse("Try again"));

    renderCheckout();
    advanceToPayment();
    confirmPayment();

    expect((await screen.findByRole("alert")).textContent).toContain(
      "Try again",
    );
    confirmPayment();

    await waitFor(() => expect(fetchMock()).toHaveBeenCalledTimes(2));
    expect(requestAt(0).headers["Idempotency-Key"]).toBe("idem-1");
    expect(requestAt(1).headers["Idempotency-Key"]).toBe("idem-1");
  });

  it("rotates the idempotency key when the amount changes after an error", async () => {
    fetchMock()
      .mockImplementationOnce(() => serverErrorResponse("Try again"))
      .mockImplementationOnce(() => serverErrorResponse("Try again"));

    renderCheckout();
    advanceToPayment();
    confirmPayment();

    expect((await screen.findByRole("alert")).textContent).toContain(
      "Try again",
    );
    fireEvent.click(screen.getByRole("button", { name: /^back$/i }));
    fireEvent.click(screen.getByRole("button", { name: /^back$/i }));
    fireEvent.click(screen.getByRole("radio", { name: "$250" }));
    fireEvent.click(screen.getByRole("button", { name: /next step/i }));
    fireEvent.click(
      screen.getByRole("button", { name: /continue to payment/i }),
    );
    confirmPayment();

    await waitFor(() => expect(fetchMock()).toHaveBeenCalledTimes(2));
    expect(requestAt(0).headers["Idempotency-Key"]).toBe("idem-1");
    expect(requestAt(1).headers["Idempotency-Key"]).toBe("idem-2");
    expect(requestAt(1).body.amount).toBe(250);
  });

  it("rotates the idempotency key when the fund designation changes after a processing response", async () => {
    fetchMock()
      .mockImplementationOnce(processingDonationResponse)
      .mockImplementationOnce(processingDonationResponse);

    const view = renderCheckout({
      amount: "100",
      fund_id: TEST_FUND_ID,
    });
    advanceToPayment();
    confirmPayment();

    expect((await screen.findByRole("alert")).textContent).toMatch(
      /still processing/i,
    );

    view.rerender(
      <CheckoutPageClient
        searchParams={{ amount: "100", fund_id: TEST_OTHER_FUND_ID }}
        stripeOverride={{
          cardElement: <div data-testid="stripe-card-element" />,
          elements: stripeState.elements,
          mode: "live",
          publishableKey: "pk_test_unit",
          stripe: stripeState.stripe,
        }}
      />,
    );
    confirmPayment();

    await waitFor(() => expect(fetchMock()).toHaveBeenCalledTimes(2));
    expect(requestAt(0).headers["Idempotency-Key"]).toBe("idem-1");
    expect(requestAt(0).body.fund_id).toBe(TEST_FUND_ID);
    expect(requestAt(1).headers["Idempotency-Key"]).toBe("idem-2");
    expect(requestAt(1).body.fund_id).toBe(TEST_OTHER_FUND_ID);
  });
});
