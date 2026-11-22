// Builds the advisory Shadscan report. This module must run with Node built-ins
// only: the reporting job publishes "evidence unavailable" even when dependency
// installation failed, so it cannot rely on node_modules.

export const COMMENT_MARKER = "<!-- shadscan-report -->";

// Shadscan discovers every Next.js workspace as an application, so the private
// operator Console is listed beside the three product apps.
export const EXPECTED_APPLICATIONS = [
  "apps/admin",
  "apps/donor",
  "apps/factory-console",
  "apps/missionary",
];

export const CATEGORIES = [
  { id: "foundation", title: "Foundation", weight: 20 },
  { id: "interaction", title: "Interaction", weight: 20 },
  { id: "states", title: "States", weight: 20 },
  { id: "accessibility", title: "Accessibility", weight: 20 },
  { id: "forms", title: "Forms", weight: 10 },
  { id: "production-polish", title: "Production polish", weight: 10 },
];

const GUIDE = "docs/guides/development/shadscan.md";

// Recomputes the scanner's category score from raw rule assessments. Only
// scored pass and fail results count; advisory and not-applicable rules do not.
export function categoryScores(findings) {
  return CATEGORIES.map(({ id, weight }) => {
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
      weight,
      applicable,
      maxScore: applicable ? weight : 0,
      percentage: applicable ? Math.round((earned / available) * 100) : null,
      score: applicable ? (earned / available) * weight : 0,
    };
  });
}

function failingRules(findings) {
  return [
    ...new Set(
      findings
        .filter((finding) => finding.status === "fail")
        .map((finding) => finding.id),
    ),
  ].sort();
}

function describeProject(report, project) {
  const findings = (report.findings ?? []).filter(
    (finding) => finding.packageDir === project.packageDir,
  );
  return {
    packageDir: project.packageDir,
    discovered: true,
    score: project.score ?? null,
    grade: project.grade ?? null,
    categories: categoryScores(findings).map(
      ({ id, applicable, percentage }) => ({ id, applicable, percentage }),
    ),
    failingRules: failingRules(findings),
  };
}

export function summarizeReport(report) {
  const projects = report.workspace?.projects ?? [];
  const applications = projects.filter(
    (project) => project.kind === "application",
  );
  const byDirectory = (left, right) =>
    left.packageDir.localeCompare(right.packageDir);
  return {
    status: "available",
    engineVersion: report.engineVersion,
    rulesetVersion: report.rulesetVersion,
    schemaVersion: report.schemaVersion,
    score: report.score ?? null,
    coverage: { source: report.coverage?.source ?? null },
    truncated: report.workspace?.truncated ?? 0,
    applications: [
      ...EXPECTED_APPLICATIONS.map((packageDir) => {
        const project = applications.find(
          (item) => item.packageDir === packageDir,
        );
        return project
          ? describeProject(report, project)
          : { packageDir, discovered: false };
      }),
      ...applications
        .filter(
          (project) => !EXPECTED_APPLICATIONS.includes(project.packageDir),
        )
        .sort(byDirectory)
        .map((project) => describeProject(report, project)),
    ],
    libraries: projects
      .filter((project) => project.kind !== "application")
      .sort(byDirectory)
      .map((project) => ({
        packageDir: project.packageDir,
        score: project.score ?? null,
      })),
  };
}

function text(value) {
  return String(value)
    .replaceAll("|", "\\|")
    .replaceAll("`", "\\`")
    .replaceAll("<", "&lt;")
    .replaceAll("\n", " ");
}

function code(value) {
  return `\`${String(value).replaceAll("`", "").replaceAll("\n", " ")}\``;
}

function heading(headSha) {
  return [
    COMMENT_MARKER,
    "## Shadscan UI audit (advisory)",
    "",
    ...(headSha ? [`Head commit ${code(headSha)}.`] : []),
  ];
}

function percentage(category) {
  return category?.applicable ? category.percentage : "n/a";
}

export function renderSummary(summary, { headSha } = {}) {
  const lines = [
    ...heading(headSha),
    `Engine ${text(summary.engineVersion)}, ruleset ${text(summary.rulesetVersion)}. Pooled application score: **${summary.score ?? "unassessed"}/100**. Source coverage: **${text(summary.coverage?.source ?? "unavailable")}**.`,
  ];
  if (summary.truncated > 0)
    lines.push(
      "",
      `Workspace discovery was truncated (${summary.truncated}); an application may be missing.`,
    );
  lines.push(
    "",
    `| Application | Overall | ${CATEGORIES.map((category) => category.title).join(" | ")} |`,
    `| --- | ---: | ${CATEGORIES.map(() => "---:").join(" | ")} |`,
  );
  for (const app of summary.applications) {
    const cells = app.discovered
      ? [
          app.score ?? "unassessed",
          ...CATEGORIES.map(({ id }) =>
            percentage(app.categories?.find((category) => category.id === id)),
          ),
        ]
      : ["not discovered", ...CATEGORIES.map(() => "-")];
    lines.push(`| ${text(app.packageDir)} | ${cells.join(" | ")} |`);
  }
  lines.push("", "### Failing rules", "");
  for (const app of summary.applications) {
    if (!app.discovered)
      lines.push(`- ${code(app.packageDir)}: not discovered`);
    else if (!app.failingRules?.length)
      lines.push(`- ${code(app.packageDir)}: none`);
    else
      lines.push(
        `- ${code(app.packageDir)} (${app.failingRules.length}): ${app.failingRules.map(code).join(", ")}`,
      );
  }
  lines.push(
    "",
    summary.libraries.length
      ? `Library projects are scanned separately and do not pool into the application score: ${summary.libraries
          .map(
            (library) =>
              `${code(library.packageDir)} ${library.score ?? "unassessed"}`,
          )
          .join(", ")}.`
      : "No library projects were scanned.",
    "",
    `These scores are advisory: they never fail a required check. Reviewers triage failing rules under ${code(GUIDE)}. The raw report is attached to the workflow run.`,
  );
  return `${lines.join("\n")}\n`;
}

export function renderUnavailable({ headSha, reason }) {
  return `${[
    ...heading(null),
    `**Audit evidence is unavailable for head commit ${code(headSha ?? "unknown")}.** ${text(reason ?? "The audit did not produce a valid report")}.`,
    "",
    "No score is shown for this commit, and no earlier score applies to it. The report is advisory and never fails a required check; the reporting job itself is marked as failed.",
  ].join("\n")}\n`;
}
