// @vitest-environment jsdom

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import React from "react";
import { flushSync } from "react-dom";
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
  (typeof import("../../../../apps/donor/app/(public)/(solid)/checkout/checkout-client"))["CheckoutPageClient"]; // eslint-disable-line @typescript-eslint/consistent-type-imports -- Keep the component import deferred until after mocks are registered.
type CheckoutSearchParams =
  React.ComponentProps<CheckoutPageClientComponent>["searchParams"];

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

vi.mock("@asym/lib/motion", () => {
  // Motion preserves each tag's component identity across parent renders.
  const components = new Map<
    string,
    (
      props: React.PropsWithChildren<Record<string, unknown>>,
    ) => React.ReactElement
  >();

  return {
    AnimatePresence: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
    motion: new Proxy(
      {},
      {
        get: (_target, tag: string) => {
          let component = components.get(tag);
          if (!component) {
            component = ({ children, ...props }) =>
              React.createElement(tag, omitMotionProps(props), children);
            components.set(tag, component);
          }
          return component;
        },
      },
    ),
  };
});

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
    await import("../../../../apps/donor/app/(public)/(solid)/checkout/checkout-client");
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

const checkoutWithOverride = (searchParams: CheckoutSearchParams) => (
  <CheckoutPageClient
    searchParams={searchParams}
    stripeOverride={{
      cardElement: <div data-testid="stripe-card-element" />,
      elements: stripeState.elements,
      mode: "live",
      publishableKey: "pk_test_unit",
      stripe: stripeState.stripe,
    }}
  />
);

const renderCheckout = (
  searchParams: CheckoutSearchParams = {
    amount: "100",
    missionary_id: TEST_MISSIONARY_ID,
    workerId: TEST_WORKER_ID,
  },
) => render(checkoutWithOverride(searchParams));

const renderCheckoutInStrictMode = (
  searchParams: CheckoutSearchParams = {
    amount: "100",
    missionary_id: TEST_MISSIONARY_ID,
    workerId: TEST_WORKER_ID,
  },
) => {
  const strictCheckout = (params: CheckoutSearchParams) => (
    <React.StrictMode>{checkoutWithOverride(params)}</React.StrictMode>
  );
  const view = render(strictCheckout(searchParams));

  return {
    ...view,
    rerenderCheckout: (params: CheckoutSearchParams) =>
      view.rerender(strictCheckout(params)),
  };
};

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

const toggleCoverProcessingFees = () => {
  fireEvent.click(
    screen.getByRole("switch", { name: /cover processing fees/i }),
  );
};

it("keeps a named contribution summary bound to the recipient, gift and fee quote through checkout steps", () => {
  renderCheckout();
  const summary = screen.getByRole("complementary", {
    name: "Contribution summary",
  });
  expect(within(summary).getByText("Unit Test Worker")).toBeTruthy();
  expect(within(summary).getAllByText("$100.00")).toHaveLength(2);
  fireEvent.change(screen.getByLabelText("Custom amount"), {
    target: { value: "125.50" },
  });
  expect(within(summary).getAllByText("$125.50")).toHaveLength(2);
  toggleCoverProcessingFees();
  expect(within(summary).getByText("$4.06")).toBeTruthy();
  expect(within(summary).getByText("$129.56")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: /next step/i }));
  expect(within(summary).getByText("Unit Test Worker")).toBeTruthy();
  expect(within(summary).getByText("$129.56")).toBeTruthy();
  const progress = screen.getByRole("navigation", {
    name: "Checkout progress",
  });
  expect(
    within(progress).getByText("DETAILS").getAttribute("aria-current"),
  ).toBe("step");
  expect(fetchMock()).not.toHaveBeenCalled();
});

// Worker profiles are sample content; a gift from one goes to the
// missionary account its link designates, so the summary says so instead of
// implying the sample is the recipient.
it("says when the profile a gift came from is a sample", () => {
  renderCheckout();
  const summary = screen.getByRole("complementary", {
    name: "Contribution summary",
  });
  expect(within(summary).getByText("Unit Test Worker")).toBeTruthy();
  expect(
    within(summary).getByText(
      "Unit Test Worker is a sample profile. Your gift goes to the missionary account it’s linked to in this demo organization.",
    ),
  ).toBeTruthy();
});

// "Give again" from the dashboard opens checkout with only the missionary
// account; the donor’s already-loaded portal data names them.
it("names a missionary the signed-in donor already supports", async () => {
  const { getQueryClient } =
    await import("../../../../packages/database/providers/query-client");
  getQueryClient().setQueryData(["donor", "portal"], {
    donations: [
      {
        missionary: {
          id: TEST_MISSIONARY_ID,
          name: "Jordan Hale",
          avatarUrl: null,
        },
      },
    ],
    recurringGifts: [],
  });
  renderCheckout({ amount: "100", missionary_id: TEST_MISSIONARY_ID });
  const summary = screen.getByRole("complementary", {
    name: "Contribution summary",
  });
  expect(within(summary).getByText("Jordan Hale")).toBeTruthy();
  getQueryClient().clear();
});

it("adds no sample note to a fund gift", () => {
  renderCheckout({ amount: "100", fund_id: TEST_OTHER_FUND_ID });
  const summary = screen.getByRole("complementary", {
    name: "Contribution summary",
  });
  expect(within(summary).queryByText(/sample profile/)).toBeNull();
});

const guestGivingDefaultFeeFlags = {
  cover_fees: false,
  payment_method: "card",
} as const;

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

    // Plain words and one way forward, instead of "Target Unspecified".
    expect(
      screen.getByRole("heading", { name: "Choose who you’d like to support" }),
    ).toBeTruthy();
    expect(
      screen
        .getByRole("link", { name: "Find a missionary" })
        .getAttribute("href"),
    ).toBe("/workers");
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
      ...guestGivingDefaultFeeFlags,
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
      ...guestGivingDefaultFeeFlags,
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

  it("recovers the runtime config fetch after an effect cleanup aborts it (StrictMode remount)", async () => {
    fetchMock().mockImplementation((_input, init) => {
      return init?.method === "POST"
        ? initializedDonationResponse("pk_live_tenant")
        : checkoutConfigResponse(null);
    });

    render(
      <React.StrictMode>
        <CheckoutPageClient
          searchParams={{
            amount: "100",
            missionary_id: TEST_MISSIONARY_ID,
            workerId: TEST_WORKER_ID,
          }}
        />
      </React.StrictMode>,
    );
    advanceToPayment();

    // The double-invoked mount effect aborts the first fetch; the payment step
    // must still resolve instead of hanging on "Preparing secure checkout".
    const configurationError = await screen.findByRole("alert");
    expect(configurationError.textContent).toMatch(/checkout configuration/i);
    expect(
      screen.getByRole("heading", { name: /secure payment/i }),
    ).toBeTruthy();
    expect(screen.queryByText(/preparing secure checkout/i)).toBeNull();
  });

  it("rejects confirmation when the returned publishable key differs from the override", async () => {
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

  it("remounts the real Elements subtree for a returned key and requires an idempotent explicit retry", async () => {
    const donationResponses: Array<(response: Response) => void> = [];
    let completeConfirmation:
      ((result: { paymentIntent: { status: string } }) => void) | undefined;
    const confirmation = new Promise<{ paymentIntent: { status: string } }>(
      (resolve) => {
        completeConfirmation = resolve;
      },
    );
    stripeState.stripe.confirmCardPayment.mockReturnValue(confirmation);
    fetchMock().mockImplementation((_input, init) =>
      init?.method === "POST"
        ? new Promise<Response>((resolve) => donationResponses.push(resolve))
        : checkoutConfigResponse("pk_live_initial"),
    );
    const responseWithRotatedKey = (clientSecret: string) =>
      new Response(
        JSON.stringify({
          clientSecret,
          donationId: "don_rotated",
          paymentIntentId: "pi_rotated",
          publishableKey: "pk_live_rotated",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );

    // No stripeOverride: this exercises the production Elements key owner.
    renderCheckoutWithRuntimeConfig();
    advanceToPayment();
    await screen.findByTestId("stripe-card-panel");
    const originalButton = screen.getByRole("button", { name: /confirm/i });
    fireEvent.click(originalButton);
    await waitFor(() => expect(fetchCallsByMethod("POST")).toHaveLength(1));
    expect(originalButton.getAttribute("aria-disabled")).toBe("true");
    expect(originalButton).toHaveProperty("disabled", false);
    fireEvent.click(originalButton);
    expect(fetchCallsByMethod("POST")).toHaveLength(1);
    expect(stripeState.stripe.confirmCardPayment).not.toHaveBeenCalled();

    await act(async () => {
      donationResponses[0]?.(responseWithRotatedKey("cs_first_unconfirmed"));
    });
    expect((await screen.findByRole("alert")).textContent).toMatch(
      /configuration changed.*try again/i,
    );
    const retryButton = screen.getByRole("button", { name: /confirm/i });
    // Changing the actual Elements key must replace its complete subtree.
    expect(retryButton).not.toBe(originalButton);
    expect(originalButton.isConnected).toBe(false);
    expect(retryButton).toHaveProperty("disabled", false);
    expect(stripeJsState.loadStripe).toHaveBeenCalledWith("pk_live_rotated");
    expect(fetchCallsByMethod("POST")).toHaveLength(1);
    expect(stripeState.stripe.confirmCardPayment).not.toHaveBeenCalled();
    expect(
      screen.queryByRole("heading", { name: /contribution confirmed/i }),
    ).toBeNull();

    // Key recovery requires an explicit retry with the unchanged request identity.
    fireEvent.click(retryButton);
    await waitFor(() => expect(fetchCallsByMethod("POST")).toHaveLength(2));
    expect(retryButton.getAttribute("aria-disabled")).toBe("true");
    expect(retryButton).toHaveProperty("disabled", false);
    fireEvent.click(retryButton);
    expect(fetchCallsByMethod("POST")).toHaveLength(2);
    const [firstRequest, retryRequest] = fetchCallsByMethod("POST");
    expect(firstRequest?.[0]).toBe("/api/donate");
    expect(retryRequest?.[0]).toBe("/api/donate");
    const initialIdempotencyKey = new Headers(firstRequest?.[1]?.headers).get(
      "Idempotency-Key",
    );
    expect(initialIdempotencyKey).toBe("idem-1");
    expect(new Headers(retryRequest?.[1]?.headers).get("Idempotency-Key")).toBe(
      initialIdempotencyKey,
    );
    expect(retryRequest?.[1]?.body).toBe(firstRequest?.[1]?.body);
    expect(JSON.parse(String(retryRequest?.[1]?.body))).toEqual({
      amount: 100,
      currency: "usd",
      missionary_id: TEST_MISSIONARY_ID,
      ...guestGivingDefaultFeeFlags,
    });
    await act(async () => {
      donationResponses[1]?.(responseWithRotatedKey("cs_retry_confirmed"));
    });
    await waitFor(() =>
      expect(stripeState.stripe.confirmCardPayment).toHaveBeenCalledTimes(1),
    );
    expect(stripeState.stripe.confirmCardPayment).toHaveBeenCalledWith(
      "cs_retry_confirmed",
      {
        payment_method: {
          card: stripeState.cardElement,
          billing_details: { email: "ada@example.com", name: "Ada Lovelace" },
        },
      },
    );
    expect(
      screen.queryByRole("heading", { name: /contribution confirmed/i }),
    ).toBeNull();
    await act(async () => {
      completeConfirmation?.({ paymentIntent: { status: "succeeded" } });
      await confirmation;
    });
    expect(
      await screen.findByRole("heading", { name: /contribution confirmed/i }),
    ).toBeTruthy();
    expect(screen.getByText("$100.00")).toBeTruthy();
    expect(screen.getByText("ada@example.com")).toBeTruthy();
    expect(screen.getByText("Unit Test Worker")).toBeTruthy();
    expect(fetchCallsByMethod("POST")).toHaveLength(2);
    expect(stripeState.stripe.confirmCardPayment).toHaveBeenCalledTimes(1);
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

  it("uses an updated override key mid-flight without remounting when the returned key matches", async () => {
    let resolveDonation: ((value: Response) => void) | null = null;
    const donationPromise = new Promise<Response>((resolve) => {
      resolveDonation = resolve;
    });
    fetchMock().mockReturnValue(donationPromise);
    stripeState.stripe.confirmCardPayment.mockResolvedValue({
      paymentIntent: { status: "succeeded" },
    });

    const searchParams = {
      amount: "100",
      missionary_id: TEST_MISSIONARY_ID,
      workerId: TEST_WORKER_ID,
    };
    const view = render(
      <CheckoutPageClient
        searchParams={searchParams}
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
    const processingButton = screen.getByRole("button", {
      name: /processing payment/i,
    });
    expect(processingButton.getAttribute("aria-disabled")).toBe("true");
    expect(processingButton).toHaveProperty("disabled", false);

    flushSync(() => {
      view.rerender(
        <CheckoutPageClient
          searchParams={searchParams}
          stripeOverride={{
            cardElement: <div data-testid="stripe-card-element" />,
            elements: stripeState.elements,
            mode: "live",
            publishableKey: "pk_test_rotated",
            stripe: stripeState.stripe,
          }}
        />,
      );
    });

    // stripeOverride updates the key ref but bypasses the keyed Elements branch.
    expect(screen.getByRole("button", { name: /processing payment/i })).toBe(
      processingButton,
    );
    expect(processingButton.getAttribute("aria-disabled")).toBe("true");
    expect(processingButton).toHaveProperty("disabled", false);

    await act(async () => {
      resolveDonation?.(
        new Response(
          JSON.stringify({
            clientSecret: "cs_test_123",
            donationId: "don_123",
            paymentIntentId: "pi_123",
            publishableKey: "pk_test_rotated",
          }),
          {
            headers: { "Content-Type": "application/json" },
            status: 200,
          },
        ),
      );
      await donationPromise;
    });

    expect(stripeState.stripe.confirmCardPayment).toHaveBeenCalledTimes(1);
    expect(
      await screen.findByRole("heading", { name: /contribution confirmed/i }),
    ).toBeTruthy();
    expect(screen.queryByText(/configuration changed/i)).toBeNull();
  });

  it("does not show success for /api/donate initialization until Stripe confirms the PaymentIntent", async () => {
    let resolveConfirmation:
      ((value: { paymentIntent: { status: string } }) => void) | null = null;
    const confirmationPromise = new Promise<{
      paymentIntent: { status: string };
    }>((resolve) => {
      resolveConfirmation = resolve;
    });
    fetchMock().mockImplementation(initializedDonationResponse);
    stripeState.stripe.confirmCardPayment.mockReturnValue(confirmationPromise);

    renderCheckout();
    advanceToPayment();
    const paymentButton = screen.getByRole("button", { name: /confirm/i });
    paymentButton.focus();
    confirmPayment();

    await waitFor(() => expect(fetchMock()).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(stripeState.stripe.confirmCardPayment).toHaveBeenCalledTimes(1),
    );
    expect(
      screen.queryByRole("heading", { name: /contribution confirmed/i }),
    ).toBeNull();

    expect(document.activeElement).toBe(paymentButton);
    expect(paymentButton.getAttribute("aria-disabled")).toBe("true");
    expect(paymentButton).toHaveProperty("disabled", false);
    expect(screen.getByRole("button", { name: "Processing payment" })).toBe(
      paymentButton,
    );
    expect(screen.getAllByLabelText("Processing payment")).toEqual([
      paymentButton,
    ]);
    fireEvent.click(paymentButton);
    expect(stripeState.stripe.confirmCardPayment).toHaveBeenCalledTimes(1);
    expect(fetchMock()).toHaveBeenCalledTimes(1);

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
      ((value: { paymentIntent: { status: string } }) => void) | null = null;
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
      ((value: { paymentIntent: { status: string } }) => void) | null = null;
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
      ...guestGivingDefaultFeeFlags,
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

describe("CheckoutPageClient shared form composition", () => {
  it("focuses the custom amount field when its currency prefix is clicked", () => {
    renderCheckout();
    const input = screen.getByRole("textbox", { name: "Custom amount" });
    fireEvent.click(screen.getByText("$", { exact: true }));
    expect(document.activeElement).toBe(input);
  });

  it("exposes a label for the disabled country field", () => {
    renderCheckout();
    advanceToPayment();
    const country = screen.getByRole("textbox", { name: "Country" });
    expect(country).toHaveProperty("disabled", true);
    expect(country).toHaveProperty("value", "United States");
  });
});

describe("CheckoutPageClient StrictMode payment state", () => {
  it("starts one payment when confirmation is repeated before React renders pending state", async () => {
    let resolveDonation: ((value: Response) => void) | undefined;
    fetchMock().mockReturnValueOnce(
      new Promise<Response>((resolve) => {
        resolveDonation = resolve;
      }),
    );
    stripeState.stripe.confirmCardPayment.mockResolvedValue({
      paymentIntent: { status: "succeeded" },
    });
    renderCheckoutInStrictMode();
    advanceToPayment();
    const button = screen.getByRole("button", { name: /confirm/i });

    act(() => {
      button.click();
      button.click();
    });

    expect(fetchCallsByMethod("POST")).toHaveLength(1);
    await act(async () => {
      resolveDonation?.(await initializedDonationResponse());
    });
    expect(stripeState.stripe.confirmCardPayment).toHaveBeenCalledTimes(1);
    expect(
      await screen.findByRole("heading", { name: /contribution confirmed/i }),
    ).toBeTruthy();
  });

  it("commits a successful payment once when React replays state updaters", async () => {
    fetchMock().mockImplementation(initializedDonationResponse);
    stripeState.stripe.confirmCardPayment.mockResolvedValue({
      paymentIntent: { status: "succeeded" },
    });

    renderCheckoutInStrictMode();
    advanceToPayment();
    confirmPayment();

    expect(
      await screen.findByRole("heading", { name: /contribution confirmed/i }),
    ).toBeTruthy();
    expect(fetchCallsByMethod("POST")).toHaveLength(1);
    expect(stripeState.stripe.confirmCardPayment).toHaveBeenCalledTimes(1);
  });

  it("reuses the idempotency key for an exact StrictMode retry", async () => {
    fetchMock()
      .mockImplementationOnce(() => serverErrorResponse("Try again"))
      .mockImplementationOnce(() => serverErrorResponse("Try again"));

    renderCheckoutInStrictMode();
    advanceToPayment();
    confirmPayment();

    expect((await screen.findByRole("alert")).textContent).toContain(
      "Try again",
    );
    confirmPayment();

    await waitFor(() => expect(fetchCallsByMethod("POST")).toHaveLength(2));
    expect(requestAt(0).headers["Idempotency-Key"]).toBe("idem-1");
    expect(requestAt(1).headers["Idempotency-Key"]).toBe("idem-1");
  });

  it("unlocks a stale StrictMode request after checkout params change", async () => {
    let rejectDonationRequest: ((reason?: unknown) => void) | null = null;
    const donationRequestPromise = new Promise<Response>((_resolve, reject) => {
      rejectDonationRequest = reject;
    });
    fetchMock().mockReturnValue(donationRequestPromise);

    const view = renderCheckoutInStrictMode({
      amount: "100",
      fund_id: TEST_FUND_ID,
    });
    advanceToPayment();
    confirmPayment();

    await waitFor(() => expect(fetchCallsByMethod("POST")).toHaveLength(1));

    view.rerenderCheckout({
      amount: "100",
      fund_id: TEST_OTHER_FUND_ID,
    });

    await act(async () => {
      rejectDonationRequest?.(new Error("Network unavailable"));
      await donationRequestPromise.catch(() => null);
    });

    expect((await screen.findByRole("alert")).textContent).toMatch(
      /checkout details changed/i,
    );
    const backButton = screen.getByRole("button", { name: /^back$/i });
    const confirmButton = screen.getByRole("button", { name: /confirm/i });
    expect((backButton as HTMLButtonElement).disabled).toBe(false);
    expect((confirmButton as HTMLButtonElement).disabled).toBe(false);
    expect(stripeState.stripe.confirmCardPayment).not.toHaveBeenCalled();
  });
});

describe("CheckoutPageClient Gift processing-fee policy", () => {
  it("posts the donor-entered gift when cover-fees is on, not a client gross-up", async () => {
    fetchMock().mockImplementation(initializedDonationResponse);
    stripeState.stripe.confirmCardPayment.mockResolvedValue({
      paymentIntent: { status: "succeeded" },
    });

    renderCheckout();
    toggleCoverProcessingFees();
    expect(screen.getByText(/estimated processing costs/i)).toBeTruthy();
    expect(screen.queryByText(/reaches the field/i)).toBeNull();

    advanceToPayment();
    confirmPayment();

    await waitFor(() => expect(fetchMock()).toHaveBeenCalledTimes(1));
    expect(requestAt(0).body).toEqual({
      amount: 100,
      currency: "usd",
      missionary_id: TEST_MISSIONARY_ID,
      cover_fees: true,
      payment_method: "card",
    });
  });

  it("quotes ACH cover-fees on confirm without posting a live bank payment", async () => {
    renderCheckout();
    toggleCoverProcessingFees();
    advanceToPayment();

    expect(
      screen.getByRole("button", { name: /confirm \$103.30/i }),
    ).toBeTruthy();

    fireEvent.click(screen.getByRole("tab", { name: /^bank$/i }));

    // The ACH fee quote is still shown, but bank payment isn't available, so
    // Confirm is disabled instead of leading to a failure message.
    const confirm = screen.getByRole("button", { name: /confirm \$100.81/i });
    expect(confirm.hasAttribute("disabled")).toBe(true);
    fireEvent.click(confirm);
    expect(screen.queryByRole("alert")).toBeNull();
    expect(fetchMock()).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("tab", { name: /^card$/i }));
    expect(
      screen
        .getByRole("button", { name: /confirm \$103.30/i })
        .hasAttribute("disabled"),
    ).toBe(false);
  });
});

describe("CheckoutPageClient keyboard selection", () => {
  it("selects preset amounts with arrow keys and keeps one tab stop", async () => {
    renderCheckout();
    const selected = screen.getByRole("radio", { name: "$100" });
    act(() => selected.focus());
    fireEvent.keyDown(selected, { key: "ArrowRight" });

    const next = screen.getByRole("radio", { name: "$250" });
    await waitFor(() => expect(next.getAttribute("aria-checked")).toBe("true"));
    expect(document.activeElement).toBe(next);
    expect(
      screen.getAllByRole("radio").filter((item) => item.tabIndex === 0),
    ).toEqual([next]);
    expect(fetchMock()).not.toHaveBeenCalled();
  });

  it("clears custom amounts when a preset is selected", () => {
    renderCheckout();
    const custom = screen.getByLabelText("Custom amount");
    fireEvent.change(custom, { target: { value: "123.45" } });
    expect(screen.queryByRole("radio", { checked: true })).toBeNull();
    fireEvent.click(screen.getByRole("radio", { name: "$50" }));
    expect(
      screen.getByRole("radio", { name: "$50", checked: true }),
    ).toBeTruthy();
    expect((custom as HTMLInputElement).value).toBe("");
  });

  it("navigates payment tabs by keyboard with correctly named panels", async () => {
    renderCheckout();
    advanceToPayment();
    const card = screen.getByRole("tab", { name: "Card" });
    act(() => card.focus());
    fireEvent.keyDown(card, { key: "ArrowRight" });

    const bank = screen.getByRole("tab", { name: "Bank" });
    await waitFor(() =>
      expect(bank.getAttribute("aria-selected")).toBe("true"),
    );
    expect(document.activeElement).toBe(bank);
    const panel = screen.getByRole("tabpanel", { name: "Bank" });
    expect(panel.id).toBe(bank.getAttribute("aria-controls"));
    expect(panel.textContent).toContain("Instant Bank Link");
    expect(
      screen.getAllByRole("tab").filter((item) => item.tabIndex === 0),
    ).toEqual([bank]);
    expect(fetchMock()).not.toHaveBeenCalled();

    fireEvent.keyDown(bank, { key: "Home" });
    await waitFor(() =>
      expect(card.getAttribute("aria-selected")).toBe("true"),
    );
    expect(screen.getByRole("tabpanel", { name: "Card" })).toBeTruthy();
  });

  it("says bank and wallet payment are unavailable instead of offering dead actions", async () => {
    renderCheckout();
    advanceToPayment();

    fireEvent.click(screen.getByRole("tab", { name: "Bank" }));
    const bank = await screen.findByRole("tabpanel", { name: "Bank" });
    expect(bank.textContent).toContain("Instant Bank Link");
    expect(bank.textContent).toContain("isn't available yet");
    expect(bank.querySelector("button")).toBeNull();

    fireEvent.click(screen.getByRole("tab", { name: /Apple|Wallet/ }));
    const wallets = await screen.findAllByRole("tabpanel");
    const wallet = wallets.find((panel) =>
      /isn't available yet/.test(panel.textContent ?? ""),
    );
    expect(wallet).toBeTruthy();
    expect(
      screen.queryByRole("button", { name: /Pay with Apple Pay/ }),
    ).toBeNull();
    expect(fetchMock()).not.toHaveBeenCalled();
  });

  it("prevents changing payment methods during confirmation", async () => {
    fetchMock().mockImplementation(() => new Promise<Response>(() => {}));
    renderCheckout();
    advanceToPayment();
    confirmPayment();
    await waitFor(() => expect(fetchMock()).toHaveBeenCalledTimes(1));

    const card = screen.getByRole("tab", { name: "Card" });
    const bank = screen.getByRole("tab", { name: "Bank" });
    expect(
      screen
        .getAllByRole("tab")
        .every(
          (item) =>
            (item as HTMLButtonElement).disabled ||
            item.getAttribute("aria-disabled") === "true",
        ),
    ).toBe(true);
    fireEvent.keyDown(card, { key: "ArrowRight" });
    fireEvent.click(bank);
    expect(card.getAttribute("aria-selected")).toBe("true");
    expect(screen.getByTestId("stripe-card-panel")).toBeTruthy();
  });
});

describe("CheckoutPageClient step focus", () => {
  // Each step replaces the last, so without this a keyboard or screen-reader
  // user is left on a control that no longer exists.
  it("moves focus to the new step's heading on Next and Back, not on load", () => {
    renderCheckout();
    const gift = screen.getByRole("heading", { name: "Your Gift." });
    expect(document.activeElement).not.toBe(gift);

    fireEvent.click(screen.getByRole("button", { name: /next step/i }));
    expect(document.activeElement).toBe(
      screen.getByRole("heading", { name: "Your Details." }),
    );

    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(document.activeElement).toBe(
      screen.getByRole("heading", { name: "Your Gift." }),
    );

    advanceToPayment();
    expect(document.activeElement).toBe(
      screen.getByRole("heading", { name: "Secure Payment." }),
    );
  });
});

describe("CheckoutPageClient payment preparation handoff", () => {
  const completeDetails = () => {
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
    return screen.getByRole("form", { name: "Your details" });
  };

  it("keeps details editable until submission, then announces and locks the real configuration handoff", async () => {
    let resolveConfig!: (response: Response) => void;
    fetchMock().mockReturnValue(
      new Promise<Response>((resolve) => {
        resolveConfig = resolve;
      }),
    );
    renderCheckoutWithRuntimeConfig();
    const form = completeDetails();
    const submitButton = screen.getByRole("button", {
      name: /continue to payment/i,
    });
    expect(submitButton).toHaveProperty("disabled", false);
    expect(screen.getByLabelText(/first name/i)).toHaveProperty(
      "disabled",
      false,
    );

    fireEvent.submit(form);

    expect(form.getAttribute("aria-busy")).toBe("true");
    expect(
      screen.getByRole("button", { name: /preparing secure checkout/i }),
    ).toHaveProperty("disabled", true);
    expect(screen.getByRole("button", { name: "Back" })).toHaveProperty(
      "disabled",
      true,
    );
    for (const name of [/first name/i, /last name/i, /email address/i]) {
      expect(screen.getByLabelText(name)).toHaveProperty("disabled", true);
    }
    const status = screen.getByRole("status");
    expect(form.contains(status)).toBe(false);
    expect(status.textContent).toMatch(/no payment has been submitted/i);
    expect(
      screen.queryByRole("heading", { name: "Secure Payment." }),
    ).toBeNull();
    expect(fetchCallsByMethod("GET")).toHaveLength(1);
    expect(fetchCallsByMethod("POST")).toHaveLength(0);
    expect(stripeState.stripe.confirmCardPayment).not.toHaveBeenCalled();

    await act(async () => {
      resolveConfig(await checkoutConfigResponse("pk_live_tenant"));
    });

    expect(screen.getByTestId("stripe-card-panel")).toBeTruthy();
    expect(document.activeElement).toBe(
      screen.getByRole("heading", { name: "Secure Payment." }),
    );
    expect(screen.queryByRole("form", { name: "Your details" })).toBeNull();
    expect(fetchCallsByMethod("POST")).toHaveLength(0);
  });

  it("starts only one refreshed handoff when submit repeats before React renders pending state", async () => {
    let resolveConfig!: (response: Response) => void;
    const configuration = new Promise<Response>((resolve) => {
      resolveConfig = resolve;
    });
    fetchMock()
      .mockImplementationOnce(() => checkoutConfigResponse("pk_live_tenant"))
      .mockReturnValue(configuration);
    renderCheckoutWithRuntimeConfig();
    await waitFor(() =>
      expect(stripeJsState.loadStripe).toHaveBeenCalledWith("pk_live_tenant"),
    );
    const form = completeDetails();
    const back = screen.getByRole("button", { name: "Back" });

    act(() => {
      form.dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true }),
      );
      form.dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true }),
      );
      back.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(fetchCallsByMethod("GET")).toHaveLength(2);
    expect(fetchMock().mock.calls[1]?.[1]?.signal?.aborted).toBe(false);
    expect(form.getAttribute("aria-busy")).toBe("true");
    fireEvent.submit(form);
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(fetchCallsByMethod("GET")).toHaveLength(2);
    expect(screen.getByRole("heading", { name: "Your Details." })).toBeTruthy();

    await act(async () => {
      resolveConfig(await checkoutConfigResponse("pk_live_tenant"));
    });

    expect(screen.getByTestId("stripe-card-panel")).toBeTruthy();
    expect(fetchCallsByMethod("POST")).toHaveLength(0);
    expect(stripeState.stripe.confirmCardPayment).not.toHaveBeenCalled();
  });

  it("releases a failed handoff and lets the donor return with details intact and retry", async () => {
    let rejectConfig!: (error: Error) => void;
    fetchMock()
      .mockReturnValueOnce(
        new Promise<Response>((_resolve, reject) => {
          rejectConfig = reject;
        }),
      )
      .mockImplementation(() => checkoutConfigResponse("pk_live_tenant"));
    renderCheckoutWithRuntimeConfig();
    fireEvent.submit(completeDetails());

    await act(async () => {
      rejectConfig(new Error("Configuration unavailable"));
    });

    expect(screen.getByRole("alert").textContent).toMatch(
      /checkout configuration could not be loaded/i,
    );
    const back = screen.getByRole("button", { name: "Back" });
    expect(back).toHaveProperty("disabled", false);
    fireEvent.click(back);
    expect(screen.getByLabelText(/email address/i)).toHaveProperty(
      "value",
      "ada@example.com",
    );
    const submitButton = screen.getByRole("button", {
      name: /continue to payment/i,
    });
    expect(submitButton).toHaveProperty("disabled", false);
    fireEvent.click(submitButton);

    expect(await screen.findByTestId("stripe-card-panel")).toBeTruthy();
    expect(fetchCallsByMethod("GET")).toHaveLength(2);
    expect(fetchCallsByMethod("POST")).toHaveLength(0);
    expect(stripeState.stripe.confirmCardPayment).not.toHaveBeenCalled();
  });
});

describe("CheckoutPageClient donor details", () => {
  const goToDetails = () => {
    renderCheckout();
    fireEvent.click(screen.getByRole("button", { name: /next step/i }));
  };
  const continueToPayment = () =>
    fireEvent.click(
      screen.getByRole("button", { name: /continue to payment/i }),
    );

  it("announces invalid details and clears the summary when the fields are corrected", () => {
    goToDetails();
    expect(screen.queryByRole("alert")).toBeNull();
    continueToPayment();
    expect(
      screen.getByRole("alert", { name: "Check your details" }).textContent,
    ).toBe("Check the highlighted fields before continuing.");
    for (const [name, value] of [
      ["First Name", "Ada"],
      ["Last Name", "Lovelace"],
      ["Email Address", "ada@example.com"],
    ])
      fireEvent.change(screen.getByRole("textbox", { name }), {
        target: { value },
      });
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("says what's missing instead of disabling Continue", () => {
    goToDetails();
    const button = screen.getByRole("button", {
      name: /continue to payment/i,
    });
    expect(button.hasAttribute("disabled")).toBe(false);

    continueToPayment();

    const firstName = screen.getByRole("textbox", { name: "First Name" });
    expect(firstName.getAttribute("aria-invalid")).toBe("true");
    expect(screen.getByText("Enter your first name.")).toBeTruthy();
    expect(screen.getByText("Enter your last name.")).toBeTruthy();
    expect(screen.getByText("Enter your email address.")).toBeTruthy();
    // Each field is tied to its label and its error explicitly.
    for (const [name, error] of [
      ["First Name", "Enter your first name."],
      ["Last Name", "Enter your last name."],
      ["Email Address", "Enter your email address."],
    ] as const) {
      const field = screen.getByRole("textbox", { name });
      expect(field.id, name).toMatch(/^checkout-/);
      expect(document.querySelector(`label[for="${field.id}"]`)).not.toBeNull();
      const describedBy = field.getAttribute("aria-describedby") ?? "";
      expect(document.getElementById(describedBy)?.textContent, name).toBe(
        error,
      );
    }
    expect(document.activeElement).toBe(firstName);
    expect(screen.queryByRole("heading", { name: "Secure Payment." })).toBe(
      null,
    );
  });

  it("doesn't accept spaces or a malformed email as details", () => {
    goToDetails();
    fireEvent.change(screen.getByLabelText(/first name/i), {
      target: { value: "   " },
    });
    fireEvent.change(screen.getByLabelText(/last name/i), {
      target: { value: "Lovelace" },
    });
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: "ada@example" },
    });
    continueToPayment();

    expect(screen.getByText("Enter your first name.")).toBeTruthy();
    expect(
      screen.getByText("Enter an email address like name@example.com."),
    ).toBeTruthy();
    expect(document.activeElement).toBe(
      screen.getByRole("textbox", { name: "First Name" }),
    );
  });

  it("sends trimmed details to the payment step", async () => {
    fetchMock().mockImplementation(initializedDonationResponse);
    stripeState.stripe.confirmCardPayment.mockResolvedValue({
      paymentIntent: { status: "succeeded" },
    });
    goToDetails();
    fireEvent.change(screen.getByLabelText(/first name/i), {
      target: { value: "  Ada " },
    });
    fireEvent.change(screen.getByLabelText(/last name/i), {
      target: { value: " Lovelace  " },
    });
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: "  ada@example.com " },
    });
    continueToPayment();
    fillPostalCode("94103");
    confirmPayment();

    await waitFor(() =>
      expect(stripeState.stripe.confirmCardPayment).toHaveBeenCalledTimes(1),
    );
    expect(stripeState.stripe.confirmCardPayment).toHaveBeenCalledWith(
      "cs_test_123",
      expect.objectContaining({
        payment_method: expect.objectContaining({
          billing_details: expect.objectContaining({
            email: "ada@example.com",
            name: "Ada Lovelace",
          }),
        }),
      }),
    );
  });
});
