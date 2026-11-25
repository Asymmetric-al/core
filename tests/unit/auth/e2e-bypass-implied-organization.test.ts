import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  createE2EAuthCookieValue,
  E2E_AUTH_COOKIE_NAMES,
  E2E_BYPASS_ASSIGNMENT_ID,
  listE2EAuthMemberships,
  type E2EAuthSession,
} from "../../../packages/auth/e2e-auth";
import { listE2EAuthAssignments } from "../../../packages/auth/principal/e2e-assignments";

const T = "6f1c2a4e-9b3d-4c5e-8f7a-0b1c2d3e4f5a";

const NOT_CANONICAL: Array<[string, string | null]> = [
  ["null", null],
  ["the empty string", ""],
  ["spaces", "   "],
  ["a leading space", ` ${T}`],
  ["a trailing tab", `${T}\t`],
  ["a trailing no-break space", `${T} `],
  ["a leading zero-width space", `​${T}`],
  ["upper-case hex", T.toUpperCase()],
  ["a non-UUID", "tenant-123"],
];

const mockedCreateServerClient = vi.hoisted(() => vi.fn());
const mockedCookieGet = vi.hoisted(() => vi.fn());

vi.mock("next/server", () => ({ connection: () => Promise.resolve() }));
vi.mock("next/headers", () => ({
  cookies: () =>
    Promise.resolve({ get: mockedCookieGet, getAll: () => [], set: vi.fn() }),
  headers: () =>
    Promise.resolve({
      get: (name: string) => (name === "host" ? "localhost:3000" : null),
    }),
}));
vi.mock(import("@supabase/ssr"), async (importOriginal) => ({
  ...(await importOriginal()),
  createServerClient: mockedCreateServerClient,
}));
vi.mock("@asym/database/supabase/config", () => ({
  getSupabasePublicConfig: () => ({
    url: "https://example.supabase.co",
    key: "example-anon-key",
    keyType: "anon",
  }),
}));
vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: () => ({ client: null, error: null }),
}));

const original = {
  bypass: process.env.E2E_AUTH_BYPASS,
  nodeEnv: process.env.NODE_ENV,
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  secret: process.env.E2E_AUTH_SECRET,
};

function restore(name: string, value: string | undefined) {
  if (value === undefined) delete process.env[name];
  else process.env[name] = value;
}

beforeEach(() => {
  process.env.E2E_AUTH_BYPASS = "true";
  process.env.NODE_ENV = "development";
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  delete process.env.E2E_AUTH_SECRET;
  mockedCookieGet.mockReset();
  mockedCreateServerClient.mockReturnValue({
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
  });
});

afterEach(() => {
  restore("E2E_AUTH_BYPASS", original.bypass);
  restore("NODE_ENV", original.nodeEnv);
  restore("NEXT_PUBLIC_SUPABASE_URL", original.url);
  restore("E2E_AUTH_SECRET", original.secret);
});

function session(
  tenantId: string | null,
  role: E2EAuthSession["role"] = "donor",
): E2EAuthSession {
  return { userId: `e2e-${role}-user`, role, tenantId };
}

describe("AL-2676: a bypass session implies a membership only in a byte-exact canonical tenant", () => {
  it.each(NOT_CANONICAL)(
    "implies no membership and no assignment for %s, so the bypass names no demo organization",
    (_label, tenantId) => {
      for (const role of [
        "donor",
        "missionary",
        "staff",
        "admin",
        "super_admin",
      ] as const) {
        expect(listE2EAuthMemberships(session(tenantId, role))).toEqual([]);
        expect(listE2EAuthAssignments(session(tenantId, role))).toEqual([]);
      }
    },
  );

  it("guard: a canonical tenant without a list gives one membership in it, per role", () => {
    expect(listE2EAuthMemberships(session(T, "donor"))).toEqual([
      {
        id: E2E_BYPASS_ASSIGNMENT_ID,
        tenantId: T,
        role: "donor",
        staffRole: null,
        isTenantAdmin: false,
      },
    ]);
    expect(listE2EAuthMemberships(session(T, "missionary"))).toEqual([
      {
        id: E2E_BYPASS_ASSIGNMENT_ID,
        tenantId: T,
        role: "missionary",
        staffRole: null,
        isTenantAdmin: false,
      },
    ]);
    expect(listE2EAuthMemberships(session(T, "staff"))).toEqual([
      {
        id: E2E_BYPASS_ASSIGNMENT_ID,
        tenantId: T,
        role: "staff",
        staffRole: "development",
        isTenantAdmin: false,
      },
    ]);
    for (const role of ["admin", "super_admin"] as const) {
      expect(listE2EAuthMemberships(session(T, role))).toEqual([
        {
          id: E2E_BYPASS_ASSIGNMENT_ID,
          tenantId: T,
          role: "staff",
          staffRole: "development",
          isTenantAdmin: true,
        },
      ]);
    }
  });

  it("guard: an explicit list wins, even an empty one", () => {
    expect(
      listE2EAuthMemberships({ ...session(T, "donor"), memberships: [] }),
    ).toEqual([]);
    expect(
      listE2EAuthMemberships({ ...session(null, "donor"), memberships: [] }),
    ).toEqual([]);
  });
});

async function contextsFor(cookieValue: string) {
  mockedCookieGet.mockImplementation((name: string) =>
    name === E2E_AUTH_COOKIE_NAMES.donor
      ? { name, value: cookieValue }
      : undefined,
  );
  const { getAuthContext } = await import("../../../packages/auth/context");
  const ambient = await getAuthContext();
  const forwarded = await getAuthContext(
    new Request("http://localhost:3000/api/donor/portal", {
      headers: { cookie: `${E2E_AUTH_COOKIE_NAMES.donor}=${cookieValue}` },
    }),
  );
  return { ambient, forwarded };
}

describe("AL-2676: getAuthContext treats a donor bypass cookie naming no canonical tenant as one with no memberships", () => {
  it.each(NOT_CANONICAL)(
    "gives for %s what memberships: [] gives, signed out, not the seed's organization",
    async (_label, tenantId) => {
      const empty = await contextsFor(
        await createE2EAuthCookieValue({
          ...session(T, "donor"),
          memberships: [],
        }),
      );
      const bad = await contextsFor(
        await createE2EAuthCookieValue(session(tenantId, "donor")),
      );

      expect(empty.ambient).toMatchObject({
        isAuthenticated: false,
        tenantId: null,
      });
      expect(empty.forwarded).toMatchObject({
        isAuthenticated: false,
        tenantId: null,
      });
      expect(bad.ambient).toEqual(empty.ambient);
      expect(bad.forwarded).toEqual(empty.forwarded);
    },
  );
});
