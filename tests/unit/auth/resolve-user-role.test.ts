import { describe, expect, it } from "vitest";

import { resolveUserRoleFromDatabase } from "../../../packages/auth/resolve-user-role";

type ProfileRow = { tenant_id: string | null; role: string | null } | null;
type MembershipRow = {
  tenant_id: string | null;
  role: string | null;
  staff_role: string | null;
  is_active: boolean | null;
};

type RpcCall = { fn: string; args: Record<string, unknown> };

/**
 * Stands in for the request-scoped Supabase client. A hand-rolled double rather
 * than a mock of the real client: this asserts the resolver's observable
 * contract (what role comes out for a given database state), not which query
 * builder methods it happened to call.
 *
 * The one exception is `schema()`, which throws. PostgREST only serves the
 * schemas in `supabase/config.toml` (`public`, `graphql_public`), so a resolver
 * that switches to `authz` fails against a real database while a permissive
 * double stays green -- exactly the gap that shipped a full lockout once.
 */
function fakeSupabase({
  profile = null,
  memberships = [],
  throwOn,
  returnErrorOn,
  rpcCalls,
}: {
  profile?: ProfileRow;
  memberships?: MembershipRow[];
  throwOn?: "profiles" | "memberships";
  returnErrorOn?: "profiles" | "memberships";
  rpcCalls?: RpcCall[];
}) {
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
              return {
                data: returnErrorOn === "profiles" ? null : profile,
                error:
                  returnErrorOn === "profiles"
                    ? new Error("profiles unavailable")
                    : null,
              };
            },
          }),
        }),
      };
    },
    schema(name: string) {
      throw new Error(
        `schema("${name}") is not reachable through the Data API; use an RPC`,
      );
    },
    async rpc(fn: string, args: Record<string, unknown>) {
      rpcCalls?.push({ fn, args });

      if (throwOn === "memberships") {
        throw new Error("memberships unavailable");
      }

      return {
        data: returnErrorOn === "memberships" ? null : memberships,
        error:
          returnErrorOn === "memberships"
            ? new Error("memberships unavailable")
            : null,
      };
    },
  } as never;
}

describe("resolveUserRoleFromDatabase", () => {
  it("derives the role from the profile and active memberships", async () => {
    const snapshot = await resolveUserRoleFromDatabase({
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

    expect(snapshot).toEqual({
      profileRole: "donor",
      memberships: [
        {
          tenantId: "tenant_1",
          role: "staff",
          staffRole: null,
          isActive: true,
        },
      ],
    });
  });

  it("reads memberships through the exposed RPC, scoped to the tenant", async () => {
    // Pins the read to `public.current_user_memberships`
    // (20260802041500_current_user_memberships_rpc.sql). Querying `authz`
    // directly returns PGRST106 against a real database, and the resolver
    // turns that into a redirect for every signed-in user.
    const rpcCalls: RpcCall[] = [];

    await resolveUserRoleFromDatabase({
      userId: "user_1",
      supabase: fakeSupabase({
        profile: { tenant_id: "tenant_1", role: "donor" },
        rpcCalls,
      }),
    });

    expect(rpcCalls).toEqual([
      { fn: "current_user_memberships", args: { target_tenant: "tenant_1" } },
    ]);
  });

  it("never passes a user id to the membership RPC", async () => {
    // The function pins rows to auth.uid(); accepting a caller-supplied id
    // would let the edge resolve someone else's roles.
    const rpcCalls: RpcCall[] = [];

    await resolveUserRoleFromDatabase({
      userId: "user_1",
      supabase: fakeSupabase({
        profile: { tenant_id: "tenant_1", role: "donor" },
        rpcCalls,
      }),
    });

    expect(Object.keys(rpcCalls[0]?.args ?? {})).toEqual(["target_tenant"]);
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

  it("fails closed when the profile lookup returns an error", async () => {
    const snapshot = await resolveUserRoleFromDatabase({
      userId: "user_1",
      supabase: fakeSupabase({ returnErrorOn: "profiles" }),
    });

    expect(snapshot).toBeNull();
  });

  it("fails closed when the membership lookup returns an error", async () => {
    const snapshot = await resolveUserRoleFromDatabase({
      userId: "user_1",
      supabase: fakeSupabase({
        profile: { tenant_id: "tenant_1", role: "donor" },
        returnErrorOn: "memberships",
      }),
    });

    expect(snapshot).toBeNull();
  });
});
