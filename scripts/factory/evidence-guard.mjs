import { createHash } from "node:crypto";
import { readFileSync, realpathSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const sha = /^[0-9a-f]{40}$/;
const digest = /^[0-9a-f]{64}$/;
const stages = {
  intent: ["samson", "intent", "READY"],
  proof: ["ezra", "proof", "READY"],
  build: ["bezalel", "build", "READY"],
  micaiah: ["micaiah", "review", "COMPLETE"],
  luke: ["luke", "review", "COMPLETE"],
  adjudication: ["agabus", "adjudication", "NO_REPAIR"],
  ratification: ["samson", "ratification", "RATIFIED"],
};
const dependencies = {
  intent: [],
  proof: ["intent"],
  build: ["intent", "proof"],
  micaiah: ["intent", "proof", "build"],
  luke: ["intent", "proof", "build"],
  adjudication: ["intent", "proof", "micaiah", "luke"],
  ratification: ["intent", "proof", "build", "micaiah", "luke", "adjudication"],
};
const fail = (message) => {
  throw new Error(message);
};
const requireValue = (condition, message) => {
  if (!condition) fail(message);
};
const ids = (values, label) => {
  requireValue(Array.isArray(values), `${label} must be an array`);
  requireValue(
    values.every((value) => typeof value === "string" && value.length > 0),
    `${label} contains an invalid ID`,
  );
  requireValue(
    new Set(values).size === values.length,
    `${label} has duplicates`,
  );
  return new Set(values);
};

export function validateEvidence(run, reports, repository) {
  requireValue(run.version === 1, "Unsupported run version");
  requireValue(run.repository === "Asymmetric-al/core", "Wrong repository");
  requireValue(run.target_branch === "develop", "Merge target must be develop");
  requireValue(
    Number.isSafeInteger(run.issue) && run.issue > 0,
    "Invalid issue",
  );
  for (const key of ["base_sha", "proof_sha", "candidate_sha"]) {
    requireValue(sha.test(run[key]), `Invalid ${key}`);
  }
  requireValue(repository.head === run.candidate_sha, "Stale candidate HEAD");
  requireValue(repository.clean === true, "Candidate worktree is not clean");
  requireValue(
    repository.lineage === true,
    "Base/proof/candidate lineage mismatch",
  );
  requireValue(
    repository.protectedIntact === true,
    "Protected proof was changed",
  );
  const invocations = new Set();
  for (const [key, [role, stage, status]] of Object.entries(stages)) {
    const report = reports[key];
    requireValue(report && typeof report === "object", `Missing ${key} report`);
    requireValue(
      report.role === role &&
        report.stage === stage &&
        report.status === status,
      `Invalid ${key} role/stage/status`,
    );
    requireValue(report.issue === run.issue, `Wrong issue in ${key}`);
    requireValue(report.base_sha === run.base_sha, `Wrong base in ${key}`);
    const subject =
      key === "intent"
        ? run.base_sha
        : key === "proof"
          ? run.proof_sha
          : run.candidate_sha;
    requireValue(report.subject_sha === subject, `Stale subject in ${key}`);
    for (const input of dependencies[key]) {
      requireValue(
        digest.test(run.artifacts?.[input]?.sha256) &&
          report.input_digests?.[input] === run.artifacts[input].sha256,
        `Wrong input digest in ${key}: ${input}`,
      );
    }
    requireValue(
      typeof report.invocation_id === "string" &&
        report.invocation_id.length > 0 &&
        !invocations.has(report.invocation_id),
      `Missing/reused invocation in ${key}`,
    );
    invocations.add(report.invocation_id);
  }
  const obligations = ids(
    reports.intent.obligations?.map((o) => o.id),
    "Intent obligations",
  );
  requireValue(obligations.size > 0, "Intent has no obligations");
  for (const [key, field] of [
    ["build", "covered_obligations"],
    ["ratification", "satisfied_obligations"],
  ]) {
    const covered = ids(reports[key][field], `${key} obligation coverage`);
    requireValue(
      [...obligations].every((id) => covered.has(id)),
      `Incomplete ${key} obligation coverage`,
    );
    requireValue(
      Array.isArray(reports[key].blocking_gaps) &&
        reports[key].blocking_gaps.length === 0,
      `Blocking gaps in ${key}`,
    );
  }
  requireValue(
    reports.proof.saw_implementation === false,
    "Proof was implementation-anchored",
  );
  requireValue(
    Array.isArray(reports.proof.protected_paths),
    "Missing protected-path manifest",
  );
  const findings = [];
  for (const role of ["micaiah", "luke"]) {
    const report = reports[role];
    requireValue(
      report.saw_peer_report === false &&
        report.saw_builder_self_review === false,
      `${role} disclosure breach`,
    );
    requireValue(Array.isArray(report.findings), `Missing ${role} findings`);
    findings.push(...report.findings.map((finding) => finding.id));
  }
  const findingIds = ids(findings, "Reviewer findings");
  const dispositions = reports.adjudication.dispositions;
  requireValue(
    Array.isArray(dispositions),
    "Missing adjudication dispositions",
  );
  const dispositionIds = ids(
    dispositions.map((item) => item.finding_id),
    "Adjudication dispositions",
  );
  requireValue(
    findingIds.size === dispositionIds.size &&
      [...findingIds].every((id) => dispositionIds.has(id)),
    "Incomplete finding dispositions",
  );
  requireValue(
    dispositions.every((item) =>
      ["RESOLVED", "REJECTED", "DEFERRED"].includes(item.status),
    ),
    "Unresolved finding disposition",
  );
  requireValue(
    Array.isArray(reports.adjudication.blocking_findings) &&
      reports.adjudication.blocking_findings.length === 0,
    "Accepted blockers remain",
  );
  return {
    status: "EVIDENCE_BOUND",
    issue: run.issue,
    candidate_sha: run.candidate_sha,
    target_branch: "develop",
  };
}

function git(args) {
  const result = spawnSync("git", args, { encoding: "utf8", shell: false });
  requireValue(result.status === 0, `Git read failed: ${args[0]}`);
  return result.stdout.trim();
}

export function guardFile(filename) {
  const actual = realpathSync(filename);
  const root = path.dirname(actual);
  const run = JSON.parse(readFileSync(actual, "utf8"));
  const reports = {};
  for (const key of Object.keys(stages)) {
    const ref = run.artifacts?.[key];
    requireValue(
      ref && typeof ref.path === "string" && digest.test(ref.sha256),
      `Invalid ${key} artifact reference`,
    );
    const reportPath = realpathSync(path.resolve(root, ref.path));
    const relative = path.relative(root, reportPath);
    requireValue(
      relative !== "" &&
        !relative.startsWith(`..${path.sep}`) &&
        relative !== ".." &&
        !path.isAbsolute(relative),
      "Artifact escapes run directory",
    );
    const bytes = readFileSync(reportPath);
    requireValue(
      createHash("sha256").update(bytes).digest("hex") === ref.sha256,
      `Changed ${key} artifact`,
    );
    reports[key] = JSON.parse(bytes.toString("utf8"));
  }
  for (const key of ["base_sha", "proof_sha", "candidate_sha"])
    requireValue(sha.test(run[key]), `Invalid ${key}`);
  const baseToProof = spawnSync(
    "git",
    ["merge-base", "--is-ancestor", run.base_sha, run.proof_sha],
    { shell: false },
  );
  const proofToCandidate = spawnSync(
    "git",
    ["merge-base", "--is-ancestor", run.proof_sha, run.candidate_sha],
    { shell: false },
  );
  const protectedPaths = reports.proof.protected_paths;
  requireValue(Array.isArray(protectedPaths), "Invalid protected paths");
  requireValue(
    protectedPaths.every(
      (p) =>
        typeof p === "string" &&
        p.length > 0 &&
        !p.startsWith("/") &&
        !p.split("/").includes(".."),
    ),
    "Invalid protected path",
  );
  const changed = protectedPaths.length
    ? git([
        "diff",
        "--name-only",
        run.proof_sha,
        run.candidate_sha,
        "--",
        ...protectedPaths,
      ])
    : "";
  return validateEvidence(run, reports, {
    head: git(["rev-parse", "HEAD"]),
    clean: git(["status", "--porcelain"]) === "",
    lineage: baseToProof.status === 0 && proofToCandidate.status === 0,
    protectedIntact: changed === "",
  });
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    requireValue(
      process.argv.length === 3,
      "Usage: node scripts/factory/evidence-guard.mjs /absolute/run/run.json",
    );
    console.log(JSON.stringify(guardFile(process.argv[2])));
  } catch (error) {
    console.error(`Factory evidence blocked: ${error.message}`);
    process.exitCode = 1;
  }
}
