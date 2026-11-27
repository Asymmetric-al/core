import { NextRequest } from "next/server";
import { expect, vi } from "vitest";

import { freshKey, hostRow, TA, TB } from "./fixtures";
import { resetFrontConfigLogForTests } from "../../../../packages/auth/front";

import type { Answer, Init } from "./fixtures";

export const PORT = "25200";

export const HOME_A = `home-a.localhost:${PORT}`;
export const HOME_B = `home-b.localhost:${PORT}`;
export const SITE_A = `site-a.localhost:${PORT}`;
export const SECOND_A = `second-a.localhost:${PORT}`;
export const BARE_B = `bare-b.localhost:${PORT}`;
export const READY_B = `ready-b.localhost:${PORT}`;
export const UNKNOWN = `unknown.localhost:${PORT}`;
export const ORPHAN_A = `orphan-a.localhost:${PORT}`;
export const STAFF_A = `staff-a.localhost:${PORT}`;
export const READY_SITE_A = `ready-site-a.localhost:${PORT}`;

export const HOME_A_NAME = "home-a.localhost";

export function sqlHost(host: string): string | null {
  if (Buffer.byteLength(host, "utf8") > 300) return null;
  return host.replace(/\.?(:[0-9]+)?$/, "").toLowerCase();
}

export const NAMES: Record<string, Answer> = {
  "home-a.localhost": hostRow(TA),
  "home-b.localhost": hostRow(TB),
  "site-a.localhost": hostRow(TA, { is_home: false, surfaces: ["website"] }),
  "second-a.localhost": hostRow(TA, {
    is_home: false,
    surfaces: ["website", "donor_account"],
  }),
  "bare-b.localhost": hostRow(TB, { surfaces: ["donor_account"] }),
  "ready-b.localhost": hostRow(TB, { state: "ready" }),
  "orphan-a.localhost": hostRow(TA, { is_home: false, surfaces: ["website"] }),
  "staff-a.localhost": hostRow(TA, { is_home: false, surfaces: ["staff"] }),
  "ready-site-a.localhost": hostRow(TA, {
    is_home: false,
    surfaces: ["website"],
    state: "ready",
  }),
};

export const HOMES: Record<string, Answer> = {
  "site-a.localhost": {
    data: [{ primary_domain: HOME_A_NAME }],
    error: null,
  },
  "second-a.localhost": {
    data: [{ primary_domain: HOME_A_NAME }],
    error: null,
  },
};

const NONE: Answer = { data: [], error: null };

export type HomeState = {
  userId: string | null;
  rows: unknown[];
  refreshCookie: boolean;
  sessionReads: number;
  clients: number;
  lookups: string[];
  homeReads: string[];
  offMode: boolean;
  answer: (host: string, callIndex: number) => Answer;
  homeAnswer: (host: string, callIndex: number) => Answer;
};

export function resetHomeMode(state: HomeState) {
  resetFrontConfigLogForTests();
  state.userId = null;
  state.rows = [];
  state.refreshCookie = true;
  state.sessionReads = 0;
  state.clients = 0;
  state.lookups = [];
  state.homeReads = [];
  state.offMode = false;
  state.answer = (host) => NAMES[sqlHost(host) ?? ""] ?? NONE;
  state.homeAnswer = (host) => HOMES[sqlHost(host) ?? ""] ?? NONE;
  vi.stubEnv("CORE_SERVE_UNDER_PATHS", "1");
  vi.stubEnv("CORE_APP_BASE_PATH", "");
  vi.stubEnv("FRONT_ADMIN_ORIGIN", "http://localhost:25201");
  vi.stubEnv("FRONT_MISSIONARY_ORIGIN", "http://localhost:25202");
  vi.stubEnv("FRONT_STAMP_KEY_ADMIN", freshKey());
  vi.stubEnv("FRONT_STAMP_KEY_MISSIONARY", freshKey());
}

export function siteRequest(
  host: string | null,
  path: string,
  init: Init & { url?: string } = {},
) {
  const { url, ...rest } = init;
  const headers: Record<string, string> = { ...(rest.headers ?? {}) };
  if (host !== null && !("host" in headers)) headers.host = host;
  return new NextRequest(url ?? `http://${host ?? SITE_A}${path}`, {
    ...rest,
    headers,
  });
}

export function homeLocation(path: string, query = "") {
  return `http://${HOME_A_NAME}:${PORT}${path}${query}`;
}

export async function expectHomeRedirect(
  response: Response,
  location: string,
  label: string,
) {
  expect(response.status, label).toBe(307);
  expect(response.headers.get("location"), label).toBe(location);
  expect(response.headers.get("cache-control"), label).toBe("no-store");
  expect(response.headers.get("referrer-policy"), label).toBe("no-referrer");
  expect(await response.text(), label).toBe("");
  expect(response.headers.get("set-cookie"), label).toBeNull();
  expect(response.headers.get("x-middleware-next"), label).toBeNull();
  expect(response.headers.get("x-middleware-rewrite"), label).toBeNull();
}
