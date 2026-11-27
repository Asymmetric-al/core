import { randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { NextRequest } from "next/server";
import { expect, vi } from "vitest";

import { resetFrontConfigLogForTests } from "../../../../packages/auth/front";

export const USER_D = "44444444-4444-4444-4444-444444444444";
export const USER_E = "11111111-1111-1111-1111-111111111111";
export const TA = "00000000-0000-0000-0000-000000000001";
export const TB = "00000000-0000-0000-0000-000000000002";
export const NAME = "x-asym-name-tenant";

export const D_A = {
  id: "00000000-0000-4000-8000-000000000901",
  user_id: USER_D,
  tenant_id: TA,
  role: "donor",
  staff_role: null,
  is_tenant_admin: false,
  updated_at: "2026-11-25T09:00:00.000000+00:00",
};
export const D_B = {
  id: "00000000-0000-4000-8000-000000000902",
  user_id: USER_D,
  tenant_id: TB,
  role: "donor",
  staff_role: null,
  is_tenant_admin: false,
  updated_at: "2026-11-25T09:00:00.000000+00:00",
};
export const E_A = {
  id: "00000000-0000-4000-8000-000000000903",
  user_id: USER_E,
  tenant_id: TA,
  role: "donor",
  staff_role: null,
  is_tenant_admin: false,
  updated_at: "2026-11-25T09:00:00.000000+00:00",
};

export type Answer = { data: unknown; error: unknown };

export type AdmissionState = {
  userId: string | null;
  rows: unknown[];
  refreshCookie: boolean;
  sessionReads: number;
  lookups: string[];
  lookupClients: number;
  offMode: boolean;
  answer: (host: string, callIndex: number) => Answer;
};

export function hostRow(
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

export const HOME_A = "home-a.localhost:25160";
export const HOME_B = "home-b.localhost:25160";
export const SITE_A = "site-a.localhost:25160";
export const SECOND_A = "second-a.localhost:25160";
export const BARE_B = "bare-b.localhost:25160";
export const READY_B = "ready-b.localhost:25160";
export const UNKNOWN = "unknown.localhost:25160";

export const FIXTURES: Record<string, Answer> = {
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

export function freshKey() {
  return randomBytes(32).toString("hex").slice(0, 32);
}

export type Init = {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
};

export function donorRequest(
  host: string | null,
  path: string,
  init: Init = {},
) {
  const origin = `http://${host && host.trim() ? host.trim() : "placeholder.localhost:25160"}`;
  const headers: Record<string, string> = { ...(init.headers ?? {}) };
  if (host !== null && !("host" in headers)) {
    headers.host = host;
  }
  return new NextRequest(`${origin}${path}`, { ...init, headers });
}

export function rawPathRequest(host: string, rawPathname: string) {
  const req = donorRequest(host, "/");
  Object.defineProperty(req.nextUrl, "pathname", {
    value: rawPathname,
    configurable: true,
  });
  return req;
}

export function forwarded(response: Response, name: string) {
  return response.headers.get(`x-middleware-request-${name}`);
}

export async function expectRefused(
  response: Response,
  label: string,
  status = 404,
) {
  expect(response.status, label).toBe(status);
  expect(response.headers.get("cache-control"), label).toBe("no-store");
  expect(await response.text(), label).toBe("");
  expect(response.headers.get("set-cookie"), label).toBeNull();
  expect(response.headers.get("x-middleware-next"), label).toBeNull();
  expect(response.headers.get("x-middleware-rewrite"), label).toBeNull();
  expect(response.headers.get("location"), label).toBeNull();
}

export function resetOnMode(state: AdmissionState) {
  resetFrontConfigLogForTests();
  const adminKey = freshKey();
  const missionaryKey = freshKey();
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
}

export const REFUSED_PROBES: Array<[string, string, Init]> = [
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

export function readInstalledNextTransport() {
  const donorDir = fileURLToPath(
    new URL("../../../../apps/donor", import.meta.url),
  );
  const repoRoot = fileURLToPath(new URL("../../../..", import.meta.url));
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
