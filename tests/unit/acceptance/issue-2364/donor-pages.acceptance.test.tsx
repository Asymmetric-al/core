// @vitest-environment jsdom
/** #2364 [A] criteria 6/7. Real checkout and mock-data worker surfaces. */
import { readFileSync } from "node:fs";

import { loadStripe } from "@stripe/stripe-js";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, expect, it, vi } from "vitest";

// Defer app entrypoints until the Next/Stripe boundaries are mocked, as in
// tests/unit/apps/donor/checkout-client.test.tsx.
const [
  { WorkersPageClient },
  { CheckoutPageClient },
  { default: WorkerProfilePage },
  { getFieldWorkers },
] = await Promise.all([
  import("../../../../apps/donor/app/(public)/(hero)/workers/workers-client"),
  import("../../../../apps/donor/app/(public)/(solid)/checkout/checkout-client"),
  import("../../../../apps/donor/app/(public)/(solid)/workers/[id]/page"),
  import("../../../../apps/donor/lib/mock-data"),
]);

const stripe = vi.hoisted(() => ({
  confirmCardPayment: vi.fn(),
  getElement: vi.fn(() => ({})),
}));
vi.mock("@stripe/stripe-js", () => ({ loadStripe: vi.fn(async () => ({})) }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  notFound: () => {
    throw new Error("not found");
  },
}));
vi.mock("@stripe/react-stripe-js", () => ({
  CardElement: () => <div data-testid="card" />,
  Elements: ({ children }: React.PropsWithChildren) => <>{children}</>,
  useStripe: () => stripe,
  useElements: () => ({ getElement: stripe.getElement }),
}));
vi.mock("next/server", () => ({
  connection: vi.fn(async () => undefined),
}));

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
const checkout = "apps/donor/app/(public)/(solid)/checkout/checkout-client.tsx";
const pages = [
  "apps/donor/app/(public)/(hero)/workers/workers-client.tsx",
  "apps/donor/app/(public)/(solid)/workers/[id]/page.tsx",
];
it("#2364 criterion 6: config containing only publishableKey reaches payment and POSTs /api/donate", async () => {
  vi.stubGlobal("scrollTo", vi.fn());
  stripe.confirmCardPayment.mockResolvedValue({
    paymentIntent: { status: "succeeded" },
  });
  const fetch = vi.fn(
    async (_url: unknown, init?: RequestInit) =>
      new Response(
        JSON.stringify(
          init?.method === "POST"
            ? {
                clientSecret: "cs_acceptance",
                donationId: "don_acceptance",
                paymentIntentId: "pi_acceptance",
                publishableKey: "pk_test_acceptance",
              }
            : { publishableKey: "pk_test_acceptance" },
        ),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
  );
  vi.stubGlobal("fetch", fetch);
  render(
    <CheckoutPageClient
      searchParams={{
        amount: "100",
        missionary_id: "20000000-0000-0000-0000-000000000001",
        workerId: getFieldWorkers()[0]!.id,
      }}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: /next step/i }));
  for (const [label, value] of [
    [/first name/i, "Ada"],
    [/last name/i, "Lovelace"],
    [/email address/i, "ada@example.test"],
  ] as const)
    fireEvent.change(await screen.findByLabelText(label), {
      target: { value },
    });
  fireEvent.click(screen.getByRole("button", { name: /continue to payment/i }));
  await screen.findByTestId("stripe-card-panel");
  expect(loadStripe).toHaveBeenCalledWith("pk_test_acceptance");
  fireEvent.click(screen.getByRole("button", { name: /confirm/i }));
  await waitFor(() =>
    expect(
      fetch.mock.calls.filter(([, init]) => init?.method === "POST"),
    ).toHaveLength(1),
  );
  const post = fetch.mock.calls.find(([, init]) => init?.method === "POST");
  expect(post?.[0]).toBe("/api/donate");
  expect(JSON.parse(String(post?.[1]?.body))).toMatchObject({
    amount: 100,
    missionary_id: "20000000-0000-0000-0000-000000000001",
  });
  await waitFor(() => expect(stripe.confirmCardPayment).toHaveBeenCalled());
});
it("#2364 criterion 6: readRuntimePublishableKey accesses only the config's publishableKey field [S]", () => {
  const source = readFileSync(checkout, "utf8");
  const fn =
    source.match(/const readRuntimePublishableKey = [\s\S]*?\n\};/)?.[0] ?? "";
  expect(fn).toContain(".publishableKey");
  expect(fn.match(/\)\.([a-zA-Z_]+)/g)).toEqual([").publishableKey"]);
  expect(fn).not.toMatch(/designations|donor|missionaries|funds/);
});
it("#2364 criterion 7: both worker surfaces import mock-data and no Supabase client [S]", () => {
  for (const path of pages) {
    const source = readFileSync(path, "utf8");
    expect(source).toMatch(/from ["']@\/lib\/mock-data["']/);
    expect(source).not.toMatch(
      /(?:from\s*|import\s*\()["'][^"']*(?:supabase|@asym\/database)/i,
    );
  }
});
it("#2364 criterion 7: /workers renders mock workers without network access", () => {
  const fetch = vi.fn(() => {
    throw new Error("unexpected page fetch");
  });
  vi.stubGlobal("fetch", fetch);
  render(<WorkersPageClient />);
  expect(
    screen.getByRole("link", {
      name: `View ${getFieldWorkers()[0]!.title}'s profile`,
    }),
  ).toBeTruthy();
  expect(fetch).not.toHaveBeenCalled();
});
it("#2364 criterion 7: /workers/[id] renders its mock worker title and route shell without a database", async () => {
  const fetch = vi.fn(() => {
    throw new Error("unexpected page fetch");
  });
  vi.stubGlobal("fetch", fetch);
  const worker = getFieldWorkers()[0]!;
  // Await the route's params boundary, then render the synchronous shell.
  // Suspense keeps its request-fresh async giving leaf at its fallback; this
  // is a shell regression check, not a claim of RSC streaming/navigation QA.
  const html = renderToStaticMarkup(
    await WorkerProfilePage({ params: Promise.resolve({ id: worker.id }) }),
  );
  expect(html).toContain('data-testid="worker-profile-route-shell"');
  const root = document.createElement("div");
  root.innerHTML = html;
  expect(root.querySelector("h1")?.textContent).toBe(worker.title);
  expect(fetch).not.toHaveBeenCalled();
});
