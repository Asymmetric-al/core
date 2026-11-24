import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const USER = "00000000-0000-4000-8000-0000000000e1";
const PROFILE = "00000000-0000-4000-8000-0000000000e2";
const TA = "00000000-0000-0000-0000-000000000001";
const TB = "00000000-0000-0000-0000-000000000002";
const NAME = "x-asym-name-tenant";

const state = vi.hoisted(() => ({
  rows: [] as unknown[],
  headersCalls: 0,
}));

function sessionClient() {
  return {
    auth: {
      getUser: async () => ({
        data: { user: { id: USER, email: "admin@example.test" } },
        error: null,
      }),
      getSession: async () => ({
        data: { session: { access_token: "cookie-access-token" } },
        error: null,
      }),
    },
    from: (table: string) => {
      if (table !== "profiles") throw new Error(table);
      return {
        select: () => ({
          eq: () => ({
            single: async () => ({ data: { id: PROFILE }, error: null }),
          }),
        }),
      };
    },
    rpc: async (fn: string) => {
      if (fn !== "current_user_assignments") throw new Error(fn);
      return { data: state.rows, error: null };
    },
  };
}

vi.mock("next/server", () => ({ connection: async () => undefined }));
vi.mock("next/headers", () => ({
  cookies: async () => {
    throw new Error("the assistant has no Next request scope");
  },
  headers: async () => {
    state.headersCalls += 1;
    throw new Error("the assistant has no Next request scope");
  },
}));
vi.mock("@asym/database/supabase/config", () => ({
  getSupabasePublicConfig: () => ({
    url: "https://project.supabase.co",
    key: "public-key",
  }),
}));
vi.mock("@supabase/ssr", () => ({
  createServerClient: () => sessionClient(),
  parseCookieHeader: (header: string) =>
    header
      .split(";")
      .map((pair) => pair.trim())
      .filter(Boolean)
      .map((pair) => {
        const [name, ...value] = pair.split("=");
        return { name: name!, value: value.join("=") };
      }),
}));
vi.mock("@supabase/supabase-js", () => ({
  createClient: () => sessionClient(),
}));

const { resolveAdminEveSessionIdentity } =
  await import("../../../../packages/api/src/eve/session-ownership/identity");

function adminRow(tenantId: string, id: string) {
  return {
    id,
    user_id: USER,
    tenant_id: tenantId,
    role: "staff",
    staff_role: "development",
    is_tenant_admin: true,
    updated_at: "2026-11-25T09:00:00.000000+00:00",
  };
}

const ROW_A = adminRow(TA, "00000000-0000-4000-8000-0000000000a1");

function eveRequest(
  credential: "bearer" | "cookie",
  headers: Record<string, string>,
) {
  return new Request("https://eve.test/eve/v1/session", {
    method: "POST",
    headers: {
      ...(credential === "bearer"
        ? { authorization: "Bearer direct-token" }
        : { cookie: "sb-project-auth-token=base64-e30" }),
      ...headers,
    },
  });
}

beforeEach(() => {
  state.rows = [ROW_A];
  state.headersCalls = 0;
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe.each([
  ["on, inside the staff dashboard's base path", "1", "/admin"],
  ["on, with no base path", "1", ""],
  ["off (switch unset)", undefined, ""],
  ["off (switch 0)", "0", ""],
] as const)(
  "the assistant's routes never read the verified-name header: %s",
  (_label, serve, base) => {
    beforeEach(() => {
      vi.stubEnv("CORE_SERVE_UNDER_PATHS", serve);
      vi.stubEnv("CORE_APP_BASE_PATH", base);
    });

    it.each(["bearer", "cookie"] as const)(
      "a %s request naming another organization resolves exactly as one without the header",
      async (credential) => {
        const without = await resolveAdminEveSessionIdentity(
          eveRequest(credential, {}),
        );
        const foreign = await resolveAdminEveSessionIdentity(
          eveRequest(credential, { [NAME]: TB }),
        );
        const malformed = await resolveAdminEveSessionIdentity(
          eveRequest(credential, { [NAME]: "not-a-uuid" }),
        );
        expect(without).toMatchObject({ ok: true, identity: { tenantId: TA } });
        expect(foreign).toEqual(without);
        expect(malformed).toEqual(without);
        expect(state.headersCalls).toBe(0);
      },
    );
  },
);
