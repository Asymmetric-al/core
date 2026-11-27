import { afterEach, describe, expect, it, vi } from "vitest";

import { deploymentPathPrefix } from "../../../../scripts/release/serve-under-paths.mjs";

const APPS = ["admin", "missionary", "donor"] as const;

describe("deploymentPathPrefix: the path prefix of an app's deployment, read as the build reads the switch", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it.each([
    ["unset", {}],
    ["empty", { CORE_SERVE_UNDER_PATHS: "" }],
    ["0", { CORE_SERVE_UNDER_PATHS: "0" }],
  ])("gives the root for every app when the switch is %s", (_label, env) => {
    for (const app of APPS) {
      expect(deploymentPathPrefix(app, env), app).toBe("");
    }
  });

  it("gives /admin, /missionary and the donor's root when the switch is exactly 1", () => {
    const env = { CORE_SERVE_UNDER_PATHS: "1" };
    expect(deploymentPathPrefix("admin", env)).toBe("/admin");
    expect(deploymentPathPrefix("missionary", env)).toBe("/missionary");
    expect(deploymentPathPrefix("donor", env)).toBe("");
    expect(
      deploymentPathPrefix("admin", { ...env, VERCEL_ENV: "preview" }),
    ).toBe("/admin");
  });

  it.each([" 1", "1 ", "\t1", "true", "on", "yes", "TRUE", "01", "2", "1\n"])(
    "throws as the build does for the switch value %j, for every app",
    (value) => {
      for (const app of APPS) {
        expect(
          () => deploymentPathPrefix(app, { CORE_SERVE_UNDER_PATHS: value }),
          app,
        ).toThrow(
          `Invalid CORE_SERVE_UNDER_PATHS value ${JSON.stringify(value)}: expected unset, "0", or "1".`,
        );
      }
    },
  );

  it.each([
    ["VERCEL_ENV", " Production "],
    ["VERCEL_ENV", "production"],
    ["VERCEL_TARGET_ENV", "PRODUCTION"],
    ["VERCEL_TARGET_ENV", "production"],
  ])(
    "uses each app's production prefix for 1 with %s=%j, for every app",
    (name, value) => {
      for (const app of APPS) {
        expect(
          deploymentPathPrefix(app, {
            CORE_SERVE_UNDER_PATHS: "1",
            [name]: value,
          }),
          app,
        ).toBe(app === "donor" ? "" : `/${app}`);
      }
    },
  );

  it("gives the root on a production target when the switch is 0 or unset", () => {
    for (const app of APPS) {
      expect(
        deploymentPathPrefix(app, {
          CORE_SERVE_UNDER_PATHS: "0",
          VERCEL_ENV: " Production ",
        }),
        app,
      ).toBe("");
      expect(
        deploymentPathPrefix(app, { VERCEL_TARGET_ENV: "production" }),
        app,
      ).toBe("");
    }
  });

  it.each([
    "eve",
    "factory-console",
    "",
    "Admin",
    "constructor",
    "toString",
    "__proto__",
  ])("throws for the unknown app %j, whatever the switch", (app) => {
    for (const value of [undefined, "0", "1"]) {
      expect(() =>
        deploymentPathPrefix(app, { CORE_SERVE_UNDER_PATHS: value }),
      ).toThrow(`Unknown app for serveUnderPathsBuildEnv: ${app}`);
    }
  });

  it("reads the process environment when no environment is given", () => {
    vi.stubEnv("CORE_SERVE_UNDER_PATHS", "1");
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.stubEnv("VERCEL_TARGET_ENV", "");
    expect(deploymentPathPrefix("missionary")).toBe("/missionary");
    vi.stubEnv("VERCEL_ENV", "production");
    expect(deploymentPathPrefix("missionary")).toBe("/missionary");
  });
});
