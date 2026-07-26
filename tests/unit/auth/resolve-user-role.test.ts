import { describe, expect, it } from "vitest";

import { resolveUserRoleFromDatabase } from "../../../packages/auth/resolve-user-role";

type ProfileRow = { tenant_id: string | null; role: string | null } | null;
type MembershipRow = {
  tenant_id: string | null;
  role: string | null;
  staff_role: string | null;
  is_active: boolean | null;
};

/**
 * Stands in for the request-scoped Supabase client. A hand-rolled double rather
 * than a mock of the real client: this asserts the resolver's observable
 * contract (what role comes out for a given database state), not which query
 * builder methods it happened to call.
 */
function fakeSupabase({
  profile = null,
  memberships = [],
  throwOn,
}: {
  profile?: ProfileRow;
  memberships?: MembershipRow[];
  throwOn?: "profiles" | "memberships";
}) {
  const membershipChain = {
    eq() {
      return this;
    },
    then(resolve: (value: { data: MembershipRow[] }) => unknown) {
      if (throwOn === "memberships") {
        throw new Error("memberships unavailable");
      }
      return Promise.resolve({ data: memberships }).then(resolve);
    },
  };

  return {
    from(table: string) {
      if (table !== "profiles") {
        throw new Error(`unexpected table ${table}`);
      }
      return {
        select: () => ({
          eq: () => ({
            maybeSingle: async () => {
              if (throwOn === "profiles") {
                throw new Error("profiles unavailable");
              }
              return { data: profile };
            },
          }),
        }),
      };
    },
    schema: () => ({
      from: () => ({ select: () => membershipChain }),
    }),
  } as never;
}

describe("resolveUserRoleFromDatabase", () => {
  it("derives the role from the profile and active memberships", async () => {
    const role = await resolveUserRoleFromDatabase({
      userId: "user_1",
      supabase: fakeSupabase({
        profile: { tenant_id: "tenant_1", role: "donor" },
        memberships: [
          {
            tenant_id: "tenant_1",
            role: "staff",
            staff_role: null,
            is_active: true,
          },
        ],
      }),
    });

    // Membership beats the profile column, matching `derivePrimaryRole`.
    expect(role).toBe("staff");
  });

  it("fails closed when the user has no profile row", async () => {
    const role = await resolveUserRoleFromDatabase({
      userId: "user_missing",
      supabase: fakeSupabase({ profile: null }),
    });

    expect(role).toBeNull();
  });

  it("fails closed when the profile lookup throws", async () => {
    // An RLS denial or a transient outage must not read as "allowed". The
    // middleware turns null into a redirect, so this is the difference between
    // a locked door and an open one.
    const role = await resolveUserRoleFromDatabase({
      userId: "user_1",
      supabase: fakeSupabase({ throwOn: "profiles" }),
    });

    expect(role).toBeNull();
  });

  it("fails closed when the membership lookup throws", async () => {
    const role = await resolveUserRoleFromDatabase({
      userId: "user_1",
      supabase: fakeSupabase({
        profile: { tenant_id: "tenant_1", role: "donor" },
        throwOn: "memberships",
      }),
    });

    expect(role).toBeNull();
  });
});
