import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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
  queryError,
  thrownError,
  rpcCalls,
}: {
  profile?: ProfileRow;
  memberships?: MembershipRow[];
  throwOn?: "profiles" | "memberships";
  returnErrorOn?: "profiles" | "memberships";
  queryError?: unknown;
  thrownError?: unknown;
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
                throw thrownError ?? new Error("profiles unavailable");
              }
              return {
                data: returnErrorOn === "profiles" ? null : profile,
                error:
                  returnErrorOn === "profiles"
                    ? (queryError ?? new Error("profiles unavailable"))
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
        throw thrownError ?? new Error("memberships unavailable");
      }

      return {
        data: returnErrorOn === "memberships" ? null : memberships,
        error:
          returnErrorOn === "memberships"
            ? (queryError ?? new Error("memberships unavailable"))
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

describe("preview role-resolution diagnostics", () => {
  beforeEach(() => {
    // Hosted previews are production builds, not protected production targets.
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.stubEnv("VERCEL_TARGET_ENV", "preview");
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("distinguishes no visible profile from a query failure while denying both", async () => {
    expect(
      await resolveUserRoleFromDatabase({
        userId: "private-user",
        supabase: fakeSupabase({ profile: null }),
      }),
    ).toBeNull();
    expect(console.warn).toHaveBeenLastCalledWith({
      event: "auth_access_diagnostic",
      stage: "profile_read",
      outcome: "no_visible_profile",
      code: null,
    });

    expect(
      await resolveUserRoleFromDatabase({
        userId: "private-user",
        supabase: fakeSupabase({
          returnErrorOn: "profiles",
          queryError: { code: "42501", message: "private query detail" },
        }),
      }),
    ).toBeNull();
    expect(console.warn).toHaveBeenLastCalledWith({
      event: "auth_access_diagnostic",
      stage: "profile_read",
      outcome: "query_failed",
      code: "42501",
    });
    expect(console.warn).toHaveBeenCalledTimes(2);
  });

  it("identifies a failed membership RPC without changing the null result", async () => {
    expect(
      await resolveUserRoleFromDatabase({
        userId: "private-user",
        supabase: fakeSupabase({
          profile: { tenant_id: "private-tenant", role: "donor" },
          returnErrorOn: "memberships",
          queryError: { code: "PGRST202", details: "private RPC detail" },
        }),
      }),
    ).toBeNull();
    expect(console.warn).toHaveBeenCalledExactlyOnceWith({
      event: "auth_access_diagnostic",
      stage: "membership_read",
      outcome: "query_failed",
      code: "PGRST202",
    });
  });

  it.each(["profiles", "memberships"] as const)(
    "keeps a thrown %s failure closed with fixed exception metadata",
    async (throwOn) => {
      expect(
        await resolveUserRoleFromDatabase({
          userId: "private-user",
          supabase: fakeSupabase({
            profile: { tenant_id: "private-tenant", role: "donor" },
            throwOn,
            thrownError: new Error("private thrown detail"),
          }),
        }),
      ).toBeNull();
      expect(console.warn).toHaveBeenCalledExactlyOnceWith({
        event: "auth_access_diagnostic",
        stage: "resolver",
        outcome: "exception",
        code: "other",
      });
    },
  );

  it.each([
    ["production", "preview"],
    ["preview", "production"],
    ["preview", "core-development"],
    ["preview", "staging"],
    [" Production ", "preview"],
    ["development", ""],
    ["", ""],
  ])(
    "stays silent and denied for VERCEL_ENV=%s and target=%s",
    async (env, target) => {
      vi.stubEnv("VERCEL_ENV", env);
      vi.stubEnv("VERCEL_TARGET_ENV", target);
      const readCode = vi.fn(() => "42501");
      const queryError = Object.defineProperty({}, "code", { get: readCode });
      expect(
        await resolveUserRoleFromDatabase({
          userId: "private-user",
          supabase: fakeSupabase({ returnErrorOn: "profiles", queryError }),
        }),
      ).toBeNull();
      expect(readCode).not.toHaveBeenCalled();
      expect(console.warn).not.toHaveBeenCalled();
    },
  );

  it("uses normalized preview classification and stays silent for a valid snapshot", async () => {
    vi.stubEnv("VERCEL_ENV", " Preview ");
    vi.stubEnv("VERCEL_TARGET_ENV", "");
    expect(
      await resolveUserRoleFromDatabase({
        userId: "private-user",
        supabase: fakeSupabase({
          profile: { tenant_id: "private-tenant", role: "donor" },
        }),
      }),
    ).toEqual({ profileRole: "donor", memberships: [] });
    expect(console.warn).not.toHaveBeenCalled();

    await resolveUserRoleFromDatabase({
      userId: "private-user",
      supabase: fakeSupabase({ profile: null }),
    });
    expect(console.warn).toHaveBeenCalledExactlyOnceWith({
      event: "auth_access_diagnostic",
      stage: "profile_read",
      outcome: "no_visible_profile",
      code: null,
    });
  });

  it.each([
    "42501",
    "42P01",
    "42883",
    "PGRST106",
    "PGRST116",
    "PGRST202",
    "PGRST301",
  ])("retains only the allowlisted query code %s", async (code) => {
    expect(
      await resolveUserRoleFromDatabase({
        userId: "private-user",
        supabase: fakeSupabase({
          returnErrorOn: "profiles",
          queryError: { code, message: "private error" },
        }),
      }),
    ).toBeNull();
    expect(console.warn).toHaveBeenCalledExactlyOnceWith({
      event: "auth_access_diagnostic",
      stage: "profile_read",
      outcome: "query_failed",
      code,
    });
  });

  it("excludes raw and encoded identities, error fields and unknown codes", async () => {
    const secret = "dummy+password@example.test";
    const variants = [
      secret,
      encodeURIComponent(secret),
      Buffer.from(secret).toString("base64"),
    ];
    const serialize = vi.fn(() => secret);
    for (const variant of variants) {
      expect(
        await resolveUserRoleFromDatabase({
          userId: variant,
          supabase: fakeSupabase({
            profile: { tenant_id: variant, role: "donor" },
            returnErrorOn: "memberships",
            queryError: {
              code: variant,
              message: variant,
              details: variant,
              hint: variant,
              cause: { userId: variant, tenantId: variant },
              stage: variant,
              outcome: variant,
              toJSON: serialize,
              toString: serialize,
            },
          }),
        }),
      ).toBeNull();
      expect(console.warn).toHaveBeenLastCalledWith({
        event: "auth_access_diagnostic",
        stage: "membership_read",
        outcome: "query_failed",
        code: "other",
      });
    }
    const output = JSON.stringify(vi.mocked(console.warn).mock.calls);
    for (const variant of variants) expect(output).not.toContain(variant);
    expect(serialize).not.toHaveBeenCalled();
  });

  it.each(["getter", "revoked-proxy", "getter-and-sink"])(
    "keeps an unreadable %s code closed with an other-code event",
    async (kind) => {
      if (kind === "getter-and-sink") {
        vi.mocked(console.warn).mockImplementation(() => {
          throw new Error("private sink detail");
        });
      }
      const queryError = kind.startsWith("getter")
        ? Object.defineProperty({}, "code", {
            get() {
              throw new Error("private getter detail");
            },
          })
        : (() => {
            const value = Proxy.revocable({}, {});
            value.revoke();
            return value.proxy;
          })();
      expect(
        await resolveUserRoleFromDatabase({
          userId: "private-user",
          supabase: fakeSupabase({ returnErrorOn: "profiles", queryError }),
        }),
      ).toBeNull();
      expect(console.warn).toHaveBeenCalledExactlyOnceWith({
        event: "auth_access_diagnostic",
        stage: "profile_read",
        outcome: "query_failed",
        code: "other",
      });
    },
  );

  it.each(["profile", "membership", "exception"])(
    "preserves the denied %s result when logging throws",
    async (kind) => {
      vi.mocked(console.warn).mockImplementation(() => {
        throw new Error("private sink detail");
      });
      const supabase =
        kind === "profile"
          ? fakeSupabase({ profile: null })
          : kind === "membership"
            ? fakeSupabase({
                profile: { tenant_id: "private-tenant", role: "donor" },
                returnErrorOn: "memberships",
              })
            : fakeSupabase({ throwOn: "profiles" });
      await expect(
        resolveUserRoleFromDatabase({ userId: "private-user", supabase }),
      ).resolves.toBeNull();
      expect(console.warn).toHaveBeenCalledTimes(1);
    },
  );
});
