import { AUDIT_CATEGORIES, RULE_CATALOG } from "@shadscan/cli";
import { describe, expect, it } from "vitest";

import {
  validatePolicy,
  validateReport,
} from "../../../scripts/verify/shadscan-policy.mjs";

const policy = {
  schemaVersion: 2,
  engineVersion: "0.17.0",
  rulesetVersion: "2026.08.46",
  reportSchemaVersion: 9,
  applicationFloors: {
    "apps/admin": 35,
    "apps/donor": 41,
    "apps/missionary": 47,
  },
  applicationCategoryFloors: Object.fromEntries(
    ["apps/admin", "apps/donor", "apps/missionary"].map((project) => [
      project,
      Object.fromEntries(AUDIT_CATEGORIES.map((category) => [category, 0])),
    ]),
  ),
};

function completeReport() {
  return {
    engineVersion: "0.17.0",
    rulesetVersion: "2026.08.46",
    schemaVersion: 9,
    score: 100,
    coverage: { source: "complete" },
    scope: {
      categories: [
        "foundation",
        "interaction",
        "states",
        "accessibility",
        "forms",
        "production-polish",
      ],
    },
    categories: [
      "foundation",
      "interaction",
      "states",
      "accessibility",
      "forms",
      "production-polish",
    ].map((id) => ({
      id,
      applicable: true,
      weight: ["forms", "production-polish"].includes(id) ? 10 : 20,
      maxScore: ["forms", "production-polish"].includes(id) ? 10 : 20,
      percentage: 100,
      score: ["forms", "production-polish"].includes(id) ? 10 : 20,
    })),
    findings: [
      "apps/admin",
      "apps/donor",
      "apps/missionary",
      "packages/ui",
    ].flatMap((packageDir) =>
      RULE_CATALOG.filter(
        (rule) =>
          rule.adapters.includes("core") ||
          rule.adapters.includes(
            packageDir.startsWith("apps/")
              ? "next-app-router"
              : "generic-react",
          ),
      ).map((rule) => ({
        id: rule.id,
        category: rule.category,
        packageDir,
        status: packageDir.startsWith("apps/") ? "pass" : "fail",
        maxScore: rule.maxScore,
        score: packageDir.startsWith("apps/") ? rule.maxScore : 0,
        impactsScore: packageDir.startsWith("apps/") && rule.maxScore > 0,
        evidence: [],
      })),
    ),
    workspace: {
      applicationCount: 3,
      truncated: 0,
      skipped: [],
      projects: [
        {
          packageDir: "apps/admin",
          kind: "application",
          poolsIntoScore: true,
          score: 100,
        },
        {
          packageDir: "apps/donor",
          kind: "application",
          poolsIntoScore: true,
          score: 100,
        },
        {
          packageDir: "apps/missionary",
          kind: "application",
          poolsIntoScore: true,
          score: 100,
        },
        {
          packageDir: "packages/ui",
          kind: "library",
          poolsIntoScore: false,
          score: 0,
        },
      ],
    },
  };
}

describe("Shadscan complete workspace gate", () => {
  it("accepts a complete category policy without changing the raw report", () => {
    const report = completeReport();
    expect(validateReport(report, policy)).toBe(report);
  });

  it("accepts an actual perfect report at 100 in every app and category", () => {
    const perfectPolicy = structuredClone(policy);
    for (const project of Object.keys(perfectPolicy.applicationFloors)) {
      Object.assign(perfectPolicy.applicationFloors, { [project]: 100 });
      for (const category of AUDIT_CATEGORIES) {
        perfectPolicy.applicationCategoryFloors[project]![category] = 100;
      }
    }
    const report = completeReport();
    expect(validateReport(report, perfectPolicy)).toBe(report);
  });

  it.each([-1, 1.5, Number.NaN, undefined, null, "100"])(
    "rejects a category floor that is not an integer score: %s",
    (foundation) => {
      const invalidPolicy = {
        ...policy,
        applicationCategoryFloors: {
          ...policy.applicationCategoryFloors,
          "apps/admin": {
            ...policy.applicationCategoryFloors["apps/admin"],
            foundation,
          },
        },
      };
      expect(() => validatePolicy(invalidPolicy)).toThrow(
        /apps\/admin.*invalid category floor.*foundation/,
      );
    },
  );

  it("requires category protection for every application", () => {
    const incompletePolicy = structuredClone(policy);
    delete incompletePolicy.applicationCategoryFloors["apps/missionary"];
    expect(() => validatePolicy(incompletePolicy)).toThrow(
      /category.*all three applications/,
    );
  });

  it.each(["missing", "extra", "invalid"])(
    "rejects %s category floors in a protected application",
    (mutation) => {
      const incompletePolicy = structuredClone(policy);
      const floors = incompletePolicy.applicationCategoryFloors["apps/admin"]!;
      if (mutation === "missing") delete floors.foundation;
      if (mutation === "extra") floors.invented = 50;
      if (mutation === "invalid") floors.foundation = 101;
      expect(() => validatePolicy(incompletePolicy)).toThrow(
        /apps\/admin.*category/,
      );
    },
  );

  it("rejects one category's regression despite a rounded pooled 100", () => {
    const report = completeReport();
    const favicon = report.findings.find(
      (finding) =>
        finding.packageDir === "apps/admin" && finding.id === "favicon-present",
    )!;
    expect(favicon.maxScore).toBe(2);
    favicon.status = "fail";
    favicon.score = 0;
    // Foundation earns 25 of 27 points in admin, 79 of 81 across all apps.
    // Its weighted scores still round to admin 99 and pooled 100.
    report.workspace.projects[0]!.score = 99;
    report.categories[0]!.percentage = 98;
    report.categories[0]!.score = (79 / 81) * 20;
    expect(validateReport(report, policy)).toBe(report);

    const protectedPolicy = structuredClone(policy);
    protectedPolicy.applicationCategoryFloors["apps/admin"]!.foundation = 95;
    expect(() => validateReport(report, protectedPolicy)).toThrow(
      /apps\/admin.*foundation.*93.*95/,
    );
  });

  it("rejects an unassessed application category even with a zero floor", () => {
    const report = completeReport();
    for (const finding of report.findings) {
      if (
        finding.packageDir === "apps/admin" &&
        finding.category === "foundation"
      ) {
        finding.status = "not-applicable";
        finding.maxScore = 0;
        finding.score = 0;
        finding.impactsScore = false;
      }
    }
    expect(() => validateReport(report, policy)).toThrow(
      /apps\/admin.*foundation.*unassessed/,
    );
  });

  it.each(["missing", "duplicate", "extra"])(
    "rejects %s rule assessments despite a complete coverage claim",
    (mutation) => {
      const report = completeReport();
      expect(
        report.findings.filter(
          (finding) => finding.packageDir === "apps/admin",
        ),
      ).toHaveLength(62);
      if (mutation === "missing") report.findings.splice(0, 1);
      if (mutation === "duplicate")
        report.findings.push({ ...report.findings[0]! });
      if (mutation === "extra")
        report.findings.push({ ...report.findings[0]!, id: "invented-rule" });
      expect(() => validateReport(report, policy)).toThrow(
        /rule coverage|duplicate rule/,
      );
    },
  );

  it("rejects empty findings and spoofed score points or category totals", () => {
    expect(() =>
      validateReport({ ...completeReport(), findings: [] }, policy),
    ).toThrow(/rule coverage/);
    const points = completeReport();
    points.findings[0]!.score = 999;
    expect(() => validateReport(points, policy)).toThrow(
      /inconsistent raw points/,
    );
    const categories = completeReport();
    categories.categories[0]!.score = 999;
    expect(() => validateReport(categories, policy)).toThrow(/raw category/);
    const project = completeReport();
    project.workspace.projects[0]!.score = 99;
    expect(() => validateReport(project, policy)).toThrow(
      /raw score disagrees/,
    );
    expect(() =>
      validateReport({ ...completeReport(), score: 99 }, policy),
    ).toThrow(/Pooled score disagrees/);
  });

  it.each([
    ["engineVersion", "0.1.1"],
    ["rulesetVersion", "other-rules"],
    ["schemaVersion", 8],
    ["score", null],
  ])("rejects an unsupported %s", (key, value) => {
    const report = { ...completeReport(), [key]: value };
    expect(() => validateReport(report, policy)).toThrow();
  });

  it("rejects partial source coverage", () => {
    const report = completeReport();
    report.coverage.source = "partial";
    expect(() => validateReport(report, policy)).toThrow(/coverage/);
  });

  it("rejects truncated workspace discovery", () => {
    const report = completeReport();
    report.workspace.truncated = 1;
    expect(() => validateReport(report, policy)).toThrow(/truncated/);
  });

  it("rejects a missing app instead of accepting a partial pooled score", () => {
    const report = completeReport();
    report.workspace.projects.splice(0, 1);
    report.workspace.applicationCount = 2;
    expect(() => validateReport(report, policy)).toThrow(
      /application.*coverage/,
    );
  });

  it("rejects duplicate apps and null app scores", () => {
    const report = completeReport();
    const unassessed = {
      ...report,
      workspace: {
        ...report.workspace,
        projects: [
          { ...report.workspace.projects[0], score: null },
          ...report.workspace.projects.slice(1),
        ],
      },
    };
    expect(() => validateReport(unassessed, policy)).toThrow(
      /apps\/admin.*score/,
    );
    report.workspace.projects[0] = report.workspace.projects[1]!;
    expect(() => validateReport(report, policy)).toThrow(/duplicate/);
  });

  it("rejects one app's regression even when the pooled score is high", () => {
    const report = completeReport();
    report.workspace.projects[0]!.score = 34;

    expect(() => validateReport(report, policy)).toThrow(/apps\/admin.*35/);
  });
});
