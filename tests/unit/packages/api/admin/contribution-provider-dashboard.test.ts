import { serverEnv } from "@asym/env";
import { describe, expect, it } from "vitest";

import {
  isStripeTestModeKey,
  resolveViewerProviderDashboardTestMode,
  stripeDashboardUrls,
} from "../../../../../packages/api/src/admin/contribution-operations/provider-dashboard";

import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

const TENANT_ID = "tenant-1";
const PROVIDER_CAPABILITY = "contributions.use_provider_actions";

function createTenantReadStub(options: {
  stripeSecretKey?: string | null;
  tenantRow?: Record<string, unknown> | null;
  error?: { message: string } | null;
}): { client: AdminSupabaseClient; tenantReads: number } {
  const state = { tenantReads: 0 };
  const row =
    options.tenantRow !== undefined
      ? options.tenantRow
      : { id: TENANT_ID, stripe_secret_key: options.stripeSecretKey ?? null };

  const client = {
    from(table: string) {
      if (table !== "tenants") {
        throw new Error(`unexpected table ${table}`);
      }
      state.tenantReads += 1;
      return {
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({
              data: options.error ? null : row,
              error: options.error ?? null,
            }),
          }),
        }),
      };
    },
  } as unknown as AdminSupabaseClient;

  return {
    client,
    get tenantReads() {
      return state.tenantReads;
    },
  };
}

/**
 * With SKIP_ENV_VALIDATION the env export is a plain runtime object, so
 * overriding the platform fallback key directly keeps these tests hermetic
 * even when the host shell exports STRIPE_SECRET_KEY.
 */
async function withPlatformStripeKey<T>(
  key: string | undefined,
  run: () => Promise<T>,
): Promise<T> {
  const envRecord = serverEnv as unknown as Record<string, unknown>;
  const previousKey = envRecord.STRIPE_SECRET_KEY;
  envRecord.STRIPE_SECRET_KEY = key;
  try {
    return await run();
  } finally {
    envRecord.STRIPE_SECRET_KEY = previousKey;
  }
}

describe("admin/contribution-operations/provider-dashboard", () => {
  describe("isStripeTestModeKey", () => {
    it("recognizes test-mode secret and restricted keys", () => {
      expect(isStripeTestModeKey("sk_test_abc")).toBe(true);
      expect(isStripeTestModeKey("rk_test_abc")).toBe(true);
    });

    it("treats live keys and missing keys as live mode", () => {
      expect(isStripeTestModeKey("sk_live_abc")).toBe(false);
      expect(isStripeTestModeKey("rk_live_abc")).toBe(false);
      expect(isStripeTestModeKey("")).toBe(false);
      expect(isStripeTestModeKey(null)).toBe(false);
      expect(isStripeTestModeKey(undefined)).toBe(false);
    });
  });

  describe("stripeDashboardUrls", () => {
    it("builds live-mode dashboard urls by default targets", () => {
      expect(
        stripeDashboardUrls({
          paymentIntentId: "pi_1",
          chargeId: "ch_1",
          testMode: false,
        }),
      ).toEqual({
        paymentIntent: "https://dashboard.stripe.com/payments/pi_1",
        charge: "https://dashboard.stripe.com/charges/ch_1",
      });
    });

    it("inserts /test after the host for test-mode tenants", () => {
      expect(
        stripeDashboardUrls({
          paymentIntentId: "pi_1",
          chargeId: "ch_1",
          testMode: true,
        }),
      ).toEqual({
        paymentIntent: "https://dashboard.stripe.com/test/payments/pi_1",
        charge: "https://dashboard.stripe.com/test/charges/ch_1",
      });
    });

    it("returns null links for missing provider ids", () => {
      expect(
        stripeDashboardUrls({
          paymentIntentId: null,
          chargeId: null,
          testMode: true,
        }),
      ).toEqual({ paymentIntent: null, charge: null });
    });
  });

  describe("resolveViewerProviderDashboardTestMode", () => {
    it("never resolves the tenant key for viewers without the provider capability", async () => {
      const stub = createTenantReadStub({ stripeSecretKey: "sk_test_tenant" });

      const testMode = await resolveViewerProviderDashboardTestMode({
        supabaseAdmin: stub.client,
        tenantId: TENANT_ID,
        viewerCapabilities: [
          "contributions.view_detail",
          "contributions.request_corrections",
        ],
      });

      expect(testMode).toBe(false);
      expect(stub.tenantReads).toBe(0);
    });

    it("resolves test mode from a tenant sk_test_ key for provider-capable viewers", async () => {
      const stub = createTenantReadStub({ stripeSecretKey: "sk_test_tenant" });

      await expect(
        resolveViewerProviderDashboardTestMode({
          supabaseAdmin: stub.client,
          tenantId: TENANT_ID,
          viewerCapabilities: [PROVIDER_CAPABILITY],
        }),
      ).resolves.toBe(true);
      expect(stub.tenantReads).toBe(1);
    });

    it("resolves live mode from a tenant live key", async () => {
      const stub = createTenantReadStub({ stripeSecretKey: "sk_live_tenant" });

      await expect(
        resolveViewerProviderDashboardTestMode({
          supabaseAdmin: stub.client,
          tenantId: TENANT_ID,
          viewerCapabilities: [PROVIDER_CAPABILITY],
        }),
      ).resolves.toBe(false);
    });

    it("falls back to the platform key when the tenant has none, mirroring the refund adapter", async () => {
      const stub = createTenantReadStub({ stripeSecretKey: null });

      await withPlatformStripeKey("sk_test_platform", async () => {
        await expect(
          resolveViewerProviderDashboardTestMode({
            supabaseAdmin: stub.client,
            tenantId: TENANT_ID,
            viewerCapabilities: [PROVIDER_CAPABILITY],
          }),
        ).resolves.toBe(true);
      });
    });

    it("resolves live mode when neither the tenant nor the platform has a key", async () => {
      const stub = createTenantReadStub({ tenantRow: null });

      await withPlatformStripeKey(undefined, async () => {
        await expect(
          resolveViewerProviderDashboardTestMode({
            supabaseAdmin: stub.client,
            tenantId: TENANT_ID,
            viewerCapabilities: [PROVIDER_CAPABILITY],
          }),
        ).resolves.toBe(false);
      });
    });

    it("drives test-mode proof links through the detail projection like the GET route", async () => {
      const stub = createTenantReadStub({ stripeSecretKey: "sk_test_tenant" });
      const viewerCapabilities = [PROVIDER_CAPABILITY];

      // Mirrors route.ts GET: resolve the boolean server-side, then hand only
      // the boolean to the viewer projection.
      const providerDashboardTestMode =
        await resolveViewerProviderDashboardTestMode({
          supabaseAdmin: stub.client,
          tenantId: TENANT_ID,
          viewerCapabilities,
        });

      expect(
        stripeDashboardUrls({
          paymentIntentId: "pi_route",
          chargeId: "ch_route",
          testMode: providerDashboardTestMode,
        }),
      ).toEqual({
        paymentIntent: "https://dashboard.stripe.com/test/payments/pi_route",
        charge: "https://dashboard.stripe.com/test/charges/ch_route",
      });
    });

    it("surfaces tenant read failures instead of guessing a mode", async () => {
      const stub = createTenantReadStub({
        error: { message: "tenants unavailable" },
      });

      await expect(
        resolveViewerProviderDashboardTestMode({
          supabaseAdmin: stub.client,
          tenantId: TENANT_ID,
          viewerCapabilities: [PROVIDER_CAPABILITY],
        }),
      ).rejects.toThrow("tenants unavailable");
    });
  });
});
