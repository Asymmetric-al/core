import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * TDD — finding 06 Gap 1: the cleanup-demo-users endpoint deletes users via the
 * admin (RLS-bypass) client and middleware exempts /api/*. It MUST fail CLOSED:
 * if CRON_SECRET is unset/empty it must refuse, never fall through to deletion.
 */

const { serverEnvMock, getAdminClientMock } = vi.hoisted(() => ({
  serverEnvMock: { CRON_SECRET: undefined as string | undefined },
  getAdminClientMock: vi.fn(),
}));

vi.mock("@asym/env", () => ({ serverEnv: serverEnvMock }));
vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: getAdminClientMock,
}));

import * as route from "../../src/auth/cleanup-demo-users";

it("exposes the destructive cleanup only as POST", () => {
  expect(Object.keys(route)).toEqual(["POST"]);
});

function req(headers?: HeadersInit): Request {
  return new Request("https://example.com/api/auth/cleanup-demo-users", {
    method: "POST",
    headers,
  });
}

function mockAdminNoUsers() {
  const deleteUser = vi.fn().mockResolvedValue({ error: null });
  getAdminClientMock.mockReturnValue({
    client: {
      auth: {
        admin: {
          listUsers: vi
            .fn()
            .mockResolvedValue({ data: { users: [] }, error: null }),
          deleteUser,
        },
      },
    },
    error: null,
  });
  return { deleteUser };
}

describe("api/auth/cleanup-demo-users — fail-closed auth (finding 06 Gap 1)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    serverEnvMock.CRON_SECRET = undefined;
  });

  it("REFUSES and never touches the admin client when CRON_SECRET is unset", async () => {
    serverEnvMock.CRON_SECRET = undefined;
    const { deleteUser } = mockAdminNoUsers();

    const res = await route.POST(req());

    expect([401, 503]).toContain(res.status);
    expect(getAdminClientMock).not.toHaveBeenCalled();
    expect(deleteUser).not.toHaveBeenCalled();
  });

  it("REFUSES when CRON_SECRET is an empty string", async () => {
    serverEnvMock.CRON_SECRET = "";
    const { deleteUser } = mockAdminNoUsers();

    const res = await route.POST(req({ authorization: "Bearer " }));

    expect([401, 503]).toContain(res.status);
    expect(getAdminClientMock).not.toHaveBeenCalled();
    expect(deleteUser).not.toHaveBeenCalled();
  });

  it("returns 401 when CRON_SECRET is set but the token is missing or wrong", async () => {
    serverEnvMock.CRON_SECRET = "s3cret";
    mockAdminNoUsers();

    expect((await route.POST(req())).status).toBe(401);
    expect(
      (await route.POST(req({ authorization: "Bearer wrong" }))).status,
    ).toBe(401);
  });

  it("PROCEEDS on the legitimate cron path (correct Bearer token)", async () => {
    serverEnvMock.CRON_SECRET = "s3cret";
    const { deleteUser } = mockAdminNoUsers();

    const res = await route.POST(req({ authorization: "Bearer s3cret" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.deletedCount).toBe(0);
    expect(deleteUser).not.toHaveBeenCalled(); // no demo users to delete
  });
});

// L4 (re-check of WP3a part 1a, 21 November): deleting a demo account
// cascades to its missionary, which the database refuses once money names
// it; such an account is kept and reported, and a failed delete fails the run.
describe("api/auth/cleanup-demo-users — accounts with giving history", () => {
  const old = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
  const LOCKED = "11111111-1111-4111-8111-111111111111";
  const PLAIN = "22222222-2222-4222-8222-222222222222";
  const MISSIONARY = "33333333-3333-4333-8333-333333333333";

  function mockAdmin({ failPlain = false } = {}) {
    const deleteUser = vi.fn(async (id: string) => ({
      error:
        id === LOCKED
          ? { message: "Database error deleting user" }
          : failPlain
            ? { message: "Database error deleting user" }
            : null,
    }));
    const from = vi.fn((table: string) => {
      const filters: Record<string, unknown> = {};
      const builder = {
        select: () => builder,
        eq: (column: string, value: unknown) => {
          filters[column] = value;
          return builder;
        },
        in: (column: string, values: string[]) => {
          filters[column] = values;
          return builder;
        },
        then: (resolve: (value: unknown) => void) => {
          if (table === "missionaries")
            return resolve({
              data: filters.profile_id === LOCKED ? [{ id: MISSIONARY }] : [],
              error: null,
            });
          if (table === "donors") return resolve({ data: [], error: null });
          const named =
            table === "donations" &&
            (filters.missionary_id as string[] | undefined)?.includes(
              MISSIONARY,
            );
          return resolve({ count: named ? 1 : 0, error: null });
        },
      };
      return builder;
    });
    getAdminClientMock.mockReturnValue({
      client: {
        from,
        auth: {
          admin: {
            listUsers: vi.fn().mockResolvedValue({
              data: {
                users: [
                  { id: LOCKED, email: "demo-locked@x.test", created_at: old },
                  { id: PLAIN, email: "demo-plain@x.test", created_at: old },
                ],
              },
              error: null,
            }),
            deleteUser,
          },
        },
      },
      error: null,
    });
    return { deleteUser };
  }

  beforeEach(() => {
    vi.clearAllMocks();
    serverEnvMock.CRON_SECRET = "s3cret";
  });

  it("keeps a demo account whose missionary money named, says why, and deletes the rest", async () => {
    const { deleteUser } = mockAdmin();
    const res = await route.POST(req({ authorization: "Bearer s3cret" }));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body).toMatchObject({
      success: true,
      deletedCount: 1,
      deletedIds: [PLAIN],
      retained: [{ id: LOCKED, reason: "giving history" }],
    });
    expect(body.errors).toBeUndefined();
    expect(deleteUser).not.toHaveBeenCalledWith(LOCKED);
  });

  // Round M (L4): the donor branch, and a money table other than donations.
  // This mock answers every lookup the handler makes: the account's
  // missionary and donor rows by profile, and a count per money table and
  // column for the ids it names.
  function mockAccounts(spec: {
    accounts: string[];
    missionaries?: Record<string, string>;
    donors?: Record<string, string>;
    named: {
      table: string;
      column: "missionary_id" | "donor_id";
      id: string;
    }[];
  }) {
    const deleteUser = vi.fn(async () => ({ error: null }));
    const from = vi.fn((table: string) => {
      const filters: Record<string, unknown> = {};
      const builder = {
        select: () => builder,
        eq: (column: string, value: unknown) => {
          filters[column] = value;
          return builder;
        },
        in: (column: string, values: string[]) => {
          filters[column] = values;
          return builder;
        },
        then: (resolve: (value: unknown) => void) => {
          if (table === "missionaries" || table === "donors") {
            const byProfile =
              (table === "missionaries" ? spec.missionaries : spec.donors) ??
              {};
            const id = byProfile[filters.profile_id as string];
            return resolve({ data: id ? [{ id }] : [], error: null });
          }
          const hit = spec.named.some(
            (n) =>
              n.table === table &&
              ((filters[n.column] as string[] | undefined) ?? []).includes(
                n.id,
              ),
          );
          return resolve({ count: hit ? 1 : 0, error: null });
        },
      };
      return builder;
    });
    getAdminClientMock.mockReturnValue({
      client: {
        from,
        auth: {
          admin: {
            listUsers: vi.fn().mockResolvedValue({
              data: {
                users: spec.accounts.map((id, n) => ({
                  id,
                  email: `demo-${n}@x.test`,
                  created_at: old,
                })),
              },
              error: null,
            }),
            deleteUser,
          },
        },
      },
      error: null,
    });
    return { deleteUser };
  }

  it("keeps an account whose donor row a pledge names, and never deletes it", async () => {
    const DONOR = "44444444-4444-4444-8444-444444444444";
    const { deleteUser } = mockAccounts({
      accounts: [PLAIN],
      donors: { [PLAIN]: DONOR },
      named: [{ table: "donor_pledges", column: "donor_id", id: DONOR }],
    });
    const res = await route.POST(req({ authorization: "Bearer s3cret" }));
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({
      success: true,
      deletedCount: 0,
      retained: [{ id: PLAIN, reason: "giving history" }],
    });
    expect(deleteUser).not.toHaveBeenCalled();
  });

  it("keeps an account whose missionary only the saga outbox names, and never deletes it", async () => {
    const { deleteUser } = mockAccounts({
      accounts: [LOCKED],
      missionaries: { [LOCKED]: MISSIONARY },
      named: [
        {
          table: "donation_saga_outbox",
          column: "missionary_id",
          id: MISSIONARY,
        },
      ],
    });
    const res = await route.POST(req({ authorization: "Bearer s3cret" }));
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({
      success: true,
      deletedCount: 0,
      retained: [{ id: LOCKED, reason: "giving history" }],
    });
    expect(deleteUser).not.toHaveBeenCalled();
  });

  it("fails the run when an account without giving history could not be deleted", async () => {
    mockAdmin({ failPlain: true });
    const res = await route.POST(req({ authorization: "Bearer s3cret" }));
    const body = await res.json();
    expect(res.status).toBe(500);
    expect(body.success).toBe(false);
    expect(body.errors).toEqual([
      { id: PLAIN, error: "Database error deleting user" },
    ]);
  });
});
