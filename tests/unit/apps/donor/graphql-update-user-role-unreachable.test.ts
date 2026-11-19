/**
 * PR #2720 review (AL-2675): GraphQL `updateUserRole` runs
 * `atomic_update_user_role_with_audit`, which writes only `profiles.role`.
 * Since WP2a that column grants and revokes no application access, so the
 * command must stay unreachable until WP2c deletes it and builds plan 5.4's
 * membership command. This pins that no person can run it.
 *
 * The person is the strongest case: a flagged tenant administrator (a staff
 * row with the flag) who is also a donor in the same organization. GraphQL is
 * mounted in the donor app only (tests/unit/apps/staff-handlers-mounted-on-
 * staff-surface.test.ts pins that). The donor proxy fixes the donor class on
 * every `/api` path, the principal resolver then chooses the donor row, and a
 * donor row holds no `people.manage_members`, so the resolver refuses before
 * the command or any read with the service key.
 *
 * Real code from the client's request on: the donor proxy, the donor app's
 * route, the GraphQL handler, `getAuthContext` and the principal resolver.
 * Doubled: Supabase's public config and clients. The caller's client answers
 * the user, the profile id and the person's two live rows; the service-key
 * client records every call. A control sends the same person's request with
 * the staff class and reaches the command, so the refusal is the surface's.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  ASSIGNMENT_HEADER,
  ROLE_CLASS_HEADER,
} from "../../../../packages/auth/request-headers";

const TENANT = "11111111-1111-4111-8111-111111111111";
const USER = "22222222-2222-4222-8222-222222222222";
const PROFILE = "33333333-3333-4333-8333-333333333333";
const STAFF_ROW = "44444444-4444-4444-8444-444444444444";
const DONOR_ROW = "55555555-5555-4555-8555-555555555555";
const TARGET = "66666666-6666-4666-8666-666666666666";
const TOKEN = "caller-jwt";

/** The person's live rows, as `public.current_user_assignments()` returns them. */
const ROWS = [
  {
    id: STAFF_ROW,
    user_id: USER,
    tenant_id: TENANT,
    role: "staff",
    staff_role: "development",
    is_tenant_admin: true,
    updated_at: "2026-11-18T00:00:00Z",
  },
  {
    id: DONOR_ROW,
    user_id: USER,
    tenant_id: TENANT,
    role: "donor",
    staff_role: null,
    is_tenant_admin: false,
    updated_at: "2026-11-18T00:00:00Z",
  },
];

const h = vi.hoisted(() => ({
  createServerClient: vi.fn(),
  createClient: vi.fn(),
  getSupabasePublicConfig: vi.fn(),
  resolveUserRole: vi.fn(),
  adminRpc: vi.fn(),
  adminFrom: vi.fn(),
}));

vi.mock("@supabase/ssr", () => ({ createServerClient: h.createServerClient }));
vi.mock("@supabase/supabase-js", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  createClient: h.createClient,
}));
vi.mock("@asym/database/supabase/config", () => ({
  getSupabasePublicConfig: h.getSupabasePublicConfig,
}));
vi.mock("@asym/auth/resolve-user-role", () => ({
  resolveUserRoleFromDatabase: h.resolveUserRole,
}));
vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: () => ({
    client: { rpc: h.adminRpc, from: h.adminFrom },
    error: null,
  }),
}));

/** The caller's own client: the user, the profile id and the live rows. */
function callerClient() {
  const profiles = {
    select: () => profiles,
    eq: () => profiles,
    single: async () => ({ data: { id: PROFILE }, error: null }),
  };
  return {
    auth: {
      getUser: vi.fn(async (token?: string) =>
        token === TOKEN
          ? {
              data: { user: { id: USER, email: "pat@example.test" } },
              error: null,
            }
          : { data: { user: null }, error: { message: "no session" } },
      ),
    },
    from: vi.fn((table: string) => {
      if (table !== "profiles") throw new Error(`unexpected table ${table}`);
      return profiles;
    }),
    rpc: vi.fn(async (fn: string) =>
      fn === "current_user_assignments"
        ? { data: ROWS, error: null }
        : { data: null, error: { message: `unexpected rpc ${fn}` } },
    ),
  };
}

const MUTATION = `mutation ($input: UpdateUserRoleInput!) {
  updateUserRole(input: $input) { id }
}`;

/**
 * A client's POST to the donor app's `/api/graphql`, passed through the donor
 * proxy. Next.js hands on the request headers the proxy names in
 * `x-middleware-override-headers`, each from `x-middleware-request-<name>`.
 */
async function throughDonorProxy(clientHeaders: Record<string, string>) {
  const { proxy } = await import("../../../../apps/donor/proxy");
  const url = new URL("https://donor.example.test/api/graphql");
  const response = await proxy({
    headers: new Headers({
      "content-type": "application/json",
      authorization: `Bearer ${TOKEN}`,
      ...clientHeaders,
    }),
    nextUrl: url,
    cookies: { getAll: () => [], set: vi.fn(), get: vi.fn() },
  } as never);
  const names = response.headers.get("x-middleware-override-headers");
  expect(names, "the donor proxy hands the request on").not.toBeNull();
  const forwarded = new Headers();
  for (const name of names!.split(",")) {
    const value = response.headers.get(`x-middleware-request-${name}`);
    if (value !== null) forwarded.set(name, value);
  }
  return forwarded;
}

const graphqlRequest = (headers: Headers) =>
  new Request("https://donor.example.test/api/graphql", {
    method: "POST",
    headers,
    body: JSON.stringify({
      query: MUTATION,
      variables: { input: { userId: TARGET, role: "donor" } },
    }),
  });

async function callRoute(headers: Headers) {
  const { POST } = await import("../../../../apps/donor/app/api/graphql/route");
  const response = await POST(graphqlRequest(headers));
  return (await response.json()) as {
    data: { updateUserRole: unknown } | null;
    errors?: unknown[];
  };
}

beforeEach(() => {
  vi.stubEnv("E2E_AUTH_BYPASS", "");
  h.getSupabasePublicConfig.mockReturnValue({
    url: "https://example.supabase.co",
    key: "anon-key",
    keyType: "anon",
  });
  // The proxy's own cookie client finds no session on an API path.
  h.createServerClient.mockReturnValue({
    auth: { getUser: async () => ({ data: { user: null } }) },
  });
  h.createClient.mockImplementation(() => callerClient());
  h.resolveUserRole.mockResolvedValue(null);
  h.adminRpc.mockResolvedValue({ data: null, error: null });
  h.adminFrom.mockImplementation(() => {
    const q = {
      select: () => q,
      eq: () => q,
      single: async () => ({
        data: { id: TARGET, role: "donor", email: null },
        error: null,
      }),
    };
    return q;
  });
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

describe("GraphQL updateUserRole cannot be run through the donor app (PR #2720, AL-2675)", () => {
  it.each([
    ["with no class or row chosen by the client", {}],
    ["when the client sends the staff class", { [ROLE_CLASS_HEADER]: "staff" }],
  ])(
    "acts under the donor row %s, which cannot change roles",
    async (_how, clientHeaders) => {
      const forwarded = await throughDonorProxy(clientHeaders);
      expect(forwarded.get(ROLE_CLASS_HEADER)).toBe("donor");

      const { getAuthContext, hasContextCapability } =
        await import("../../../../packages/auth/context");
      const auth = await getAuthContext(graphqlRequest(forwarded));
      expect(auth.assignment?.assignmentId).toBe(DONOR_ROW);
      expect(hasContextCapability(auth, "people.manage_members")).toBe(false);

      const body = await callRoute(forwarded);
      expect(body.data).toBeNull();
      expect(body.errors).toHaveLength(1);
      expect(h.adminRpc).not.toHaveBeenCalled();
      expect(h.adminFrom).not.toHaveBeenCalled();
    },
  );

  it("refuses the person when the client names the staff row", async () => {
    const forwarded = await throughDonorProxy({
      [ASSIGNMENT_HEADER]: STAFF_ROW,
    });
    expect(forwarded.get(ROLE_CLASS_HEADER)).toBe("donor");

    const { getAuthContext } =
      await import("../../../../packages/auth/context");
    const auth = await getAuthContext(graphqlRequest(forwarded));
    expect(auth.isAuthenticated).toBe(false);
    expect(auth.assignmentDenial).toBe("role_class_mismatch");

    const body = await callRoute(forwarded);
    expect(body.data).toBeNull();
    expect(body.errors).toHaveLength(1);
    expect(h.adminRpc).not.toHaveBeenCalled();
    expect(h.adminFrom).not.toHaveBeenCalled();
  });

  // The control: the staff class a staff surface's proxy would set. The same
  // person then acts under the flagged staff row and the handler runs the
  // command, so the refusals above come from the donor surface, and mounting
  // GraphQL on a staff surface would make the command reachable.
  it("reaches the command under the staff class (control)", async () => {
    const headers = new Headers({
      "content-type": "application/json",
      authorization: `Bearer ${TOKEN}`,
      [ROLE_CLASS_HEADER]: "staff",
    });
    await callRoute(headers);
    expect(h.adminRpc).toHaveBeenCalledWith(
      "atomic_update_user_role_with_audit",
      expect.objectContaining({
        p_profile_id: TARGET,
        p_tenant_id: TENANT,
        p_new_role: "donor",
      }),
    );
  });
});
