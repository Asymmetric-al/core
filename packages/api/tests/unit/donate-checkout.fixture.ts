import { NextRequest } from "next/server";
import { expect, vi } from "vitest";

import type { AuthContext } from "@asym/auth/context";

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

export function createDonationsFromMock(
  storedAmount: number | null,
  expected: { donationId?: string; tenantId?: string } = {},
) {
  const expectedDonationId = expected.donationId ?? beginRpcResult.donation_id;
  const expectedTenantId = expected.tenantId ?? authenticatedDonor.tenantId;
  return vi.fn((table: string) => {
    expect(table).toBe("donations");
    const filters = new Map<string, string>();
    const query = {
      eq(column: string, value: string) {
        filters.set(column, value);
        return query;
      },
      single: async () => {
        const matchesId = filters.get("id") === expectedDonationId;
        const matchesTenant = filters.get("tenant_id") === expectedTenantId;
        if (!matchesId || !matchesTenant || storedAmount == null) {
          return { data: null, error: { message: "Donation not found" } };
        }
        return { data: storedGift(storedAmount), error: null };
      },
    };
    return { select: () => query };
  });
}
