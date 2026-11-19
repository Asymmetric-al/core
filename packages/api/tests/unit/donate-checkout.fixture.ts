import { NextRequest } from "next/server";
import { expect, vi } from "vitest";

import type { AuthContext } from "@asym/auth/context";

vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: vi.fn(),
}));

vi.mock("@asym/lib/audit/logger", () => ({
  createAuditLogger: vi.fn(() => ({
    log: vi.fn(),
    logDonation: vi.fn(),
    logPost: vi.fn(),
    logRoleChange: vi.fn(),
  })),
}));

vi.mock("@asym/auth/context", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@asym/auth/context")>()),
  getAuthContext: vi.fn(),
  requireAuth: vi.fn(),
  requireRole: vi.fn(
    (
      context: {
        isAuthenticated?: boolean;
        userId?: string | null;
        tenantId?: string | null;
        role?: string | null;
        profileId?: string | null;
      },
      roles: string[],
    ) => {
      if (
        !context?.isAuthenticated ||
        !context.userId ||
        !context.tenantId ||
        !context.role ||
        !context.profileId
      ) {
        throw new Error("Unauthorized");
      }
      if (!roles.includes(context.role)) {
        throw new Error(`Forbidden: requires one of ${roles.join(", ")} role`);
      }
    },
  ),
}));

vi.mock("../../src/stripe/tenant-client", () => ({
  resolveTenantStripe: vi.fn(),
}));

vi.mock("../../src/donate/saga", () => ({
  processDonationSagaOutboxEvent: vi.fn(),
}));

vi.mock("../../src/money/settlement", () => ({
  resolveTenantSettlementCurrency: vi.fn(),
}));

export const authenticatedDonor: AuthContext = {
  userId: "user-1",
  email: "donor@example.com",
  tenantId: "tenant-1",
  role: "donor",
  profileId: "profile-1",
  isAuthenticated: true,
  // AL-2675: the donor class is read from the membership the request acts under.
  memberships: [
    { tenantId: "tenant-1", role: "donor", staffRole: null, isActive: true },
  ],
};

export const beginRpcResult = {
  outbox_id: "outbox-1",
  donation_id: "donation-1",
  replayed: false,
};

export function createDonateRequest(
  body: Record<string, unknown>,
): NextRequest {
  return new NextRequest("http://localhost/api/donate", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "idempotency-key": "guest-giving-fee-policy-test",
    },
    body: JSON.stringify(body),
  });
}

export function storedGift(amount: number) {
  return {
    amount,
    currency: "usd",
    missionary_id: null,
    fund_id: null,
    donor: { profile: { id: authenticatedDonor.profileId } },
  };
}

export function createDonationsFromMock(storedAmount: number | null) {
  return vi.fn((table: string) => {
    expect(table).toBe("donations");
    return {
      select: () => ({
        eq: () => ({
          eq: () => ({
            single: async () =>
              storedAmount == null
                ? { data: null, error: { message: "Donation not found" } }
                : { data: storedGift(storedAmount), error: null },
          }),
        }),
      }),
    };
  });
}
