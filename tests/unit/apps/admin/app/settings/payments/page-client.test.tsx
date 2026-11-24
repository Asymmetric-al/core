/** @vitest-environment jsdom */

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  fetchWithSupabaseAuth: vi.fn(),
  loadDocument: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock("../../../../../../../apps/admin/lib/authenticated-fetch", () => ({
  fetchWithSupabaseAuth: mocks.fetchWithSupabaseAuth,
}));

vi.mock("@asym/database/document-reload", () => ({
  loadDocument: mocks.loadDocument,
}));

vi.mock("sonner", () => ({
  toast: {
    error: mocks.toastError,
    success: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}));

import PaymentAccountsPage from "../../../../../../../apps/admin/app/(app)/settings/payments/page-client";

const entityA = {
  id: "00000000-0000-0000-0000-000000000010",
  name: "GiveHope Organization",
  legal_name: "GiveHope Organization",
  country_code: "US",
  currency: "usd",
  tax_id: null,
  currentBinding: null,
  bindings: [],
};

beforeEach(() => {
  vi.clearAllMocks();
  window.history.replaceState({}, "", "/settings/payments");
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: (query: string) => ({
      matches: query.includes("prefers-reduced-motion"),
      media: query,
      onchange: null,
      addListener() {},
      removeListener() {},
      addEventListener() {},
      removeEventListener() {},
      dispatchEvent: () => false,
    }),
  });
});

afterEach(() => {
  cleanup();
});

describe("Mission Control payment accounts screen", () => {
  it("loads legal entities, validates reason, starts onboarding, and redirects via loadDocument", async () => {
    mocks.fetchWithSupabaseAuth
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            livemode: false,
            configured: true,
            legalEntities: [entityA],
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            binding: {
              binding_id: "00000000-0000-0000-0000-000000000099",
              version: 1,
              status: "pending",
            },
            onboardingUrl: "https://connect.stripe.com/setup/test-link",
            expiresAt: 1893456000,
          }),
          { status: 201, headers: { "content-type": "application/json" } },
        ),
      );

    render(<PaymentAccountsPage />);

    await screen.findByText("GiveHope Organization");
    expect(screen.getByText("Not connected")).toBeTruthy();
    expect(screen.getByText("Test mode")).toBeTruthy();

    fireEvent.click(
      screen.getByRole("button", { name: /start stripe onboarding/i }),
    );
    expect(mocks.toastError).toHaveBeenCalledWith(
      "Reason required",
      expect.anything(),
    );
    expect(mocks.fetchWithSupabaseAuth).toHaveBeenCalledTimes(1);

    const input = screen.getByLabelText("Audit reason");
    fireEvent.change(input, {
      target: { value: "Initial US Stripe Connect setup" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: /start stripe onboarding/i }),
    );

    await waitFor(() => {
      expect(mocks.loadDocument).toHaveBeenCalledWith(
        "https://connect.stripe.com/setup/test-link",
      );
    });
    expect(mocks.fetchWithSupabaseAuth).toHaveBeenLastCalledWith(
      "/api/admin/payment-accounts",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          legal_entity_id: entityA.id,
          reason: "Initial US Stripe Connect setup",
        }),
      }),
    );
  });

  it("displays onboarding return notice and active binding summary without an onboarding button", async () => {
    window.history.replaceState({}, "", "/settings/payments?onboarding=return");
    mocks.fetchWithSupabaseAuth.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          livemode: false,
          configured: true,
          legalEntities: [
            {
              ...entityA,
              currentBinding: {
                id: "00000000-0000-0000-0000-000000000099",
                version: 1,
                status: "active",
                provider_account_ref: "acct_live123",
                livemode: false,
                activated_at: "2026-11-23T01:00:00Z",
                restricted_at: null,
                disconnected_at: null,
                created_at: "2026-11-23T00:00:00Z",
                updated_at: "2026-11-23T01:00:00Z",
              },
            },
          ],
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    );

    render(<PaymentAccountsPage />);

    await screen.findByText("Returned from Stripe onboarding");
    expect(screen.getByText("Active (v1)")).toBeTruthy();
    expect(screen.getByText("acct_live123")).toBeTruthy();
    expect(screen.queryByRole("button", { name: /onboarding/i })).toBeNull();
  });

  it("shows unconfigured warning when STRIPE_SECRET_KEY is not set", async () => {
    mocks.fetchWithSupabaseAuth.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          livemode: false,
          configured: false,
          legalEntities: [entityA],
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    );

    render(<PaymentAccountsPage />);

    await screen.findByText("Stripe Connect not configured");
    expect(
      screen.queryByRole("button", { name: /start stripe onboarding/i }),
    ).toBeNull();
  });
});
