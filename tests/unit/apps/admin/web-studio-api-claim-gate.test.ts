import { readFileSync, realpathSync } from "node:fs";
import path from "node:path";

import {
  signWebStudioSelection,
  WEB_STUDIO_TENANT_COOKIE,
} from "@asym/auth/web-studio";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createWebStudioCallerResolver } from "../../../../apps/admin/src/cms/auth/supabase-strategy";
import {
  WEB_STUDIO_REFUSAL_HEADER,
  WEB_STUDIO_REFUSAL_MESSAGES,
  type WebStudioRefusal,
} from "../../../../apps/admin/src/cms/auth/web-studio-refusal";
import { claimedCallsOnly } from "../../../../apps/admin/src/cms/web-studio-api-route";

const routeHandlers = vi.hoisted(() => {
  const served = () => vi.fn(async () => new Response("served"));
  return {
    GET: served(),
    POST: served(),
    PATCH: served(),
    PUT: served(),
    DELETE: served(),
    OPTIONS: served(),
  };
});

vi.mock("@payload-config", () => ({ default: {} }));
vi.mock(
  "../../../../apps/admin/node_modules/@payloadcms/next/dist/exports/routes.js",
  () => ({
    REST_GET: () => routeHandlers.GET,
    REST_POST: () => routeHandlers.POST,
    REST_PATCH: () => routeHandlers.PATCH,
    REST_PUT: () => routeHandlers.PUT,
    REST_DELETE: () => routeHandlers.DELETE,
    REST_OPTIONS: () => routeHandlers.OPTIONS,
  }),
);

const route =
  await import("../../../../apps/admin/app/(payload)/web-studio/api/[...slug]/route");

type Method = keyof typeof routeHandlers;

const SECRET = "unit-test-web-studio-claim-gate-secret";
const ORIGIN = "http://localhost:25411";
const USER = "00000000-0000-4000-8000-0000000000c1";
const TA = "00000000-0000-0000-0000-000000000001";
const TB = "00000000-0000-0000-0000-000000000002";
const ROW = {
  id: "00000000-0000-4000-8000-000000000a01",
  user_id: USER,
  tenant_id: TA,
  role: "staff",
  staff_role: "development",
  is_tenant_admin: false,
  updated_at: "2026-11-27T09:00:00.000000+00:00",
};

type Endpoint = { method: Method; path: string };

const ROOT: readonly Endpoint[] = [
  { method: "GET", path: "/access" },
  { method: "GET", path: "/og" },
  { method: "POST", path: "/web-studio/create-from-template" },
];
const COLLECTION: readonly Endpoint[] = [
  { method: "POST", path: "/:id/duplicate" },
  { method: "GET", path: "/count" },
  { method: "POST", path: "/" },
  { method: "DELETE", path: "/" },
  { method: "DELETE", path: "/:id" },
  { method: "POST", path: "/access/:id?" },
  { method: "POST", path: "/validate" },
  { method: "POST", path: "/:id/validate" },
  { method: "GET", path: "/versions" },
  { method: "GET", path: "/" },
  { method: "GET", path: "/:id" },
  { method: "GET", path: "/versions/:id" },
  { method: "POST", path: "/versions/:id" },
  { method: "POST", path: "/:id/rename" },
  { method: "PATCH", path: "/" },
  { method: "PATCH", path: "/:id" },
];
const AUTH_COLLECTION: readonly Endpoint[] = [
  { method: "POST", path: "/:id/api-key/reveal" },
  { method: "POST", path: "/forgot-password" },
  { method: "GET", path: "/init" },
  { method: "POST", path: "/login" },
  { method: "POST", path: "/logout" },
  { method: "GET", path: "/me" },
  { method: "POST", path: "/refresh-token" },
  { method: "POST", path: "/first-register" },
  { method: "POST", path: "/reset-password" },
  { method: "POST", path: "/unlock" },
  { method: "POST", path: "/verify/:id" },
];
const PREFERENCES: readonly Endpoint[] = [
  { method: "GET", path: "/:key" },
  { method: "DELETE", path: "/:key" },
  { method: "POST", path: "/:key" },
];

const payloadRoot = realpathSync(
  path.join(process.cwd(), "apps/admin/node_modules/payload"),
);

function payloadEndpoints(file: string): string[] {
  const text = readFileSync(path.join(payloadRoot, "dist", file), "utf8");
  return [...text.matchAll(/method: '([a-z]+)',\s+path: '([^']+)'/g)].map(
    ([, method, pathname]) => `${method!.toUpperCase()} ${pathname}`,
  );
}

const named = (endpoints: readonly Endpoint[]) =>
  endpoints.map(({ method, path: pathname }) => `${method} ${pathname}`);

describe("the endpoints under Web Studio's REST route, derived from the pinned Payload and Core's config", () => {
  it("are the pinned Payload's own lists", () => {
    const pinned = JSON.parse(
      readFileSync(path.join(payloadRoot, "package.json"), "utf8"),
    ) as { version: string };
    expect(pinned.version).toBe("4.0.0-beta.9");
    expect(
      payloadEndpoints("collections/endpoints/index.js").toSorted(),
    ).toEqual(named(COLLECTION).toSorted());
    expect(payloadEndpoints("auth/endpoints/index.js").toSorted()).toEqual(
      [...named(AUTH_COLLECTION), "GET /access"].toSorted(),
    );
    expect(payloadEndpoints("preferences/config.js").toSorted()).toEqual(
      named(PREFERENCES).toSorted(),
    );
  });

  it("include Core's one custom endpoint, and no upload, orderable or global endpoint", () => {
    const config = readFileSync(
      path.join(process.cwd(), "apps/admin/payload.config.ts"),
      "utf8",
    );
    expect(config).toContain(
      "endpoints: [webStudioCreateFromTemplateEndpoint]",
    );
    expect(config).not.toMatch(/\bglobals:/);
    const collections = readFileSync(
      path.join(process.cwd(), "apps/admin/src/cms/collections/media.ts"),
      "utf8",
    );
    expect(collections).not.toMatch(/\bupload:/);
    const template = readFileSync(
      path.join(
        process.cwd(),
        "apps/admin/src/cms/create-from-template-endpoint.ts",
      ),
      "utf8",
    );
    expect(template).toContain('path: "/web-studio/create-from-template"');
  });
});

function concrete(pathname: string): string {
  return pathname
    .replace(":id?", "7")
    .replace(":id", "7")
    .replace(":key", "nav");
}

const REQUESTS: ReadonlyArray<
  readonly [label: string, method: Method, url: string]
> = [
  ...ROOT.map(
    ({ method, path: pathname }) =>
      [`root ${method} ${pathname}`, method, pathname] as const,
  ),
  ...COLLECTION.flatMap(({ method, path: pathname }) =>
    ["pages", "media"].map(
      (slug) =>
        [
          `${slug} ${method} ${pathname}`,
          method,
          `/${slug}${concrete(pathname)}`.replace(/\/$/, ""),
        ] as const,
    ),
  ),
  ...AUTH_COLLECTION.map(
    ({ method, path: pathname }) =>
      [
        `principal-links ${method} ${pathname}`,
        method,
        `/principal-links${concrete(pathname)}`,
      ] as const,
  ),
  ...PREFERENCES.map(
    ({ method, path: pathname }) =>
      [
        `payload-preferences ${method} ${pathname}`,
        method,
        `/payload-preferences${concrete(pathname)}`,
      ] as const,
  ),
  ["OPTIONS on a collection", "OPTIONS", "/pages"],
  ["OPTIONS on the root", "OPTIONS", "/access"],
];

let cookie: string;
let signedIn: boolean;

beforeEach(async () => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");
  vi.stubEnv("PAYLOAD_SECRET", SECRET);
  vi.stubEnv("E2E_AUTH_BYPASS", undefined);
  vi.stubEnv("CORE_SERVE_UNDER_PATHS", "1");
  vi.stubEnv("CORE_APP_BASE_PATH", "/admin");
  signedIn = true;
  readFails = false;
  for (const handler of Object.values(routeHandlers)) handler.mockClear();
  cookie = `${WEB_STUDIO_TENANT_COOKIE}=${await signWebStudioSelection({ tenantId: TA, assignmentId: ROW.id }, SECRET)}`;
});

afterEach(() => {
  vi.unstubAllEnvs();
});

const supabaseClient = {
  auth: {
    getUser: async () => ({
      data: {
        user: signedIn ? { id: USER, email: "staff@example.org" } : null,
      },
    }),
  },
  rpc: async (fn: string) => {
    if (fn !== "current_user_assignments") throw new Error(fn);
    return readFails
      ? { data: null, error: { code: "57014", message: "statement timeout" } }
      : { data: [ROW], error: null };
  },
};

let readFails = false;

function resolveCaller() {
  return createWebStudioCallerResolver({
    createSupabaseClient: (() => supabaseClient) as unknown as Parameters<
      typeof createWebStudioCallerResolver
    >[0]["createSupabaseClient"],
  });
}

const RIGHT = {
  "x-asym-tenant": TA,
  "x-asym-assignment": ROW.id,
  "x-asym-scope-generation": "7",
};

function requestFor(
  method: Method,
  url: string,
  extra: Record<string, string>,
) {
  return new Request(`${ORIGIN}/admin/web-studio/api${url}`, {
    method,
    headers: new Headers({
      cookie: `sb=1; ${cookie}`,
      origin: ORIGIN,
      "x-asym-name-tenant": TA,
      "x-asym-name-generation": "7",
      ...extra,
    }),
  });
}

function gated() {
  const handler = vi.fn(async () => new Response("served"));
  return { handler, gate: claimedCallsOnly(handler, resolveCaller()) };
}

async function expectRefusal(
  response: Response,
  refusal: WebStudioRefusal,
  status: number,
  label: string,
) {
  expect(response.status, label).toBe(status);
  expect(response.headers.get(WEB_STUDIO_REFUSAL_HEADER), label).toBe(refusal);
  expect(response.headers.get("cache-control"), label).toBe("no-store");
  const body = (await response.json()) as {
    errors: Array<{ message: string }>;
  };
  expect(body.errors[0]!.message, label).toBe(
    WEB_STUDIO_REFUSAL_MESSAGES[refusal],
  );
}

describe("on: no Web Studio REST handler runs for a call the claim check refuses (invariant 8)", () => {
  it.each(REQUESTS)(
    "%s with no claims is refused scope_mismatch and its handler never runs",
    async (label, method, url) => {
      const { handler, gate } = gated();
      await expectRefusal(
        await gate(requestFor(method, url, {}), {}),
        "scope_mismatch",
        409,
        label,
      );
      expect(handler, label).not.toHaveBeenCalled();
    },
  );

  it.each(REQUESTS)(
    "%s with a stale generation is refused scope_mismatch and its handler never runs",
    async (label, method, url) => {
      const { handler, gate } = gated();
      await expectRefusal(
        await gate(
          requestFor(method, url, { ...RIGHT, "x-asym-scope-generation": "6" }),
          {},
        ),
        "scope_mismatch",
        409,
        label,
      );
      expect(handler, label).not.toHaveBeenCalled();
    },
  );

  it.each(REQUESTS)(
    "%s naming another organization is refused scope_mismatch and its handler never runs",
    async (label, method, url) => {
      const { handler, gate } = gated();
      await expectRefusal(
        await gate(
          requestFor(method, url, { ...RIGHT, "x-asym-tenant": TB }),
          {},
        ),
        "scope_mismatch",
        409,
        label,
      );
      expect(handler, label).not.toHaveBeenCalled();
    },
  );

  it("refuses a call with no session no_session and runs no handler", async () => {
    signedIn = false;
    const { handler, gate } = gated();
    await expectRefusal(
      await gate(requestFor("GET", "/pages", RIGHT), {}),
      "no_session",
      401,
      "GET /pages",
    );
    expect(handler).not.toHaveBeenCalled();
  });

  it.each(["GET", "POST", "OPTIONS"] as const)(
    "answers a %s whose membership read failed 503 no-store with no refusal header, and runs no handler (#2858 item 1; base: 403 no_selection, as if the person had to choose again)",
    async (method) => {
      readFails = true;
      const { handler, gate } = gated();
      const response = await gate(requestFor(method, "/pages", RIGHT), {});
      expect(response.status).toBe(503);
      expect(response.headers.get(WEB_STUDIO_REFUSAL_HEADER)).toBeNull();
      expect(response.headers.get("cache-control")).toBe("no-store");
      expect(handler).not.toHaveBeenCalled();
    },
  );

  it("refuses a call with no name no_selection and runs no handler", async () => {
    const { handler, gate } = gated();
    const request = requestFor("GET", "/pages", RIGHT);
    request.headers.delete("x-asym-name-tenant");
    request.headers.delete("x-asym-name-generation");
    await expectRefusal(
      await gate(request, {}),
      "no_selection",
      403,
      "GET /pages",
    );
    expect(handler).not.toHaveBeenCalled();
  });

  it.each(REQUESTS)(
    "serves %s carrying the name's generation and the cookie's row (guard)",
    async (label, method, url) => {
      const { handler, gate } = gated();
      const response = await gate(requestFor(method, url, RIGHT), {});
      expect(await response.text(), label).toBe("served");
      expect(handler, label).toHaveBeenCalledOnce();
    },
  );

  it("passes every call to the handler with the switch off (guard)", async () => {
    vi.stubEnv("CORE_SERVE_UNDER_PATHS", undefined);
    for (const [label, method, url] of REQUESTS) {
      const { handler, gate } = gated();
      const response = await gate(
        new Request(`${ORIGIN}/admin/web-studio/api${url}`, { method }),
        {},
      );
      expect(await response.text(), label).toBe("served");
      expect(handler, label).toHaveBeenCalledOnce();
    }
  });
});

describe("Web Studio's REST route gates all six of its exports", () => {
  const METHODS: readonly Method[] = [
    "GET",
    "POST",
    "PATCH",
    "PUT",
    "DELETE",
    "OPTIONS",
  ];

  it.each(METHODS)(
    "on: %s with no session is refused no_session and Payload's handler never runs (base: it ran)",
    async (method) => {
      const response = await route[method](
        new Request(`${ORIGIN}/admin/web-studio/api/access`, {
          method,
          headers: {
            origin: ORIGIN,
            "x-asym-name-tenant": TA,
            "x-asym-name-generation": "7",
          },
        }),
        { params: Promise.resolve({ slug: ["access"] }) },
      );
      await expectRefusal(response, "no_session", 401, method);
      for (const [name, handler] of Object.entries(routeHandlers)) {
        expect(
          handler,
          `${method}: Payload's ${name} handler`,
        ).not.toHaveBeenCalled();
      }
    },
  );

  it.each(METHODS)(
    "off: %s reaches Payload's handler (guard)",
    async (method) => {
      vi.stubEnv("CORE_SERVE_UNDER_PATHS", undefined);
      const response = await route[method](
        new Request(`${ORIGIN}/admin/web-studio/api/access`, {
          method,
          headers: { origin: ORIGIN },
        }),
        { params: Promise.resolve({ slug: ["access"] }) },
      );
      expect(await response.text()).toBe("served");
      expect(routeHandlers[method]).toHaveBeenCalledOnce();
    },
  );
});
