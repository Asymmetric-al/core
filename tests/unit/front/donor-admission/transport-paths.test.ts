import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  BARE_B,
  D_A,
  D_B,
  donorRequest,
  expectRefused,
  forwarded,
  HOME_A,
  NAME,
  readInstalledNextTransport,
  READY_B,
  resetOnMode,
  SECOND_A,
  SITE_A,
  TA,
  TB,
  UNKNOWN,
  USER_D,
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
const {
  NEXT_ROOT_TRANSPORT_PATH,
  NEXT_RSC_SEGMENT_STRIPPED_SUFFIX,
  NEXT_RSC_SEGMENT_SUFFIX,
  NEXT_RSC_SEGMENTS_DIR_SUFFIX,
  NEXT_RSC_SUFFIX,
  normalizeDonorPath,
} = await import("../../../../apps/donor/lib/route-policy");

beforeEach(() => {
  resetOnMode(state);
});

afterEach(() => {
  vi.unstubAllEnvs();
});

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
