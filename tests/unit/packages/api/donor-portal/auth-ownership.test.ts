import { beforeEach, describe, expect, it, vi } from "vitest";

const { getAdminClientMock, getAuthContextMock, requireRoleMock } = vi.hoisted(
  () => ({
    getAdminClientMock: vi.fn(),
    getAuthContextMock: vi.fn(),
    requireRoleMock: vi.fn(),
  }),
);

vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: getAdminClientMock,
}));

vi.mock("@asym/auth/context", () => ({
  getAuthContext: getAuthContextMock,
  requireAuth: vi.fn(),
  requireRole: requireRoleMock,
}));

import { GET as getDonorPortal } from "../../../../../packages/api/src/donor-portal";
import {
  getOwnedDonation,
  getOwnedStatementDonations,
} from "../../../../../packages/api/src/donor-portal/service";

type QueryResult<T> = {
  data: T | null;
  error: { code?: string; message: string } | null;
};

function createQueryMock<T>(result: QueryResult<T>) {
  const query: {
    select: ReturnType<typeof vi.fn>;
    eq: ReturnType<typeof vi.fn>;
    gte: ReturnType<typeof vi.fn>;
    lt: ReturnType<typeof vi.fn>;
    order: ReturnType<typeof vi.fn>;
    single: ReturnType<typeof vi.fn>;
    then?: PromiseLike<QueryResult<T>>["then"];
  } = {
    select: vi.fn(() => query),
    eq: vi.fn(() => query),
    gte: vi.fn(() => query),
    lt: vi.fn(() => query),
    order: vi.fn(() => query),
    single: vi.fn(() => Promise.resolve(result)),
  };

  query.then = (onFulfilled, onRejected) =>
    Promise.resolve(result).then(onFulfilled, onRejected);

  return query;
}

function request(path = "/api/donor/portal") {
  return new Request(`https://donor.example.test${path}`) as never;
}

describe("donor portal auth and ownership", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAdminClientMock.mockReturnValue({
      client: { from: vi.fn() },
      error: null,
    });
    getAuthContextMock.mockResolvedValue({
      isAuthenticated: true,
      userId: "user-1",
      tenantId: "tenant-1",
      role: "donor",
      profileRole: "donor",
      memberships: [],
      profileId: "profile-1",
      email: "donor@example.com",
    });
  });

  it("requires the donor role for the donor portal route", async () => {
    requireRoleMock.mockImplementation(() => {
      throw new Error("Forbidden: requires donor role");
    });

    const response = await getDonorPortal(request());

    expect(response.status).toBe(403);
    expect(requireRoleMock).toHaveBeenCalledWith(
      expect.objectContaining({ profileId: "profile-1" }),
      ["donor"],
    );
  });

  it("returns the deterministic E2E donor portal snapshot when admin Supabase is unavailable", async () => {
    const originalBypass = process.env.E2E_AUTH_BYPASS;
    process.env.E2E_AUTH_BYPASS = "true";
    getAdminClientMock.mockReturnValue({
      client: null,
      error:
        "Admin endpoints are disabled because SUPABASE_SERVICE_ROLE_KEY is not configured.",
    });
    getAuthContextMock.mockResolvedValue({
      isAuthenticated: true,
      userId: "e2e-donor-user",
      tenantId: "00000000-0000-0000-0000-000000000001",
      role: "donor",
      profileRole: "donor",
      memberships: [],
      profileId: "11111111-1111-1111-1111-111111111111",
      email: null,
    });
    requireRoleMock.mockImplementation(() => undefined);

    try {
      const response = await getDonorPortal(request());
      const payload = (await response.json()) as {
        portal?: {
          profile?: { id: string; displayName: string };
          donations?: unknown[];
          recurringGifts?: unknown[];
        };
      };

      expect(response.status).toBe(200);
      expect(payload.portal?.profile).toMatchObject({
        id: "11111111-1111-1111-1111-111111111111",
        displayName: "Jordan Hale",
      });
      expect(payload.portal?.donations?.length).toBeGreaterThan(0);
      expect(payload.portal?.recurringGifts?.length).toBeGreaterThan(0);
    } finally {
      process.env.E2E_AUTH_BYPASS = originalBypass;
    }
  });

  it("scopes donor receipt lookup by donation id, tenant, and donor", async () => {
    const query = createQueryMock({
      data: {
        id: "donation-1",
        amount: 1000,
        currency: "usd",
        status: "completed",
        donation_type: "one_time",
        payment_method: "Stripe",
        is_recurring: false,
        recurring_interval: null,
        gift_date: "2026-05-01T00:00:00.000Z",
        created_at: "2026-05-01T00:00:00.000Z",
        completed_at: null,
        processed_at: null,
        stripe_payment_intent_id: "pi_1",
        stripe_charge_id: "ch_1",
        fund: null,
        missionary: null,
      },
      error: null,
    });
    const supabase = { from: vi.fn(() => query) };

    await getOwnedDonation({
      supabaseAdmin: supabase as never,
      donationId: "donation-1",
      donorId: "donor-1",
      tenantId: "tenant-1",
    });

    expect(supabase.from).toHaveBeenCalledWith("donations");
    expect(query.eq).toHaveBeenCalledWith("id", "donation-1");
    expect(query.eq).toHaveBeenCalledWith("tenant_id", "tenant-1");
    expect(query.eq).toHaveBeenCalledWith("donor_id", "donor-1");
  });

  it("returns a 404-style error when a donor receipt is not owned by the donor", async () => {
    const query = createQueryMock({
      data: null,
      error: { code: "PGRST116", message: "No rows found" },
    });

    await expect(
      getOwnedDonation({
        supabaseAdmin: { from: vi.fn(() => query) } as never,
        donationId: "donation-2",
        donorId: "donor-1",
        tenantId: "tenant-1",
      }),
    ).rejects.toMatchObject({
      status: 404,
      message: "Donation not found",
    });
  });

  it("scopes annual statements by tenant, donor, and requested year", async () => {
    const query = createQueryMock({
      data: [
        {
          id: "settled",
          amount: 1000,
          currency: "usd",
          status: "completed",
          donation_type: "one_time",
          payment_method: "Stripe",
          is_recurring: false,
          recurring_interval: null,
          gift_date: "2026-02-01T00:00:00.000Z",
          created_at: "2026-02-01T00:00:00.000Z",
          completed_at: null,
          processed_at: null,
          stripe_payment_intent_id: "pi_1",
          stripe_charge_id: "ch_1",
          fund: null,
          missionary: null,
        },
        {
          id: "pending",
          amount: 2000,
          currency: "usd",
          status: "pending",
          donation_type: "one_time",
          payment_method: "Stripe",
          is_recurring: false,
          recurring_interval: null,
          gift_date: "2026-03-01T00:00:00.000Z",
          created_at: "2026-03-01T00:00:00.000Z",
          completed_at: null,
          processed_at: null,
          stripe_payment_intent_id: "pi_2",
          stripe_charge_id: null,
          fund: null,
          missionary: null,
        },
      ],
      error: null,
    });
    const supabase = { from: vi.fn(() => query) };

    const donations = await getOwnedStatementDonations({
      supabaseAdmin: supabase as never,
      donorId: "donor-1",
      tenantId: "tenant-1",
      year: 2026,
    });

    expect(query.eq).toHaveBeenCalledWith("tenant_id", "tenant-1");
    expect(query.eq).toHaveBeenCalledWith("donor_id", "donor-1");
    expect(query.gte).toHaveBeenCalledWith(
      "gift_date",
      "2026-01-01T00:00:00.000Z",
    );
    expect(query.lt).toHaveBeenCalledWith(
      "gift_date",
      "2027-01-01T00:00:00.000Z",
    );
    expect(donations).toHaveLength(1);
    expect(donations[0]?.id).toBe("settled");
  });
});
