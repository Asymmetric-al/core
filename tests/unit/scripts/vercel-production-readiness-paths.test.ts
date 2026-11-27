import { describe, expect, it, vi } from "vitest";

import {
  crossProjectSwitchProblem,
  formatReadinessReport,
  PROJECTS,
  readHealth,
  readinessExitCode,
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

describe("readiness compares the switch state each app reports", () => {
  const donor = {
    key: "donor",
    project: "asym-donor",
    vercelConfigPath: "apps/donor/vercel.json",
    healthUrl: "https://donor.asymmetric.al/api/health",
    requiredEnv: [],
  };
  const onValues = {
    CORE_SERVE_UNDER_PATHS: "1",
    FRONT_ADMIN_ORIGIN: "https://admin.asymmetric.al",
    FRONT_MISSIONARY_ORIGIN: "https://missionary.asymmetric.al",
    FRONT_STAMP_KEY_ADMIN: "a".repeat(32),
    FRONT_STAMP_KEY_MISSIONARY: "m".repeat(32),
  };

  function donorReport(
    reported: boolean | undefined,
    envValues: Record<string, string> = onValues,
    requestedPaths = false,
  ) {
    return summarizeProjectReadiness({
      project: donor,
      envKeys: Object.keys(envValues),
      envValues,
      envTypes: {},
      deployments: [
        {
          url: "donor.example.vercel.app",
          state: "READY",
          target: "production",
          createdAt: 1,
          commitSha: "built",
          commitRef: "production",
        },
      ],
      commit: "built",
      health: {
        url: "https://donor.asymmetric.al/api/health/migrations",
        status: 200,
        releaseCommit: "built",
        serveUnderPaths: reported,
      },
      productionBranch: "production",
      productionGitDeployments: false,
      requestedPaths,
    });
  }

  it("reads the state an app reports beside its commit", async () => {
    const request = vi.fn(async (_url: string, _init?: RequestInit) =>
      Response.json({
        status: "ok",
        release: { commit: "built", serveUnderPaths: false },
      }),
    );
    const project = PROJECTS.find((p) => p.key === "donor")!;
    const health = await readHealth(project, false, true, {}, request);
    expect(health?.serveUnderPaths).toBe(false);
  });

  it("is ready when the donor reports the expected path mode (guard)", () => {
    expect(donorReport(true).ready).toBe(true);
  });

  it.each([
    ["reports off", false],
    ["reports no state", undefined],
  ] as const)(
    "is not ready when path mode is expected and the donor %s, and the summary names it",
    (_label, reported) => {
      for (const report of [
        donorReport(reported),
        donorReport(
          reported,
          { ...onValues, CORE_SERVE_UNDER_PATHS: "0" },
          true,
        ),
      ]) {
        expect(report.ready).toBe(false);
        const text = formatReadinessReport({
          commit: "built",
          reports: [report],
        });
        expect(text).toContain("Overall: BLOCKED (asym-donor)");
        expect(text).toContain(
          `Release health serveUnderPaths: ${reported ?? "absent"} (expected true)`,
        );
      }
    },
  );

  it.each([false, undefined, true])(
    "off, the reported state (%s) changes nothing, as today (guard)",
    (reported) => {
      const report = donorReport(reported, {}, false);
      expect(report.ready).toBe(true);
      expect(
        formatReadinessReport({ commit: "built", reports: [report] }),
      ).not.toContain("Release health serveUnderPaths");
    },
  );
});

const KEY = "k".repeat(32);
const PATH_VALUES: Record<string, Record<string, string>> = {
  admin: { CORE_SERVE_UNDER_PATHS: "1", FRONT_STAMP_KEY: KEY },
  missionary: { CORE_SERVE_UNDER_PATHS: "1", FRONT_STAMP_KEY: KEY },
  donor: {
    CORE_SERVE_UNDER_PATHS: "1",
    FRONT_ADMIN_ORIGIN: "https://admin.asymmetric.al",
    FRONT_MISSIONARY_ORIGIN: "https://missionary.asymmetric.al",
    FRONT_STAMP_KEY_ADMIN: KEY,
    FRONT_STAMP_KEY_MISSIONARY: KEY,
  },
};

function projectReport(
  key: "admin" | "missionary" | "donor",
  values: Record<string, string>,
  releaseCommit: string | null = "built",
) {
  return summarizeProjectReadiness({
    project: {
      key,
      project: key,
      vercelConfigPath: `apps/${key}/vercel.json`,
      healthUrl: `https://${key}.asymmetric.al/api/health`,
      requiredEnv: [],
    },
    envKeys: Object.keys(values),
    envValues: values,
    envTypes: {},
    deployments: [
      {
        url: `${key}.example.vercel.app`,
        state: "READY",
        target: "production",
        createdAt: 1,
        commitSha: "built",
        commitRef: "production",
      },
    ],
    commit: "built",
    health: {
      url: `https://${key}.asymmetric.al/api/health/migrations`,
      status: 200,
      releaseCommit: releaseCommit ?? undefined,
      serveUnderPaths: values.CORE_SERVE_UNDER_PATHS === "1" ? true : undefined,
    },
    productionBranch: "production",
    productionGitDeployments: false,
  });
}

describe("#2845 item 6: readiness compares the switch across the three projects", () => {
  it("blocks when the projects' configured values differ, whatever the shell says", () => {
    const reports = [
      projectReport("admin", PATH_VALUES.admin!),
      projectReport("missionary", PATH_VALUES.missionary!),
      projectReport("donor", {}),
    ];
    expect(reports.every((report) => report.ready)).toBe(true);
    expect(crossProjectSwitchProblem(reports)).toBe(
      "CORE_SERVE_UNDER_PATHS differs across projects: admin on, missionary on, donor off",
    );
    const text = formatReadinessReport({ commit: "built", reports });
    expect(text).toContain(
      "Switch: CORE_SERVE_UNDER_PATHS differs across projects: admin on, missionary on, donor off",
    );
    expect(text).toContain("Overall: BLOCKED");
    expect(text).not.toContain("Overall: READY");
    expect(readinessExitCode(reports)).toBe(1);
  });

  it.each([
    ["all on", PATH_VALUES],
    ["all off", { admin: {}, missionary: {}, donor: {} }],
  ] as const)("passes when the three agree, %s (guard)", (_label, values) => {
    const reports = (["admin", "missionary", "donor"] as const).map((key) =>
      projectReport(key, values[key]!),
    );
    expect(crossProjectSwitchProblem(reports)).toBeNull();
    expect(formatReadinessReport({ commit: "built", reports })).toContain(
      "Overall: READY",
    );
    expect(readinessExitCode(reports)).toBe(0);
  });
});

describe("#2845 item 8: in path mode the live commit must be the target commit", () => {
  it.each([null, "unknown", "older"])(
    "an app on paths reporting commit %s is not ready",
    (commit) => {
      expect(projectReport("admin", PATH_VALUES.admin!, commit).ready).toBe(
        false,
      );
    },
  );

  it("an app on paths reporting the target commit is ready (guard)", () => {
    expect(projectReport("admin", PATH_VALUES.admin!, "built").ready).toBe(
      true,
    );
  });

  it.each([null, "unknown"])(
    "off keeps today's tolerance for commit %s (guard)",
    (commit) => {
      expect(projectReport("admin", {}, commit).ready).toBe(true);
    },
  );
});
