function markdown(value) {
  return String(value)
    .replaceAll("|", "\\|")
    .replaceAll("`", "\\`")
    .replaceAll("<", "&lt;")
    .replaceAll("\n", " ");
}

export function renderSummary(summary) {
  const lines = [
    "<!-- shadscan-report -->",
    "## Shadscan workspace audit",
    "",
    `Raw pooled score: **${summary.score ?? "unassessed"}/100**. Engine ${markdown(summary.engineVersion)}, ruleset ${markdown(summary.rulesetVersion)}.`,
    `Source coverage: **${markdown(summary.coverage?.source ?? "unavailable")}**.`,
    "",
    "| Application | Raw score | Floor |",
    "| --- | ---: | ---: |",
    ...summary.applications.map(
      (project) =>
        `| ${markdown(project.packageDir)} | ${project.score ?? "unassessed"} | ${project.floor} |`,
    ),
    "",
    `${summary.libraries.length} library projects are reported separately and excluded from the pooled application score. No library score floor or adjusted score is used.`,
    "",
    `Gate: **${summary.passed ? "passed" : "failed"}**. All raw findings remain in the attached JSON report, including proven scanner limitations and accepted product choices.`,
  ];
  if (summary.errors.length)
    lines.push(
      "",
      "### Required follow-up",
      "",
      ...summary.errors.map((error) => `- ${markdown(error)}`),
    );
  if (summary.findings.length) {
    lines.push(
      "",
      "### Raw failures and reviewed classifications",
      "",
      "| Project | Rule | Classification |",
      "| --- | --- | --- |",
    );
    for (const finding of summary.findings)
      lines.push(
        `| ${markdown(finding.project)} | ${markdown(finding.rule)} | ${markdown(finding.classification)} |`,
      );
  }
  return `${lines.join("\n")}\n`;
}
