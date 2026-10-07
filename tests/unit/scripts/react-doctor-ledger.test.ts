import { createHash } from "node:crypto";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  findingIdentity,
  reviewReactDoctorFindings,
  sourceContextHash,
  sourceFileHash,
  parseReactDoctorReport,
} from "../../../scripts/react-doctor-ledger.mjs";

const roots: string[] = [];
const policyText = "reduced motion contract";
const policyDigest = createHash("sha256").update(policyText).digest("hex");
const digest = createHash("sha256").update("profile").digest("hex");
function fixture() {
  const root = mkdtempSync(path.join(tmpdir(), "core-doctor-ledger-"));
  roots.push(root);
  mkdirSync(path.join(root, "apps/admin"), { recursive: true });
  writeFileSync(path.join(root, "apps/admin/component.tsx"), "first\nsecond\n");
  mkdirSync(path.join(root, "packages/ui/styles"), { recursive: true });
  writeFileSync(path.join(root, "packages/ui/styles/globals.css"), policyText);
  const diagnostic = {
    filePath: "component.tsx",
    plugin: "react-doctor",
    rule: "no-static-element-interactions",
    severity: "warning",
    fingerprint: "same-upstream-fingerprint",
    line: 1,
    column: 1,
    endLine: 1,
    offset: 0,
    length: 5,
  };
  const scans = [
    {
      target: "apps/admin",
      diagnostics: [diagnostic],
      skippedChecks: [],
      scannedFileCount: 1,
    },
  ];
  const options = { root, configHash: digest, expectedTargets: ["apps/admin"] };
  const record = {
    target: "apps/admin",
    ...diagnostic,
    sourceContextHash: sourceContextHash(root, "apps/admin", diagnostic),
    sourceFileHash: sourceFileHash(root, "apps/admin", diagnostic),
    evidenceFileHashes: { "packages/ui/styles/globals.css": policyDigest },
    reason: "The containing gridcell owns the keyboard interaction.",
    evidence: ["Parent gridcell keyboard regression"],
    reconsiderWhen:
      "The parent gridcell activation or tab-stop contract changes.",
  };
  const ledger = {
    schemaVersion: 1,
    reactDoctorVersion: "0.9.17",
    configHash: digest,
    exceptions: [record],
  };
  return { root, diagnostic, scans, options, ledger };
}
afterEach(() => {
  for (const root of roots.splice(0))
    rmSync(root, { recursive: true, force: true });
});

describe("React Doctor evidence ledger", () => {
  it("rejects stale supporting policy even when the diagnostic source is unchanged", () => {
    const { root, scans, options, ledger } = fixture();
    writeFileSync(
      path.join(root, "packages/ui/styles/globals.css"),
      "changed policy",
    );
    expect(() => reviewReactDoctorFindings(scans, ledger, options)).toThrow(
      /evidence.*changed/i,
    );
  });
  it("requires a supporting source digest and rejects opaque or escaping evidence paths", () => {
    const { scans, options, ledger } = fixture();
    ledger.exceptions[0].evidenceFileHashes = {};
    expect(() => reviewReactDoctorFindings(scans, ledger, options)).toThrow(
      /evidence/i,
    );
    ledger.exceptions[0].evidenceFileHashes = {
      "../outside.css": policyDigest,
    };
    expect(() => reviewReactDoctorFindings(scans, ledger, options)).toThrow(
      /evidence/i,
    );
    ledger.exceptions[0].evidenceFileHashes = { ".env.local": policyDigest };
    expect(() => reviewReactDoctorFindings(scans, ledger, options)).toThrow(
      /evidence/i,
    );
  });
  it("does not let one exception consume two findings with a repeated upstream fingerprint", () => {
    const { scans, diagnostic, options, ledger } = fixture();
    scans[0].diagnostics.push({
      ...diagnostic,
      line: 2,
      endLine: 2,
      offset: 6,
      length: 6,
    });
    const result = reviewReactDoctorFindings(scans, ledger, options);
    expect(result.excepted).toHaveLength(1);
    expect(result.actionable).toHaveLength(1);
    expect(result.actionable[0].diagnostic.line).toBe(2);
  });
  it("distinguishes package findings at line zero using the complete CLI identity", () => {
    const { root, scans, diagnostic, options } = fixture();
    writeFileSync(
      path.join(root, "apps/admin/package.json"),
      JSON.stringify({ dependencies: { first: "1", second: "2" } }),
    );
    const first = {
      ...diagnostic,
      filePath: "package.json",
      rule: "unused-dependency",
      line: 0,
      column: 0,
      endLine: undefined,
      offset: undefined,
      length: undefined,
      id: "first-dependency",
      message: "Unused dependency: `first`",
    };
    const second = {
      ...first,
      id: "second-dependency",
      message: "Unused dependency: `second`",
    };
    const ledger = {
      schemaVersion: 1,
      reactDoctorVersion: "0.9.17",
      configHash: digest,
      exceptions: [
        {
          target: "apps/admin",
          ...first,
          sourceContextHash: sourceContextHash(root, "apps/admin", first),
          sourceFileHash: sourceFileHash(root, "apps/admin", first),
          evidenceFileHashes: {
            "packages/ui/styles/globals.css": policyDigest,
          },
          reason: "Public package entrypoint dependency",
          evidence: ["Package consumer import"],
          reconsiderWhen: "The public consumer is removed.",
        },
      ],
    };
    const result = reviewReactDoctorFindings(
      [{ ...scans[0], diagnostics: [first, second] }],
      ledger,
      options,
    );
    expect(result.excepted).toHaveLength(1);
    expect(result.actionable[0].diagnostic.id).toBe("second-dependency");
    expect(() =>
      reviewReactDoctorFindings(
        [{ ...scans[0], diagnostics: [first, first] }],
        ledger,
        options,
      ),
    ).toThrow(/duplicate/i);
  });
  it("hashes CLI UTF-8 byte spans after non-ASCII source without shifting their context", () => {
    const { root, diagnostic, scans, options, ledger } = fixture();
    const prefix = "🧡é\n";
    const token = "<target/>";
    writeFileSync(
      path.join(root, "apps/admin/component.tsx"),
      prefix + token + " trailing text",
    );
    const guarded = {
      ...diagnostic,
      line: 2,
      endLine: 2,
      offset: Buffer.byteLength(prefix),
      length: Buffer.byteLength(token),
    };
    const hash = createHash("sha256").update(token).digest("hex");
    expect(sourceContextHash(root, "apps/admin", guarded)).toBe(hash);
    const reviewed = {
      ...ledger,
      exceptions: [
        {
          ...ledger.exceptions[0],
          ...guarded,
          sourceContextHash: hash,
          sourceFileHash: sourceFileHash(root, "apps/admin", guarded),
        },
      ],
    };
    expect(
      reviewReactDoctorFindings(
        [{ ...scans[0], diagnostics: [guarded] }],
        reviewed,
        options,
      ).excepted,
    ).toHaveLength(1);
    writeFileSync(
      path.join(root, "apps/admin/component.tsx"),
      prefix + "<change/>" + " trailing text",
    );
    expect(() =>
      reviewReactDoctorFindings(
        [{ ...scans[0], diagnostics: [guarded] }],
        reviewed,
        options,
      ),
    ).toThrow(/context/i);
  });
  it("requires review when owning behavior changes outside the diagnostic token", () => {
    const { root, scans, options, ledger } = fixture();
    writeFileSync(
      path.join(root, "apps/admin/component.tsx"),
      "first\nchanged owning behavior\n",
    );
    expect(() => reviewReactDoctorFindings(scans, ledger, options)).toThrow(
      /source|context/i,
    );
  });
  it("rejects a stale exception after the guarded source changes", () => {
    const { root, scans, options, ledger } = fixture();
    writeFileSync(
      path.join(root, "apps/admin/component.tsx"),
      "changed\nsecond\n",
    );
    expect(() => reviewReactDoctorFindings(scans, ledger, options)).toThrow(
      /context/i,
    );
  });
  it("fails closed when any required project or check is absent", () => {
    const { scans, options, ledger } = fixture();
    expect(() => reviewReactDoctorFindings([], ledger, options)).toThrow(
      /target/i,
    );
    scans[0].skippedChecks.push("dead-code");
    expect(() => reviewReactDoctorFindings(scans, ledger, options)).toThrow(
      /skipped/i,
    );
  });
  it("rejects duplicate, unconsumed, version-drifted, and unsupported-severity records", () => {
    const { scans, options, ledger } = fixture();
    expect(() =>
      reviewReactDoctorFindings(
        scans,
        { ...ledger, exceptions: [...ledger.exceptions, ledger.exceptions[0]] },
        options,
      ),
    ).toThrow(/duplicate/i);
    expect(() =>
      reviewReactDoctorFindings(
        [{ ...scans[0], diagnostics: [] }],
        ledger,
        options,
      ),
    ).toThrow(/unused|unconsumed/i);
    expect(() =>
      reviewReactDoctorFindings(
        scans,
        { ...ledger, reactDoctorVersion: "next" },
        options,
      ),
    ).toThrow(/version/i);
    expect(() =>
      reviewReactDoctorFindings(
        [
          {
            ...scans[0],
            diagnostics: [{ ...scans[0].diagnostics[0], severity: "mystery" }],
          },
        ],
        { ...ledger, exceptions: [] },
        options,
      ),
    ).toThrow(/severity/i);
  });
  it("counts design warnings as actionable even when upstream CI surfaces omit their tags", () => {
    const { scans, options, ledger } = fixture();
    scans[0].diagnostics[0] = {
      ...scans[0].diagnostics[0],
      rule: "no-tiny-text",
      tags: ["design"],
    };
    expect(
      reviewReactDoctorFindings(scans, { ...ledger, exceptions: [] }, options)
        .actionable,
    ).toHaveLength(1);
  });
  it("refuses paths outside the scoped project before reading source", () => {
    const { root, diagnostic } = fixture();
    expect(() =>
      sourceContextHash(root, "apps/admin", {
        ...diagnostic,
        filePath: "../../.env.local",
      }),
    ).toThrow(/path|source/i);
    expect(findingIdentity("apps/admin", diagnostic)).not.toBe(
      findingIdentity("apps/donor", diagnostic),
    );
  });
});

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
    version: "0.9.17",
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
