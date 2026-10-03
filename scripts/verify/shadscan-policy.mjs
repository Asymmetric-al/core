import { createHash } from "node:crypto";
import { lstatSync, readFileSync, realpathSync } from "node:fs";
import path from "node:path";

import { RULE_CATALOG } from "@shadscan/cli";

const CATEGORIES = [
  "foundation",
  "interaction",
  "states",
  "accessibility",
  "forms",
  "production-polish",
];
const APPLICATIONS = ["apps/admin", "apps/donor", "apps/missionary"];
const CLASSIFICATIONS = new Set([
  "scanner-limitation",
  "product-decision",
  "library-applicability",
  "confirmed-defect",
]);
const SAFE_PROOF_ROOTS = new Set([
  "apps",
  "packages",
  "scripts",
  "tests",
  "docs",
  "openspec",
  "tooling",
]);
const SHA256 = /^[a-f0-9]{64}$/;
const CATEGORY_WEIGHTS = {
  foundation: 20,
  interaction: 20,
  states: 20,
  accessibility: 20,
  forms: 10,
  "production-polish": 10,
};
const LIBRARY_APP_SHELL_RULES = new Set([
  "shadcn-config-present",
  "theme-provider-configured",
  "theme-hotkey-present",
  "metadata-configured",
  "favicon-present",
  "not-found-route-present",
  "error-boundary-present",
  "toast-provider-present",
  "toast-provider-mounted",
  "social-preview-present",
  "command-menu-present",
  "command-menu-hotkey-present",
]);

function rulesFor(kind) {
  const adapter = kind === "application" ? "next-app-router" : "generic-react";
  return RULE_CATALOG.filter(
    (rule) => rule.adapters.includes("core") || rule.adapters.includes(adapter),
  );
}

function categoryScores(findings) {
  return CATEGORIES.map((id) => {
    const scored = findings.filter(
      (finding) =>
        finding.category === id &&
        ["pass", "fail"].includes(finding.status) &&
        finding.maxScore > 0,
    );
    const available = scored.reduce(
      (total, finding) => total + finding.maxScore,
      0,
    );
    const earned = scored.reduce((total, finding) => total + finding.score, 0);
    const applicable = available > 0;
    return {
      id,
      weight: CATEGORY_WEIGHTS[id],
      applicable,
      maxScore: applicable ? CATEGORY_WEIGHTS[id] : 0,
      percentage: applicable ? Math.round((earned / available) * 100) : null,
      score: applicable ? (earned / available) * CATEGORY_WEIGHTS[id] : 0,
    };
  });
}

function totalScore(categories) {
  const active = categories.filter((category) => category.applicable);
  const weight = active.reduce((total, category) => total + category.weight, 0);
  return weight
    ? Math.round(
        (active.reduce((total, category) => total + category.score, 0) /
          weight) *
          100,
      )
    : null;
}

function validateAssessments(report, projects) {
  for (const project of projects) {
    const expected = rulesFor(project.kind);
    const findings = report.findings.filter(
      (finding) => finding.packageDir === project.packageDir,
    );
    requireCondition(
      new Set(findings.map((finding) => finding.id)).size === findings.length,
      `${project.packageDir} has duplicate rule assessments`,
    );
    requireCondition(
      JSON.stringify(findings.map((finding) => finding.id).sort()) ===
        JSON.stringify(expected.map((rule) => rule.id).sort()),
      `${project.packageDir} has incomplete rule coverage`,
    );
    const catalog = new Map(expected.map((rule) => [rule.id, rule]));
    for (const finding of findings) {
      const rule = catalog.get(finding.id);
      requireCondition(
        finding.category === rule.category &&
          finding.maxScore ===
            (finding.status === "not-applicable" ? 0 : rule.maxScore),
        `${project.packageDir} ${finding.id} changed rule scoring metadata`,
      );
      requireCondition(
        ["pass", "fail", "advisory", "not-applicable"].includes(finding.status),
        `${project.packageDir} ${finding.id} has an invalid assessment`,
      );
      const score = ["pass", "advisory"].includes(finding.status)
        ? finding.maxScore
        : 0;
      const impactsScore =
        project.kind === "application" &&
        ["pass", "fail"].includes(finding.status) &&
        finding.maxScore > 0;
      requireCondition(
        finding.score === score && finding.impactsScore === impactsScore,
        `${project.packageDir} ${finding.id} has inconsistent raw points`,
      );
    }
    requireCondition(
      project.score === totalScore(categoryScores(findings)),
      `${project.packageDir} raw score disagrees with its rule assessments`,
    );
  }
  const pooled = report.findings.filter((finding) =>
    projects.some(
      (project) =>
        project.kind === "application" &&
        project.packageDir === finding.packageDir,
    ),
  );
  const computed = categoryScores(pooled);
  requireCondition(
    Array.isArray(report.categories) &&
      report.categories.length === CATEGORIES.length &&
      new Set(report.categories.map((category) => category.id)).size ===
        CATEGORIES.length,
    "Incomplete raw category coverage",
  );
  for (const category of computed) {
    const actual = report.categories.find((item) => item.id === category.id);
    requireCondition(
      actual &&
        actual.weight === category.weight &&
        actual.maxScore === category.maxScore &&
        actual.applicable === category.applicable &&
        actual.percentage === category.percentage &&
        Math.abs(actual.score - category.score) < 1e-8,
      `Inconsistent raw category score: ${category.id}`,
    );
  }
  requireCondition(
    report.score === totalScore(computed),
    "Pooled score disagrees with application assessments",
  );
}

function requireCondition(condition, message) {
  if (!condition) throw new Error(message);
}

function isScore(value) {
  return Number.isInteger(value) && value >= 0 && value <= 100;
}

export function validatePolicy(policy) {
  requireCondition(
    policy?.schemaVersion === 1,
    "Unsupported Shadscan policy schema",
  );
  requireCondition(
    typeof policy.engineVersion === "string" &&
      /^\d+\.\d+\.\d+$/.test(policy.engineVersion),
    "An exact engine version is required",
  );
  requireCondition(
    typeof policy.rulesetVersion === "string" &&
      policy.rulesetVersion.length > 0,
    "A ruleset version is required",
  );
  requireCondition(
    Number.isInteger(policy.reportSchemaVersion),
    "A report schema version is required",
  );
  const actual = Object.keys(policy.applicationFloors ?? {}).sort();
  requireCondition(
    JSON.stringify(actual) === JSON.stringify(APPLICATIONS),
    "Policy must protect all three applications independently",
  );
  for (const [project, floor] of Object.entries(policy.applicationFloors)) {
    requireCondition(isScore(floor), `${project} has an invalid score floor`);
  }
  if (policy.libraryProjects) {
    requireCondition(
      Array.isArray(policy.libraryProjects) &&
        new Set(policy.libraryProjects).size === policy.libraryProjects.length,
      "Library inventory must be unique",
    );
  }
  return policy;
}

export function validateReport(report, policy) {
  validatePolicy(policy);
  requireCondition(
    report?.engineVersion === policy.engineVersion,
    "Shadscan engineVersion does not match the locked policy",
  );
  requireCondition(
    report.rulesetVersion === policy.rulesetVersion,
    "Shadscan rulesetVersion does not match the reviewed policy",
  );
  requireCondition(
    report.schemaVersion === policy.reportSchemaVersion,
    "Shadscan schemaVersion does not match the reviewed policy",
  );
  requireCondition(
    isScore(report.score),
    "Shadscan pooled score is unassessed or invalid",
  );
  requireCondition(
    report.coverage?.source === "complete",
    "Shadscan source coverage is incomplete",
  );
  requireCondition(
    JSON.stringify([...(report.scope?.categories ?? [])].sort()) ===
      JSON.stringify([...CATEGORIES].sort()),
    "All audit categories must be assessed",
  );
  requireCondition(
    report.workspace && Array.isArray(report.workspace.projects),
    "A complete workspace report is required",
  );
  requireCondition(
    report.workspace.truncated === 0,
    "Workspace discovery was truncated",
  );
  const projects = report.workspace.projects;
  requireCondition(
    new Set(projects.map((project) => project.packageDir)).size ===
      projects.length,
    "Workspace contains duplicate projects",
  );
  const applications = projects.filter(
    (project) => project.kind === "application",
  );
  requireCondition(
    report.workspace.applicationCount === APPLICATIONS.length &&
      JSON.stringify(
        applications.map((project) => project.packageDir).sort(),
      ) === JSON.stringify(APPLICATIONS),
    "Incomplete application coverage: expected all three Core apps",
  );
  const libraries = projects.filter((project) => project.kind === "library");
  requireCondition(
    projects.length === applications.length + libraries.length,
    "Unknown workspace project kind",
  );
  if (policy.libraryProjects) {
    requireCondition(
      JSON.stringify(libraries.map((project) => project.packageDir).sort()) ===
        JSON.stringify([...policy.libraryProjects].sort()),
      "Incomplete library coverage",
    );
  }
  requireCondition(
    Array.isArray(report.findings),
    "Raw findings must be retained",
  );
  const projectKinds = new Map(
    projects.map((project) => [project.packageDir, project.kind]),
  );
  for (const finding of report.findings) {
    requireCondition(
      projectKinds.has(finding.packageDir),
      `Finding references an unassessed project: ${finding.packageDir}`,
    );
    if (projectKinds.get(finding.packageDir) === "library") {
      requireCondition(
        finding.impactsScore === false,
        `Library finding unexpectedly moves the app score: ${finding.id}`,
      );
    }
  }
  for (const project of report.workspace.projects) {
    const floor = policy.applicationFloors[project.packageDir];
    if (floor !== undefined) {
      requireCondition(
        project.poolsIntoScore === true && isScore(project.score),
        `${project.packageDir} score is unassessed or excluded`,
      );
      requireCondition(
        project.score >= floor,
        `${project.packageDir} score ${project.score} is below ${floor}`,
      );
    } else {
      requireCondition(
        project.poolsIntoScore === false,
        `Library ${project.packageDir} must not pool into the application score`,
      );
    }
  }
  validateAssessments(report, projects);
  return report;
}

export function evidenceFingerprint(finding) {
  const evidence = finding.evidence
    .map((item) => ({ filePath: item.filePath ?? null, message: item.message }))
    .sort((left, right) => {
      const a = JSON.stringify(left);
      const b = JSON.stringify(right);
      return a < b ? -1 : a > b ? 1 : 0;
    });
  return createHash("sha256").update(JSON.stringify(evidence)).digest("hex");
}

export function proofHash(content) {
  return createHash("sha256").update(content).digest("hex");
}

export function readProofFile(root, relativePath) {
  requireCondition(
    typeof relativePath === "string" &&
      !relativePath.includes("\\") &&
      !path.posix.isAbsolute(relativePath),
    "Proof path must be repository-relative",
  );
  const parts = relativePath.split("/");
  requireCondition(
    parts.every(
      (part) =>
        part &&
        !part.startsWith(".") &&
        !["node_modules", "vendor", "private", "secrets"].includes(part) &&
        !/^(?:secrets?|credentials?)(?:\.|$)/i.test(part),
    ),
    "Proof path references a private, generated, or unsafe location",
  );
  requireCondition(
    (SAFE_PROOF_ROOTS.has(parts[0]) ||
      ["package.json", "AGENTS.md"].includes(relativePath)) &&
      /\.(?:[cm]?[jt]sx?|json|md|css|ya?ml)$/.test(relativePath),
    "Proof must be a source, test, or policy file",
  );
  const realRoot = realpathSync(root);
  let candidate = realRoot;
  for (const part of parts) {
    candidate = path.join(candidate, part);
    requireCondition(
      !lstatSync(candidate).isSymbolicLink(),
      "Proof paths must not traverse symlinks",
    );
  }
  const stat = lstatSync(candidate);
  requireCondition(
    stat.isFile() && stat.size <= 2 * 1024 * 1024,
    "Proof must be a bounded regular file",
  );
  const resolved = realpathSync(candidate);
  const relative = path.relative(realRoot, resolved);
  requireCondition(
    relative &&
      !relative.startsWith(`..${path.sep}`) &&
      relative !== ".." &&
      !path.isAbsolute(relative),
    "Proof escapes the repository",
  );
  return readFileSync(resolved);
}

export function reviewFindings(report, ledger, root) {
  requireCondition(
    ledger?.schemaVersion === 1 && Array.isArray(ledger.entries),
    "Unsupported Shadscan finding ledger",
  );
  const projects = new Map(
    report.workspace.projects.map((project) => [
      project.packageDir,
      project.kind,
    ]),
  );
  const indexed = new Map();
  for (const entry of ledger.entries) {
    requireCondition(
      projects.has(entry.project) &&
        typeof entry.rule === "string" &&
        SHA256.test(entry.evidenceFingerprint),
      "Finding classification must name an assessed project, rule, and exact evidence fingerprint",
    );
    requireCondition(
      CLASSIFICATIONS.has(entry.classification) &&
        typeof entry.rationale === "string" &&
        entry.rationale.trim().length >= 20,
      "Finding classification requires a precise rationale",
    );
    requireCondition(
      entry.classification !== "library-applicability" ||
        projects.get(entry.project) === "library",
      "Library applicability cannot exempt an application finding",
    );
    requireCondition(
      entry.classification !== "library-applicability" ||
        LIBRARY_APP_SHELL_RULES.has(entry.rule),
      "Library applicability is limited to app-shell responsibilities",
    );
    requireCondition(
      Array.isArray(entry.proof) && entry.proof.length > 0,
      "Finding classification requires source or policy proof",
    );
    const key = `${entry.project}\0${entry.rule}\0${entry.evidenceFingerprint}`;
    requireCondition(
      !indexed.has(key),
      "Ambiguous duplicate finding classification",
    );
    for (const proof of entry.proof) {
      requireCondition(
        SHA256.test(proof.sha256),
        "Proof requires a SHA256 digest",
      );
      requireCondition(
        proofHash(readProofFile(root, proof.path)) === proof.sha256,
        `Stale evidence: ${proof.path}`,
      );
    }
    if (entry.classification === "scanner-limitation") {
      requireCondition(
        entry.proof.some(
          (proof) =>
            proof.path.startsWith("apps/") ||
            proof.path.startsWith("packages/"),
        ),
        "Scanner limitation requires current source proof",
      );
      requireCondition(
        Array.isArray(entry.verificationTests) &&
          entry.verificationTests.length > 0,
        "Scanner limitation requires executable verification tests",
      );
      for (const testPath of entry.verificationTests) {
        requireCondition(
          testPath.startsWith("tests/") &&
            /\.(?:test|spec)\.[jt]sx?$/.test(testPath),
          "Verification must reference a repository test",
        );
        requireCondition(
          entry.proof.some((proof) => proof.path === testPath),
          "Verification test must have checked proof",
        );
      }
    }
    indexed.set(key, entry);
  }
  const observed = new Set();
  const findings = report.findings
    .filter((finding) => finding.status === "fail" && finding.maxScore > 0)
    .map((finding) => {
      const fingerprint = evidenceFingerprint(finding);
      const key = `${finding.packageDir}\0${finding.id}\0${fingerprint}`;
      const entry = indexed.get(key);
      if (entry) {
        for (const item of finding.evidence) {
          if (item.filePath !== undefined) {
            requireCondition(
              entry.proof.some((proof) => proof.path === item.filePath),
              `Raw file evidence requires hashed proof: ${item.filePath}`,
            );
          }
        }
        observed.add(key);
      }
      return {
        project: finding.packageDir,
        rule: finding.id,
        evidenceFingerprint: fingerprint,
        classification: entry?.classification ?? "unclassified",
        rationale: entry?.rationale ?? null,
        evidence: finding.evidence,
      };
    });
  for (const key of indexed.keys())
    requireCondition(
      observed.has(key),
      "Stale classification: its exact raw failure no longer exists",
    );
  const errors = findings
    .filter((finding) =>
      ["unclassified", "confirmed-defect"].includes(finding.classification),
    )
    .map(
      (finding) =>
        `${finding.project} ${finding.rule}: ${finding.classification} (${finding.evidenceFingerprint})`,
    );
  return { findings, errors };
}
