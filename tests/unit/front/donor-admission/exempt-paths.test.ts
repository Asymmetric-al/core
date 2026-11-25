import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  donorRequest,
  expectRefused,
  forwarded,
  HOME_A,
  NAME,
  resetOnMode,
  SITE_A,
  TA,
  TB,
  UNKNOWN,
} from "./fixtures";

import type { Answer } from "./fixtures";

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

const donorModule = await import("../../../../apps/donor/proxy");

beforeEach(() => {
  resetOnMode(state);
});

afterEach(() => {
  vi.unstubAllEnvs();
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
          "../../../../apps/donor/app/api/playwright-ready/route.ts",
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
