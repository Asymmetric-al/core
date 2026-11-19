import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { resolveUserRoleFromDatabase } from "../../../packages/auth/resolve-user-role";

/**
 * AL-2675 (WP2a; plan 5.2; NR-20): the proxies' role check reads the caller's
 * live memberships through `public.current_user_assignments()` and selects
 * the one of the surface's role class. It reads no profile.
 */
const USER = "00000000-0000-4000-8000-0000000000a1";
const TA = "00000000-0000-4000-8000-00000000000a";
const TB = "00000000-0000-4000-8000-00000000000b";
let next = 0x100;
function row(
  tenant: string,
  role: "donor" | "missionary" | "staff",
  staffRole: string | null = null,
  isTenantAdmin = false,
) {
  next += 1;
  return {
    id: `00000000-0000-4000-8000-${next.toString(16).padStart(12, "0")}`,
    user_id: USER,
    tenant_id: tenant,
    role,
    staff_role: staffRole,
    is_tenant_admin: isTenantAdmin,
    updated_at: "2026-11-17T09:00:00.000000+00:00",
  };
}

type RpcCall = { fn: string; args: unknown[] };

/**
 * Stands in for the request-scoped Supabase client. `from()` and `schema()`
 * throw: the resolver must read neither a table nor an unexposed schema, only
 * the assignments RPC.
 */
function fakeSupabase({
  rows = [],
  returnError,
  throwError,
  rpcCalls,
}: {
  rows?: unknown;
  returnError?: unknown;
  throwError?: unknown;
  rpcCalls?: RpcCall[];
}) {
  return {
    from(table: string) {
      throw new Error(`unexpected table read: ${table}`);
    },
    schema(name: string) {
      throw new Error(
        `schema("${name}") is not reachable through the Data API`,
      );
    },
    async rpc(fn: string, ...args: unknown[]) {
      rpcCalls?.push({ fn, args });
      if (throwError !== undefined) throw throwError;
      return returnError !== undefined
        ? { data: null, error: returnError }
        : { data: rows, error: null };
    },
  } as never;
}

const resolve = (
  supabase: never,
  roleClass: "donor" | "missionary" | "staff" | null = "staff",
  userId = USER,
) => resolveUserRoleFromDatabase({ userId, supabase, roleClass });

describe("resolveUserRoleFromDatabase", () => {
  it("returns the one live membership of the surface's class, with its flag", async () => {
    const admin = row(TA, "staff", "development", true);
    const rpcCalls: RpcCall[] = [];
    expect(
      await resolve(
        fakeSupabase({ rows: [row(TA, "donor"), admin], rpcCalls }),
      ),
    ).toEqual({
      memberships: [
        {
          tenantId: TA,
          role: "staff",
          staffRole: "development",
          isActive: true,
          isTenantAdmin: true,
        },
      ],
    });
    expect(rpcCalls).toEqual([{ fn: "current_user_assignments", args: [] }]);
  });

  it("selects by the surface's class: the donor portal gets the donor row, never the staff row", async () => {
    const supabase = fakeSupabase({
      rows: [row(TA, "staff", "finance"), row(TA, "donor")],
    });
    expect(await resolve(supabase, "donor")).toEqual({
      memberships: [
        {
          tenantId: TA,
          role: "donor",
          staffRole: null,
          isActive: true,
          isTenantAdmin: false,
        },
      ],
    });
  });

  it.each([
    ["no row of the class", [row(TA, "donor")], "staff"],
    [
      "two staff rows in one tenant",
      [row(TA, "staff", "finance"), row(TA, "staff", "hr")],
      "staff",
    ],
    [
      "donor rows in two tenants",
      [row(TA, "donor"), row(TB, "donor")],
      "donor",
    ],
    ["no membership at all", [], "missionary"],
  ] as const)("fails closed for %s", async (_name, rows, roleClass) => {
    expect(await resolve(fakeSupabase({ rows }), roleClass)).toBeNull();
  });

  it("fails closed with no surface class, without a read", async () => {
    const rpcCalls: RpcCall[] = [];
    expect(
      await resolve(
        fakeSupabase({ rows: [row(TA, "staff", "hr")], rpcCalls }),
        null,
      ),
    ).toBeNull();
    expect(rpcCalls).toEqual([]);
  });

  it.each([
    ["the RPC returns an error", { returnError: new Error("rpc down") }],
    ["the RPC throws", { throwError: new Error("rpc threw") }],
    ["the RPC returns a non-array", { rows: { id: "x" } }],
    [
      "a row is malformed",
      { rows: [{ ...row(TA, "staff", "hr"), role: "admin" }] },
    ],
  ])("fails closed when %s", async (_name, options) => {
    expect(await resolve(fakeSupabase(options))).toBeNull();
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

  it("distinguishes no assignment from a query failure while denying both", async () => {
    expect(await resolve(fakeSupabase({ rows: [] }))).toBeNull();
    expect(console.warn).toHaveBeenLastCalledWith({
      event: "auth_access_diagnostic",
      stage: "membership_read",
      outcome: "no_assignment",
      code: null,
    });

    expect(
      await resolve(
        fakeSupabase({
          returnError: { code: "42501", message: "private query detail" },
        }),
      ),
    ).toBeNull();
    expect(console.warn).toHaveBeenLastCalledWith({
      event: "auth_access_diagnostic",
      stage: "membership_read",
      outcome: "query_failed",
      code: "42501",
    });
    expect(console.warn).toHaveBeenCalledTimes(2);
  });

  it("reports a request with no surface class", async () => {
    expect(await resolve(fakeSupabase({}), null)).toBeNull();
    expect(console.warn).toHaveBeenCalledExactlyOnceWith({
      event: "auth_access_diagnostic",
      stage: "surface",
      outcome: "no_role_class",
      code: null,
    });
  });

  it("keeps a thrown RPC failure closed with an other-code event", async () => {
    expect(
      await resolve(
        fakeSupabase({ throwError: new Error("private thrown detail") }),
      ),
    ).toBeNull();
    expect(console.warn).toHaveBeenCalledExactlyOnceWith({
      event: "auth_access_diagnostic",
      stage: "membership_read",
      outcome: "query_failed",
      code: "other",
    });
  });

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
        await resolve(fakeSupabase({ returnError: queryError })),
      ).toBeNull();
      expect(readCode).not.toHaveBeenCalled();
      expect(console.warn).not.toHaveBeenCalled();
    },
  );

  it("uses normalized preview classification and stays silent for a valid snapshot", async () => {
    vi.stubEnv("VERCEL_ENV", " Preview ");
    vi.stubEnv("VERCEL_TARGET_ENV", "");
    expect(
      await resolve(fakeSupabase({ rows: [row(TA, "donor")] }), "donor"),
    ).not.toBeNull();
    expect(console.warn).not.toHaveBeenCalled();

    await resolve(fakeSupabase({ rows: [] }), "donor");
    expect(console.warn).toHaveBeenCalledExactlyOnceWith({
      event: "auth_access_diagnostic",
      stage: "membership_read",
      outcome: "no_assignment",
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
      await resolve(
        fakeSupabase({ returnError: { code, message: "private error" } }),
      ),
    ).toBeNull();
    expect(console.warn).toHaveBeenCalledExactlyOnceWith({
      event: "auth_access_diagnostic",
      stage: "membership_read",
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
        await resolve(
          fakeSupabase({
            returnError: {
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
        ),
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
        await resolve(fakeSupabase({ returnError: queryError })),
      ).toBeNull();
      expect(console.warn).toHaveBeenCalledExactlyOnceWith({
        event: "auth_access_diagnostic",
        stage: "membership_read",
        outcome: "query_failed",
        code: "other",
      });
    },
  );

  it.each(["no assignment", "membership", "exception"])(
    "preserves the denied %s result when logging throws",
    async (kind) => {
      vi.mocked(console.warn).mockImplementation(() => {
        throw new Error("private sink detail");
      });
      const supabase =
        kind === "no assignment"
          ? fakeSupabase({ rows: [] })
          : kind === "membership"
            ? fakeSupabase({ returnError: new Error("rpc down") })
            : fakeSupabase({ throwError: new Error("rpc threw") });
      await expect(resolve(supabase)).resolves.toBeNull();
      expect(console.warn).toHaveBeenCalledTimes(1);
    },
  );
});
