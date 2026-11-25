import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

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
  rawPathRequest,
  READY_B,
  resetOnMode,
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
const { classifyDonorPath, isDonorExemptPath, normalizeDonorPath } =
  await import("../../../../apps/donor/lib/route-policy");

beforeEach(() => {
  resetOnMode(state);
});

afterEach(() => {
  vi.unstubAllEnvs();
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
      new URL("../../../../apps/donor", import.meta.url),
    );
    const repoRoot = fileURLToPath(new URL("../../../..", import.meta.url));
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
