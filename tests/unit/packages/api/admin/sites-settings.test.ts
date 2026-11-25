import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type * as AuthModule from "../../../../../packages/auth/context";
import type { AuthContext } from "../../../../../packages/auth/context";

const TENANT = "00000000-0000-4000-8000-0000000000a1";
const OTHER_TENANT = "00000000-0000-4000-8000-0000000000b2";
const ADMIN_ROW = "00000000-0000-4000-8000-00000000a0a1";
const STAFF_ROW = "00000000-0000-4000-8000-00000000a0a2";
const SITE = "00000000-0000-4000-8000-00000000c0c1";
const SEEDED_SITE = "ffbeafc8-f85f-a2c9-5493-d62f5003e3b8";
const DB_TEXT =
  "tenant_guard: Site management is not active for this assignment";

const h = vi.hoisted(() => ({
  auth: vi.fn(),
  session: vi.fn(),
  serviceKeyUsed: vi.fn(),
  captureError: vi.fn(),
  auditLog: vi.fn(),
}));

vi.mock("@asym/auth/context", async (importOriginal) => ({
  ...(await importOriginal<typeof AuthModule>()),
  getAuthContext: h.auth,
}));

vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: () => ({
    client: new Proxy(
      {},
      {
        get: (_target, key) => {
          h.serviceKeyUsed(String(key));
          throw new Error(`service-key client used: ${String(key)}`);
        },
      },
    ),
    error: null,
  }),
}));

vi.mock("@asym/lib/audit/logger", () => ({
  createAuditLogger: vi.fn(() => ({ log: h.auditLog })),
}));

vi.mock("@asym/lib/monitoring/sentry", () => ({
  captureError: h.captureError,
}));

vi.mock(
  "../../../../../packages/api/src/shared/request-session-client",
  async (original) => ({
    ...(await original<
      typeof import("../../../../../packages/api/src/shared/request-session-client")
    >()),
    createRequestSessionClient: h.session,
  }),
);

import { POST as brandPOST } from "../../../../../packages/api/src/admin/sites/brand";
import {
  GET as settingsGET,
  POST as createPOST,
} from "../../../../../packages/api/src/admin/sites/settings";
import { POST as statusPOST } from "../../../../../packages/api/src/admin/sites/status";

type Handler = (request: NextRequest) => Promise<Response>;

function makeAuth(
  membershipRole: "staff" | "missionary" | "donor",
  isTenantAdmin = false,
): AuthContext {
  const staffRole = membershipRole === "staff" ? "development" : null;
  const assignmentId = isTenantAdmin ? ADMIN_ROW : STAFF_ROW;
  return {
    userId: "00000000-0000-4000-9000-000000000001",
    email: "member@example.org",
    tenantId: TENANT,
    role: isTenantAdmin ? "admin" : membershipRole,
    memberships: [
      {
        tenantId: TENANT,
        role: membershipRole,
        staffRole,
        isActive: true,
        isTenantAdmin,
      },
    ],
    assignment: {
      assignmentId,
      userId: "00000000-0000-4000-9000-000000000001",
      tenantId: TENANT,
      revision: "1",
      membershipRole,
      staffRole,
      isTenantAdmin,
    },
    assignmentDenial: null,
    profileId: "00000000-0000-4000-8000-000000000001",
    isAuthenticated: true,
  } as AuthContext;
}

const URL_BASE = "https://admin.example.test";

function getRequest() {
  return new NextRequest(`${URL_BASE}/api/admin/sites`, {
    headers: {
      authorization: "Bearer sites-fixture",
      "x-asym-tenant": OTHER_TENANT,
    },
  });
}

function postRequest(
  path: string,
  body: unknown,
  contentType = "application/json",
) {
  return new NextRequest(`${URL_BASE}${path}`, {
    method: "POST",
    headers: {
      "content-type": contentType,
      authorization: "Bearer sites-fixture",
      "x-asym-tenant": OTHER_TENANT,
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

function siteRow(overrides: Record<string, unknown> = {}) {
  return {
    id: SITE,
    tenant_id: TENANT,
    name: "Spanish site",
    is_default: false,
    status: "active",
    primary_domain: null,
    ...overrides,
  };
}

type Route = {
  label: string;
  operation: string;
  handler: Handler;
  request: () => NextRequest;
  rpcName: string;
};

const WRITES: Route[] = [
  {
    label: "create",
    operation: "admin.sites.create",
    handler: createPOST as Handler,
    request: () => postRequest("/api/admin/sites", { name: "Spanish site" }),
    rpcName: "create_site",
  },
  {
    label: "status",
    operation: "admin.sites.status",
    handler: statusPOST as Handler,
    request: () =>
      postRequest("/api/admin/sites/status", {
        siteId: SITE,
        status: "inactive",
      }),
    rpcName: "set_site_status",
  },
  {
    label: "brand",
    operation: "admin.sites.brand",
    handler: brandPOST as Handler,
    request: () =>
      postRequest("/api/admin/sites/brand", { displayName: "Hope Givers" }),
    rpcName: "set_account_brand",
  },
];

const ROUTES: Route[] = [
  {
    label: "read",
    operation: "admin.sites.read",
    handler: settingsGET as Handler,
    request: getRequest,
    rpcName: "tenant_site_settings",
  },
  ...WRITES,
];

function sessionAnswering(answer: (fn: string, args: unknown) => unknown) {
  const rpc = vi.fn(async (fn: string, args: unknown) => answer(fn, args));
  h.session.mockResolvedValue({ rpc });
  return rpc;
}

async function bodyOf(response: Response) {
  return (await response.json()) as Record<string, unknown>;
}

function expectNoStore(response: Response, label: string) {
  expect(response.headers.get("cache-control"), label).toBe("no-store");
}

let consoleError: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  h.auth.mockReset();
  h.session.mockReset();
  h.serviceKeyUsed.mockReset();
  h.captureError.mockReset();
  h.auditLog.mockReset();
  consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  consoleError.mockRestore();
});

describe("AL-2676 WP3b part 3: the Sites and brand routes (T3)", () => {
  it.each(ROUTES)(
    "$label: refuses a member without sites.manage with 403 before any database call, with no-store",
    async (route) => {
      for (const auth of [
        makeAuth("staff", false),
        makeAuth("missionary"),
        makeAuth("donor"),
      ]) {
        h.auth.mockResolvedValue(auth);
        const rpc = sessionAnswering(() => ({ data: null, error: null }));
        const response = await route.handler(route.request());
        expect(response.status, auth.role ?? "").toBe(403);
        expectNoStore(response, route.label);
        expect(rpc).not.toHaveBeenCalled();
        expect(h.session).not.toHaveBeenCalled();
      }
      expect(h.serviceKeyUsed).not.toHaveBeenCalled();
    },
  );

  it.each(ROUTES)(
    "$label: answers an unauthenticated request 401 with no-store",
    async (route) => {
      h.auth.mockResolvedValue({
        ...makeAuth("staff", true),
        isAuthenticated: false,
        userId: null,
      });
      const response = await route.handler(route.request());
      expect(response.status).toBe(401);
      expectNoStore(response, route.label);
      expect(h.session).not.toHaveBeenCalled();
    },
  );

  it("reads the organization's Sites and brand for auth.tenantId only, 200 with no-store", async () => {
    h.auth.mockResolvedValue(makeAuth("staff", true));
    const answer = {
      sites: [
        {
          id: SEEDED_SITE,
          name: "GiveHope Demo Organization",
          is_default: true,
          status: "active",
          primary_domain: "give-hope-demo.localhost",
        },
        {
          id: SITE,
          name: "Spanish site",
          is_default: false,
          status: "inactive",
          primary_domain: null,
        },
      ],
      brand: { display_name: "GiveHope" },
    };
    const rpc = sessionAnswering(() => ({ data: answer, error: null }));
    const response = await settingsGET(getRequest());
    expect(response.status).toBe(200);
    expectNoStore(response, "read");
    expect(await bodyOf(response)).toEqual(answer);
    expect(rpc).toHaveBeenCalledTimes(1);
    expect(rpc).toHaveBeenCalledWith("tenant_site_settings", {
      p_tenant_id: TENANT,
    });
  });

  it("reads an organization with no Site and no brand as an empty list and a null brand", async () => {
    h.auth.mockResolvedValue(makeAuth("staff", true));
    sessionAnswering(() => ({ data: { sites: [], brand: null }, error: null }));
    const response = await settingsGET(getRequest());
    expect(response.status).toBe(200);
    expect(await bodyOf(response)).toEqual({ sites: [], brand: null });
  });

  it("creates a Site by calling create_site exactly once and no other RPC, 201 with the command's five fields", async () => {
    h.auth.mockResolvedValue(makeAuth("staff", true));
    const rpc = sessionAnswering(() => ({
      data: siteRow({ name: "Spanish site (stored)" }),
      error: null,
    }));
    const response = await createPOST(
      postRequest("/api/admin/sites", { name: "Spanish site" }),
    );
    expect(response.status).toBe(201);
    expectNoStore(response, "create");
    expect(await bodyOf(response)).toEqual({
      site: {
        id: SITE,
        name: "Spanish site (stored)",
        is_default: false,
        status: "active",
        primary_domain: null,
      },
    });
    expect(rpc).toHaveBeenCalledTimes(1);
    expect(rpc).toHaveBeenCalledWith("create_site", {
      p_tenant_id: TENANT,
      p_name: "Spanish site",
    });
  });

  it("sets a Site's status, 200 with the command's five fields, never the request's", async () => {
    h.auth.mockResolvedValue(makeAuth("staff", true));
    const rpc = sessionAnswering(() => ({
      data: siteRow({ id: SEEDED_SITE, status: "inactive", name: "Stored" }),
      error: null,
    }));
    const response = await statusPOST(
      postRequest("/api/admin/sites/status", {
        siteId: SEEDED_SITE,
        status: "inactive",
      }),
    );
    expect(response.status).toBe(200);
    expectNoStore(response, "status");
    expect(await bodyOf(response)).toEqual({
      site: {
        id: SEEDED_SITE,
        name: "Stored",
        is_default: false,
        status: "inactive",
        primary_domain: null,
      },
    });
    expect(rpc).toHaveBeenCalledWith("set_site_status", {
      p_tenant_id: TENANT,
      p_site_id: SEEDED_SITE,
      p_status: "inactive",
    });
  });

  it("sets the brand, 200 with the command's display name only, no tenant_id", async () => {
    h.auth.mockResolvedValue(makeAuth("staff", true));
    const rpc = sessionAnswering(() => ({
      data: { tenant_id: TENANT, display_name: "Hope Givers (stored)" },
      error: null,
    }));
    const response = await brandPOST(
      postRequest("/api/admin/sites/brand", { displayName: "Hope Givers" }),
    );
    expect(response.status).toBe(200);
    expectNoStore(response, "brand");
    const body = await bodyOf(response);
    expect(body).toEqual({ brand: { display_name: "Hope Givers (stored)" } });
    expect(JSON.stringify(body)).not.toContain(TENANT);
    expect(rpc).toHaveBeenCalledWith("set_account_brand", {
      p_tenant_id: TENANT,
      p_display_name: "Hope Givers",
    });
  });

  it.each([
    ["create", "/api/admin/sites", { name: "A", tenantId: OTHER_TENANT }],
    ["create", "/api/admin/sites", { name: "A", p_tenant_id: OTHER_TENANT }],
    [
      "status",
      "/api/admin/sites/status",
      { siteId: SITE, status: "inactive", tenantId: OTHER_TENANT },
    ],
    [
      "status",
      "/api/admin/sites/status",
      { siteId: SITE, status: "inactive", p_tenant_id: OTHER_TENANT },
    ],
    [
      "brand",
      "/api/admin/sites/brand",
      { displayName: "A", tenantId: OTHER_TENANT },
    ],
    [
      "brand",
      "/api/admin/sites/brand",
      { displayName: "A", p_tenant_id: OTHER_TENANT },
    ],
    ["create", "/api/admin/sites", { name: 7 }],
    ["create", "/api/admin/sites", {}],
    [
      "status",
      "/api/admin/sites/status",
      { siteId: "not-a-uuid", status: "inactive" },
    ],
    ["status", "/api/admin/sites/status", { siteId: SITE, status: "archived" }],
    ["status", "/api/admin/sites/status", { siteId: SITE }],
    ["brand", "/api/admin/sites/brand", { displayName: null }],
    ["brand", "/api/admin/sites/brand", []],
  ])(
    "%s: refuses the body %j with 400 INVALID_REQUEST and no RPC",
    async (label, path, body) => {
      h.auth.mockResolvedValue(makeAuth("staff", true));
      const rpc = sessionAnswering(() => ({ data: null, error: null }));
      const route = WRITES.find((r) => r.label === label)!;
      const response = await route.handler(postRequest(path, body));
      expect(response.status).toBe(400);
      expectNoStore(response, label);
      expect((await bodyOf(response)).code).toBe("INVALID_REQUEST");
      expect(rpc).not.toHaveBeenCalled();
    },
  );

  it.each(WRITES)(
    "$label: keeps ensureJsonBody's 415 for a non-JSON type and 400 for bad JSON, with no RPC",
    async (route) => {
      h.auth.mockResolvedValue(makeAuth("staff", true));
      const rpc = sessionAnswering(() => ({ data: null, error: null }));
      const path = new URL(route.request().url).pathname;
      const wrongType = await route.handler(
        postRequest(path, "name=x", "text/plain"),
      );
      expect(wrongType.status).toBe(415);
      expectNoStore(wrongType, route.label);
      const badJson = await route.handler(postRequest(path, "{not json"));
      expect(badJson.status).toBe(400);
      expectNoStore(badJson, route.label);
      expect(rpc).not.toHaveBeenCalled();
    },
  );

  const REFUSED_NAMES: Array<[string, string]> = [
    ["empty", ""],
    ["a leading space", " a"],
    ["a trailing space", "a "],
    ["a leading no-break space", " a"],
    ["a trailing zero-width space", "a​"],
    ["a trailing line separator", "a "],
    ["a leading byte-order mark", "﻿a"],
    ["a line feed inside", "a\nb"],
    ["a tab inside", "a\tb"],
    ["161 code points", "a".repeat(161)],
  ];

  it.each(
    REFUSED_NAMES.flatMap(([what, value]) => [
      ["create", what, { name: value }],
      ["brand", what, { displayName: value }],
    ]),
  )(
    "%s: refuses a name with %s as 400 INVALID_NAME, untrimmed, with no RPC",
    async (label, _what, body) => {
      h.auth.mockResolvedValue(makeAuth("staff", true));
      const rpc = sessionAnswering(() => ({ data: null, error: null }));
      const route = WRITES.find((r) => r.label === label)!;
      const path = new URL(route.request().url).pathname;
      const response = await route.handler(postRequest(path, body));
      expect(response.status).toBe(400);
      expectNoStore(response, label);
      const answer = await bodyOf(response);
      expect(answer.code).toBe("INVALID_NAME");
      expect(answer.error).toBe(
        "Use 1 to 160 characters, with nothing invisible and no spaces at the start or end.",
      );
      expect(rpc).not.toHaveBeenCalled();
    },
  );

  const ASTRAL = "\u{1F30D}";
  const ACCEPTED_NAMES: Array<[string, string]> = [
    [
      "160 code points with an astral character counted once",
      `${ASTRAL}${"a".repeat(159)}`,
    ],
    ["a decomposed letter", "Café"],
    ["a space inside", "Spanish site"],
  ];

  it.each(
    ACCEPTED_NAMES.flatMap(([what, value]) => [
      ["create", what, value],
      ["brand", what, value],
    ]),
  )("%s: sends %s exactly as typed", async (label, _what, value) => {
    h.auth.mockResolvedValue(makeAuth("staff", true));
    const rpc = sessionAnswering((fn) =>
      fn === "create_site"
        ? { data: siteRow({ name: value }), error: null }
        : { data: { tenant_id: TENANT, display_name: value }, error: null },
    );
    const route = WRITES.find((r) => r.label === label)!;
    const path = new URL(route.request().url).pathname;
    const response = await route.handler(
      postRequest(
        path,
        label === "create" ? { name: value } : { displayName: value },
      ),
    );
    expect(response.status).toBe(label === "create" ? 201 : 200);
    const args = rpc.mock.calls[0]![1] as Record<string, unknown>;
    expect(args[label === "create" ? "p_name" : "p_display_name"]).toBe(value);
  });

  const ERROR_MAP: Array<[string, string, number, string | null]> = [
    ["read", "42501", 403, "NOT_PERMITTED"],
    ["read", "22004", 500, "SITES_UNAVAILABLE"],
    ["read", "PGRST202", 500, "SITES_UNAVAILABLE"],
    ["create", "42501", 403, "NOT_PERMITTED"],
    ["create", "23514", 400, "INVALID_NAME"],
    ["create", "23502", 400, "INVALID_NAME"],
    ["create", "22004", 500, "SITES_UNAVAILABLE"],
    ["create", "PGRST202", 500, "SITES_UNAVAILABLE"],
    ["status", "42501", 403, "NOT_PERMITTED"],
    ["status", "P0002", 404, "SITE_NOT_FOUND"],
    ["status", "23514", 409, "DEFAULT_SITE_ALWAYS_ACTIVE"],
    ["status", "23502", 500, "SITES_UNAVAILABLE"],
    ["status", "22P02", 500, "SITES_UNAVAILABLE"],
    ["brand", "42501", 403, "NOT_PERMITTED"],
    ["brand", "23514", 400, "INVALID_NAME"],
    ["brand", "23502", 400, "INVALID_NAME"],
    ["brand", "23503", 500, "SITES_UNAVAILABLE"],
    ["brand", "XX000", 500, "SITES_UNAVAILABLE"],
  ];

  const TEXTS: Record<string, string> = {
    NOT_PERMITTED: "You can't manage Sites in this organization.",
    SITE_NOT_FOUND:
      "This Site isn't in this organization any more. Reload to see the current list.",
    DEFAULT_SITE_ALWAYS_ACTIVE: "The default Site is always active.",
    INVALID_NAME:
      "Use 1 to 160 characters, with nothing invisible and no spaces at the start or end.",
    SITES_UNAVAILABLE: "Sites can't be loaded or changed right now. Try again.",
  };

  it.each(ERROR_MAP)(
    "%s: answers SQLSTATE %s with %i %s and a fixed text, never the database's",
    async (label, sqlstate, status, code) => {
      h.auth.mockResolvedValue(makeAuth("staff", true));
      sessionAnswering(() => ({
        data: null,
        error: {
          code: sqlstate,
          message: DB_TEXT,
          details: "tenant_guard: details",
          hint: "tenant_guard: hint",
        },
      }));
      const route = ROUTES.find((r) => r.label === label)!;
      const response = await route.handler(route.request());
      expect(response.status).toBe(status);
      expectNoStore(response, label);
      const text = await response.clone().text();
      expect(text).not.toContain("tenant_guard:");
      const body = await bodyOf(response);
      expect(body.code).toBe(code);
      expect(body.error).toBe(TEXTS[code!]);
      const logged = JSON.stringify([
        consoleError.mock.calls,
        h.captureError.mock.calls,
      ]);
      expect(logged).not.toContain("tenant_guard:");
      if (status === 500) {
        expect(h.captureError).toHaveBeenCalledTimes(1);
        const diagnostic = h.captureError.mock.calls[0]![1] as {
          code: string | null;
          status: number;
        };
        expect(diagnostic.code).toBe(sqlstate);
        expect(diagnostic.status).toBe(500);
        expect(
          consoleError.mock.calls.filter((call) =>
            String(call[0]).startsWith(`[${route.operation}]`),
          ),
        ).toHaveLength(1);
      } else {
        expect(h.captureError).not.toHaveBeenCalled();
      }
    },
  );

  it.each(WRITES)(
    "$label: reports a 500 once with no name, display name or body in the log",
    async (route) => {
      h.auth.mockResolvedValue(makeAuth("staff", true));
      sessionAnswering(() => ({
        data: null,
        error: { code: "XX000", message: "Spanish site Hope Givers" },
      }));
      const response = await route.handler(route.request());
      expect(response.status).toBe(500);
      const logged = JSON.stringify([
        consoleError.mock.calls,
        h.captureError.mock.calls,
      ]);
      expect(logged).not.toContain("Spanish site");
      expect(logged).not.toContain("Hope Givers");
      expect(h.captureError).toHaveBeenCalledTimes(1);
    },
  );

  const READ_SITE = {
    id: SITE,
    name: "Spanish site",
    is_default: false,
    status: "active",
    primary_domain: null,
  };

  it.each([
    [
      "read with an extra top-level key",
      "read",
      { sites: [], brand: null, tenant_id: TENANT },
    ],
    [
      "read with an extra Site key",
      "read",
      { sites: [{ ...READ_SITE, tenant_id: TENANT }], brand: null },
    ],
    [
      "read with an extra brand key",
      "read",
      { sites: [], brand: { display_name: "A", tenant_id: TENANT } },
    ],
    [
      "read with a missing Site key",
      "read",
      { sites: [{ id: SITE, name: "A" }], brand: null },
    ],
    [
      "read with an unknown status",
      "read",
      { sites: [{ ...READ_SITE, status: "archived" }], brand: null },
    ],
    ["create with an extra key", "create", { ...siteRow(), generation: 1 }],
    ["create without tenant_id", "create", { ...READ_SITE }],
    [
      "create from another tenant",
      "create",
      siteRow({ tenant_id: OTHER_TENANT }),
    ],
    ["status with an extra key", "status", { ...siteRow(), generation: 1 }],
    [
      "status from another tenant",
      "status",
      siteRow({ tenant_id: OTHER_TENANT }),
    ],
    [
      "brand with an extra key",
      "brand",
      { tenant_id: TENANT, display_name: "A", id: SITE },
    ],
    [
      "brand from another tenant",
      "brand",
      { tenant_id: OTHER_TENANT, display_name: "A" },
    ],
    ["brand without tenant_id", "brand", { display_name: "A" }],
    ["create answering nothing", "create", null],
  ])(
    "answers %s 500 SITES_UNAVAILABLE, reported once",
    async (_what, label, data) => {
      h.auth.mockResolvedValue(makeAuth("staff", true));
      sessionAnswering(() => ({ data, error: null }));
      const route = ROUTES.find((r) => r.label === label)!;
      const response = await route.handler(route.request());
      expect(response.status).toBe(500);
      expectNoStore(response, label);
      const body = await bodyOf(response);
      expect(body.code).toBe("SITES_UNAVAILABLE");
      expect(JSON.stringify(body)).not.toContain(OTHER_TENANT);
      expect(h.captureError).toHaveBeenCalledTimes(1);
    },
  );

  it("accepts a write row whose tenant_id differs only in letter case", async () => {
    h.auth.mockResolvedValue(makeAuth("staff", true));
    const upper = "00000000-0000-4000-8000-0000000000A1";
    sessionAnswering(() => ({
      data: siteRow({ tenant_id: upper }),
      error: null,
    }));
    const response = await createPOST(
      postRequest("/api/admin/sites", { name: "Spanish site" }),
    );
    expect(response.status).toBe(201);
  });
});
