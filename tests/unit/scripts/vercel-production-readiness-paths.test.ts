import { describe, expect, it, vi } from "vitest";

import {
  PROJECTS,
  readHealth,
  summarizeProjectReadiness,
} from "../../../scripts/verify/vercel-production-readiness.mjs";

describe("production readiness for serving under paths", () => {
  function inspect(
    app: string,
    values: Record<string, string>,
    envTypes: Record<string, string> = {},
  ) {
    const project = PROJECTS.find((p) => p.key === app)!;
    return summarizeProjectReadiness({
      project,
      envValues: values,
      envKeys: Object.keys(values),
      envTypes,
      deployments: [],
      commit: "sha",
      health: null,
      productionBranch: "production",
    });
  }
  it("validates the project's switch without including its value in errors", () => {
    expect(() =>
      inspect("admin", { CORE_SERVE_UNDER_PATHS: "private-invalid" }),
    ).toThrow(/^Invalid CORE_SERVE_UNDER_PATHS$/);
  });
  it.each(["admin", "missionary"])("%s needs its own stamp key", (app) => {
    expect(inspect(app, { CORE_SERVE_UNDER_PATHS: "1" }).missingEnv).toContain(
      "FRONT_STAMP_KEY",
    );
    expect(
      inspect(app, { CORE_SERVE_UNDER_PATHS: "0" }).missingEnv,
    ).not.toContain("FRONT_STAMP_KEY");
    const report = inspect(
      app,
      { CORE_SERVE_UNDER_PATHS: "1", FRONT_STAMP_KEY: "[SENSITIVE]" },
      { FRONT_STAMP_KEY: "sensitive" },
    );
    expect(report.unreadableEnv).toContain("FRONT_STAMP_KEY");
    expect(report.invalidEnv.map((v) => v.key)).not.toContain(
      "FRONT_STAMP_KEY",
    );
  });
  it("checks both donor origins and counts UTF-8 bytes for keys", () => {
    const values = {
      CORE_SERVE_UNDER_PATHS: "1",
      FRONT_ADMIN_ORIGIN: "http://insecure.test",
      FRONT_MISSIONARY_ORIGIN: "https://mission.test",
      FRONT_STAMP_KEY_ADMIN: "é".repeat(16),
      FRONT_STAMP_KEY_MISSIONARY: "x".repeat(31),
    };
    const report = inspect("donor", values);
    expect(report.invalidEnv.map((v) => v.key).sort()).toEqual([
      "FRONT_ADMIN_ORIGIN",
      "FRONT_STAMP_KEY_MISSIONARY",
    ]);
    expect(
      inspect("donor", { CORE_SERVE_UNDER_PATHS: "1" }).missingEnv,
    ).toEqual(
      expect.arrayContaining([
        "FRONT_ADMIN_ORIGIN",
        "FRONT_MISSIONARY_ORIGIN",
        "FRONT_STAMP_KEY_ADMIN",
        "FRONT_STAMP_KEY_MISSIONARY",
      ]),
    );
  });
  it("probes the dashboard migration route on its own origin with its own bypass", async () => {
    const request = vi.fn(async (_url: string, _init?: RequestInit) =>
      Response.json({ status: "ok", release: { commit: "built" } }),
    );
    const admin = PROJECTS.find((p) => p.key === "admin")!;
    const health = await readHealth(
      admin,
      false,
      true,
      { VERCEL_ADMIN_AUTOMATION_BYPASS_SECRET: "fixture" },
      request,
    );
    expect(request).toHaveBeenCalledWith(
      "https://admin.asymmetric.al/admin/api/health/migrations",
      expect.objectContaining({
        redirect: "error",
        headers: { "x-vercel-protection-bypass": "fixture" },
      }),
    );
    expect(health?.releaseCommit).toBe("built");
    request.mockClear();
    expect(await readHealth(admin, true, true, {}, request)).toBeNull();
    expect(request).not.toHaveBeenCalled();
  });
});
