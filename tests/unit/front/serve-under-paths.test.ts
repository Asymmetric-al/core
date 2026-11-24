import { readFileSync } from "node:fs";
import path from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../../../scripts/load-workspace-env.mjs", () => ({
  loadWorkspaceEnvironment: () => ({}),
}));

import {
  CORE_SERVE_UNDER_PATHS_ENV,
  isProductionBuildTarget,
  resolveServeUnderPaths,
  serveUnderPathsBuildEnv,
  serveUnderPathsDonorHeaders,
  serveUnderPathsNextConfig,
} from "../../../scripts/release/serve-under-paths.mjs";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("CORE_SERVE_UNDER_PATHS build switch", () => {
  it("defaults to off when unset or 0, and enables on 1", () => {
    expect(resolveServeUnderPaths({})).toBe(false);
    expect(resolveServeUnderPaths({ [CORE_SERVE_UNDER_PATHS_ENV]: "" })).toBe(
      false,
    );
    expect(resolveServeUnderPaths({ [CORE_SERVE_UNDER_PATHS_ENV]: "0" })).toBe(
      false,
    );
    expect(resolveServeUnderPaths({ [CORE_SERVE_UNDER_PATHS_ENV]: "1" })).toBe(
      true,
    );
  });

  it.each(["yes", "true", "2", "false", "on", " 1 ", "01"])(
    "throws on invalid switch value %j",
    (value) => {
      expect(() =>
        resolveServeUnderPaths({ [CORE_SERVE_UNDER_PATHS_ENV]: value }),
      ).toThrow(/CORE_SERVE_UNDER_PATHS/);
    },
  );

  it.each([
    { VERCEL_ENV: "production" },
    { VERCEL_ENV: "PRODUCTION" },
    { VERCEL_ENV: " Production " },
    { VERCEL_TARGET_ENV: "production" },
    { VERCEL_TARGET_ENV: "PRODUCTION" },
    { VERCEL_TARGET_ENV: "Production", VERCEL_ENV: "preview" },
    { VERCEL_TARGET_ENV: "core-development", VERCEL_ENV: "production" },
  ])("throws when enabled on a production target %j", (targetEnv) => {
    expect(isProductionBuildTarget(targetEnv)).toBe(true);
    expect(() =>
      resolveServeUnderPaths({
        [CORE_SERVE_UNDER_PATHS_ENV]: "1",
        ...targetEnv,
      }),
    ).toThrow(/production/i);
  });

  it.each([
    {},
    { VERCEL_ENV: "preview" },
    { VERCEL_ENV: "preview", VERCEL_TARGET_ENV: "core-development" },
    { VERCEL_ENV: "development", VERCEL_TARGET_ENV: "development" },
  ])("allows enabled builds outside production %j", (targetEnv) => {
    expect(isProductionBuildTarget(targetEnv)).toBe(false);
    expect(
      resolveServeUnderPaths({
        [CORE_SERVE_UNDER_PATHS_ENV]: "1",
        ...targetEnv,
      }),
    ).toBe(true);
  });

  it("allows off builds even on production", () => {
    expect(
      resolveServeUnderPaths({
        VERCEL_ENV: "production",
        VERCEL_TARGET_ENV: "production",
      }),
    ).toBe(false);
    expect(
      resolveServeUnderPaths({
        [CORE_SERVE_UNDER_PATHS_ENV]: "0",
        VERCEL_ENV: "production",
        VERCEL_TARGET_ENV: "production",
      }),
    ).toBe(false);
  });

  it("returns basePath and inlined env per app in off and on modes", () => {
    expect(serveUnderPathsNextConfig("admin", {})).toEqual({
      env: { CORE_APP_BASE_PATH: "", CORE_SERVE_UNDER_PATHS: "0" },
    });
    expect(serveUnderPathsNextConfig("missionary", {})).toEqual({
      env: { CORE_APP_BASE_PATH: "", CORE_SERVE_UNDER_PATHS: "0" },
    });
    expect(serveUnderPathsNextConfig("donor", {})).toEqual({
      env: { CORE_APP_BASE_PATH: "", CORE_SERVE_UNDER_PATHS: "0" },
    });

    const on = { [CORE_SERVE_UNDER_PATHS_ENV]: "1" };
    expect(serveUnderPathsNextConfig("admin", on)).toEqual({
      basePath: "/admin",
      env: { CORE_APP_BASE_PATH: "/admin", CORE_SERVE_UNDER_PATHS: "1" },
    });
    expect(serveUnderPathsNextConfig("missionary", on)).toEqual({
      basePath: "/missionary",
      env: { CORE_APP_BASE_PATH: "/missionary", CORE_SERVE_UNDER_PATHS: "1" },
    });
    expect(serveUnderPathsNextConfig("donor", on)).toEqual({
      env: { CORE_APP_BASE_PATH: "", CORE_SERVE_UNDER_PATHS: "1" },
    });
    expect(serveUnderPathsBuildEnv("donor", on)).toEqual({
      CORE_APP_BASE_PATH: "",
      CORE_SERVE_UNDER_PATHS: "1",
    });
  });

  it("lists CORE_SERVE_UNDER_PATHS in turbo.json build env", () => {
    const turbo = JSON.parse(
      readFileSync(path.join(process.cwd(), "turbo.json"), "utf8"),
    ) as { tasks: { build: { env: string[] } } };
    expect(turbo.tasks.build.env).toContain(CORE_SERVE_UNDER_PATHS_ENV);
  });
});

describe("donor header rules for serving under paths", () => {
  const sampleRules = [
    {
      source: "/(.*)",
      headers: [
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      ],
    },
    {
      source: "/:all*(svg|jpg|jpeg|png|gif|ico|webp|avif)",
      headers: [
        { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
      ],
    },
    {
      source: "/:all*(js|css)",
      headers: [
        { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
      ],
    },
    {
      source: "/:all*(woff|woff2|ttf|otf|eot)",
      headers: [
        { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
      ],
    },
    {
      source: "/sitemap.xml",
      headers: [{ key: "Cache-Control", value: "public, max-age=86400" }],
    },
  ];

  it("returns the exact rules untouched when off", () => {
    expect(serveUnderPathsDonorHeaders(sampleRules, {})).toEqual(sampleRules);
  });

  it("skips /admin and /missionary on both security and immutable rules when on", async () => {
    const { pathToRegexp } = await import("next/dist/compiled/path-to-regexp");
    const rules = serveUnderPathsDonorHeaders(sampleRules, {
      [CORE_SERVE_UNDER_PATHS_ENV]: "1",
    });
    const securityRe = pathToRegexp(rules[0]!.source);
    const cssRe = pathToRegexp(rules[2]!.source);
    const imgRe = pathToRegexp(rules[1]!.source);
    const fontRe = pathToRegexp(rules[3]!.source);

    for (const kept of [
      "/",
      "/workers",
      "/administration",
      "/missionary-stories",
      "/admin.json",
      "/invite/x",
    ]) {
      expect(securityRe.test(kept), `security should match ${kept}`).toBe(true);
    }
    for (const skipped of [
      "/admin",
      "/admin/",
      "/admin/invite/x",
      "/admin/x.css",
      "/missionary",
      "/missionary/",
      "/missionary/invite/x",
      "/missionary/x.css",
    ]) {
      expect(securityRe.test(skipped), `security should skip ${skipped}`).toBe(
        false,
      );
    }

    expect(cssRe.test("/x.css")).toBe(true);
    expect(cssRe.test("/assets/app.js")).toBe(true);
    expect(cssRe.test("/administration/app.css")).toBe(true);
    expect(cssRe.test("/missionary-stories/app.css")).toBe(true);
    expect(cssRe.test("/admin/x.css")).toBe(false);
    expect(cssRe.test("/missionary/x.css")).toBe(false);
    expect(cssRe.test("/admin/deep/a.js")).toBe(false);
    expect(cssRe.test("/missionary/deep/a.js")).toBe(false);

    expect(imgRe.test("/logo.png")).toBe(true);
    expect(imgRe.test("/admin/logo.png")).toBe(false);
    expect(imgRe.test("/missionary/logo.png")).toBe(false);

    expect(fontRe.test("/fonts/inter.woff2")).toBe(true);
    expect(fontRe.test("/admin/fonts/inter.woff2")).toBe(false);
    expect(fontRe.test("/missionary/fonts/inter.woff2")).toBe(false);

    expect(rules[4]!.source).toBe("/sitemap.xml");
  });
});

describe("the three next.config.ts files in off and on modes", () => {
  it("keeps admin, missionary, and donor configs identical to today when off", async () => {
    vi.stubEnv("CORE_SERVE_UNDER_PATHS", "");
    vi.stubEnv("VERCEL_ENV", "");
    vi.stubEnv("VERCEL_TARGET_ENV", "");

    const adminMod = await import("../../../apps/admin/next.config");
    const missionaryMod = await import("../../../apps/missionary/next.config");
    const donorMod = await import("../../../apps/donor/next.config");

    const adminCfg = adminMod.nextConfig;
    expect(adminCfg.basePath).toBeUndefined();
    expect(adminCfg.env?.CORE_APP_BASE_PATH).toBe("");
    expect(adminCfg.env?.CORE_SERVE_UNDER_PATHS).toBe("0");
    expect((await adminCfg.headers?.())?.map((h) => h.source)).toEqual([
      "/invite",
      "/invite/:path*",
    ]);
    expect((await adminCfg.redirects?.())?.map((r) => r.source)).toEqual([
      "/mc",
      "/mc/",
      "/mc/:path*",
      "/api/media/file/:path*",
    ]);

    const missionaryCfg = missionaryMod.default;
    expect(missionaryCfg.basePath).toBeUndefined();
    expect(missionaryCfg.env?.CORE_APP_BASE_PATH).toBe("");
    expect(missionaryCfg.env?.CORE_SERVE_UNDER_PATHS).toBe("0");
    expect((await missionaryCfg.headers?.())?.map((h) => h.source)).toEqual([
      "/invite",
      "/invite/:path*",
    ]);

    const donorCfg = donorMod.default;
    expect(donorCfg.basePath).toBeUndefined();
    expect(donorCfg.env?.CORE_APP_BASE_PATH).toBe("");
    expect(donorCfg.env?.CORE_SERVE_UNDER_PATHS).toBe("0");
    expect((await donorCfg.headers?.())?.map((h) => h.source)).toEqual([
      "/(.*)",
      "/:all*(svg|jpg|jpeg|png|gif|ico|webp|avif)",
      "/:all*(js|css)",
      "/:all*(woff|woff2|ttf|otf|eot)",
      "/sitemap.xml",
      "/robots.txt",
    ]);
    expect((await donorCfg.redirects?.())?.map((r) => r.source)).toEqual([
      "/home",
      "/missionaries",
      "/donate",
      "/give",
    ]);
    expect(donorCfg.images?.formats).toEqual(["image/avif", "image/webp"]);
  });

  it("sets basePath, inlined env, and donor header skips when CORE_SERVE_UNDER_PATHS=1", async () => {
    vi.stubEnv("CORE_SERVE_UNDER_PATHS", "1");
    vi.stubEnv("VERCEL_ENV", "");
    vi.stubEnv("VERCEL_TARGET_ENV", "");

    const adminMod = await import("../../../apps/admin/next.config");
    const missionaryMod = await import("../../../apps/missionary/next.config");
    const donorMod = await import("../../../apps/donor/next.config");

    const adminCfg = adminMod.nextConfig;
    expect(adminCfg.basePath).toBe("/admin");
    expect(adminCfg.env?.CORE_APP_BASE_PATH).toBe("/admin");
    expect(adminCfg.env?.CORE_SERVE_UNDER_PATHS).toBe("1");
    expect((await adminCfg.headers?.())?.map((h) => h.source)).toEqual([
      "/invite",
      "/invite/:path*",
    ]);
    expect((await adminCfg.redirects?.())?.map((r) => r.source)).toEqual([
      "/mc",
      "/mc/",
      "/mc/:path*",
      "/api/media/file/:path*",
    ]);

    const missionaryCfg = missionaryMod.default;
    expect(missionaryCfg.basePath).toBe("/missionary");
    expect(missionaryCfg.env?.CORE_APP_BASE_PATH).toBe("/missionary");
    expect(missionaryCfg.env?.CORE_SERVE_UNDER_PATHS).toBe("1");
    expect((await missionaryCfg.headers?.())?.map((h) => h.source)).toEqual([
      "/invite",
      "/invite/:path*",
    ]);

    const donorCfg = donorMod.default;
    expect(donorCfg.basePath).toBeUndefined();
    expect(donorCfg.env?.CORE_APP_BASE_PATH).toBe("");
    expect(donorCfg.env?.CORE_SERVE_UNDER_PATHS).toBe("1");
    const donorHeaders = await donorCfg.headers?.();
    expect(donorHeaders?.[0]?.source).not.toBe("/(.*)");
    expect(donorHeaders?.[2]?.source).not.toBe("/:all*(js|css)");
  });

  it("refuses to load admin next.config when CORE_SERVE_UNDER_PATHS=1 on production", async () => {
    vi.stubEnv("CORE_SERVE_UNDER_PATHS", "1");
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("VERCEL_TARGET_ENV", "");

    await expect(import("../../../apps/admin/next.config")).rejects.toThrow(
      /production/i,
    );
  });
});
