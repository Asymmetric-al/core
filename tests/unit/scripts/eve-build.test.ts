import { readFileSync } from "node:fs";

import { afterEach, describe, expect, it, vi } from "vitest";

import { runEveBuild } from "../../../packages/eve-runtime/scripts/build.mjs";

afterEach(() => vi.restoreAllMocks());

describe("Eve build dispatch", () => {
  it.each([
    { VERCEL: "1", VERCEL_ENV: "production" },
    { VERCEL: "1", VERCEL_ENV: "preview", VERCEL_TARGET_ENV: "production" },
    { VERCEL: "1", VERCEL_ENV: "preview", VERCEL_TARGET_ENV: " Production " },
    { VERCEL: "1", VERCEL_ENV: " Preview ", VERCEL_TARGET_ENV: "production" },
    { VERCEL: "1", VERCEL_ENV: "preview", VERCEL_TARGET_ENV: "development" },
    {
      VERCEL: "1",
      VERCEL_ENV: "development",
      VERCEL_TARGET_ENV: "development",
    },
    { VERCEL_ENV: "preview" },
    {},
  ])("keeps service qualification full outside hosted preview (%j)", (env) => {
    vi.spyOn(console, "log").mockImplementation(() => undefined);
    const spawn = vi.fn(() => ({ status: 1 }));
    runEveBuild({
      environment: { ...env, CORE_EVE_BUILD_MODE: "artifacts" },
      service: true,
      spawn,
    });
    expect(spawn).toHaveBeenCalledWith(
      process.execPath,
      [expect.any(String), "build"],
      expect.anything(),
    );
  });

  it.each([undefined, "full"])(
    "keeps ordinary/full builds on the required prewarm path (%s)",
    (mode) => {
      const spawn = vi.fn(() => ({ status: 1 }));

      const status = runEveBuild({
        environment: { CORE_EVE_BUILD_MODE: mode },
        spawn,
      });

      expect(spawn.mock.calls[0]?.[1]).toEqual([
        expect.stringMatching(/[/\\]eve[/\\]bin[/\\]eve\.js$/u),
        "build",
      ]);
      expect(status).toBe(1);
    },
  );

  it("selects the supported skip option only for explicit artifacts", () => {
    vi.spyOn(console, "log").mockImplementation(() => undefined);
    const spawn = vi.fn(() => ({ status: 0 }));

    expect(
      runEveBuild({
        environment: { CORE_EVE_BUILD_MODE: "artifacts" },
        args: ["--profile", "profile.json"],
        spawn,
      }),
    ).toBe(0);
    expect(spawn.mock.calls[0]?.[1]).toEqual([
      expect.any(String),
      "build",
      "--skip-sandbox-prewarm",
      "--profile",
      "profile.json",
    ]);
    expect(spawn.mock.calls[0]?.[2]).toEqual(
      expect.objectContaining({ shell: false }),
    );
  });

  it.each([
    { VERCEL_ENV: "preview" },
    { VERCEL_ENV: "preview", VERCEL_TARGET_ENV: "preview" },
    { VERCEL_ENV: "preview", VERCEL_TARGET_ENV: "core-development" },
    { VERCEL_ENV: "preview", VERCEL_TARGET_ENV: "staging" },
    { VERCEL_ENV: "preview", VERCEL_TARGET_ENV: " Core-Development " },
    { VERCEL_ENV: " Preview ", VERCEL_TARGET_ENV: "preview" },
  ])(
    "compiles a hosted preview service without sandbox prewarming (%j)",
    (signals) => {
      vi.spyOn(console, "log").mockImplementation(() => undefined);
      const spawn = vi.fn(() => ({ status: 0 }));
      runEveBuild({
        environment: {
          VERCEL: "1",
          ...signals,
          CORE_EVE_BUILD_MODE: "full",
        },
        service: true,
        spawn,
      });
      expect(spawn).toHaveBeenCalledWith(
        process.execPath,
        [expect.any(String), "build", "--skip-sandbox-prewarm"],
        expect.anything(),
      );
    },
  );

  it.each([false, true])(
    "rejects the SDK skip flag in full mode (service=%s)",
    (service) => {
      const spawn = vi.fn(() => ({ status: 0 }));
      expect(() =>
        runEveBuild({
          environment: { VERCEL: "1", VERCEL_ENV: "production" },
          service,
          args: ["--skip-sandbox-prewarm"],
          spawn,
        }),
      ).toThrow("--skip-sandbox-prewarm is only supported in artifacts mode.");
      expect(spawn).not.toHaveBeenCalled();
    },
  );

  it("rejects an unknown mode without starting the SDK", () => {
    const spawn = vi.fn();
    expect(() =>
      runEveBuild({
        environment: { CORE_EVE_BUILD_MODE: "other" },
        spawn,
      }),
    ).toThrow("CORE_EVE_BUILD_MODE must be full or artifacts.");
    expect(spawn).not.toHaveBeenCalled();
  });

  it("fails when the SDK cannot start or exits without a status", () => {
    const error = new Error("spawn failed");
    expect(() =>
      runEveBuild({ environment: {}, spawn: () => ({ error }) }),
    ).toThrow(error);
    expect(
      runEveBuild({ environment: {}, spawn: () => ({ status: null }) }),
    ).toBe(1);
  });

  it("keeps full qualification explicit and distinct from cached artifacts", () => {
    const packageJson = JSON.parse(
      readFileSync("packages/eve-runtime/package.json", "utf8"),
    );
    const turbo = JSON.parse(readFileSync("turbo.json", "utf8"));
    const eveTurbo = JSON.parse(
      readFileSync("packages/eve-runtime/turbo.json", "utf8"),
    );

    expect(packageJson.scripts["build:full"]).toBe(
      "node scripts/build.mjs --full",
    );
    expect(packageJson.scripts["build:artifacts"]).toBe(
      "node scripts/build.mjs --artifacts",
    );
    expect(packageJson.scripts["build:service"]).toBe(
      "node scripts/build.mjs --service",
    );
    expect(turbo.tasks.build.env).toContain("CORE_EVE_BUILD_MODE");
    expect(eveTurbo.extends).toEqual(["//"]);
    expect(eveTurbo.tasks.build.cache).toBe(false);
  });
});
