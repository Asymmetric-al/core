import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  evidenceFingerprint,
  proofHash,
  readProofFile,
  reviewFindings,
} from "../../../scripts/verify/shadscan-policy.mjs";

const roots: string[] = [];

afterEach(() => {
  for (const root of roots.splice(0))
    rmSync(root, { recursive: true, force: true });
});

function fixture() {
  const root = mkdtempSync(path.join(os.tmpdir(), "core-shadscan-ledger-"));
  roots.push(root);
  const testPath = "tests/unit/propagated-name.test.ts";
  mkdirSync(path.join(root, "tests/unit"), { recursive: true });
  const proof = "export const labelVerified = true;\n";
  writeFileSync(path.join(root, testPath), proof);
  const sourcePath = "apps/admin/composed-button.tsx";
  const source = '<Button aria-label="Menu" />\n';
  mkdirSync(path.dirname(path.join(root, sourcePath)), { recursive: true });
  writeFileSync(path.join(root, sourcePath), source);
  const finding = {
    packageDir: "apps/admin",
    id: "icon-buttons-have-labels",
    status: "fail",
    maxScore: 6,
    impactsScore: true,
    score: 0,
    evidence: [
      {
        filePath: "apps/admin/composed-button.tsx",
        line: 7,
        message: "Icon-only button is missing an accessible label.",
      },
    ],
  };
  const entry = {
    project: "apps/admin",
    rule: finding.id,
    evidenceFingerprint: evidenceFingerprint(finding),
    classification: "scanner-limitation",
    rationale:
      "The Base UI render parent supplies the accessible name to its button.",
    proof: [
      { path: sourcePath, sha256: proofHash(source) },
      { path: testPath, sha256: proofHash(proof) },
    ],
    verificationTests: [testPath],
  };
  const report = {
    workspace: {
      projects: [
        { packageDir: "apps/admin", kind: "application" },
        { packageDir: "packages/ui", kind: "library" },
      ],
    },
    findings: [finding],
  };
  const ledger = { schemaVersion: 1, entries: [entry] };
  return { root, report, ledger, entry, finding, testPath };
}

describe("precise Shadscan evidence classifications", () => {
  it("annotates a proven limitation while retaining its raw failure and score", () => {
    const { root, report, ledger, finding } = fixture();
    const before = JSON.stringify(report);
    const result = reviewFindings(report, ledger, root);
    expect(result.errors).toEqual([]);
    expect(result.findings[0]?.classification).toBe("scanner-limitation");
    expect(JSON.stringify(report)).toBe(before);
    expect(finding.score).toBe(0);
  });

  it("keeps new evidence under an already-classified rule unclassified", () => {
    const { root, report, ledger, finding } = fixture();
    report.findings.push({
      ...finding,
      evidence: [
        { ...finding.evidence[0]!, filePath: "apps/admin/another-button.tsx" },
      ],
    });
    const result = reviewFindings(report, ledger, root);
    expect(result.findings[1]?.classification).toBe("unclassified");
    expect(result.errors).toHaveLength(1);
  });

  it("requires the actual flagged file even when unchanged wrapper proof is hashed", () => {
    const { root, report, ledger, entry } = fixture();
    const wrapperPath = "apps/admin/wrapper.tsx";
    const wrapper = '<ComposedButton aria-label="Menu" />\n';
    writeFileSync(path.join(root, wrapperPath), wrapper);
    entry.proof = [
      { path: wrapperPath, sha256: proofHash(wrapper) },
      ...entry.proof.filter((proof) => proof.path.startsWith("tests/")),
    ];

    expect(() => reviewFindings(report, ledger, root)).toThrow(
      /Raw file evidence.*apps\/admin\/composed-button\.tsx/,
    );
  });

  it("accepts full raw file proof and rejects edits behind the same finding message", () => {
    const { root, report, ledger, entry, finding } = fixture();
    const secondPath = "apps/admin/second-control.tsx";
    const secondSource = '<Button aria-label="Second action" />\n';
    writeFileSync(path.join(root, secondPath), secondSource);
    finding.evidence.push({
      ...finding.evidence[0]!,
      filePath: secondPath,
    });
    entry.evidenceFingerprint = evidenceFingerprint(finding);
    entry.proof.push({ path: secondPath, sha256: proofHash(secondSource) });

    expect(reviewFindings(report, ledger, root).errors).toEqual([]);
    writeFileSync(path.join(root, secondPath), "<Button />\n");
    expect(() => reviewFindings(report, ledger, root)).toThrow(
      /Stale evidence.*second-control/,
    );
  });

  it("allows a no-file foundation finding with existing verified policy proof", () => {
    const { root, report, ledger, entry, finding } = fixture();
    finding.id = "shadcn-config-present";
    finding.evidence = [];
    entry.rule = finding.id;
    entry.evidenceFingerprint = evidenceFingerprint(finding);
    entry.classification = "product-decision";

    expect(reviewFindings(report, ledger, root).errors).toEqual([]);
  });

  it("rejects stale proof and classifications that no longer match a raw failure", () => {
    const { root, report, ledger, testPath } = fixture();
    writeFileSync(
      path.join(root, testPath),
      "export const labelVerified = false;\n",
    );
    expect(() => reviewFindings(report, ledger, root)).toThrow(
      /Stale evidence/,
    );
    const second = fixture();
    second.report.findings = [];
    expect(() =>
      reviewFindings(second.report, second.ledger, second.root),
    ).toThrow(/Stale classification/);
  });

  it("rejects ambiguity and requires executable proof for a scanner limitation", () => {
    const { root, report, ledger, entry } = fixture();
    ledger.entries.push({ ...entry });
    expect(() => reviewFindings(report, ledger, root)).toThrow(/Ambiguous/);
    ledger.entries.pop();
    entry.verificationTests = [];
    expect(() => reviewFindings(report, ledger, root)).toThrow(/executable/);
  });

  it("does not let a confirmed defect pass when it has been classified", () => {
    const { root, report, ledger, entry } = fixture();
    entry.classification = "confirmed-defect";
    expect(reviewFindings(report, ledger, root).errors[0]).toContain(
      "confirmed-defect",
    );
  });

  it("reports library failures separately and limits library applicability to libraries", () => {
    const { root, report, ledger, finding, entry } = fixture();
    report.findings = [
      {
        ...finding,
        id: "toast-provider-present",
        packageDir: "packages/ui",
        impactsScore: false,
      },
    ];
    entry.project = "packages/ui";
    entry.rule = "toast-provider-present";
    entry.classification = "library-applicability";
    expect(reviewFindings(report, ledger, root).errors).toEqual([]);
    entry.project = "apps/admin";
    expect(() => reviewFindings(report, ledger, root)).toThrow(
      /cannot exempt an application/,
    );
  });

  it("does not classify a real library control defect as an app-shell responsibility", () => {
    const { root, report, ledger, finding, entry } = fixture();
    report.findings = [
      { ...finding, packageDir: "packages/ui", impactsScore: false },
    ];
    entry.project = "packages/ui";
    entry.classification = "library-applicability";
    expect(() => reviewFindings(report, ledger, root)).toThrow(/app-shell/);
  });

  it.each([
    "../outside.ts",
    ".env.local",
    ".git/config",
    "apps/admin/private/proof.ts",
    "apps/admin/secrets.json",
    "apps/admin/credentials.json",
  ])('refuses private or escaping proof "%s"', (proofPath) => {
    const { root } = fixture();
    if (proofPath.startsWith("apps/admin/")) {
      mkdirSync(path.dirname(path.join(root, proofPath)), { recursive: true });
      writeFileSync(path.join(root, proofPath), "private contents");
    }
    expect(() => readProofFile(root, proofPath)).toThrow();
  });

  it("refuses symlink proof files even when the target is inside the repository", () => {
    const { root, testPath } = fixture();
    const linkedPath = "tests/unit/linked.test.ts";
    symlinkSync(path.join(root, testPath), path.join(root, linkedPath));
    expect(() => readProofFile(root, linkedPath)).toThrow(/symlink/);
  });
});
