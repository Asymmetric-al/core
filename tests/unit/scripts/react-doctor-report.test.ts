import { describe, expect, it } from "vitest";

import { REACT_DOCTOR_VERSION } from "../../../scripts/react-doctor-first-party.mjs";
import { parseReactDoctorReport } from "../../../scripts/react-doctor-report.mjs";

describe("React Doctor supported CLI report boundary", () => {
  const root = "/fixture/apps/admin";
  const diagnostic = {
    filePath: "component.tsx",
    plugin: "react-doctor",
    rule: "no-tiny-text",
    severity: "warning",
    fingerprint: "finding",
    line: 1,
    column: 1,
  };
  const report = {
    schemaVersion: 3,
    version: REACT_DOCTOR_VERSION,
    mode: "full",
    ok: true,
    error: null,
    directory: root,
    diagnostics: [diagnostic],
    summary: {
      errorCount: 0,
      warningCount: 1,
      totalDiagnosticCount: 1,
      score: null,
    },
    projects: [
      {
        directory: root,
        packageRoot: root,
        project: { rootDirectory: root },
        diagnostics: [diagnostic],
        score: null,
        complete: true,
        skippedChecks: [],
        analyzedFiles: ["component.tsx"],
        analyzedFileCount: 1,
        scannedFileCount: 1,
      },
    ],
  };
  it("keeps every reported warning regardless of its default CI surface", () => {
    expect(
      parseReactDoctorReport(report, "apps/admin", root).diagnostics,
    ).toEqual([diagnostic]);
  });
  it("rejects partial projects, missing checks, mismatched counts, scores, and protocol/version drift", () => {
    for (const invalid of [
      { ...report, projects: [{ ...report.projects[0], complete: false }] },
      {
        ...report,
        projects: [
          {
            ...report.projects[0],
            analyzedFiles: [],
            analyzedFileCount: 0,
            scannedFileCount: 0,
          },
        ],
      },
      {
        ...report,
        projects: [{ ...report.projects[0], skippedChecks: ["dead-code"] }],
      },
      { ...report, summary: { ...report.summary, totalDiagnosticCount: 0 } },
      { ...report, summary: { ...report.summary, score: 100 } },
      { ...report, version: "next" },
      { ...report, schemaVersion: 99 },
      { ...report, ok: false },
      { ...report, skippedProjects: ["apps/donor"] },
      { ...report, projects: [{ ...report.projects[0], directory: "/wrong" }] },
      {
        ...report,
        projects: [{ ...report.projects[0], packageRoot: "/wrong" }],
      },
      {
        ...report,
        projects: [
          { ...report.projects[0], project: { rootDirectory: "/wrong" } },
        ],
      },
      {
        ...report,
        diagnostics: [],
        summary: {
          errorCount: 0,
          warningCount: 0,
          totalDiagnosticCount: 0,
          score: null,
        },
      },
    ])
      expect(() =>
        parseReactDoctorReport(invalid, "apps/admin", root),
      ).toThrow();
  });
});

describe("React Doctor diagnostic identity and severity", () => {
  const root = "/fixture/apps/admin";
  const valid = {
    filePath: "component.tsx",
    plugin: "react-doctor",
    rule: "no-tiny-text",
    severity: "warning",
    fingerprint: "finding",
    line: 1,
    column: 1,
  };
  function reportWith(diagnostic: Record<string, unknown>) {
    return {
      schemaVersion: 3,
      version: REACT_DOCTOR_VERSION,
      mode: "full",
      ok: true,
      error: null,
      directory: root,
      diagnostics: [diagnostic],
      summary: {
        errorCount: diagnostic.severity === "error" ? 1 : 0,
        warningCount: diagnostic.severity === "warning" ? 1 : 0,
        totalDiagnosticCount: 1,
        score: null,
      },
      projects: [
        {
          directory: root,
          packageRoot: root,
          project: { rootDirectory: root },
          diagnostics: [diagnostic],
          score: null,
          complete: true,
          skippedChecks: [],
          analyzedFiles: ["component.tsx"],
          analyzedFileCount: 1,
          scannedFileCount: 1,
        },
      ],
    };
  }

  it.each(["warning", "error"])(
    "accepts a %s diagnostic with a complete identity",
    (severity) => {
      expect(
        parseReactDoctorReport(
          reportWith({ ...valid, severity }),
          "apps/admin",
          root,
        ).diagnostics,
      ).toEqual([{ ...valid, severity }]);
    },
  );

  it.each([
    ["an unsupported severity", { severity: "mystery" }],
    ["no severity", { severity: undefined }],
    ["no fingerprint", { fingerprint: undefined }],
    ["an empty fingerprint", { fingerprint: "" }],
    ["no plugin", { plugin: undefined }],
    ["an empty plugin", { plugin: "" }],
    ["no rule", { rule: undefined }],
    ["an empty rule", { rule: "" }],
  ])("rejects a diagnostic with %s", (_label, change) => {
    expect(() =>
      parseReactDoctorReport(
        reportWith({ ...valid, ...change }),
        "apps/admin",
        root,
      ),
    ).toThrow(/diagnostic identity or severity is unsupported/i);
  });
});

describe("React Doctor incomplete-scan reasons", () => {
  const root = "/fixture/apps/donor";
  const project = {
    directory: root,
    packageRoot: root,
    project: { rootDirectory: root },
    diagnostics: [],
    score: null,
    complete: false,
    skippedChecks: [],
    skippedCheckReasons: {
      "lint:partial":
        "1 file(s) failed to lint and were skipped (app/checkout.tsx) — first failure: oxlint batch timed out: 60s budget exceeded",
    },
    analyzedFiles: ["app/page.tsx"],
    analyzedFileCount: 1,
    scannedFileCount: 2,
  };
  const report = {
    schemaVersion: 3,
    version: REACT_DOCTOR_VERSION,
    mode: "full",
    ok: true,
    error: null,
    directory: root,
    diagnostics: [],
    summary: {
      errorCount: 0,
      warningCount: 0,
      totalDiagnosticCount: 0,
      score: null,
    },
    projects: [project],
  };

  it("names the target and the scanner's reasons when a project is partial", () => {
    expect(() => parseReactDoctorReport(report, "apps/donor", root)).toThrow(
      /partial project for apps\/donor \(lint:partial: 1 file\(s\) failed to lint .*oxlint batch timed out: 60s budget exceeded\)/,
    );
  });

  it("still names the target when the scanner gives no reason", () => {
    const { skippedCheckReasons: _omitted, ...withoutReasons } = project;
    expect(() =>
      parseReactDoctorReport(
        { ...report, projects: [withoutReasons] },
        "apps/donor",
        root,
      ),
    ).toThrow(/partial project for apps\/donor\.$/);
  });
});
