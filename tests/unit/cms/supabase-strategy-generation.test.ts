import { createE2EAuthCookieValue } from "@asym/auth/e2e-auth";
import {
  signWebStudioSelection,
  WEB_STUDIO_TENANT_COOKIE,
} from "@asym/auth/web-studio";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

type Strategy = {
  authenticate: (args: {
    headers: Headers;
    payload: unknown;
    req?: { method?: string; context: Record<string, unknown> };
    isGraphQL?: boolean;
  }) => Promise<{ user: Record<string, unknown> | null }>;
};

const SECRET = "unit-test-strategy-generation-secret";
const USER = "00000000-0000-4000-8000-0000000000c1";
const TA = "00000000-0000-0000-0000-000000000001";
const NAME = "x-asym-name-tenant";
const NAME_GEN = "x-asym-name-generation";
const CLAIM = "x-asym-scope-generation";
const ROW = {
  id: "00000000-0000-4000-8000-000000000a01",
  user_id: USER,
  tenant_id: TA,
  role: "staff",
  staff_role: "development",
  is_tenant_admin: false,
  updated_at: "2026-11-26T09:00:00.000000+00:00",
};

let createSupabaseAuthStrategy: (deps?: Record<string, unknown>) => Strategy;
let readWebStudioRefusal: (req: unknown) => string | null;

beforeAll(async () => {
  ({ createSupabaseAuthStrategy } =
    (await import("../../../apps/admin/src/cms/auth/supabase-strategy")) as never);
  ({ readWebStudioRefusal } =
    (await import("../../../apps/admin/src/cms/auth/web-studio-refusal")) as never);
});

function fakes(signedIn = true) {
  const client = {
    auth: {
      getUser: vi.fn(async () => ({
        data: { user: signedIn ? { id: USER, email: "s@example.org" } : null },
      })),
    },
    rpc: vi.fn(async (fn: string) => {
      if (fn !== "current_user_assignments") throw new Error(fn);
      return { data: [ROW], error: null };
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
  return { strategy, payload };
}

function req(method: string) {
  return { method, context: {} as Record<string, unknown> };
}

let cookie: string;

async function headersWith(extra: Record<string, string>) {
  return new Headers({
    cookie: `sb=1; ${cookie}`,
    [NAME]: TA,
    [NAME_GEN]: "7",
    ...extra,
  });
}

const DOCUMENT = { "x-asym-tenant": TA, "x-asym-assignment": ROW.id };

function expectRefused(
  outcome: { user: unknown },
  request: ReturnType<typeof req>,
  payload: ReturnType<typeof fakes>["payload"],
  refusal: string,
  label: string,
) {
  expect(outcome.user, label).toBeNull();
  expect(readWebStudioRefusal(request), label).toBe(refusal);
  expect(payload.find, label).not.toHaveBeenCalled();
  expect(payload.create, label).not.toHaveBeenCalled();
  expect(payload.update, label).not.toHaveBeenCalled();
}

beforeEach(async () => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");
  vi.stubEnv("PAYLOAD_SECRET", SECRET);
  vi.stubEnv("E2E_AUTH_BYPASS", undefined);
  vi.stubEnv("CORE_SERVE_UNDER_PATHS", "1");
  vi.stubEnv("CORE_APP_BASE_PATH", "/admin");
  cookie = `${WEB_STUDIO_TENANT_COOKIE}=${await signWebStudioSelection({ tenantId: TA, assignmentId: ROW.id }, SECRET)}`;
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("on: every REST call carries the name's generation byte for byte", () => {
  const CLAIMS: Array<[string, Record<string, string>]> = [
    ["6", { [CLAIM]: "6" }],
    ["7 and a no-break space", { [CLAIM]: "7\u00a0" }],
    ["07", { [CLAIM]: "07" }],
    ["7.0", { [CLAIM]: "7.0" }],
    ["no generation", {}],
  ];

  it.each(CLAIMS)(
    "refuses a read and a write with %s, with or without tenant and assignment: scope_mismatch, nothing signed in (base: a read is served)",
    async (_label, claim) => {
      for (const method of ["GET", "POST", "PATCH"]) {
        for (const document of [DOCUMENT, {}]) {
          const { strategy, payload } = fakes();
          const request = req(method);
          const outcome = await strategy.authenticate({
            headers: await headersWith({ ...document, ...claim }),
            payload,
            req: request,
          });
          expectRefused(
            outcome,
            request,
            payload,
            "scope_mismatch",
            `${method} ${JSON.stringify(document)}`,
          );
        }
      }
    },
  );

  it("refuses the stock API view's new-tab navigation to /web-studio/api/<collection>/<id>, which carries no claim (base: served)", async () => {
    const { strategy, payload } = fakes();
    const request = req("GET");
    const outcome = await strategy.authenticate({
      headers: await headersWith({
        "sec-fetch-mode": "navigate",
        "sec-fetch-dest": "document",
        "sec-fetch-site": "same-origin",
        accept: "text/html",
      }),
      payload,
      req: request,
    });
    expectRefused(outcome, request, payload, "scope_mismatch", "navigation");
  });

  it("refuses a GraphQL call with 6 too", async () => {
    const { strategy, payload } = fakes();
    const request = req("POST");
    const outcome = await strategy.authenticate({
      headers: await headersWith({ ...DOCUMENT, [CLAIM]: "6" }),
      payload,
      req: request,
      isGraphQL: true,
    });
    expectRefused(outcome, request, payload, "scope_mismatch", "graphql");
  });

  it("serves a read and a write with 7 and the cookie's tenant and row (guard)", async () => {
    for (const method of ["GET", "POST"]) {
      const { strategy, payload } = fakes();
      const { user } = await strategy.authenticate({
        headers: await headersWith({ ...DOCUMENT, [CLAIM]: "7" }),
        payload,
        req: req(method),
      });
      expect(user, method).toMatchObject({
        tenantId: TA,
        assignmentId: ROW.id,
      });
    }
  });

  it("needs no claim on a Payload page render, which has no request (guard)", async () => {
    const { strategy, payload } = fakes();
    const { user } = await strategy.authenticate({
      headers: await headersWith({}),
      payload,
    });
    expect(user).toMatchObject({ tenantId: TA });
  });

  it.each([
    ["absent", null],
    ["invalid", "07"],
    ["zero", "0"],
  ])(
    "answers no_selection when the name's trusted generation is %s (base: served)",
    async (_label, trusted) => {
      const { strategy, payload } = fakes();
      const request = req("GET");
      const headers = await headersWith({ ...DOCUMENT, [CLAIM]: "7" });
      if (trusted === null) headers.delete(NAME_GEN);
      else headers.set(NAME_GEN, trusted);
      const outcome = await strategy.authenticate({
        headers,
        payload,
        req: request,
      });
      expectRefused(outcome, request, payload, "no_selection", "trusted");
    },
  );
});

describe("on: the E2E bypass compares the generation alike", () => {
  async function bypassCookie() {
    vi.stubEnv("E2E_AUTH_BYPASS", "true");
    vi.stubEnv("E2E_AUTH_SECRET", "cms-strategy-generation-secret");
    vi.stubEnv("E2E_AUTH_ALLOWED_SUPABASE_REFS", "example");
    return `asym_e2e_auth_admin=${await createE2EAuthCookieValue({
      userId: USER,
      role: "staff",
      tenantId: TA,
      memberships: [
        {
          id: ROW.id,
          tenantId: TA,
          role: "staff",
          staffRole: "development",
          isTenantAdmin: false,
        },
      ],
    })}`;
  }

  async function bypassHeaders(extra: Record<string, string>) {
    return new Headers({
      cookie: `${await bypassCookie()}; ${cookie}`,
      host: "localhost:3030",
      [NAME]: TA,
      [NAME_GEN]: "7",
      ...extra,
    });
  }

  it("refuses 6, and a read without a generation, with scope_mismatch (base: served)", async () => {
    for (const claim of [{ [CLAIM]: "6" }, {}]) {
      const { strategy, payload } = fakes(false);
      const request = req("GET");
      const outcome = await strategy.authenticate({
        headers: await bypassHeaders({ ...DOCUMENT, ...claim }),
        payload,
        req: request,
      });
      expectRefused(outcome, request, payload, "scope_mismatch", "bypass");
    }
  });

  it("answers no_selection when the trusted generation is invalid (base: served)", async () => {
    const { strategy, payload } = fakes(false);
    const request = req("GET");
    const outcome = await strategy.authenticate({
      headers: await bypassHeaders({
        ...DOCUMENT,
        [CLAIM]: "7",
        [NAME_GEN]: "x",
      }),
      payload,
      req: request,
    });
    expectRefused(outcome, request, payload, "no_selection", "bypass trusted");
  });

  it("serves 7 with the cookie's tenant and row (guard)", async () => {
    const { strategy, payload } = fakes(false);
    const { user } = await strategy.authenticate({
      headers: await bypassHeaders({ ...DOCUMENT, [CLAIM]: "7" }),
      payload,
      req: req("GET"),
    });
    expect(user).toMatchObject({ tenantId: TA });
  });
});

describe("off: nothing is read (guard)", () => {
  it("serves a read without claims and ignores a client's generation headers", async () => {
    vi.stubEnv("CORE_SERVE_UNDER_PATHS", "0");
    vi.stubEnv("CORE_APP_BASE_PATH", "");
    const { strategy, payload } = fakes();
    const { user } = await strategy.authenticate({
      headers: new Headers({
        cookie: `sb=1; ${cookie}`,
        [NAME_GEN]: "x",
        [CLAIM]: "6",
      }),
      payload,
      req: req("GET"),
    });
    expect(user).toMatchObject({ tenantId: TA });
  });
});
