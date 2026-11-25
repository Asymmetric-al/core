import { randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { resetFrontConfigLogForTests } from "../../../packages/auth/front";

const USER_D = "44444444-4444-4444-4444-444444444444";
const USER_E = "11111111-1111-1111-1111-111111111111";
const TA = "00000000-0000-0000-0000-000000000001";
const TB = "00000000-0000-0000-0000-000000000002";
const NAME = "x-asym-name-tenant";

const D_A = {
  id: "00000000-0000-4000-8000-000000000901",
  user_id: USER_D,
  tenant_id: TA,
  role: "donor",
  staff_role: null,
  is_tenant_admin: false,
  updated_at: "2026-11-25T09:00:00.000000+00:00",
};
const D_B = {
  id: "00000000-0000-4000-8000-000000000902",
  user_id: USER_D,
  tenant_id: TB,
  role: "donor",
  staff_role: null,
  is_tenant_admin: false,
  updated_at: "2026-11-25T09:00:00.000000+00:00",
};
const E_A = {
  id: "00000000-0000-4000-8000-000000000903",
  user_id: USER_E,
  tenant_id: TA,
  role: "donor",
  staff_role: null,
  is_tenant_admin: false,
  updated_at: "2026-11-25T09:00:00.000000+00:00",
};

type Answer = { data: unknown; error: unknown };

const state = vi.hoisted(() => ({
  userId: null as string | null,
  rows: [] as unknown[],
  refreshCookie: true,
  sessionReads: 0,
  lookups: [] as string[],
  lookupClients: 0,
  offMode: false,
  answer: (() => ({ data: [], error: null })) as (
    host: string,
    callIndex: number,
  ) => Answer,
}));

vi.mock("@asym/database/supabase/config", () => ({
  getSupabasePublicConfig: () => ({
    url: "https://example.supabase.co",
    key: "anon-key",
    keyType: "anon",
  }),
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: (
    _url: string,
    _key: string,
    options: {
      cookies: {
        setAll: (
          cookies: Array<{ name: string; value: string }>,
          headers: Record<string, string>,
        ) => void;
      };
    },
  ) => ({
    auth: {
      getUser: async () => {
        state.sessionReads += 1;
        if (state.refreshCookie) {
          options.cookies.setAll([{ name: "sb-refreshed", value: "fresh" }], {
            "Cache-Control": "private, no-store",
          });
        }
        return { data: { user: state.userId ? { id: state.userId } : null } };
      },
    },
    rpc: async (fn: string) => {
      if (fn !== "current_user_assignments") throw new Error(fn);
      return { data: state.rows, error: null };
    },
  }),
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: () => {
    if (state.offMode) {
      throw new Error("no lookup client when the switch is off");
    }
    state.lookupClients += 1;
    return {
      rpc: (fn: string, args: { p_host: string }) => {
        if (fn !== "resolve_verified_host") throw new Error(fn);
        state.lookups.push(args.p_host);
        const answer = state.answer(args.p_host, state.lookups.length);
        return { abortSignal: () => Promise.resolve(answer) };
      },
    };
  },
}));

const donorModule = await import("../../../apps/donor/proxy");
const {
  classifyDonorPath,
  isDonorExemptPath,
  NEXT_ROOT_TRANSPORT_PATH,
  NEXT_RSC_SEGMENT_STRIPPED_SUFFIX,
  NEXT_RSC_SEGMENT_SUFFIX,
  NEXT_RSC_SEGMENTS_DIR_SUFFIX,
  NEXT_RSC_SUFFIX,
  normalizeDonorPath,
} = await import("../../../apps/donor/lib/route-policy");

function hostRow(
  tenantId: string,
  overrides: Record<string, unknown> = {},
): Answer {
  return {
    data: [
      {
        tenant_id: tenantId,
        site_id: null,
        generation: 3,
        surfaces: ["website", "donor_account", "staff", "missionary"],
        state: "active",
        is_home: true,
        ...overrides,
      },
    ],
    error: null,
  };
}

const HOME_A = "home-a.localhost:25160";
const HOME_B = "home-b.localhost:25160";
const SITE_A = "site-a.localhost:25160";
const SECOND_A = "second-a.localhost:25160";
const BARE_B = "bare-b.localhost:25160";
const READY_B = "ready-b.localhost:25160";
const UNKNOWN = "unknown.localhost:25160";

const FIXTURES: Record<string, Answer> = {
  [HOME_A]: hostRow(TA),
  [HOME_B]: hostRow(TB),
  [SITE_A]: hostRow(TA, { is_home: false, surfaces: ["website"] }),
  [SECOND_A]: hostRow(TA, {
    is_home: false,
    surfaces: ["website", "donor_account"],
  }),
  [BARE_B]: hostRow(TB, { is_home: true, surfaces: ["donor_account"] }),
  [READY_B]: hostRow(TB, { state: "ready" }),
  [UNKNOWN]: { data: [], error: null },
};

function freshKey() {
  return randomBytes(32).toString("hex").slice(0, 32);
}

type Init = {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
};

function donorRequest(host: string | null, path: string, init: Init = {}) {
  const origin = `http://${host && host.trim() ? host.trim() : "placeholder.localhost:25160"}`;
  const headers: Record<string, string> = { ...(init.headers ?? {}) };
  if (host !== null && !("host" in headers)) {
    headers.host = host;
  }
  return new NextRequest(`${origin}${path}`, { ...init, headers });
}

function rawPathRequest(host: string, rawPathname: string) {
  const req = donorRequest(host, "/");
  Object.defineProperty(req.nextUrl, "pathname", {
    value: rawPathname,
    configurable: true,
  });
  return req;
}

function forwarded(response: Response, name: string) {
  return response.headers.get(`x-middleware-request-${name}`);
}

async function expectRefused(response: Response, label: string, status = 404) {
  expect(response.status, label).toBe(status);
  expect(response.headers.get("cache-control"), label).toBe("no-store");
  expect(await response.text(), label).toBe("");
  expect(response.headers.get("set-cookie"), label).toBeNull();
  expect(response.headers.get("x-middleware-next"), label).toBeNull();
  expect(response.headers.get("x-middleware-rewrite"), label).toBeNull();
  expect(response.headers.get("location"), label).toBeNull();
}

let adminKey: string;
let missionaryKey: string;

beforeEach(() => {
  resetFrontConfigLogForTests();
  adminKey = freshKey();
  missionaryKey = freshKey();
  state.userId = null;
  state.rows = [];
  state.refreshCookie = true;
  state.sessionReads = 0;
  state.lookups = [];
  state.lookupClients = 0;
  state.offMode = false;
  state.answer = (host) => FIXTURES[host] ?? { data: [], error: null };
  vi.stubEnv("CORE_SERVE_UNDER_PATHS", "1");
  vi.stubEnv("CORE_APP_BASE_PATH", "");
  vi.stubEnv("FRONT_ADMIN_ORIGIN", "http://localhost:25161");
  vi.stubEnv("FRONT_MISSIONARY_ORIGIN", "http://localhost:25162");
  vi.stubEnv("FRONT_STAMP_KEY_ADMIN", adminKey);
  vi.stubEnv("FRONT_STAMP_KEY_MISSIONARY", missionaryKey);
  vi.stubEnv("FRONT_NAMES", `${HOME_A},${HOME_B}`);
});

afterEach(() => {
  vi.unstubAllEnvs();
});

const REFUSED_PROBES: Array<[string, string, Init]> = [
  ["a page", "/", {}],
  ["an RSC request", "/", { headers: { rsc: "1" } }],
  [
    "a prefetch",
    "/workers",
    { headers: { "next-router-prefetch": "1", purpose: "prefetch" } },
  ],
  ["an API GET", "/api/profile", {}],
  [
    "an API POST",
    "/api/profile",
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: `http://${UNKNOWN}`,
      },
      body: "{}",
    },
  ],
  ["/login", "/login", {}],
  ["/register", "/register", {}],
  ["/donor-dashboard", "/donor-dashboard", {}],
];

describe("on: refused names return 404 no-store with empty body, no Set-Cookie and zero session reads", () => {
  for (const host of [UNKNOWN, READY_B]) {
    it.each(REFUSED_PROBES)(`${host}: %s`, async (label, path, init) => {
      state.userId = USER_D;
      state.rows = [D_A, D_B];
      const response = await donorModule.proxy(donorRequest(host, path, init));
      await expectRefused(response, `${host} ${label}`);
      expect(state.sessionReads).toBe(0);
      expect(state.lookups).toEqual([host]);
    });
  }
});

describe("on: per-surface path admission across bare-b, site-a, second-a and ready-b", () => {
  it("bare-b refuses website paths and forwards account and both paths with B", async () => {
    for (const path of ["/", "/workers"]) {
      state.lookups = [];
      state.sessionReads = 0;
      await expectRefused(
        await donorModule.proxy(donorRequest(BARE_B, path)),
        path,
      );
      expect(state.sessionReads).toBe(0);
      expect(state.lookups).toEqual([BARE_B]);
    }

    state.userId = USER_D;
    state.rows = [D_A, D_B];
    for (const path of ["/login", "/donor-dashboard", "/privacy"]) {
      state.lookups = [];
      const req = donorRequest(BARE_B, path, { headers: { [NAME]: TA } });
      const res = await donorModule.proxy(req);
      if (path === "/login") {
        expect(res.status, path).toBe(307);
        expect(new URL(res.headers.get("location")!).pathname).toBe(
          "/donor-dashboard",
        );
      } else {
        expect(res.headers.get("x-middleware-next"), path).toBe("1");
        expect(forwarded(res, NAME), path).toBe(TB);
      }
      expect(state.lookups).toEqual([BARE_B]);
    }

    state.userId = null;
    for (const path of [
      "/login",
      "/privacy",
      "/terms",
      "/cookies",
      "/help/about",
    ]) {
      const res = await donorModule.proxy(
        donorRequest(BARE_B, path, { headers: { [NAME]: TA } }),
      );
      expect(res.headers.get("x-middleware-next"), path).toBe("1");
      expect(forwarded(res, NAME), path).toBe(TB);
    }
  });

  it("site-a forwards website and both paths with A and refuses every account path", async () => {
    for (const path of [
      "/",
      "/workers",
      "/privacy",
      "/terms",
      "/cookies",
      "/help/about",
    ]) {
      const res = await donorModule.proxy(
        donorRequest(SITE_A, path, { headers: { [NAME]: TB } }),
      );
      expect(res.headers.get("x-middleware-next"), path).toBe("1");
      expect(forwarded(res, NAME), path).toBe(TA);
    }

    const accountPaths = [
      "/login",
      "/register",
      "/forgot-password",
      "/forgot-password/callback",
      "/auth/callback",
      "/checkout",
      "/no-access",
      "/donor-dashboard",
      "/donor-dashboard/settings",
      "/api/profile",
    ];
    state.userId = USER_D;
    state.rows = [D_A, D_B];
    for (const path of accountPaths) {
      state.lookups = [];
      state.sessionReads = 0;
      await expectRefused(
        await donorModule.proxy(donorRequest(SITE_A, path)),
        path,
      );
      expect(state.sessionReads).toBe(0);
      expect(state.lookups).toEqual([SITE_A]);
    }
  });

  it("second-a forwards website paths with A and refuses every account path", async () => {
    const home = await donorModule.proxy(donorRequest(SECOND_A, "/"));
    expect(home.headers.get("x-middleware-next")).toBe("1");
    expect(forwarded(home, NAME)).toBe(TA);

    state.userId = USER_D;
    state.rows = [D_A, D_B];
    for (const path of [
      "/login",
      "/register",
      "/forgot-password",
      "/auth/callback",
      "/checkout",
      "/no-access",
      "/donor-dashboard",
      "/api/profile",
    ]) {
      state.lookups = [];
      state.sessionReads = 0;
      await expectRefused(
        await donorModule.proxy(donorRequest(SECOND_A, path)),
        path,
      );
      expect(state.sessionReads).toBe(0);
      expect(state.lookups).toEqual([SECOND_A]);
    }
  });
});

describe("on: hostile paths", () => {
  const PRE_LOOKUP_NEXT_REQUEST = [
    "/a%5clogin",
    "//login",
    "/%252e%252e/login",
    "/%E0%A4%A",
    "/%61dmin/x",
  ];
  const PRE_LOOKUP_RAW_DOTS = [
    "/a/../login",
    "/a/./login",
    "/a/%2e%2e/login",
    "/a/%2e/login",
    "/api/webhooks/stripe/../profile",
    "/api/webhooks/stripe/%2e%2e/profile",
  ];

  it("normalizes and classifies donor paths directly", () => {
    for (const bad of [
      ...PRE_LOOKUP_NEXT_REQUEST,
      ...PRE_LOOKUP_RAW_DOTS,
      "/%2fprivacy",
      "/%6dissionary/x",
      "/login//",
    ]) {
      expect(normalizeDonorPath(bad), bad).toBeNull();
    }
    expect(normalizeDonorPath("/")).toBe("/");
    expect(normalizeDonorPath("/login/")).toBe("/login");
    expect(normalizeDonorPath("/%6c%6f%67%69%6e")).toBe("/login");
    expect(normalizeDonorPath("/%61pi/profile")).toBe("/api/profile");
    expect(normalizeDonorPath("/privacy/")).toBe("/privacy");
    expect(isDonorExemptPath("/api/health")).toBe(true);
    expect(isDonorExemptPath("/api/health/x")).toBe(false);
    expect(classifyDonorPath("/donor-dashboard")).toBe("account");
    expect(classifyDonorPath("/donor-dashboard/settings")).toBe("account");
    expect(classifyDonorPath("/login")).toBe("account");
    expect(classifyDonorPath("/register")).toBe("account");
    expect(classifyDonorPath("/forgot-password/callback")).toBe("account");
    expect(classifyDonorPath("/auth/callback")).toBe("account");
    expect(classifyDonorPath("/checkout")).toBe("account");
    expect(classifyDonorPath("/no-access")).toBe("account");
    expect(classifyDonorPath("/api")).toBe("account");
    expect(classifyDonorPath("/api/profile")).toBe("account");
    expect(classifyDonorPath("/privacy")).toBe("both");
    expect(classifyDonorPath("/terms")).toBe("both");
    expect(classifyDonorPath("/cookies")).toBe("both");
    expect(classifyDonorPath("/help/about")).toBe("both");
    expect(classifyDonorPath("/")).toBe("website");
    expect(classifyDonorPath("/LOGIN")).toBe("website");
    expect(classifyDonorPath("/loginx")).toBe("website");
  });

  it.each([SITE_A, BARE_B])(
    "refuses malformed, traversal, double-encoded and encoded-dashboard paths on %s with 404 and zero lookups",
    async (host) => {
      state.userId = USER_D;
      state.rows = [D_A, D_B];
      for (const path of PRE_LOOKUP_NEXT_REQUEST) {
        state.lookups = [];
        state.lookupClients = 0;
        state.sessionReads = 0;
        await expectRefused(
          await donorModule.proxy(donorRequest(host, path)),
          `${host} ${path}`,
        );
        expect(state.lookups, path).toEqual([]);
        expect(state.lookupClients, path).toBe(0);
        expect(state.sessionReads, path).toBe(0);
      }
      for (const rawPath of PRE_LOOKUP_RAW_DOTS) {
        state.lookups = [];
        state.lookupClients = 0;
        state.sessionReads = 0;
        await expectRefused(
          await donorModule.proxy(rawPathRequest(host, rawPath)),
          `${host} raw ${rawPath}`,
        );
        expect(state.lookups, rawPath).toEqual([]);
        expect(state.lookupClients, rawPath).toBe(0);
        expect(state.sessionReads, rawPath).toBe(0);
      }
    },
  );

  it("refuses percent-encoded and trailing-slash account paths on site-a, while admitting /LOGIN and /loginx as website", async () => {
    state.userId = USER_D;
    state.rows = [D_A, D_B];
    for (const path of [
      "/%6c%6f%67%69%6e",
      "/%61pi/profile",
      "/login/",
      "/checkout/",
      "/api/",
    ]) {
      state.lookups = [];
      state.sessionReads = 0;
      await expectRefused(
        await donorModule.proxy(donorRequest(SITE_A, path)),
        path,
      );
      expect(state.sessionReads, path).toBe(0);
      expect(state.lookups, path).toEqual([SITE_A]);
    }

    for (const path of ["/LOGIN", "/loginx"]) {
      const res = await donorModule.proxy(donorRequest(SITE_A, path));
      expect(res.headers.get("x-middleware-next"), path).toBe("1");
      expect(forwarded(res, NAME), path).toBe(TA);
    }
  });

  it("on bare-b refuses /%2fprivacy with zero lookups, refuses website bypasses, and forwards /privacy/", async () => {
    state.lookups = [];
    state.sessionReads = 0;
    await expectRefused(
      await donorModule.proxy(donorRequest(BARE_B, "/%2fprivacy")),
      "/%2fprivacy",
    );
    expect(state.lookups).toEqual([]);
    expect(state.sessionReads).toBe(0);

    for (const path of ["/%77orkers", "/workers/"]) {
      state.lookups = [];
      state.sessionReads = 0;
      await expectRefused(
        await donorModule.proxy(donorRequest(BARE_B, path)),
        path,
      );
      expect(state.lookups, path).toEqual([BARE_B]);
      expect(state.sessionReads, path).toBe(0);
    }

    const privacy = await donorModule.proxy(donorRequest(BARE_B, "/privacy/"));
    expect(privacy.headers.get("x-middleware-next")).toBe("1");
    expect(forwarded(privacy, NAME)).toBe(TB);
  });

  it("refuses any encoded slash (%2F or %2f) anywhere in the raw path with 404 and zero lookups", async () => {
    state.userId = USER_D;
    state.rows = [D_A, D_B];
    for (const host of [UNKNOWN, READY_B]) {
      for (const encoded of [
        "/api/health%2F",
        "/api/health%2f",
        "/api/webhooks/stripe%2F",
        "/api/playwright-ready%2F",
      ]) {
        state.lookups = [];
        state.lookupClients = 0;
        state.sessionReads = 0;
        await expectRefused(
          await donorModule.proxy(donorRequest(host, encoded)),
          `${host} ${encoded}`,
        );
        expect(state.lookups, `${host} ${encoded}`).toEqual([]);
        expect(state.lookupClients, `${host} ${encoded}`).toBe(0);
        expect(state.sessionReads, `${host} ${encoded}`).toBe(0);
      }
    }

    for (const [host, encoded] of [
      [BARE_B, "/login%2F"],
      [BARE_B, "/login%2f"],
      [HOME_A, "/donor-dashboard%2Fhistory"],
      [HOME_A, "/donor-dashboard%2fhistory"],
      [BARE_B, "/%2fprivacy"],
      [HOME_A, "/%2Fprivacy"],
    ] as const) {
      state.lookups = [];
      state.lookupClients = 0;
      state.sessionReads = 0;
      await expectRefused(
        await donorModule.proxy(donorRequest(host, encoded)),
        `${host} ${encoded}`,
      );
      expect(state.lookups, `${host} ${encoded}`).toEqual([]);
      expect(state.lookupClients, `${host} ${encoded}`).toBe(0);
      expect(state.sessionReads, `${host} ${encoded}`).toBe(0);
    }
  });

  it("pins matrix parameter, NUL, control characters and F1 transport forms through proxy against Next router matching", async () => {
    const donorDir = fileURLToPath(
      new URL("../../../apps/donor", import.meta.url),
    );
    const repoRoot = fileURLToPath(new URL("../../..", import.meta.url));
    const req = createRequire(import.meta.url);
    const nextDir = path.dirname(
      req.resolve("next/package.json", { paths: [donorDir, repoRoot] }),
    );
    const { getRouteRegex } = req(
      path.join(nextDir, "dist/shared/lib/router/utils/route-regex.js"),
    ) as { getRouteRegex: (route: string) => { re: RegExp } };
    const filesystemSource = readFileSync(
      path.join(nextDir, "dist/server/lib/router-utils/filesystem.js"),
      "utf8",
    );
    expect(filesystemSource).toContain("items.has(curItemPath)");
    expect(filesystemSource).toContain("items.has(curDecodedItemPath)");

    const loginRegex = getRouteRegex("/login").re;
    expect(loginRegex.test("/login")).toBe(true);
    for (const candidate of [
      "/login;x",
      "/login%00",
      "/login\u0000",
      "/login%0a",
      "/login\n",
      "/login%1f",
      "/login\u001f",
    ]) {
      expect(loginRegex.test(candidate), candidate).toBe(false);
    }

    const hostileTable: ReadonlyArray<{
      path: string;
      expectedClass: "account" | "website";
      reason: string;
    }> = [
      {
        path: "/login;x",
        expectedClass: "website",
        reason:
          "matrix parameter does not match static /login and hits catch-all",
      },
      {
        path: "/login%00",
        expectedClass: "website",
        reason: "encoded NUL does not match static /login and hits catch-all",
      },
      {
        path: "/login%0a",
        expectedClass: "website",
        reason:
          "encoded LF control char does not match static /login and hits catch-all",
      },
      {
        path: "/login%1f",
        expectedClass: "website",
        reason:
          "encoded US control char does not match static /login and hits catch-all",
      },
      {
        path: "/login.rsc",
        expectedClass: "account",
        reason: "leftover RSC payload suffix maps to /login",
      },
      {
        path: "/donor-dashboard.rsc",
        expectedClass: "account",
        reason: "leftover RSC payload suffix maps to /donor-dashboard",
      },
      {
        path: "/index.rsc",
        expectedClass: "website",
        reason: "root RSC payload suffix maps to /",
      },
      {
        path: "/login.segments/_tree.segment",
        expectedClass: "account",
        reason: "adapter-stripped segment prefetch path maps to /login",
      },
      {
        path: "/login.segments/_tree.segment.rsc",
        expectedClass: "account",
        reason: "raw segment prefetch path maps to /login",
      },
      {
        path: "/index.segments/_tree.segment",
        expectedClass: "website",
        reason: "root segment prefetch path maps to /",
      },
    ];

    for (const { path: hostilePath, expectedClass, reason } of hostileTable) {
      const normalized = normalizeDonorPath(hostilePath);
      expect(normalized, reason).not.toBeNull();
      expect(classifyDonorPath(normalized!), reason).toBe(expectedClass);

      state.userId = null;
      if (expectedClass === "website") {
        const onSite = await donorModule.proxy(
          donorRequest(SITE_A, hostilePath),
        );
        expect(
          onSite.headers.get("x-middleware-next"),
          `${hostilePath}: ${reason}`,
        ).toBe("1");
        expect(forwarded(onSite, NAME), hostilePath).toBe(TA);

        state.lookups = [];
        state.sessionReads = 0;
        await expectRefused(
          await donorModule.proxy(donorRequest(BARE_B, hostilePath)),
          `bare-b ${hostilePath}: ${reason}`,
        );
        expect(state.lookups, hostilePath).toEqual([BARE_B]);
        expect(state.sessionReads, hostilePath).toBe(0);
      } else {
        state.userId = USER_D;
        state.rows = [D_A, D_B];
        state.lookups = [];
        state.sessionReads = 0;
        await expectRefused(
          await donorModule.proxy(donorRequest(SITE_A, hostilePath)),
          `site-a ${hostilePath}: ${reason}`,
        );
        expect(state.lookups, hostilePath).toEqual([SITE_A]);
        expect(state.sessionReads, hostilePath).toBe(0);

        state.userId = null;
        const onBareB = await donorModule.proxy(
          donorRequest(BARE_B, hostilePath, { headers: { [NAME]: TA } }),
        );
        expect(
          onBareB.headers.get("x-middleware-next"),
          `${hostilePath}: ${reason}`,
        ).toBe("1");
        expect(forwarded(onBareB, NAME), hostilePath).toBe(TB);
      }
    }
  });
});

function readInstalledNextTransport() {
  const donorDir = fileURLToPath(
    new URL("../../../apps/donor", import.meta.url),
  );
  const repoRoot = fileURLToPath(new URL("../../..", import.meta.url));
  const req = createRequire(import.meta.url);
  const nextPkgPath = req.resolve("next/package.json", {
    paths: [donorDir, repoRoot],
  });
  const nextDir = path.dirname(nextPkgPath);
  const constants = req(path.join(nextDir, "dist/lib/constants.js")) as {
    RSC_SEGMENTS_DIR_SUFFIX: string;
    RSC_SEGMENT_SUFFIX: string;
    RSC_SUFFIX: string;
    NEXT_DATA_SUFFIX: string;
  };
  const readDist = (rel: string) =>
    readFileSync(path.join(nextDir, "dist", rel), "utf8");
  return {
    constants,
    strippedSegmentSuffix: constants.RSC_SEGMENT_SUFFIX.slice(
      0,
      -constants.RSC_SUFFIX.length,
    ),
    appPaths: readDist("shared/lib/router/utils/app-paths.js"),
    adapter: readDist("server/web/adapter.js"),
    segmentPrefixRsc: readDist(
      "server/normalizers/request/segment-prefix-rsc.js",
    ),
    getPageStaticInfo: readDist("build/analysis/get-page-static-info.js"),
    buildComplete: readDist("build/adapter/build-complete.js"),
    appRouteModule: readDist("server/route-modules/app-route/module.js"),
  };
}

describe("on: Next.js App Router transport paths", () => {
  const nextTransport = readInstalledNextTransport();
  const segDir = nextTransport.constants.RSC_SEGMENTS_DIR_SUFFIX;
  const segFullSuffix = nextTransport.constants.RSC_SEGMENT_SUFFIX;
  const segStrippedSuffix = nextTransport.strippedSegmentSuffix;
  const rscSuffix = nextTransport.constants.RSC_SUFFIX;
  const segPath = (page: string, segment = "_tree") =>
    `${page}${segDir}/${segment}${segStrippedSuffix}`;

  it("pins installed Next transport constants and adapter normalization from next/dist sources", () => {
    expect(NEXT_RSC_SEGMENTS_DIR_SUFFIX).toBe(segDir);
    expect(NEXT_RSC_SEGMENT_SUFFIX).toBe(segFullSuffix);
    expect(NEXT_RSC_SUFFIX).toBe(rscSuffix);
    expect(NEXT_RSC_SEGMENT_STRIPPED_SUFFIX).toBe(segStrippedSuffix);
    expect(NEXT_ROOT_TRANSPORT_PATH).toBe("/index");
    expect(segDir).toBe(".segments");
    expect(segFullSuffix).toBe(".segment.rsc");
    expect(rscSuffix).toBe(".rsc");
    expect(segStrippedSuffix).toBe(".segment");
    expect(nextTransport.constants.NEXT_DATA_SUFFIX).toBe(".json");
    expect(nextTransport.appPaths).toContain("url.replace(/\\.rsc($|\\?)/,");
    expect(nextTransport.adapter).toContain(
      "normalizeRscURL)(params.request.url)",
    );
    expect(nextTransport.segmentPrefixRsc).toContain("RSC_SEGMENTS_DIR_SUFFIX");
    expect(nextTransport.segmentPrefixRsc).toContain("RSC_SEGMENT_SUFFIX");
    expect(nextTransport.getPageStaticInfo).toContain(
      "ROOT_APP_ROUTE_TRANSPORT_MATCHER = `/?index(?:${APP_ROUTE_TRANSPORT_SUFFIX_MATCHER})`",
    );
    expect(nextTransport.buildComplete).toContain(
      "outputs.appRoutes.push(output)",
    );
    expect(nextTransport.appRouteModule).not.toContain("segmentPrefetchRSC");

    expect(normalizeDonorPath(segPath("/login"))).toBe("/login");
    expect(normalizeDonorPath(segPath("/index"))).toBe("/");
    expect(normalizeDonorPath(`/login${segDir}/_tree${segFullSuffix}`)).toBe(
      "/login",
    );
    expect(normalizeDonorPath(`/login${rscSuffix}`)).toBe("/login");
    expect(normalizeDonorPath(`/index${rscSuffix}`)).toBe("/");
  });

  it("refuses account segment prefetch paths on site-a and second-a with 404 and zero session reads, and forwards them on home-a with A", async () => {
    const accountTargets = [
      "/login",
      "/register",
      "/forgot-password/reset",
      "/checkout",
      "/donor-dashboard",
      "/api/profile",
    ];
    const segmentPaths = [
      ...accountTargets.map((page) => segPath(page)),
      segPath("/login", "!KGF1dGgp/login/__PAGE__"),
      `/login${segDir}/_tree${segFullSuffix}`,
      segPath("/index/login"),
    ];

    state.userId = USER_D;
    state.rows = [D_A, D_B];
    for (const host of [SITE_A, SECOND_A]) {
      for (const p of segmentPaths) {
        state.lookups = [];
        state.sessionReads = 0;
        await expectRefused(
          await donorModule.proxy(donorRequest(host, p)),
          `${host} ${p}`,
        );
        expect(state.sessionReads, `${host} ${p}`).toBe(0);
        expect(state.lookups, `${host} ${p}`).toEqual([host]);
      }
    }

    state.userId = null;
    for (const p of segmentPaths) {
      state.lookups = [];
      const res = await donorModule.proxy(
        donorRequest(HOME_A, p, { headers: { [NAME]: TB } }),
      );
      expect(res.headers.get("x-middleware-next"), p).toBe("1");
      expect(forwarded(res, NAME), p).toBe(TA);
      expect(state.lookups, p).toEqual([HOME_A]);
    }
  });

  it("on bare-b refuses root and /workers segment prefetch paths and forwards /login segment prefetch with B", async () => {
    state.userId = USER_D;
    state.rows = [D_A, D_B];
    for (const p of [
      segPath("/index"),
      segPath("/index", "!KHB1YmxpYyk/!KGhlcm8p/__PAGE__"),
      segPath("/workers"),
    ]) {
      state.lookups = [];
      state.sessionReads = 0;
      await expectRefused(
        await donorModule.proxy(donorRequest(BARE_B, p)),
        `bare-b ${p}`,
      );
      expect(state.sessionReads, p).toBe(0);
      expect(state.lookups, p).toEqual([BARE_B]);
    }

    state.userId = null;
    state.lookups = [];
    const loginSeg = await donorModule.proxy(
      donorRequest(BARE_B, segPath("/login"), { headers: { [NAME]: TA } }),
    );
    expect(loginSeg.headers.get("x-middleware-next")).toBe("1");
    expect(forwarded(loginSeg, NAME)).toBe(TB);
    expect(state.lookups).toEqual([BARE_B]);
  });

  it("refuses malformed segment prefetch paths and dashboard segment prefetch paths with 404 and zero lookups", async () => {
    const malformed = [
      `/login${segDir}/`,
      `/login${segDir}/x`,
      `/a${segDir}/b${segDir}/c${segStrippedSuffix}`,
      `/${segDir}/_tree${segStrippedSuffix}`,
      `/login${segDir}/${segStrippedSuffix}`,
      `/login${segDir}/_tree${segStrippedSuffix}/`,
      segPath("/admin"),
      segPath("/missionary"),
    ];
    for (const host of [SITE_A, BARE_B, HOME_A]) {
      for (const p of malformed) {
        state.lookups = [];
        state.lookupClients = 0;
        state.sessionReads = 0;
        await expectRefused(
          await donorModule.proxy(donorRequest(host, p)),
          `${host} ${p}`,
        );
        expect(state.lookups, `${host} ${p}`).toEqual([]);
        expect(state.lookupClients, `${host} ${p}`).toBe(0);
        expect(state.sessionReads, `${host} ${p}`).toBe(0);
      }
    }
  });

  it("never exempts proxy-received segment prefetch forms or leftover .rsc paths (such as raw /api/health.rsc.rsc after Next strips one .rsc)", async () => {
    const exemptTransports = [
      segPath("/api/health"),
      segPath("/api/webhooks/stripe"),
      segPath("/api/health/migrations"),
      segPath("/api/playwright-ready"),
      `/api/health${rscSuffix}`,
    ];
    state.userId = USER_D;
    state.rows = [D_A, D_B];
    for (const host of [UNKNOWN, READY_B, SITE_A, SECOND_A]) {
      for (const p of exemptTransports) {
        state.lookups = [];
        state.sessionReads = 0;
        await expectRefused(
          await donorModule.proxy(donorRequest(host, p)),
          `${host} ${p}`,
        );
        expect(state.sessionReads, `${host} ${p}`).toBe(0);
        expect(state.lookups, `${host} ${p}`).toEqual([host]);
      }
    }
  });

  it("refuses /login carrying next-router-segment-prefetch header on site-a and forwards it on home-a", async () => {
    const headers = {
      rsc: "1",
      "next-router-prefetch": "1",
      "next-router-segment-prefetch": "/_tree",
    };
    state.userId = USER_D;
    state.rows = [D_A, D_B];
    state.lookups = [];
    state.sessionReads = 0;
    await expectRefused(
      await donorModule.proxy(donorRequest(SITE_A, "/login", { headers })),
      "site-a /login segment-prefetch header",
    );
    expect(state.sessionReads).toBe(0);
    expect(state.lookups).toEqual([SITE_A]);

    state.userId = null;
    state.lookups = [];
    const admitted = await donorModule.proxy(
      donorRequest(HOME_A, "/login", { headers: { ...headers, [NAME]: TB } }),
    );
    expect(admitted.headers.get("x-middleware-next")).toBe("1");
    expect(forwarded(admitted, NAME)).toBe(TA);
    expect(state.lookups).toEqual([HOME_A]);
  });

  it("maps leftover .rsc transport paths to their page class and refuses malformed .rsc forms with zero lookups", async () => {
    state.userId = USER_D;
    state.rows = [D_A, D_B];
    for (const host of [SITE_A, SECOND_A]) {
      for (const p of [`/login${rscSuffix}`, `/donor-dashboard${rscSuffix}`]) {
        state.lookups = [];
        state.sessionReads = 0;
        await expectRefused(
          await donorModule.proxy(donorRequest(host, p)),
          `${host} ${p}`,
        );
        expect(state.sessionReads, `${host} ${p}`).toBe(0);
        expect(state.lookups, `${host} ${p}`).toEqual([host]);
      }
    }

    state.userId = null;
    for (const p of [`/login${rscSuffix}`, `/donor-dashboard${rscSuffix}`]) {
      state.lookups = [];
      const res = await donorModule.proxy(
        donorRequest(HOME_A, p, { headers: { [NAME]: TB } }),
      );
      expect(res.headers.get("x-middleware-next"), p).toBe("1");
      expect(forwarded(res, NAME), p).toBe(TA);
    }

    state.lookups = [];
    state.sessionReads = 0;
    await expectRefused(
      await donorModule.proxy(donorRequest(BARE_B, `/index${rscSuffix}`)),
      `bare-b /index${rscSuffix}`,
    );
    expect(state.sessionReads).toBe(0);
    expect(state.lookups).toEqual([BARE_B]);

    const siteIndexRsc = await donorModule.proxy(
      donorRequest(SITE_A, `/index${rscSuffix}`),
    );
    expect(siteIndexRsc.headers.get("x-middleware-next")).toBe("1");
    expect(forwarded(siteIndexRsc, NAME)).toBe(TA);

    for (const bad of [
      `/admin${rscSuffix}`,
      `/missionary${rscSuffix}`,
      `/login${rscSuffix}${rscSuffix}`,
      `/${rscSuffix}`,
    ]) {
      state.lookups = [];
      state.lookupClients = 0;
      state.sessionReads = 0;
      await expectRefused(
        await donorModule.proxy(donorRequest(HOME_A, bad)),
        bad,
      );
      expect(state.lookups, bad).toEqual([]);
      expect(state.lookupClients, bad).toBe(0);
      expect(state.sessionReads, bad).toBe(0);
    }
  });
});

describe("on: exact exempt paths and playwright-ready source pin", () => {
  const EXEMPT = [
    "/api/webhooks/stripe",
    "/api/health",
    "/api/health/migrations",
    "/api/playwright-ready",
  ];

  it("makes no lookup and strips x-asym-name-tenant, x-asym-front-* and x-forwarded-host on each exempt path and with a trailing slash", async () => {
    for (const base of EXEMPT) {
      for (const path of [base, `${base}/`]) {
        state.lookups = [];
        state.lookupClients = 0;
        const res = await donorModule.proxy(
          donorRequest(UNKNOWN, path, {
            headers: {
              [NAME]: TB,
              "x-forwarded-host": "evil.example.test",
              "x-asym-front-origin": "https://evil.example.test",
              "x-asym-front-stamp": "v1.1.forged",
              "x-asym-front-extra": "forged",
            },
          }),
        );
        expect(res.headers.get("x-middleware-next"), path).toBe("1");
        expect(forwarded(res, NAME), path).toBeNull();
        expect(forwarded(res, "x-forwarded-host"), path).toBeNull();
        expect(forwarded(res, "x-asym-front-origin"), path).toBeNull();
        expect(forwarded(res, "x-asym-front-stamp"), path).toBeNull();
        expect(forwarded(res, "x-asym-front-extra"), path).toBeNull();
        expect(state.lookups, path).toEqual([]);
        expect(state.lookupClients, path).toBe(0);
      }
    }
  });

  it("never treats prefixes of exempt paths as exempt: runs lookup and account rules", async () => {
    for (const path of [
      "/api/health/x",
      "/api/webhooks/stripe/x",
      "/api/playwright-ready/x",
    ]) {
      state.lookups = [];
      state.sessionReads = 0;
      await expectRefused(
        await donorModule.proxy(donorRequest(SITE_A, path)),
        `${SITE_A} ${path}`,
      );
      expect(state.lookups, path).toEqual([SITE_A]);
      expect(state.sessionReads, path).toBe(0);

      state.lookups = [];
      const admitted = await donorModule.proxy(donorRequest(HOME_A, path));
      expect(admitted.headers.get("x-middleware-next"), path).toBe("1");
      expect(forwarded(admitted, NAME), path).toBe(TA);
      expect(state.lookups, path).toEqual([HOME_A]);
    }
  });

  it("pins apps/donor/app/api/playwright-ready/route.ts to GET returning only { status: 'ok' } and reading nothing", () => {
    const source = readFileSync(
      fileURLToPath(
        new URL(
          "../../../apps/donor/app/api/playwright-ready/route.ts",
          import.meta.url,
        ),
      ),
      "utf8",
    ).trim();
    expect(source).toBe(
      'export function GET() {\n  return Response.json({ status: "ok" });\n}',
    );
  });
});

describe("on: host handling, lookup unavailability, dashboard handoff and no cross-request cache", () => {
  it("refuses absent or blank host with 404 no-store and zero lookups", async () => {
    for (const host of [null, "", "   "]) {
      state.lookups = [];
      state.lookupClients = 0;
      state.sessionReads = 0;
      await expectRefused(
        await donorModule.proxy(donorRequest(host, "/")),
        `host=${String(host)}`,
      );
      expect(state.lookups).toEqual([]);
      expect(state.lookupClients).toBe(0);
      expect(state.sessionReads).toBe(0);
    }
  });

  it("returns 503 no-store with empty body on every path class when lookup is unavailable", async () => {
    state.answer = () => ({ data: null, error: { message: "down" } });
    for (const path of [
      "/",
      "/privacy",
      "/login",
      "/donor-dashboard",
      "/api/profile",
    ]) {
      state.sessionReads = 0;
      await expectRefused(
        await donorModule.proxy(donorRequest(HOME_A, path)),
        path,
        503,
      );
      expect(state.sessionReads, path).toBe(0);
    }
  });

  it("asks for the host header only, never x-forwarded-host or request.url", async () => {
    const req = new NextRequest("http://url-host.localhost:9999/", {
      headers: {
        host: HOME_A,
        "x-forwarded-host": HOME_B,
      },
    });
    const res = await donorModule.proxy(req);
    expect(res.headers.get("x-middleware-next")).toBe("1");
    expect(forwarded(res, NAME)).toBe(TA);
    expect(forwarded(res, "x-forwarded-host")).toBeNull();
    expect(state.lookups).toEqual([HOME_A]);
  });

  it("routes /admin/... and /missionary/... through routeToDashboard with zero donor lookups", async () => {
    for (const [path, upstream] of [
      ["/admin/donors", "http://localhost:25161/admin/donors"],
      ["/missionary/donors", "http://localhost:25162/missionary/donors"],
    ] as const) {
      state.lookups = [];
      state.lookupClients = 0;
      const res = await donorModule.proxy(donorRequest(HOME_A, path));
      expect(res.headers.get("x-middleware-rewrite"), path).toBe(upstream);
      expect(state.lookups, path).toEqual([]);
      expect(state.lookupClients, path).toBe(0);
    }
  });

  it("remembers nothing across requests: one lookup each, second request takes B", async () => {
    const flipping = "flip.localhost:25160";
    state.answer = (_host, n) => (n === 1 ? hostRow(TA) : hostRow(TB));

    const first = await donorModule.proxy(donorRequest(flipping, "/"));
    expect(first.headers.get("x-middleware-next")).toBe("1");
    expect(forwarded(first, NAME)).toBe(TA);
    expect(state.lookups).toEqual([flipping]);

    const second = await donorModule.proxy(donorRequest(flipping, "/"));
    expect(second.headers.get("x-middleware-next")).toBe("1");
    expect(forwarded(second, NAME)).toBe(TB);
    expect(state.lookups).toEqual([flipping, flipping]);
  });
});

describe("on: donor dashboard role check and status through membership", () => {
  it("admits D on both home-a and home-b, and redirects E on home-b to /", async () => {
    state.userId = USER_D;
    state.rows = [D_A, D_B];
    const onA = await donorModule.proxy(
      donorRequest(HOME_A, "/donor-dashboard"),
    );
    expect(onA.headers.get("x-middleware-next")).toBe("1");
    expect(forwarded(onA, NAME)).toBe(TA);

    const onB = await donorModule.proxy(
      donorRequest(HOME_B, "/donor-dashboard"),
    );
    expect(onB.headers.get("x-middleware-next")).toBe("1");
    expect(forwarded(onB, NAME)).toBe(TB);

    state.userId = USER_E;
    state.rows = [E_A];
    const eOnB = await donorModule.proxy(
      donorRequest(HOME_B, "/donor-dashboard"),
    );
    expect(eOnB.status).toBe(307);
    expect(new URL(eOnB.headers.get("location")!).pathname).toBe("/");
  });

  it("when B is suspended or D's row in B is revoked: signed-out /login 200, signed-in /donor-dashboard redirects to /", async () => {
    state.rows = [D_A];
    state.userId = null;
    const signedOutLogin = await donorModule.proxy(
      donorRequest(HOME_B, "/login"),
    );
    expect(signedOutLogin.status).toBe(200);
    expect(signedOutLogin.headers.get("x-middleware-next")).toBe("1");
    expect(forwarded(signedOutLogin, NAME)).toBe(TB);

    state.userId = USER_D;
    const signedInDashboard = await donorModule.proxy(
      donorRequest(HOME_B, "/donor-dashboard"),
    );
    expect(signedInDashboard.status).toBe(307);
    expect(new URL(signedInDashboard.headers.get("location")!).pathname).toBe(
      "/",
    );
  });
});

describe.each([
  ["unset", undefined],
  ["0", "0"],
] as const)(
  "off (switch %s): donor proxy is byte-for-byte today with no lookup client",
  (_label, value) => {
    beforeEach(() => {
      state.offMode = true;
      vi.stubEnv("CORE_SERVE_UNDER_PATHS", value);
      vi.stubEnv("CORE_APP_BASE_PATH", "");
    });

    it("gives the same concrete answers with or without client x-asym-name-tenant and host: home-b", async () => {
      const withHeaders = { [NAME]: TB, host: HOME_B };
      const withoutHeaders = { host: "localhost:3000" };

      const homeWith = await donorModule.proxy(
        donorRequest(HOME_B, "/", { headers: withHeaders }),
      );
      const homeWithout = await donorModule.proxy(
        donorRequest("localhost:3000", "/", { headers: withoutHeaders }),
      );
      expect(homeWith.status).toBe(200);
      expect(homeWith.headers.get("x-middleware-next")).toBe("1");
      expect(homeWithout.headers.get("x-middleware-next")).toBe("1");
      expect(forwarded(homeWith, NAME)).toBeNull();
      expect(homeWith.headers.get("set-cookie")).toBe(
        homeWithout.headers.get("set-cookie"),
      );

      state.userId = null;
      const anonWith = await donorModule.proxy(
        donorRequest(HOME_B, "/donor-dashboard", { headers: withHeaders }),
      );
      const anonWithout = await donorModule.proxy(
        donorRequest("localhost:3000", "/donor-dashboard", {
          headers: withoutHeaders,
        }),
      );
      expect(anonWith.status).toBe(307);
      expect(anonWithout.status).toBe(307);
      expect(
        new URL(anonWith.headers.get("location")!).pathname +
          new URL(anonWith.headers.get("location")!).search,
      ).toBe("/login?next=%2Fdonor-dashboard");
      expect(
        new URL(anonWithout.headers.get("location")!).pathname +
          new URL(anonWithout.headers.get("location")!).search,
      ).toBe("/login?next=%2Fdonor-dashboard");

      state.userId = USER_E;
      state.rows = [E_A];
      const eWith = await donorModule.proxy(
        donorRequest(HOME_B, "/donor-dashboard", { headers: withHeaders }),
      );
      const eWithout = await donorModule.proxy(
        donorRequest("localhost:3000", "/donor-dashboard", {
          headers: withoutHeaders,
        }),
      );
      expect(eWith.status).toBe(200);
      expect(eWith.headers.get("x-middleware-next")).toBe("1");
      expect(eWithout.headers.get("x-middleware-next")).toBe("1");
      expect(forwarded(eWith, NAME)).toBeNull();
      expect(eWith.headers.get("set-cookie")).toContain("sb-refreshed=fresh");
      expect(eWith.headers.get("set-cookie")).toBe(
        eWithout.headers.get("set-cookie"),
      );

      state.userId = USER_D;
      state.rows = [D_A, D_B];
      const dWith = await donorModule.proxy(
        donorRequest(HOME_B, "/donor-dashboard", { headers: withHeaders }),
      );
      const dWithout = await donorModule.proxy(
        donorRequest("localhost:3000", "/donor-dashboard", {
          headers: withoutHeaders,
        }),
      );
      expect(dWith.status).toBe(307);
      expect(dWithout.status).toBe(307);
      expect(new URL(dWith.headers.get("location")!).pathname).toBe("/");
      expect(new URL(dWithout.headers.get("location")!).pathname).toBe("/");

      const apiWith = await donorModule.proxy(
        donorRequest(HOME_B, "/api/profile", { headers: withHeaders }),
      );
      const apiWithout = await donorModule.proxy(
        donorRequest("localhost:3000", "/api/profile", {
          headers: withoutHeaders,
        }),
      );
      expect(apiWith.status).toBe(200);
      expect(apiWith.headers.get("x-middleware-next")).toBe("1");
      expect(apiWithout.headers.get("x-middleware-next")).toBe("1");
      expect(forwarded(apiWith, "x-asym-role-class")).toBe("donor");
      expect(forwarded(apiWithout, "x-asym-role-class")).toBe("donor");
      expect(forwarded(apiWith, NAME)).toBeNull();
      expect(forwarded(apiWithout, NAME)).toBeNull();
      expect(state.lookupClients).toBe(0);
      expect(state.lookups).toEqual([]);
    });

    it("keeps today's answers on requests the on branch refuses or rewrites, including no host", async () => {
      state.userId = null;
      for (const path of [
        "/a%5clogin",
        "/%61dmin/x",
        "/admin/x",
        "/login.segments/_tree.segment",
      ]) {
        state.sessionReads = 0;
        const res = await donorModule.proxy(
          donorRequest(HOME_B, path, { headers: { [NAME]: TB } }),
        );
        expect(res.status, path).toBe(200);
        expect(res.headers.get("x-middleware-next"), path).toBe("1");
        expect(res.headers.get("x-middleware-rewrite"), path).toBeNull();
        expect(res.headers.get("cache-control"), path).not.toBe("no-store");
        expect(forwarded(res, "x-asym-pathname"), path).toBe(path);
        expect(forwarded(res, "x-asym-role-class"), path).toBe("donor");
        expect(forwarded(res, NAME), path).toBeNull();
        expect(state.sessionReads, path).toBe(1);
        expect(state.lookupClients, path).toBe(0);
      }

      state.sessionReads = 0;
      const encodedApi = await donorModule.proxy(
        donorRequest(HOME_B, "/api/health%2F", { headers: { [NAME]: TB } }),
      );
      expect(encodedApi.status).toBe(200);
      expect(encodedApi.headers.get("x-middleware-next")).toBe("1");
      expect(encodedApi.headers.get("x-middleware-rewrite")).toBeNull();
      expect(encodedApi.headers.get("cache-control")).not.toBe("no-store");
      expect(forwarded(encodedApi, "x-asym-pathname")).toBe("/api/health%2F");
      expect(forwarded(encodedApi, "x-asym-role-class")).toBe("donor");
      expect(forwarded(encodedApi, NAME)).toBeNull();
      expect(state.sessionReads).toBe(0);
      expect(state.lookupClients).toBe(0);

      const noHostHome = await donorModule.proxy(donorRequest(null, "/"));
      expect(noHostHome.status).toBe(200);
      expect(noHostHome.headers.get("x-middleware-next")).toBe("1");
      expect(noHostHome.headers.get("x-middleware-rewrite")).toBeNull();
      expect(noHostHome.headers.get("cache-control")).not.toBe("no-store");
      expect(forwarded(noHostHome, "x-asym-pathname")).toBe("/");
      expect(forwarded(noHostHome, NAME)).toBeNull();

      const noHostDash = await donorModule.proxy(
        donorRequest(null, "/donor-dashboard"),
      );
      expect(noHostDash.status).toBe(307);
      expect(noHostDash.headers.get("x-middleware-rewrite")).toBeNull();
      expect(
        new URL(noHostDash.headers.get("location")!).pathname +
          new URL(noHostDash.headers.get("location")!).search,
      ).toBe("/login?next=%2Fdonor-dashboard");
      expect(state.lookupClients).toBe(0);
      expect(state.lookups).toEqual([]);
    });
  },
);
