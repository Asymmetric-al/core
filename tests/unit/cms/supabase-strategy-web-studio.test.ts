import { createE2EAuthCookieValue } from "@asym/auth/e2e-auth";
import {
  signWebStudioSelection,
  WEB_STUDIO_TENANT_COOKIE,
} from "@asym/auth/web-studio";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Payload's strategy under the Web Studio cookie (plan 5.2 and 6.5; AL-2675,
 * WP2b slice C). The cookie's tenant and row are proposals to the principal
 * resolver, over the caller's live staff rows on every request; nothing falls
 * back to a profile, a first membership or another surface's address. A REST
 * write must come from a document rendered for the same tenant and row.
 */

type Strategy = {
  authenticate: (args: {
    headers: Headers;
    payload: unknown;
    req?: { method?: string; context: Record<string, unknown> };
    isGraphQL?: boolean;
  }) => Promise<{ user: Record<string, unknown> | null }>;
};

const SECRET = "unit-test-payload-secret";
const USER = "00000000-0000-4000-8000-0000000000c1";
const TA = "00000000-0000-0000-0000-000000000001";
const TB = "00000000-0000-0000-0000-000000000002";

let nextId = 0x300;
function row(
  tenant: string,
  role: "donor" | "missionary" | "staff" = "staff",
  isTenantAdmin = false,
) {
  nextId += 1;
  return {
    id: `00000000-0000-4000-8000-${nextId.toString(16).padStart(12, "0")}`,
    user_id: USER,
    tenant_id: tenant,
    role,
    staff_role: role === "staff" ? "development" : null,
    is_tenant_admin: isTenantAdmin,
    updated_at: "2026-11-18T09:00:00.000000+00:00",
  };
}

let createSupabaseAuthStrategy: (deps?: Record<string, unknown>) => Strategy;
let readWebStudioRefusal: (req: unknown) => string | null;

beforeAll(async () => {
  ({ createSupabaseAuthStrategy } =
    (await import("../../../apps/admin/src/cms/auth/supabase-strategy")) as never);
  ({ readWebStudioRefusal } =
    (await import("../../../apps/admin/src/cms/auth/web-studio-refusal")) as never);
});

function fakes({
  rows,
  signedIn = true,
  readFails = false,
}: {
  rows: ReturnType<typeof row>[];
  signedIn?: boolean;
  readFails?: boolean;
}) {
  const reads = { assignments: 0 };
  const client = {
    auth: {
      getUser: vi.fn(async () => ({
        data: { user: signedIn ? { id: USER, email: "s@example.org" } : null },
      })),
    },
    rpc: vi.fn(async (fn: string) => {
      if (fn !== "current_user_assignments") throw new Error(fn);
      reads.assignments += 1;
      return readFails
        ? { data: null, error: { message: "connection reset" } }
        : { data: rows, error: null };
    }),
    from: vi.fn(),
  };
  const payload = {
    find: vi.fn(async () => ({ docs: [] })),
    create: vi.fn(async (options: { data: object }) => ({
      id: 5,
      ...options.data,
    })),
    update: vi.fn(async (options: { id: unknown; data: object }) => ({
      id: options.id,
      ...options.data,
    })),
  };
  const strategy = createSupabaseAuthStrategy({
    createSupabaseClient: vi.fn(() => client),
  });
  return { strategy, payload, reads };
}

async function webStudioCookie(tenantId: string, assignmentId: string) {
  return `${WEB_STUDIO_TENANT_COOKIE}=${await signWebStudioSelection({ tenantId, assignmentId }, SECRET)}`;
}

function req(method: string) {
  return { method, context: {} as Record<string, unknown> };
}

beforeEach(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
  process.env.PAYLOAD_SECRET = SECRET;
  delete process.env.E2E_AUTH_BYPASS;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
});

describe("the organization a Web Studio request acts in", () => {
  it("is the one the cookie selects, for a person with staff rows in two organizations", async () => {
    const a = row(TA);
    const b = row(TB, "staff", true);
    const { strategy, payload } = fakes({ rows: [a, b] });

    for (const [tenant, assignment, isTenantAdmin] of [
      [TA, a.id, false],
      [TB, b.id, true],
    ] as const) {
      const { user } = await strategy.authenticate({
        headers: new Headers({
          cookie: `sb=1; ${await webStudioCookie(tenant, assignment)}`,
        }),
        payload,
      });
      expect(user).toMatchObject({
        tenantId: tenant,
        assignmentId: assignment,
        isTenantAdmin,
      });
    }
  });

  it("is nothing for that person without a cookie: the resolver never guesses", async () => {
    const { strategy, payload } = fakes({ rows: [row(TA), row(TB)] });
    const request = req("GET");

    const { user } = await strategy.authenticate({
      headers: new Headers({ cookie: "sb=1" }),
      payload,
      req: request,
    });

    expect(user).toBeNull();
    expect(readWebStudioRefusal(request)).toBe("no_selection");
  });

  it("is never what a client's tenant or assignment headers name, so a path the proxy skips selects nothing either", async () => {
    const b = row(TB);
    const { strategy, payload } = fakes({ rows: [row(TA), b] });

    for (const method of ["GET", "PATCH"]) {
      const request = req(method);
      const { user } = await strategy.authenticate({
        headers: new Headers({
          cookie: "sb=1",
          "x-asym-tenant": TB,
          "x-asym-assignment": b.id,
          "x-asym-role-class": "staff",
        }),
        payload,
        req: request,
      });
      expect(user, method).toBeNull();
      expect(readWebStudioRefusal(request)).toBe("no_selection");
    }
  });

  it("is the one staff row of a person who needs no choice", async () => {
    const { strategy, payload } = fakes({ rows: [row(TA), row(TB, "donor")] });

    const { user } = await strategy.authenticate({
      headers: new Headers({ cookie: "sb=1" }),
      payload,
    });

    expect(user).toMatchObject({ tenantId: TA });
  });

  it("is nothing when the cookie is forged, names a row the person does not hold, or a row since revoked", async () => {
    const a = row(TA);
    const revoked = row(TB);
    const { strategy, payload } = fakes({ rows: [a] });

    for (const cookie of [
      await webStudioCookie(TB, revoked.id),
      await webStudioCookie(TB, a.id),
      `${WEB_STUDIO_TENANT_COOKIE}=v1.${TA}.${a.id}.forged`,
    ]) {
      const request = req("GET");
      const { user } = await strategy.authenticate({
        headers: new Headers({ cookie: `sb=1; ${cookie}` }),
        payload,
        req: request,
      });
      // One staff row left is no licence to fall back to it.
      expect(user).toBeNull();
      expect(readWebStudioRefusal(request)).toBe("no_selection");
    }
  });

  // Last read of the first release, L3 (JR2's rule in Web Studio): rows
  // that could not be read are an ordinary failure, unmarked, never "choose
  // an organization", which would ask a valid editor to choose again.
  it("is nothing, unmarked, when the person's rows cannot be read", async () => {
    const a = row(TA);
    const { strategy, payload } = fakes({ rows: [a], readFails: true });
    const request = req("GET");

    const { user } = await strategy.authenticate({
      headers: new Headers({
        cookie: `sb=1; ${await webStudioCookie(TA, a.id)}`,
      }),
      payload,
      req: request,
    });

    expect(user).toBeNull();
    expect(readWebStudioRefusal(request)).toBeNull();
  });

  it("is read from live rows on every request, so a revoked row stops working at the next one", async () => {
    const a = row(TA);
    const rows = [a, row(TB)];
    const { strategy, payload, reads } = fakes({ rows });
    const headers = new Headers({
      cookie: `sb=1; ${await webStudioCookie(TA, a.id)}`,
    });

    expect(
      (await strategy.authenticate({ headers, payload })).user,
    ).not.toBeNull();
    rows.splice(0, 1);
    expect((await strategy.authenticate({ headers, payload })).user).toBeNull();
    expect(reads.assignments).toBe(2);
  });

  it("marks a request with no session, so Payload answers it 401 and never redirects", async () => {
    const { strategy, payload } = fakes({ rows: [row(TA)], signedIn: false });
    const request = req("PATCH");

    const { user } = await strategy.authenticate({
      headers: new Headers({ cookie: "sb=expired" }),
      payload,
      req: request,
    });

    expect(user).toBeNull();
    expect(readWebStudioRefusal(request)).toBe("no_session");
  });

  it("takes an E2E bypass identity's organization from the cookie too, never from its signed default", async () => {
    process.env.E2E_AUTH_BYPASS = "true";
    process.env.E2E_AUTH_SECRET = "cms-strategy-test-secret";
    process.env.E2E_AUTH_ALLOWED_SUPABASE_REFS = "example";
    const memberships = [
      {
        id: "00000000-0000-4000-8000-0000000e2e31",
        tenantId: TA,
        role: "staff" as const,
        staffRole: "development" as const,
        isTenantAdmin: false,
      },
      {
        id: "00000000-0000-4000-8000-0000000e2e32",
        tenantId: TB,
        role: "staff" as const,
        staffRole: "development" as const,
        isTenantAdmin: false,
      },
    ];
    const e2e = `asym_e2e_auth_admin=${await createE2EAuthCookieValue({
      userId: "00000000-0000-4000-8000-0000000e2e30",
      role: "staff",
      tenantId: TA,
      memberships,
    })}`;
    const { strategy, payload } = fakes({ rows: [], signedIn: false });
    const host = "localhost:3030";

    const none = await strategy.authenticate({
      headers: new Headers({ cookie: e2e, host }),
      payload,
    });
    expect(none.user).toBeNull();

    const chosen = await strategy.authenticate({
      headers: new Headers({
        cookie: `${e2e}; ${await webStudioCookie(TB, memberships[1]!.id)}`,
        host,
      }),
      payload,
    });
    expect(chosen.user).toMatchObject({ tenantId: TB });
  });
});

describe("a REST call from a Web Studio document", () => {
  async function setup() {
    const a = row(TA);
    const b = row(TB);
    const harness = fakes({ rows: [a, b] });
    const cookie = `sb=1; ${await webStudioCookie(TB, b.id)}`;
    return { ...harness, a, b, cookie };
  }

  it("may write when the document was rendered for the cookie's tenant and row", async () => {
    const { strategy, payload, b, cookie } = await setup();

    const { user } = await strategy.authenticate({
      headers: new Headers({
        cookie,
        "x-asym-tenant": TB,
        "x-asym-assignment": b.id,
      }),
      payload,
      req: req("PATCH"),
    });

    expect(user).toMatchObject({ tenantId: TB });
  });

  it("is refused when the document was rendered for another tenant: the form in the other tab is not retargeted", async () => {
    const { strategy, payload, a, cookie } = await setup();

    for (const method of ["POST", "PATCH", "PUT", "DELETE", "GET"]) {
      const request = req(method);
      const { user } = await strategy.authenticate({
        headers: new Headers({
          cookie,
          "x-asym-tenant": TA,
          "x-asym-assignment": a.id,
        }),
        payload,
        req: request,
      });
      expect(user, method).toBeNull();
      expect(readWebStudioRefusal(request)).toBe("scope_mismatch");
    }
  });

  it("is refused when a write names no document at all, and when it names only half of one", async () => {
    const { strategy, payload, b, cookie } = await setup();

    for (const extra of [
      {},
      { "x-asym-tenant": TB },
      { "x-asym-assignment": b.id },
    ]) {
      const request = req("POST");
      const { user } = await strategy.authenticate({
        headers: new Headers({ cookie, ...extra }),
        payload,
        req: request,
      });
      expect(user).toBeNull();
      expect(readWebStudioRefusal(request)).toBe("scope_mismatch");
    }
  });

  it("over GraphQL must name its document like a REST write, until WP6 removes the route (council C4)", async () => {
    const { strategy, payload, b, cookie } = await setup();

    const unnamed = req("POST");
    const refused = await strategy.authenticate({
      headers: new Headers({ cookie }),
      payload,
      req: unnamed,
      isGraphQL: true,
    });
    expect(refused.user).toBeNull();
    expect(readWebStudioRefusal(unnamed)).toBe("scope_mismatch");

    const named = await strategy.authenticate({
      headers: new Headers({
        cookie,
        "x-asym-tenant": TB,
        "x-asym-assignment": b.id,
      }),
      payload,
      req: req("POST"),
      isGraphQL: true,
    });
    expect(named.user).toMatchObject({ tenantId: TB });
  });

  it("may read without naming a document, as an image or a link does", async () => {
    const { strategy, payload, cookie } = await setup();

    const { user } = await strategy.authenticate({
      headers: new Headers({ cookie }),
      payload,
      req: req("GET"),
    });

    expect(user).toMatchObject({ tenantId: TB });
  });
});
