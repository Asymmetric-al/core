/** #2364 [A] criterion 5. GET boundary mocks follow donate-post-charge.test.ts. */
import {
  getAuthContext,
  requireAuth,
  type AuthContext,
} from "@asym/auth/context";
import { getAdminClient } from "@asym/database/supabase/admin";
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { GET } from "../../../../packages/api/src/donate";
import { FORBIDDEN_PUBLIC_COLUMNS } from "../../../../packages/api/src/public-giving/columns";
import { resolveTenantStripe } from "../../../../packages/api/src/stripe/tenant-client";

vi.mock("@asym/database/supabase/admin", () => ({ getAdminClient: vi.fn() }));
vi.mock("@asym/auth/context", () => ({
  getAuthContext: vi.fn(),
  requireAuth: vi.fn(),
}));
vi.mock("../../../../packages/api/src/stripe/tenant-client", () => ({
  resolveTenantStripe: vi.fn(),
}));

const auth: AuthContext = {
  userId: "user-A",
  tenantId: "tenant-A",
  profileId: "profile-A",
  role: "donor",
  email: "acceptance@example.test",
  isAuthenticated: true,
  profileRole: "donor",
  memberships: [],
};
const from = vi.fn((table: string) => {
  // Resolve the old GET too: a shape failure must expose the old contract,
  // rather than a missing fluent mock method or an artificial 500.
  const row =
    table === "donors"
      ? { id: "donor-A" }
      : { id: "row-A", profile: { last_name: "private" } };
  const query = Object.assign(Promise.resolve({ data: [row], error: null }), {
    select: () => query,
    eq: () => query,
    single: async () => ({ data: row, error: null }),
  });
  return query;
});
const client = { from };
const configured = {
  ok: true as const,
  stripe: {} as never,
  secretKey: "sk_test_mock",
  publishableKey: "pk_test_acceptance",
};
const request = (query = "") =>
  new NextRequest(`http://localhost/api/donate${query}`);
function keysDeep(value: unknown): string[] {
  if (!value || typeof value !== "object") return [];
  return Object.entries(value).flatMap(([key, child]) => [
    key,
    ...keysDeep(child),
  ]);
}
beforeEach(() => {
  vi.mocked(getAdminClient).mockReturnValue({
    client: client as never,
    error: null,
  });
  vi.mocked(getAuthContext).mockResolvedValue(auth);
  vi.mocked(requireAuth).mockImplementation((ctx) => {
    if (!ctx.isAuthenticated) throw new Error("Unauthorized");
  });
  vi.mocked(resolveTenantStripe).mockResolvedValue(configured);
});

describe("#2364 donate config [A]", () => {
  it.each([
    "",
    "?missionary_id=20000000-0000-0000-0000-000000000001&fund_id=40000000-0000-0000-0000-000000000001",
  ])(
    "#2364 criterion 5: GET%s returns exactly publishableKey without designation/donor queries or nested forbidden keys",
    async (query) => {
      const req = request(query);
      const response = await GET(req);
      expect(response.status).toBe(200);
      const body = await response.json();
      expect.soft(Object.keys(body)).toEqual(["publishableKey"]);
      expect.soft(body).toEqual({ publishableKey: "pk_test_acceptance" });
      expect
        .soft(
          keysDeep(body).filter((k) =>
            [
              "designations",
              "donor",
              "missionaries",
              ...FORBIDDEN_PUBLIC_COLUMNS,
            ].includes(k),
          ),
        )
        .toEqual([]);
      expect
        .soft(
          from.mock.calls
            .map(([table]) => table)
            .filter((t) => ["missionaries", "funds", "donors"].includes(t)),
        )
        .toEqual([]);
      expect(getAuthContext).toHaveBeenCalledExactlyOnceWith(req);
      expect(requireAuth).toHaveBeenCalledExactlyOnceWith(auth);
      expect(resolveTenantStripe).toHaveBeenCalledExactlyOnceWith({
        supabaseAdmin: client,
        tenantId: "tenant-A",
      });
    },
  );
  it("#2364 criterion 5: missing admin client keeps the 503 body and stops before auth", async () => {
    vi.mocked(getAdminClient).mockReturnValue({
      client: null,
      error: "Supabase admin unavailable",
    });
    const response = await GET(request());
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      error: "Supabase admin unavailable",
    });
    expect(getAuthContext).not.toHaveBeenCalled();
    expect(resolveTenantStripe).not.toHaveBeenCalled();
  });
  it("#2364 criterion 5: unauthenticated GET keeps 401 and never resolves tenant Stripe", async () => {
    vi.mocked(getAuthContext).mockResolvedValue({
      ...auth,
      isAuthenticated: false,
    });
    const response = await GET(request());
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "Unauthorized" });
    expect(requireAuth).toHaveBeenCalled();
    expect(resolveTenantStripe).not.toHaveBeenCalled();
    expect(from).not.toHaveBeenCalled();
  });
  it.each(["tenant_not_found", "lookup_failed"] as const)(
    "#2364 criterion 5: %s keeps the 404 tenant response",
    async (reason) => {
      vi.mocked(resolveTenantStripe).mockResolvedValue(
        reason === "lookup_failed"
          ? { ok: false, reason, message: "lookup failed" }
          : { ok: false, reason },
      );
      const response = await GET(request());
      expect(response.status).toBe(404);
      expect(await response.json()).toEqual({ error: "Tenant not found" });
      expect(from).not.toHaveBeenCalled();
    },
  );
  it.each(["stripe_unconfigured", "missing_publishable_key"])(
    "#2364 criterion 5: %s keeps the Stripe-config 500 response",
    async (reason) => {
      vi.mocked(resolveTenantStripe).mockResolvedValue(
        reason === "stripe_unconfigured"
          ? { ok: false, reason: "stripe_unconfigured" }
          : { ...configured, publishableKey: null },
      );
      const response = await GET(request());
      expect(response.status).toBe(500);
      expect(await response.json()).toEqual({
        error: "Checkout configuration is incomplete for this organization",
      });
      expect(from).not.toHaveBeenCalled();
    },
  );
});
