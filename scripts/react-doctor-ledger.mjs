import { createHash } from "node:crypto";
import { readFileSync, realpathSync } from "node:fs";
import path from "node:path";

import {
  REACT_DOCTOR_TARGETS,
  REACT_DOCTOR_VERSION,
} from "./react-doctor-first-party.mjs";

const sha256 = (value) => createHash("sha256").update(value).digest("hex");

export function findingIdentity(target, diagnostic) {
  return JSON.stringify([
    target,
    diagnostic.filePath,
    `${diagnostic.plugin}/${diagnostic.rule}`,
    diagnostic.line ?? null,
    diagnostic.column ?? null,
    diagnostic.endLine ?? null,
    diagnostic.offset ?? null,
    diagnostic.length ?? null,
    diagnostic.fingerprint ?? null,
    diagnostic.id ?? null,
    diagnostic.message ?? null,
    diagnostic.severity ?? null,
  ]);
}

function diagnosticSourcePath(root, target, diagnostic) {
  const relative = diagnostic.filePath;
  if (
    typeof relative !== "string" ||
    relative.includes("\\") ||
    path.isAbsolute(relative) ||
    relative
      .split("/")
      .some(
        (part) =>
          part === ".." || part.startsWith(".env") || part === "node_modules",
      )
  ) {
    throw new Error("Diagnostic source path is outside the audit contract.");
  }
  const project = realpathSync(path.resolve(root, target));
  const source = realpathSync(path.resolve(project, relative));
  if (
    !source.startsWith(project + path.sep) ||
    !/\.(?:[cm]?js|jsx|ts|tsx|json)$/.test(source)
  ) {
    throw new Error("Diagnostic source path is outside its scoped project.");
  }
  return source;
}

export function sourceContextHash(root, target, diagnostic) {
  const relative = diagnostic.filePath;
  const source = diagnosticSourcePath(root, target, diagnostic);
  const bytes = readFileSync(source);
  const text = bytes.toString("utf8");
  if (
    relative === "package.json" &&
    diagnostic.line === 0 &&
    ["unused-dependency", "unused-dev-dependency"].includes(diagnostic.rule)
  ) {
    return sha256(text);
  }
  const { offset, length } = diagnostic;
  if (
    Number.isSafeInteger(offset) &&
    Number.isSafeInteger(length) &&
    offset >= 0 &&
    length > 0 &&
    offset + length <= bytes.length
  ) {
    return sha256(bytes.subarray(offset, offset + length));
  }
  const lines = text.split(/\r?\n/);
  if (
    !Number.isSafeInteger(diagnostic.line) ||
    diagnostic.line < 1 ||
    diagnostic.line > lines.length
  ) {
    throw new Error("Diagnostic has no valid source context location.");
  }
  const endLine = diagnostic.endLine ?? diagnostic.line;
  if (
    !Number.isSafeInteger(endLine) ||
    endLine < diagnostic.line ||
    endLine > lines.length
  ) {
    throw new Error("Diagnostic has an invalid source context span.");
  }
  return sha256(lines.slice(diagnostic.line - 1, endLine).join("\n"));
}

export function sourceFileHash(root, target, diagnostic) {
  return sha256(readFileSync(diagnosticSourcePath(root, target, diagnostic)));
}

export function evidenceFileHash(root, relative) {
  if (
    typeof relative !== "string" ||
    path.isAbsolute(relative) ||
    relative.includes("\\") ||
    relative
      .split("/")
      .some(
        (part) =>
          part === ".." ||
          part.startsWith(".env") ||
          part === ".git" ||
          part === "node_modules",
      ) ||
    !(
      relative === "bun.lock" ||
      relative === "package.json" ||
      relative === "doctor.config.json" ||
      /^(?:apps|packages|scripts|tests|tooling|docs)\//.test(relative)
    )
  ) {
    throw new Error("Evidence source path is outside the audit contract.");
  }
  const absoluteRoot = realpathSync(root);
  const source = realpathSync(path.resolve(absoluteRoot, relative));
  if (!source.startsWith(absoluteRoot + path.sep))
    throw new Error("Evidence source escaped the repository.");
  return sha256(readFileSync(source));
}

export function reviewReactDoctorFindings(
  scans,
  ledger,
  { root, configHash, expectedTargets = REACT_DOCTOR_TARGETS },
) {
  if (
    ledger.schemaVersion !== 1 ||
    ledger.reactDoctorVersion !== REACT_DOCTOR_VERSION
  ) {
    throw new Error("Exception ledger schema or scanner version is stale.");
  }
  if (ledger.configHash !== configHash || !Array.isArray(ledger.exceptions)) {
    throw new Error(
      "Exception ledger configuration hash or records are invalid.",
    );
  }
  const targets = scans.map((scan) => scan.target);
  if (
    new Set(targets).size !== targets.length ||
    targets.length !== expectedTargets.length ||
    expectedTargets.some((target) => !targets.includes(target))
  ) {
    throw new Error(
      "The audit did not complete every required target exactly once.",
    );
  }
  const exceptions = new Map();
  for (const record of ledger.exceptions) {
    if (
      !expectedTargets.includes(record.target) ||
      !record.reason?.trim() ||
      !record.reconsiderWhen?.trim() ||
      !Array.isArray(record.evidence) ||
      record.evidence.length === 0 ||
      record.evidence.some(
        (item) => typeof item !== "string" || !item.trim(),
      ) ||
      !/^[a-f0-9]{64}$/.test(record.sourceContextHash) ||
      !/^[a-f0-9]{64}$/.test(record.sourceFileHash)
    ) {
      throw new Error(
        "Exception record lacks scope, context, reason, evidence, or reconsideration condition.",
      );
    }
    const evidenceHashes = record.evidenceFileHashes;
    if (
      !evidenceHashes ||
      typeof evidenceHashes !== "object" ||
      Array.isArray(evidenceHashes) ||
      Object.keys(evidenceHashes).length === 0
    )
      throw new Error("Exception lacks supporting evidence source hashes.");
    for (const [relative, hash] of Object.entries(evidenceHashes)) {
      if (
        !/^[a-f0-9]{64}$/.test(hash) ||
        evidenceFileHash(root, relative) !== hash
      )
        throw new Error(`Exception evidence changed: ${relative}`);
    }
    const key = findingIdentity(record.target, record);
    if (exceptions.has(key))
      throw new Error("Duplicate exception records are forbidden.");
    exceptions.set(key, record);
  }
  const seen = new Set();
  const actionable = [];
  const excepted = [];
  for (const scan of scans) {
    if (
      !Array.isArray(scan.diagnostics) ||
      !Array.isArray(scan.skippedChecks) ||
      scan.skippedChecks.length ||
      scan.complete === false ||
      !Number.isSafeInteger(scan.scannedFileCount) ||
      scan.scannedFileCount < 1
    ) {
      throw new Error(
        `Target ${scan.target} has skipped, incomplete, or missing checks.`,
      );
    }
    for (const diagnostic of scan.diagnostics) {
      if (
        !["warning", "error"].includes(diagnostic.severity) ||
        typeof diagnostic.fingerprint !== "string" ||
        !diagnostic.fingerprint ||
        typeof diagnostic.plugin !== "string" ||
        typeof diagnostic.rule !== "string"
      ) {
        throw new Error("Diagnostic identity or severity is unsupported.");
      }
      const key = findingIdentity(scan.target, diagnostic);
      if (seen.has(key))
        throw new Error(
          "Duplicate diagnostic identity cannot be safely adjudicated.",
        );
      seen.add(key);
      const record = exceptions.get(key);
      const finding = { target: scan.target, diagnostic };
      if (!record) {
        actionable.push(finding);
        continue;
      }
      if (
        sourceContextHash(root, scan.target, diagnostic) !==
          record.sourceContextHash ||
        sourceFileHash(root, scan.target, diagnostic) !== record.sourceFileHash
      ) {
        throw new Error(
          `Exception source context changed: ${scan.target}/${diagnostic.filePath}:${diagnostic.line}`,
        );
      }
      exceptions.delete(key);
      excepted.push({ ...finding, exception: record });
    }
  }
  if (exceptions.size)
    throw new Error(
      `${exceptions.size} exception records are unused or stale.`,
    );
  return {
    actionable,
    excepted,
    rawCount: actionable.length + excepted.length,
  };
}

export { sha256 as reactDoctorConfigHash };

export function parseReactDoctorReport(report, target, expectedDirectory) {
  if (
    report.schemaVersion !== 3 ||
    report.version !== REACT_DOCTOR_VERSION ||
    report.mode !== "full" ||
    report.ok !== true ||
    report.error !== null ||
    path.resolve(report.directory) !== path.resolve(expectedDirectory)
  ) {
    throw new Error(
      "React Doctor CLI report protocol, version, scope, or success is invalid.",
    );
  }
  if (
    !Array.isArray(report.projects) ||
    report.projects.length !== 1 ||
    !Array.isArray(report.diagnostics)
  ) {
    throw new Error("A target scan must contain exactly one complete project.");
  }
  if (
    report.skippedProjects !== undefined &&
    (!Array.isArray(report.skippedProjects) || report.skippedProjects.length)
  ) {
    throw new Error("React Doctor skipped one or more projects.");
  }
  const project = report.projects[0];
  const identity = [
    project.directory,
    project.packageRoot,
    project.project?.rootDirectory,
  ];
  if (
    identity.some(
      (directory) =>
        typeof directory !== "string" ||
        path.resolve(directory) !== path.resolve(expectedDirectory),
    ) ||
    !Array.isArray(project.diagnostics) ||
    JSON.stringify(project.diagnostics) !==
      JSON.stringify(report.diagnostics) ||
    project.score !== null
  ) {
    throw new Error(
      "React Doctor project identity or diagnostic accounting is inconsistent.",
    );
  }
  if (
    project.complete !== true ||
    !Array.isArray(project.skippedChecks) ||
    project.skippedChecks.length ||
    !Array.isArray(project.analyzedFiles) ||
    new Set(project.analyzedFiles).size !== project.analyzedFiles.length ||
    project.analyzedFiles.length !== project.analyzedFileCount ||
    !Number.isSafeInteger(project.scannedFileCount) ||
    project.scannedFileCount < 1
  ) {
    throw new Error(
      "React Doctor skipped checks, omitted source coverage, or returned a partial project.",
    );
  }
  const errors = report.diagnostics.filter(
    (item) => item.severity === "error",
  ).length;
  const warnings = report.diagnostics.filter(
    (item) => item.severity === "warning",
  ).length;
  if (
    report.summary?.score !== null ||
    report.summary.totalDiagnosticCount !== report.diagnostics.length ||
    report.summary.errorCount !== errors ||
    report.summary.warningCount !== warnings ||
    errors + warnings !== report.diagnostics.length
  ) {
    throw new Error(
      "React Doctor returned a score or inconsistent diagnostic accounting.",
    );
  }
  return {
    target,
    complete: true,
    diagnostics: report.diagnostics,
    skippedChecks: project.skippedChecks,
    scannedFileCount: project.scannedFileCount,
    analyzedFiles: project.analyzedFiles,
    sourceFilterConfigHash: project.sourceFilterConfigHash,
  };
}
