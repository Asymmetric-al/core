import { describe, expect, it, vi } from "vitest";

import { resolveTenantStripe } from "../../src/stripe/tenant-client";

/**
 * Interface tests for the per-tenant Stripe resolution module (money path).
 * One deep module owns tenant lookup, key normalization, and the canonical
 * env fallback that seven handlers previously each re-implemented.
 */

type TenantRow = {
  stripe_secret_key?: string | null;
  stripe_publishable_key?: string | null;
} | null;

function fakeSupabaseAdmin(result: {
  data?: TenantRow;
  error?: { message: string } | null;
}) {
  const maybeSingle = vi.fn().mockResolvedValue({
    data: result.data ?? null,
    error: result.error ?? null,
  });
  const eq = vi.fn().mockReturnValue({ maybeSingle });
  const select = vi.fn().mockReturnValue({ eq });
  const from = vi.fn().mockReturnValue({ select });
  return { client: { from } as never, from, select, eq, maybeSingle };
}

const params = (fake: ReturnType<typeof fakeSupabaseAdmin>, envKeys = {}) => ({
  supabaseAdmin: fake.client,
  tenantId: "tenant-1",
  envKeys,
});

describe("resolveTenantStripe", () => {
  it("uses the tenant's own keys and returns a ready Stripe client", async () => {
    const fake = fakeSupabaseAdmin({
      data: {
        stripe_secret_key: "sk_test_tenant",
        stripe_publishable_key: "pk_test_tenant",
      },
    });

    const result = await resolveTenantStripe(params(fake));

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.secretKey).toBe("sk_test_tenant");
      expect(result.publishableKey).toBe("pk_test_tenant");
      expect(result.stripe).toBeDefined();
    }
    expect(fake.from).toHaveBeenCalledWith("tenants");
    expect(fake.eq).toHaveBeenCalledWith("id", "tenant-1");
  });

  it("falls back to the environment keys when the tenant has none", async () => {
    const fake = fakeSupabaseAdmin({ data: {} });

    const result = await resolveTenantStripe(
      params(fake, { secretKey: "sk_test_env", publishableKey: "pk_test_env" }),
    );

    expect(result).toMatchObject({
      ok: true,
      secretKey: "sk_test_env",
      publishableKey: "pk_test_env",
    });
  });

  it("treats empty or whitespace tenant keys as unset", async () => {
    const fake = fakeSupabaseAdmin({
      data: { stripe_secret_key: "   ", stripe_publishable_key: "" },
    });

    const result = await resolveTenantStripe(
      params(fake, { secretKey: "sk_test_env" }),
    );

    expect(result).toMatchObject({ ok: true, secretKey: "sk_test_env" });
    if (result.ok) {
      expect(result.publishableKey).toBeNull();
    }
  });

  it("reports stripe_unconfigured when neither tenant nor env has a secret key", async () => {
    const fake = fakeSupabaseAdmin({ data: {} });

    const result = await resolveTenantStripe(params(fake));

    expect(result).toEqual({ ok: false, reason: "stripe_unconfigured" });
  });

  it("reports tenant_not_found for a missing tenant row without borrowing the env key", async () => {
    const fake = fakeSupabaseAdmin({ data: null });

    const result = await resolveTenantStripe(
      params(fake, { secretKey: "sk_test_env" }),
    );

    expect(result).toEqual({ ok: false, reason: "tenant_not_found" });
  });

  it("reports lookup_failed with the database message on query errors", async () => {
    const fake = fakeSupabaseAdmin({ error: { message: "connection reset" } });

    const result = await resolveTenantStripe(params(fake));

    expect(result).toEqual({
      ok: false,
      reason: "lookup_failed",
      message: "connection reset",
    });
  });

  it("trims tenant keys before use", async () => {
    const fake = fakeSupabaseAdmin({
      data: { stripe_secret_key: "  sk_test_padded  " },
    });

    const result = await resolveTenantStripe(params(fake));

    expect(result).toMatchObject({ ok: true, secretKey: "sk_test_padded" });
  });
});
