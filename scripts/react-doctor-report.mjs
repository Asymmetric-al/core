import { createHash } from "node:crypto";
import path from "node:path";

import { REACT_DOCTOR_VERSION } from "./react-doctor-first-party.mjs";

const sha256 = (value) => createHash("sha256").update(value).digest("hex");

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
  const nonEmptyString = (value) => typeof value === "string" && value !== "";
  if (
    report.diagnostics.some(
      (diagnostic) =>
        !["warning", "error"].includes(diagnostic?.severity) ||
        !nonEmptyString(diagnostic.fingerprint) ||
        !nonEmptyString(diagnostic.plugin) ||
        !nonEmptyString(diagnostic.rule),
    )
  ) {
    throw new Error("Diagnostic identity or severity is unsupported.");
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
    // Name the scanner's own reasons: under load a lint batch timeout looks
    // like this, and the fix is a rerun, not a code change.
    const reasons =
      project.skippedCheckReasons &&
      typeof project.skippedCheckReasons === "object" &&
      !Array.isArray(project.skippedCheckReasons)
        ? Object.entries(project.skippedCheckReasons).map(
            ([check, reason]) => `${check}: ${String(reason)}`,
          )
        : [];
    throw new Error(
      `React Doctor skipped checks, omitted source coverage, or returned a partial project for ${target}${reasons.length ? ` (${reasons.join("; ")})` : ""}.`,
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
