import { describe, expect, it } from "vitest";
import { validateEvidence } from "../../../scripts/factory/evidence-guard.mjs";

function fixture() {
  const base = "a".repeat(40);
  const proof = "b".repeat(40);
  const candidate = "c".repeat(40);
  const roles = {
    intent: ["samson", "intent", "READY"],
    proof: ["ezra", "proof", "READY"],
    build: ["bezalel", "build", "READY"],
    micaiah: ["micaiah", "review", "COMPLETE"],
    luke: ["luke", "review", "COMPLETE"],
    adjudication: ["agabus", "adjudication", "NO_REPAIR"],
    ratification: ["samson", "ratification", "RATIFIED"],
  };
  const run = {
    version: 1,
    repository: "Asymmetric-al/core",
    issue: 1923,
    target_branch: "develop",
    base_sha: base,
    proof_sha: proof,
    candidate_sha: candidate,
    artifacts: Object.fromEntries(
      Object.keys(roles).map((key, i) => [
        key,
        { path: `${key}.json`, sha256: String(i + 1).repeat(64) },
      ]),
    ),
  };
  const dependencies = {
    intent: [],
    proof: ["intent"],
    build: ["intent", "proof"],
    micaiah: ["intent", "proof", "build"],
    luke: ["intent", "proof", "build"],
    adjudication: ["intent", "proof", "micaiah", "luke"],
    ratification: [
      "intent",
      "proof",
      "build",
      "micaiah",
      "luke",
      "adjudication",
    ],
  };
  const reports: Record<string, any> = Object.fromEntries(
    Object.entries(roles).map(([key, [role, stage, status]]) => [
      key,
      {
        role,
        stage,
        status,
        issue: 1923,
        base_sha: base,
        subject_sha:
          key === "intent" ? base : key === "proof" ? proof : candidate,
        invocation_id: `${key}-fresh-session`,
        input_digests: Object.fromEntries(
          dependencies[key].map((input) => [
            input,
            run.artifacts[input].sha256,
          ]),
        ),
      },
    ]),
  );
  reports.intent.obligations = [{ id: "AC-1" }];
  reports.proof.protected_paths = ["tests/unit/example.test.ts"];
  reports.proof.saw_implementation = false;
  reports.build.covered_obligations = ["AC-1"];
  reports.build.blocking_gaps = [];
  for (const role of ["micaiah", "luke"])
    Object.assign(reports[role], {
      findings: [],
      saw_peer_report: false,
      saw_builder_self_review: false,
    });
  reports.adjudication.dispositions = [];
  reports.adjudication.blocking_findings = [];
  reports.ratification.satisfied_obligations = ["AC-1"];
  reports.ratification.blocking_gaps = [];
  return {
    run,
    reports,
    repository: {
      head: candidate,
      clean: true,
      lineage: true,
      protectedIntact: true,
    },
  };
}

describe("factory evidence binding", () => {
  it("accepts one complete exact-current candidate", () => {
    const f = fixture();
    expect(validateEvidence(f.run, f.reports, f.repository).status).toBe(
      "EVIDENCE_BOUND",
    );
  });
  it("rejects a same-SHA review of a different intent contract", () => {
    const f = fixture();
    f.reports.luke.input_digests.intent = "f".repeat(64);
    expect(() => validateEvidence(f.run, f.reports, f.repository)).toThrow(
      /input digest/i,
    );
  });
  it("rejects stale SHA, altered protected proof and an unclean candidate", () => {
    for (const change of [
      { head: "d".repeat(40) },
      { protectedIntact: false },
      { clean: false },
    ]) {
      const f = fixture();
      Object.assign(f.repository, change);
      expect(() => validateEvidence(f.run, f.reports, f.repository)).toThrow();
    }
  });
  it("requires both independent review reports and a fresh ratifier", () => {
    const missing = fixture();
    delete missing.reports.luke;
    expect(() =>
      validateEvidence(missing.run, missing.reports, missing.repository),
    ).toThrow(/Missing luke/);
    const reused = fixture();
    reused.reports.ratification.invocation_id =
      reused.reports.intent.invocation_id;
    expect(() =>
      validateEvidence(reused.run, reused.reports, reused.repository),
    ).toThrow(/reused invocation/);
  });
  it("blocks disclosed peer review and incomplete obligation coverage", () => {
    const disclosed = fixture();
    disclosed.reports.micaiah.saw_peer_report = true;
    expect(() =>
      validateEvidence(disclosed.run, disclosed.reports, disclosed.repository),
    ).toThrow(/disclosure breach/);
    const omitted = fixture();
    omitted.reports.ratification.satisfied_obligations = [];
    expect(() =>
      validateEvidence(omitted.run, omitted.reports, omitted.repository),
    ).toThrow(/Incomplete ratification/);
  });
  it("requires disposition for each finding and blocks unresolved findings", () => {
    const f = fixture();
    f.reports.luke.findings = [{ id: "LUKE-1" }];
    expect(() => validateEvidence(f.run, f.reports, f.repository)).toThrow(
      /Incomplete finding dispositions/,
    );
    f.reports.adjudication.dispositions = [
      { finding_id: "LUKE-1", status: "UNRESOLVED" },
    ];
    expect(() => validateEvidence(f.run, f.reports, f.repository)).toThrow(
      /Unresolved finding/,
    );
  });
  it("rejects production targets and writer-authored ratification", () => {
    const target = fixture();
    target.run.target_branch = "production";
    expect(() =>
      validateEvidence(target.run, target.reports, target.repository),
    ).toThrow(/develop/);
    const writer = fixture();
    writer.reports.ratification.role = "bezalel";
    expect(() =>
      validateEvidence(writer.run, writer.reports, writer.repository),
    ).toThrow(/ratification role/);
  });
});
