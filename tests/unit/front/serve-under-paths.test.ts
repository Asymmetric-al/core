import { readFileSync } from "node:fs";
import path from "node:path";

import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const network = vi.hoisted(() => {
  const reached: string[] = [];
  const fetchSpy = vi.fn(async (input: unknown) => {
    reached.push(String(input));
    throw new Error("a test reached the network");
  });
  vi.stubGlobal("fetch", fetchSpy);
  return { reached, fetchSpy };
});

vi.mock("../../../scripts/load-workspace-env.mjs", () => ({
  loadWorkspaceEnvironment: () => ({}),
}));

import { APP_BASE_PATHS as PACKAGE_APP_BASE_PATHS } from "../../../packages/database/app-base-path";
import { APP_BASE_PATHS as REEXPORTED_APP_BASE_PATHS } from "../../../packages/database/document-reload";
import { canonicalUpstreamOrigin } from "../../../packages/env/src/front-origin";
import {
  APP_BASE_PATHS as SCRIPT_APP_BASE_PATHS,
  CORE_SERVE_UNDER_PATHS_ENV,
  frontUpstreamOrigin,
  isProductionBuildTarget,
  resolveServeUnderPaths,
  serveUnderPathsBuildEnv,
  serveUnderPathsDonorHeaders,
  serveUnderPathsDonorRewrites,
  serveUnderPathsNextConfig,
} from "../../../scripts/release/serve-under-paths.mjs";

const ON = { [CORE_SERVE_UNDER_PATHS_ENV]: "1" };
const ADMIN_UPSTREAM = "https://a.example.test";
const MISSIONARY_UPSTREAM = "https://m.example.test";
const ORIGIN_VARIABLES = [
  "FRONT_ADMIN_ORIGIN",
  "FRONT_MISSIONARY_ORIGIN",
] as const;
const BOTH_UPSTREAMS = {
  FRONT_ADMIN_ORIGIN: ADMIN_UPSTREAM,
  FRONT_MISSIONARY_ORIGIN: MISSIONARY_UPSTREAM,
};
const BUILD_NEEDS =
  "CORE_SERVE_UNDER_PATHS=1 needs it when the donor app is built";
const EXPECTED_DONOR_REWRITES = {
  beforeFiles: [
    {
      source: "/admin/_next/:path+",
      destination: "https://a.example.test/admin/_next/:path+",
    },
    {
      source: "/missionary/_next/:path+",
      destination: "https://m.example.test/missionary/_next/:path+",
    },
  ],
  afterFiles: [],
  fallback: [],
};
const INVALID_UPSTREAMS = [
  " https://a.example.test",
  "https://a.example.test/",
  "HTTPS://A.EXAMPLE.TEST",
  "https://a.example.test/admin",
  "http://a.example.test",
  "https://user@a.example.test",
  "javascript:alert(1)",
];
const UPSTREAM_PARITY_VALUES = [
  undefined,
  null,
  "",
  "https://admin.example.test",
  "https://missionary.example.test",
  "http://localhost:25051",
  "http://127.0.0.1:25052",
  "http://[::1]:25051",
  "https://missionary.example.test:8443",
  "https://admin.example.test/",
  "HTTPS://ADMIN.EXAMPLE.TEST",
  "https://Admin.Example.Test",
  "https://admin.example.test/admin",
  "https://admin.example.test:443",
  "http://core-admin.vercel.app",
  "http://localhost.evil.test:25051",
  "http://127.0.0.1.evil.test:25051",
  "http://localhost:3030",
  "http://127.0.0.1:3031",
  "http://[::1]:3032",
  "http://127.1:3030",
  "ftp://a.example.test",
  ...INVALID_UPSTREAMS,
];

function donorRewrites(env: Record<string, string | undefined>) {
  expect(serveUnderPathsDonorRewrites).toBeTypeOf("function");
  return serveUnderPathsDonorRewrites(env);
}

function donorRefusal(env: Record<string, string | undefined>) {
  expect(serveUnderPathsDonorRewrites).toBeTypeOf("function");
  try {
    serveUnderPathsDonorRewrites(env);
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }
  return null;
}

function envThatRefusesOrigins(values: Record<string, string | undefined>) {
  return new Proxy(values, {
    get(target, property) {
      if (
        property === "FRONT_ADMIN_ORIGIN" ||
        property === "FRONT_MISSIONARY_ORIGIN"
      ) {
        throw new Error(`read ${property}`);
      }
      return Reflect.get(target, property);
    },
  });
}

function upstreamsWith(
  variable: (typeof ORIGIN_VARIABLES)[number],
  value: string | undefined,
) {
  const env: Record<string, string | undefined> = { ...ON, ...BOTH_UPSTREAMS };
  if (value === undefined) delete env[variable];
  else env[variable] = value;
  return env;
}

beforeEach(() => {
  vi.stubGlobal("fetch", network.fetchSpy);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
  expect(network.reached.splice(0)).toEqual([]);
});

afterAll(() => {
  vi.unstubAllGlobals();
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

  it("lists CORE_SERVE_UNDER_PATHS in turbo.json build env and serve-under-paths.mjs in build inputs", () => {
    const turbo = JSON.parse(
      readFileSync(path.join(process.cwd(), "turbo.json"), "utf8"),
    ) as { tasks: { build: { env: string[]; inputs: string[] } } };
    expect(turbo.tasks.build.env).toContain(CORE_SERVE_UNDER_PATHS_ENV);
    expect(turbo.tasks.build.inputs).toContain(
      "$TURBO_ROOT$/scripts/release/serve-under-paths.mjs",
    );
  });

  it("keeps the prefix tables in serve-under-paths.mjs and app-base-path.ts equal", () => {
    expect(SCRIPT_APP_BASE_PATHS).toEqual(PACKAGE_APP_BASE_PATHS);
    expect(REEXPORTED_APP_BASE_PATHS).toBe(PACKAGE_APP_BASE_PATHS);
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

describe("the donor's rewrites of the dashboards' static files", () => {
  it.each([
    {},
    { [CORE_SERVE_UNDER_PATHS_ENV]: "" },
    { [CORE_SERVE_UNDER_PATHS_ENV]: "0" },
  ])("is off for %j and reads neither origin", (values) => {
    expect(donorRewrites(envThatRefusesOrigins(values))).toBeUndefined();
  });

  it("sends each dashboard's /_next/ to its own origin when on", () => {
    const rewrites = donorRewrites({ ...ON, ...BOTH_UPSTREAMS });
    expect(rewrites).toStrictEqual(EXPECTED_DONOR_REWRITES);
    for (const entry of rewrites?.beforeFiles ?? []) {
      expect(Object.keys(entry)).toEqual(["source", "destination"]);
    }
  });

  it.each(
    ORIGIN_VARIABLES.flatMap((variable) => [
      [variable, undefined] as const,
      [variable, ""] as const,
    ]),
  )("refuses a missing %s (%j) by name", (variable, value) => {
    const message = donorRefusal(upstreamsWith(variable, value));
    expect(message).toMatch(new RegExp(`^${variable} is missing`));
    expect(message).toContain(BUILD_NEEDS);
    expect(message).not.toContain(ADMIN_UPSTREAM);
    expect(message).not.toContain(MISSIONARY_UPSTREAM);
  });

  it("names the staff origin first when both are missing", () => {
    expect(donorRefusal({ ...ON })).toMatch(/^FRONT_ADMIN_ORIGIN is missing/);
  });

  it.each(
    ORIGIN_VARIABLES.flatMap((variable) =>
      INVALID_UPSTREAMS.map((value) => [variable, value] as const),
    ),
  )("refuses %s = %j as invalid without printing it", (variable, value) => {
    const message = donorRefusal(upstreamsWith(variable, value));
    expect(message).toMatch(new RegExp(`^${variable} is invalid`));
    expect(message).toContain(BUILD_NEEDS);
    expect(message).not.toContain(value);
    expect(message).not.toContain(value.trim());
    expect(message).not.toContain("a.example.test");
    expect(message).not.toContain("m.example.test");
  });

  it("accepts loopback upstream origins", () => {
    expect(
      donorRewrites({
        ...ON,
        FRONT_ADMIN_ORIGIN: "http://localhost:3030",
        FRONT_MISSIONARY_ORIGIN: "http://127.0.0.1:3031",
      })?.beforeFiles.map((entry) => entry.destination),
    ).toEqual([
      "http://localhost:3030/admin/_next/:path+",
      "http://127.0.0.1:3031/missionary/_next/:path+",
    ]);
    expect(
      donorRewrites({
        ...ON,
        FRONT_ADMIN_ORIGIN: "http://[::1]:3032",
        FRONT_MISSIONARY_ORIGIN: "http://[::1]:3033",
      })?.beforeFiles.map((entry) => entry.destination),
    ).toEqual([
      "http://[::1]:3032/admin/_next/:path+",
      "http://[::1]:3033/missionary/_next/:path+",
    ]);
  });

  it("refuses a production build or a bad switch before reading either origin", () => {
    const production = donorRefusal(
      envThatRefusesOrigins({ ...ON, VERCEL_ENV: "production" }),
    );
    expect(production).toMatch(/production/i);
    expect(production).not.toMatch(/read FRONT_/);
    const badSwitch = donorRefusal(
      envThatRefusesOrigins({ [CORE_SERVE_UNDER_PATHS_ENV]: "2" }),
    );
    expect(badSwitch).toMatch(/^Invalid CORE_SERVE_UNDER_PATHS value/);
  });

  it("copies the shared upstream-origin rule exactly", () => {
    expect(frontUpstreamOrigin).toBeTypeOf("function");
    for (const value of UPSTREAM_PARITY_VALUES) {
      expect(frontUpstreamOrigin(value), String(value)).toBe(
        canonicalUpstreamOrigin(value),
      );
    }
    expect(frontUpstreamOrigin("https://admin.example.test")).toBe(
      "https://admin.example.test",
    );
    expect(frontUpstreamOrigin("http://[::1]:25051")).toBe(
      "http://[::1]:25051",
    );
    expect(frontUpstreamOrigin("http://core-admin.vercel.app")).toBeNull();
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
    expect(donorCfg.rewrites).toBeUndefined();
  });

  it("loads the donor config off with no rewrites whatever the origins hold", async () => {
    vi.stubEnv("CORE_SERVE_UNDER_PATHS", "");
    vi.stubEnv("VERCEL_ENV", "");
    vi.stubEnv("VERCEL_TARGET_ENV", "");
    vi.stubEnv("FRONT_ADMIN_ORIGIN", "not an origin");
    vi.stubEnv("FRONT_MISSIONARY_ORIGIN", "http://m.example.test");

    const donorMod = await import("../../../apps/donor/next.config");

    expect(donorMod.default.rewrites).toBeUndefined();
    expect(donorMod.default.env?.CORE_SERVE_UNDER_PATHS).toBe("0");
  });

  it("sets basePath, inlined env, donor header skips and the donor's static-file rewrites when CORE_SERVE_UNDER_PATHS=1", async () => {
    vi.stubEnv("CORE_SERVE_UNDER_PATHS", "1");
    vi.stubEnv("VERCEL_ENV", "");
    vi.stubEnv("VERCEL_TARGET_ENV", "");
    vi.stubEnv("FRONT_ADMIN_ORIGIN", ADMIN_UPSTREAM);
    vi.stubEnv("FRONT_MISSIONARY_ORIGIN", MISSIONARY_UPSTREAM);

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
    expect(await donorCfg.rewrites?.()).toStrictEqual(EXPECTED_DONOR_REWRITES);
  });

  it.each(ORIGIN_VARIABLES)(
    "refuses to load the donor config when CORE_SERVE_UNDER_PATHS=1 and %s is missing",
    async (variable) => {
      vi.stubEnv("CORE_SERVE_UNDER_PATHS", "1");
      vi.stubEnv("VERCEL_ENV", "");
      vi.stubEnv("VERCEL_TARGET_ENV", "");
      vi.stubEnv("FRONT_ADMIN_ORIGIN", ADMIN_UPSTREAM);
      vi.stubEnv("FRONT_MISSIONARY_ORIGIN", MISSIONARY_UPSTREAM);
      vi.stubEnv(variable, "");

      await expect(import("../../../apps/donor/next.config")).rejects.toThrow(
        new RegExp(`^${variable} is missing`),
      );
    },
  );

  it("refuses to load the donor config when CORE_SERVE_UNDER_PATHS=1 and an origin is invalid, without printing it", async () => {
    vi.stubEnv("CORE_SERVE_UNDER_PATHS", "1");
    vi.stubEnv("VERCEL_ENV", "");
    vi.stubEnv("VERCEL_TARGET_ENV", "");
    vi.stubEnv("FRONT_ADMIN_ORIGIN", ADMIN_UPSTREAM);
    vi.stubEnv("FRONT_MISSIONARY_ORIGIN", "http://m.example.test");

    const failure = await import("../../../apps/donor/next.config").then(
      () => null,
      (error: unknown) => error,
    );

    expect(failure).toBeInstanceOf(Error);
    expect((failure as Error).message).toMatch(
      /^FRONT_MISSIONARY_ORIGIN is invalid/,
    );
    expect((failure as Error).message).not.toContain("m.example.test");
  });

  it("refuses to load admin next.config when CORE_SERVE_UNDER_PATHS=1 on production", async () => {
    vi.stubEnv("CORE_SERVE_UNDER_PATHS", "1");
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("VERCEL_TARGET_ENV", "");

    await expect(import("../../../apps/admin/next.config")).rejects.toThrow(
      /production/i,
    );
  });

  it("hashes both origins in the donor build and leaves the root build env alone", () => {
    const donorTurbo = JSON.parse(
      readFileSync(path.join(process.cwd(), "apps/donor/turbo.json"), "utf8"),
    ) as { tasks: { build: { env?: string[]; inputs: string[] } } };
    expect(donorTurbo.tasks.build.env).toEqual([
      "$TURBO_EXTENDS$",
      "FRONT_ADMIN_ORIGIN",
      "FRONT_MISSIONARY_ORIGIN",
    ]);
    expect(donorTurbo.tasks.build.inputs).toEqual([
      "$TURBO_EXTENDS$",
      "$TURBO_ROOT$/supabase/migrations/*.sql",
      "$TURBO_ROOT$/apps/admin/src/migrations/*.ts",
      "$TURBO_ROOT$/scripts/release/migration-heads.mjs",
    ]);

    const rootTurbo = JSON.parse(
      readFileSync(path.join(process.cwd(), "turbo.json"), "utf8"),
    ) as { tasks: { build: { env: string[] } } };
    expect(rootTurbo.tasks.build.env).toContain(CORE_SERVE_UNDER_PATHS_ENV);
    expect(rootTurbo.tasks.build.env).not.toContain("FRONT_ADMIN_ORIGIN");
    expect(rootTurbo.tasks.build.env).not.toContain("FRONT_MISSIONARY_ORIGIN");
  });
});
