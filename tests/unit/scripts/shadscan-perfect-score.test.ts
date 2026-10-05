import { RULE_CATALOG } from "@shadscan/cli";
import { describe, expect, it, vi } from "vitest";

import { validateReport } from "../../../scripts/verify/shadscan-policy.mjs";

// Exercise the SDK boundary with a larger catalog: one missing point can round
// back to 100. The gate must remain exact if an official catalog grows.
vi.mock("@shadscan/cli", () => ({
  RULE_CATALOG: [
    { id: "foundation-major", category: "foundation", maxScore: 1000 },
    { id: "foundation-minor", category: "foundation", maxScore: 1 },
    { id: "foundation-informational", category: "foundation", maxScore: 0 },
    ...[
      "interaction",
      "states",
      "accessibility",
      "forms",
      "production-polish",
    ].map((category) => ({ id: category, category, maxScore: 1 })),
  ].map((rule) => ({ ...rule, adapters: ["core"] })),
}));

function roundedReportFixture() {
  const applications = ["apps/admin", "apps/donor", "apps/missionary"];
  const categories = [
    "foundation",
    "interaction",
    "states",
    "accessibility",
    "forms",
    "production-polish",
  ];
  const report = {
    engineVersion: "0.17.0",
    rulesetVersion: "2026.08.46",
    schemaVersion: 9,
    score: 100,
    coverage: { source: "complete" },
    scope: { categories },
    categories: categories.map((id) => {
      const weight = ["forms", "production-polish"].includes(id) ? 10 : 20;
      return {
        id,
        applicable: true,
        weight,
        maxScore: weight,
        percentage: 100,
        score: id === "foundation" ? (3002 / 3003) * 20 : weight,
      };
    }),
    findings: applications.flatMap((packageDir) =>
      RULE_CATALOG.map((rule) => {
        const failed =
          packageDir === "apps/admin" && rule.id === "foundation-minor";
        return {
          id: rule.id,
          category: rule.category,
          packageDir,
          status: failed ? "fail" : "pass",
          maxScore: rule.maxScore,
          score: failed ? 0 : rule.maxScore,
          impactsScore: rule.maxScore > 0,
          evidence: [],
        };
      }),
    ),
    workspace: {
      applicationCount: 3,
      truncated: 0,
      skipped: [],
      projects: applications.map((packageDir) => ({
        packageDir,
        kind: "application",
        poolsIntoScore: true,
        score: 100,
      })),
    },
  };
  const policy = {
    schemaVersion: 2,
    engineVersion: "0.17.0",
    rulesetVersion: "2026.08.46",
    reportSchemaVersion: 9,
    applicationFloors: Object.fromEntries(applications.map((app) => [app, 0])),
    applicationCategoryFloors: Object.fromEntries(
      applications.map((app) => [
        app,
        Object.fromEntries(categories.map((id) => [id, 0])),
      ]),
    ),
  };
  return { report, policy };
}

function advisoryReportFixture(ruleId = "foundation-minor") {
  const fixture = roundedReportFixture();
  for (const finding of fixture.report.findings) {
    finding.status = "pass";
    finding.score = finding.maxScore;
  }
  for (const category of fixture.report.categories) {
    category.score = category.maxScore;
  }
  const finding = fixture.report.findings.find(
    (item) => item.packageDir === "apps/admin" && item.id === ruleId,
  )!;
  finding.status = "advisory";
  finding.impactsScore = false;
  return fixture;
}

describe("Shadscan genuine perfect-score gate", () => {
  it("preserves existing raw category floors before activating a perfect application target", () => {
    const { report, policy } = advisoryReportFixture();
    expect(validateReport(report, policy)).toBe(report);
    policy.applicationCategoryFloors["apps/admin"]!.foundation = 100;
    expect(validateReport(report, policy)).toBe(report);
    policy.applicationFloors["apps/admin"] = 100;
    expect(() => validateReport(report, policy)).toThrow(
      /unresolved scored advisory/,
    );
  });

  it("rejects unresolved scored advisories at a 100 overall floor", () => {
    const { report, policy } = advisoryReportFixture();
    expect(validateReport(report, policy)).toBe(report);
    policy.applicationFloors["apps/admin"] = 100;
    expect(() => validateReport(report, policy)).toThrow(
      /apps\/admin.*unresolved scored advisory/,
    );
  });

  it("retains zero-point advisories without making them a score-bearing defect", () => {
    const { report, policy } = advisoryReportFixture(
      "foundation-informational",
    );
    policy.applicationFloors["apps/admin"] = 100;
    policy.applicationCategoryFloors["apps/admin"]!.foundation = 100;
    expect(validateReport(report, policy)).toBe(report);
    expect(
      report.findings.find((item) => item.id === "foundation-informational")
        ?.status,
    ).toBe("advisory");
  });

  it("keeps a perfect category independent from another category's unresolved advisory", () => {
    const { report, policy } = advisoryReportFixture();
    policy.applicationCategoryFloors["apps/admin"]!.interaction = 100;
    const before = structuredClone(report);
    expect(validateReport(report, policy)).toBe(report);
    expect(report).toEqual(before);
  });

  it("rejects a scored failure even when every reported percentage rounds to 100", () => {
    const { report, policy } = roundedReportFixture();
    expect(validateReport(report, policy)).toBe(report);
    policy.applicationCategoryFloors["apps/admin"]!.foundation = 100;
    expect(() => validateReport(report, policy)).toThrow(
      /apps\/admin.*foundation.*every scored point/,
    );
  });

  it("requires every scored point when an application's overall floor is 100", () => {
    const { report, policy } = roundedReportFixture();
    expect(validateReport(report, policy)).toBe(report);
    policy.applicationFloors["apps/admin"] = 100;
    expect(() => validateReport(report, policy)).toThrow(
      /apps\/admin.*every scored point/,
    );
  });
});
