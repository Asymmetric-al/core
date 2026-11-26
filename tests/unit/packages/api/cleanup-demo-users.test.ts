import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => ({
  users: [] as { id: string; email: string; created_at: string }[],
  deleteUser: vi.fn(),
}));

vi.mock("@asym/env", () => ({
  serverEnv: { CRON_SECRET: "cron-secret" },
}));

vi.mock("@asym/database/supabase/admin", () => {
  const query = {
    select: () => query,
    eq: () => Promise.resolve({ data: [], error: null }),
    in: () => Promise.resolve({ count: 0, error: null }),
  };
  return {
    getAdminClient: () => ({
      client: {
        auth: {
          admin: {
            listUsers: async () => ({ data: { users: h.users }, error: null }),
            deleteUser: h.deleteUser,
          },
        },
        from: () => query,
      },
      error: null,
    }),
  };
});

import { POST } from "../../../../packages/api/src/auth/cleanup-demo-users";

const LINKED = "00000000-0000-4000-8000-0000000000c1";
const UNLINKED = "00000000-0000-4000-8000-0000000000c2";
const REFUSAL =
  'update or delete on table "users" violates foreign key constraint "account_links_user_id_fkey" on table "account_links"';

describe("the demo clean-up and a demo login with an account link (AL-2678 WP5 rest, Q7 guard: passes on the base)", () => {
  beforeEach(() => {
    const old = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
    h.users = [
      { id: LINKED, email: "demo-linked@example.test", created_at: old },
      { id: UNLINKED, email: "demo-unlinked@example.test", created_at: old },
    ];
    h.deleteUser.mockReset().mockImplementation(async (id: string) => ({
      error: id === LINKED ? { message: REFUSAL } : null,
    }));
  });

  it("records the refused delete of the linked login and goes on to delete the next", async () => {
    const response = await POST(
      new Request("http://localhost/api/auth/cleanup-demo-users", {
        method: "POST",
        headers: { authorization: "Bearer cron-secret" },
      }),
    );

    expect(h.deleteUser.mock.calls).toEqual([[LINKED], [UNLINKED]]);
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      success: false,
      deletedCount: 1,
      deletedIds: [UNLINKED],
      errors: [{ id: LINKED, error: REFUSAL }],
    });
  });
});
