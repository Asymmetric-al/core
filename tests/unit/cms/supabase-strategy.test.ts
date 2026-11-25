import { readFileSync } from "node:fs";

import { createE2EAuthCookieValue } from "@asym/auth/e2e-auth";
import {
  signWebStudioSelection,
  WEB_STUDIO_TENANT_COOKIE,
} from "@asym/auth/web-studio";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

type Strategy = {
  authenticate: (args: Record<string, unknown>) => Promise<{
    user: Record<string, unknown> | null;
  }>;
};
type StrategyFactory = (dependencies?: Record<string, unknown>) => Strategy;

const USER = "00000000-0000-4000-8000-0000000000a1";
const TENANT = "00000000-0000-4000-8000-000000000101";
const ASSIGNMENT = "00000000-0000-4000-8000-000000000201";
const STRATEGY = "apps/admin/src/cms/auth/supabase-strategy.ts";

let createSupabaseAuthStrategy: StrategyFactory;
let getTenantContext: (req: unknown) => Record<string, unknown>;

beforeAll(async () => {
  ({ createSupabaseAuthStrategy } =
    (await import("../../../apps/admin/src/cms/auth/supabase-strategy")) as unknown as {
      createSupabaseAuthStrategy: StrategyFactory;
    });
  ({ getTenantContext } =
    (await import("../../../apps/admin/src/cms/access/tenant-context")) as unknown as {
      getTenantContext: typeof getTenantContext;
    });
});

beforeEach(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "service-key-sentinel";
  delete process.env.E2E_AUTH_BYPASS;
});

function supabaseFakes(email = "staff@example.org", userId = USER) {
  const calls = { getUser: 0, rpc: [] as string[], from: [] as string[] };
  const client = {
    auth: {
      getUser: vi.fn(async () => {
        calls.getUser += 1;
        return { data: { user: { id: userId, email } } };
      }),
    },
    rpc: vi.fn(async (fn: string) => {
      calls.rpc.push(fn);
      return {
        data: [
          {
            id: ASSIGNMENT,
            user_id: userId,
            tenant_id: TENANT,
            role: "staff",
            staff_role: "development",
            is_tenant_admin: true,
            updated_at: "2026-11-25T09:00:00.000000+00:00",
          },
        ],
        error: null,
      };
    }),
    from: vi.fn((table: string) => {
      calls.from.push(table);
      throw new Error(`unexpected table read: ${table}`);
    }),
  };
  const createSupabaseClient = vi.fn(() => client);
  return { calls, createSupabaseClient };
}

function payloadFake(
  rows: Array<Record<string, unknown> | null>,
  createImpl?: (
    data: Record<string, unknown>,
  ) => Promise<Record<string, unknown>>,
) {
  const finds = [...rows];
  const find = vi.fn(async (options: { collection: string }) => {
    if (options.collection !== "principal-links") {
      throw new Error(`unexpected collection ${options.collection}`);
    }
    const next = finds.length > 1 ? finds.shift() : finds[0];
    return { docs: next ? [next] : [] };
  });
  const create = vi.fn(
    async (options: { collection: string; data: Record<string, unknown> }) =>
      createImpl
        ? createImpl(options.data)
        : {
            ...options.data,
            createdAt: "2026-11-25T00:00:00.000Z",
            updatedAt: "2026-11-25T00:00:00.000Z",
          },
  );
  const update = vi.fn(
    async (options: { id: string; data: Record<string, unknown> }) => ({
      id: options.id,
      ...options.data,
      createdAt: "2026-11-25T00:00:00.000Z",
      updatedAt: "2026-11-25T00:00:01.000Z",
    }),
  );
  return { find, create, update, findByID: vi.fn(), delete: vi.fn() };
}

const request = (method = "GET") => ({ method, context: {} });

describe("test 8: the Web Studio strategy reads Core once and links the login through the service port", () => {
  it("makes one getUser and one assignments read per REST request, reads no table and touches no service key", async () => {
    const supabase = supabaseFakes();
    const payload = payloadFake([
      { id: USER, email: "staff@example.org", createdAt: "x", updatedAt: "x" },
    ]);
    const strategy = createSupabaseAuthStrategy({
      createSupabaseClient: supabase.createSupabaseClient,
    });
    const { user } = await strategy.authenticate({
      headers: new Headers({ cookie: "sb-token=1" }),
      payload,
      req: request(),
    });
    expect(user).not.toBeNull();
    expect(supabase.calls.getUser).toBe(1);
    expect(supabase.calls.rpc).toEqual(["current_user_assignments"]);
    expect(supabase.calls.from).toEqual([]);
    expect(supabase.createSupabaseClient).toHaveBeenCalledTimes(1);
    expect(supabase.createSupabaseClient.mock.calls[0]?.[1]).toBe("anon-key");
    expect(payload.create).not.toHaveBeenCalled();
    expect(payload.update).not.toHaveBeenCalled();
    const source = readFileSync(STRATEGY, "utf8");
    expect(source).not.toMatch(
      /SERVICE_ROLE_KEY|@supabase\/supabase-js|"tenants"|findOrCreateCmsTenant|findOrSyncCmsUser/,
    );
  });

  it("signs the person in as their principal-links row with the assignment's tenant, row, sub-role and admin flag", async () => {
    const supabase = supabaseFakes();
    const payload = payloadFake([
      { id: USER, email: "staff@example.org", createdAt: "x", updatedAt: "x" },
    ]);
    const { user } = await createSupabaseAuthStrategy({
      createSupabaseClient: supabase.createSupabaseClient,
    }).authenticate({ headers: new Headers(), payload, req: request() });
    expect(user).toMatchObject({
      id: USER,
      collection: "principal-links",
      tenantId: TENANT,
      assignmentId: ASSIGNMENT,
      staffRole: "development",
      isTenantAdmin: true,
    });
    expect(user).not.toHaveProperty("role");
    expect(user).not.toHaveProperty("publicTenantId");
    expect(getTenantContext({ user })).toMatchObject({
      tenantId: TENANT,
      staffRole: "development",
      isTenantAdmin: true,
    });
  });

  it("creates exactly one row for a new login, under the login's UUID", async () => {
    const supabase = supabaseFakes();
    const payload = payloadFake([null]);
    await createSupabaseAuthStrategy({
      createSupabaseClient: supabase.createSupabaseClient,
    }).authenticate({ headers: new Headers(), payload, req: request() });
    expect(payload.create).toHaveBeenCalledTimes(1);
    expect(payload.create.mock.calls[0]?.[0]).toMatchObject({
      collection: "principal-links",
      data: { id: USER, email: "staff@example.org" },
      overrideAccess: true,
    });
    expect(payload.update).not.toHaveBeenCalled();
  });

  it("re-reads and returns the row when the create meets a unique violation", async () => {
    const supabase = supabaseFakes();
    const row = {
      id: USER,
      email: "staff@example.org",
      createdAt: "x",
      updatedAt: "x",
    };
    const payload = payloadFake([null, row], async () => {
      throw Object.assign(new Error("The following field is invalid: id"), {
        name: "ValidationError",
        data: { errors: [{ path: "id", message: "Value must be unique" }] },
      });
    });
    const { user } = await createSupabaseAuthStrategy({
      createSupabaseClient: supabase.createSupabaseClient,
    }).authenticate({ headers: new Headers(), payload, req: request() });
    expect(payload.create).toHaveBeenCalledTimes(1);
    expect(payload.find).toHaveBeenCalledTimes(2);
    expect(user).toMatchObject({ id: USER, collection: "principal-links" });
  });

  it("signs in nobody, and reads and writes no principal-links row, for a login whose id is not a UUID (the row is keyed by the login UUID)", async () => {
    const supabase = supabaseFakes("demo@example.org", "e2e-admin-user");
    const payload = payloadFake([null]);
    const { user } = await createSupabaseAuthStrategy({
      createSupabaseClient: supabase.createSupabaseClient,
    }).authenticate({ headers: new Headers(), payload, req: request() });
    expect(user).toBeNull();
    expect(payload.find).not.toHaveBeenCalled();
    expect(payload.create).not.toHaveBeenCalled();
    expect(payload.update).not.toHaveBeenCalled();
  });

  it("signs in nobody, and reads and writes no principal-links row, for an E2E bypass login whose id is not a UUID", async () => {
    const secret = "unit-test-payload-secret";
    process.env.E2E_AUTH_BYPASS = "true";
    process.env.E2E_AUTH_SECRET = "cms-strategy-test-secret";
    process.env.E2E_AUTH_ALLOWED_SUPABASE_REFS = "example";
    process.env.PAYLOAD_SECRET = secret;
    const membership = {
      id: ASSIGNMENT,
      tenantId: TENANT,
      role: "staff" as const,
      staffRole: "development" as const,
      isTenantAdmin: true,
    };
    const selection = `${WEB_STUDIO_TENANT_COOKIE}=${await signWebStudioSelection(
      { tenantId: TENANT, assignmentId: ASSIGNMENT },
      secret,
    )}`;
    const signIn = async (userId: string) => {
      const e2e = `asym_e2e_auth_admin=${await createE2EAuthCookieValue({
        userId,
        role: "admin",
        tenantId: TENANT,
        memberships: [membership],
      })}`;
      const payload = payloadFake([null]);
      const { user } = await createSupabaseAuthStrategy({
        createSupabaseClient: supabaseFakes().createSupabaseClient,
      }).authenticate({
        headers: new Headers({
          cookie: `${e2e}; ${selection}`,
          host: "localhost:3030",
        }),
        payload,
        req: request(),
      });
      return { user, payload };
    };

    const uuidLogin = await signIn(USER);
    expect(uuidLogin.user).toMatchObject({
      id: USER,
      collection: "principal-links",
    });

    const other = await signIn("e2e-admin-user");
    expect(other.user).toBeNull();
    expect(other.payload.find).not.toHaveBeenCalled();
    expect(other.payload.create).not.toHaveBeenCalled();
    expect(other.payload.update).not.toHaveBeenCalled();
  });

  it("updates the email only when it differs, and never deletes the row", async () => {
    const supabase = supabaseFakes("new@example.org");
    const payload = payloadFake([
      { id: USER, email: "old@example.org", createdAt: "x", updatedAt: "x" },
    ]);
    await createSupabaseAuthStrategy({
      createSupabaseClient: supabase.createSupabaseClient,
    }).authenticate({ headers: new Headers(), payload, req: request() });
    expect(payload.update).toHaveBeenCalledTimes(1);
    expect(payload.update.mock.calls[0]?.[0]).toMatchObject({
      id: USER,
      collection: "principal-links",
      data: { email: "new@example.org" },
    });
    expect(payload.delete).not.toHaveBeenCalled();
  });
});
