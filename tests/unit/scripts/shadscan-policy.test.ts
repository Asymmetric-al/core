import { describe, expect, it } from "vitest";
import { RULE_CATALOG } from "@shadscan/cli";

import { validateReport } from "../../../scripts/verify/shadscan-policy.mjs";

const policy = {
  schemaVersion: 1,
  engineVersion: "0.17.0",
  rulesetVersion: "2026.08.46",
  reportSchemaVersion: 9,
  applicationFloors: {
    "apps/admin": 35,
    "apps/donor": 41,
    "apps/missionary": 47,
  },
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
  it("preserves the report and excludes low library scores from app floors", () => {
    const report = completeReport();
    expect(validateReport(report, policy)).toBe(report);
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
