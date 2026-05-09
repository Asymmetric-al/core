import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_REPORT_DIR = "test-results/unit-feedback";
const MAX_BUFFER_BYTES = 50 * 1024 * 1024;
const REMEDIATION_CATEGORIES = new Set([
  "import path",
  "server/client boundary",
  "fallback routing",
  "rich-text image policy",
]);

function escapeMarkdownCell(value) {
  return String(value ?? "")
    .replace(/\r?\n/g, " ")
    .replace(/\|/g, "\\|")
    .trim();
}

function parseCount(text, label) {
  const match = text.match(new RegExp(`(\\d+)\\s+${label}\\b`));
  return match ? Number(match[1]) : 0;
}

function parseTotal(text) {
  const match = text.match(/\((\d+)\)/);
  return match ? Number(match[1]) : 0;
}

function normalizeRepoPath(value) {
  return String(value ?? "")
    .replace(/\\/g, "/")
    .replace(/^\.?\//, "")
    .trim();
}

function summarizeStatusLine(text) {
  return {
    failed: parseCount(text, "failed"),
    passed: parseCount(text, "passed"),
    skipped: parseCount(text, "skipped"),
    total: parseTotal(text),
    raw: text.trim(),
  };
}

function findFirstMatchingLine(block, patterns) {
  for (const line of block.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (patterns.some((pattern) => pattern.test(trimmed))) {
      return trimmed;
    }
  }
  return "";
}

function findAffectedSourcePath(block, testFile) {
  const pathMatches = block.match(
    /\b(?:apps|packages|tooling|scripts|tests)\/[^\s:'")]+/g,
  );

  if (pathMatches) {
    const normalizedMatches = pathMatches.map(normalizeRepoPath);
    const sourcePath = normalizedMatches.find(
      (candidate) => !candidate.startsWith("tests/"),
    );
    if (sourcePath) return sourcePath;
    if (normalizedMatches[0]) return normalizedMatches[0];
  }

  const normalizedTestFile = normalizeRepoPath(testFile);
  if (normalizedTestFile.includes("apps/admin")) {
    return "apps/admin";
  }
  if (normalizedTestFile.includes("apps/donor")) {
    return "apps/donor";
  }
  if (normalizedTestFile.includes("virtualization")) {
    return "apps/donor or apps/missionary virtualization surfaces";
  }
  return "unknown";
}

export function stripAnsi(value) {
  return String(value ?? "").replace(
    // eslint-disable-next-line no-control-regex -- AL-203 strips terminal color escapes from Vitest output.
    /\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])/g,
    "",
  );
}

export function parseVitestSummary(output, exitCode = 0) {
  const cleanOutput = stripAnsi(output);
  const testFilesMatch = cleanOutput.match(/Test Files\s+([^\n]+)/);
  const testsMatch = cleanOutput.match(/^\s*Tests\s+([^\n]+)/m);
  const durationMatch = cleanOutput.match(/Duration\s+([^\n]+)/);
  const testFiles = testFilesMatch
    ? summarizeStatusLine(testFilesMatch[1])
    : { failed: 0, passed: 0, skipped: 0, total: 0, raw: "unknown" };
  const tests = testsMatch
    ? summarizeStatusLine(testsMatch[1])
    : { failed: 0, passed: 0, skipped: 0, total: 0, raw: "unknown" };

  return {
    command: "bun run test:unit",
    status: exitCode === 0 ? "pass" : "fail",
    exitCode,
    testFiles,
    tests,
    duration: durationMatch ? durationMatch[1].trim() : "unknown",
  };
}

export function categorizeFailure(failure) {
  const haystack = [
    failure.testFile,
    failure.testName,
    failure.assertion,
    failure.block,
  ]
    .join("\n")
    .toLowerCase();

  if (
    haystack.includes("@/features/donor/components") ||
    haystack.includes("features/donor/components")
  ) {
    return "import path";
  }
  if (
    haystack.includes("page-client") ||
    haystack.includes("use client") ||
    haystack.includes("server component") ||
    haystack.includes("page.tsx")
  ) {
    return "server/client boundary";
  }
  if (
    haystack.includes("global-not-found") ||
    haystack.includes("global-error") ||
    haystack.includes("not-found") ||
    haystack.includes("fallback") ||
    haystack.includes("404")
  ) {
    return "fallback routing";
  }
  if (
    haystack.includes("<img") ||
    haystack.includes("image-view") ||
    haystack.includes("rich-text") ||
    haystack.includes("tiptap")
  ) {
    return "rich-text image policy";
  }
  return "unrelated";
}

export function recommendedAction(category) {
  switch (category) {
    case "import path":
      return "Replace hot-path barrel imports with direct module imports while keeping compatibility exports intact.";
    case "server/client boundary":
      return "Keep route files as server wrappers and move client-only assertions or logic to colocated page-client islands.";
    case "fallback routing":
      return "Verify full-document global fallback markup and globalNotFound config in each app.";
    case "rich-text image policy":
      return "Keep raw image rendering only in the rich-text path with alt, lazy loading, sizing, and sanitization constraints.";
    default:
      return "Rerun the failing file, inspect the assertion, and avoid changing remediation surfaces unless the trace proves a link.";
  }
}

export function parseFailedTests(output) {
  const cleanOutput = stripAnsi(output);
  const lines = cleanOutput.split(/\r?\n/);
  const failures = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();
    const match = line.match(/^FAIL\s+(.+?)\s+>\s+(.+)$/);
    if (!match) continue;

    const blockLines = [];
    for (let next = index + 1; next < lines.length; next += 1) {
      if (lines[next].trim().startsWith("FAIL ")) break;
      if (lines[next].includes("Failed Tests")) continue;
      blockLines.push(lines[next]);
    }

    const block = blockLines.join("\n");
    const assertion =
      findFirstMatchingLine(block, [
        /AssertionError:/,
        /TypeError:/,
        /ReferenceError:/,
        /Error:/,
        /^expected\s/i,
        /^received\s/i,
      ]) || "No assertion line parsed; inspect raw Vitest output.";
    const baseFailure = {
      testFile: normalizeRepoPath(match[1]),
      testName: match[2].trim(),
      assertion,
      block,
    };
    const category = categorizeFailure(baseFailure);
    failures.push({
      ...baseFailure,
      affectedSourcePath: findAffectedSourcePath(block, baseFailure.testFile),
      category,
      recommendedAction: recommendedAction(category),
      nextAction: REMEDIATION_CATEGORIES.has(category)
        ? "fix now"
        : "triage separately",
    });
  }

  if (failures.length > 0) {
    return failures;
  }

  const failedFileMatches = cleanOutput.matchAll(
    /^\s*(?:\S+\s+)?((?:tests|packages)\/.+?)\s+\(.+failed\)/gm,
  );
  return Array.from(failedFileMatches, (match) => {
    const baseFailure = {
      testFile: normalizeRepoPath(match[1]),
      testName: "Unknown test; inspect raw Vitest output.",
      assertion: "No assertion line parsed; inspect raw Vitest output.",
      block: "",
    };
    const category = categorizeFailure(baseFailure);
    return {
      ...baseFailure,
      affectedSourcePath: findAffectedSourcePath("", baseFailure.testFile),
      category,
      recommendedAction: recommendedAction(category),
      nextAction: REMEDIATION_CATEGORIES.has(category)
        ? "fix now"
        : "triage separately",
    };
  });
}

function readCoverageCaveat(rootDir) {
  const summaryPath = path.join(rootDir, "coverage", "coverage-summary.json");
  if (!existsSync(summaryPath)) {
    return "Coverage summary was not generated.";
  }

  try {
    const summary = JSON.parse(readFileSync(summaryPath, "utf8"));
    if (summary?.meta?.provider === "custom-v8-raw") {
      return `${summary.meta.note ?? "Custom coverage provider is active."} totalScripts: ${
        summary.meta.totalScripts ?? "unknown"
      }.`;
    }
  } catch (error) {
    return `Coverage summary could not be parsed: ${error.message}`;
  }

  return "Coverage summary generated.";
}

function uniqueFailureFiles(failures) {
  return Array.from(
    new Set(failures.map((failure) => failure.testFile)),
  ).filter(Boolean);
}

function runCommand(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd,
    encoding: "utf8",
    env: options.env ?? process.env,
    maxBuffer: MAX_BUFFER_BYTES,
    shell: options.shell ?? false,
  });

  const stdout = result.stdout ?? "";
  const stderr = result.stderr ?? "";

  if (options.passThrough) {
    if (stdout) process.stdout.write(stdout);
    if (stderr) process.stderr.write(stderr);
  }

  return {
    command: [command, ...args].join(" "),
    status: result.status ?? 1,
    error: result.error?.message ?? null,
    stdout,
    stderr,
  };
}

function runTargetedReruns(failures, rootDir) {
  const maxReruns = Number(process.env.UNIT_FEEDBACK_MAX_RERUNS ?? "20");
  const files = uniqueFailureFiles(failures).slice(0, maxReruns);

  return files.map((file) => {
    const result = runCommand("bun", ["x", "vitest", "run", file], {
      cwd: rootDir,
      env: {
        ...process.env,
        FORCE_COLOR: "0",
        NO_COLOR: "1",
      },
      passThrough: true,
    });

    return {
      testFile: file,
      command: `bunx vitest run ${file}`,
      exitCode: result.status,
      status: result.status === 0 ? "pass" : "fail",
      error: result.error,
    };
  });
}

export function buildMarkdownReport(report) {
  const summary = report.summary;
  const lines = [
    "# Unit Test Feedback Report",
    "",
    `- Status: ${summary.status.toUpperCase()}`,
    `- Command: \`${summary.command}\``,
    `- Test files: ${summary.testFiles.raw}`,
    `- Tests: ${summary.tests.raw}`,
    `- Skipped tests: ${summary.tests.skipped}`,
    `- Duration: ${summary.duration}`,
    `- Report artifacts: \`${report.artifacts.markdown}\`, \`${report.artifacts.json}\``,
    `- Coverage caveat: ${report.coverageCaveat}`,
    "",
    "## Failures",
    "",
  ];

  if (report.failures.length === 0) {
    lines.push("No unit test failures. Next action: no action.");
  } else {
    lines.push(
      "| Test file | Test name | Assertion | Affected source path | Regression category | Recommended action | Next action |",
      "| --- | --- | --- | --- | --- | --- | --- |",
    );
    for (const failure of report.failures) {
      const cells = [
        failure.testFile,
        failure.testName,
        failure.assertion,
        failure.affectedSourcePath,
        failure.category,
        failure.recommendedAction,
        failure.nextAction,
      ].map(escapeMarkdownCell);
      lines.push(`| ${cells.join(" | ")} |`);
    }
  }

  if (report.reruns.length > 0) {
    lines.push("", "## Targeted Reruns", "");
    lines.push("| Test file | Command | Status | Exit code |");
    lines.push("| --- | --- | --- | --- |");
    for (const rerun of report.reruns) {
      const cells = [
        rerun.testFile,
        `\`${rerun.command}\``,
        rerun.status,
        rerun.exitCode,
      ].map(escapeMarkdownCell);
      lines.push(`| ${cells.join(" | ")} |`);
    }
  }

  return `${lines.join("\n")}\n`;
}

function parseArgs(argv) {
  const options = {
    githubIssue: process.env.UNIT_FEEDBACK_GITHUB_ISSUE ?? "",
    reportDir: process.env.UNIT_FEEDBACK_REPORT_DIR ?? DEFAULT_REPORT_DIR,
    passThrough: true,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--github-issue") {
      options.githubIssue = argv[index + 1] ?? "";
      index += 1;
      continue;
    }
    if (arg === "--report-dir") {
      options.reportDir = argv[index + 1] ?? DEFAULT_REPORT_DIR;
      index += 1;
      continue;
    }
    if (arg === "--no-pass-through") {
      options.passThrough = false;
      continue;
    }
    if (arg === "--help") {
      options.help = true;
    }
  }

  return options;
}

function printHelp() {
  console.log(`Usage: node scripts/verify/unit-feedback.mjs [options]

Options:
  --github-issue <number>  Post failing reports to a GitHub issue.
  --report-dir <path>      Write report artifacts to this ignored directory.
  --no-pass-through        Do not echo raw Vitest output before the report.

Environment:
  UNIT_FEEDBACK_GITHUB_ISSUE=<number>
  UNIT_FEEDBACK_REPORT_DIR=<path>
  UNIT_FEEDBACK_MAX_RERUNS=<number>
`);
}

function maybePostGitHubComment(report, markdownPath, rootDir, githubIssue) {
  if (!githubIssue || report.summary.status !== "fail") {
    return null;
  }

  const result = runCommand(
    "gh",
    ["issue", "comment", githubIssue, "--body-file", markdownPath],
    {
      cwd: rootDir,
      passThrough: true,
    },
  );

  return {
    issue: githubIssue,
    status: result.status === 0 ? "posted" : "failed",
    exitCode: result.status,
    error: result.error,
  };
}

export function buildReport({
  baseline,
  coverageCaveat,
  failures,
  reportDir,
  reruns,
}) {
  const summary = parseVitestSummary(
    `${baseline.stdout}\n${baseline.stderr}`,
    baseline.status,
  );
  const markdownPath = normalizeRepoPath(path.join(reportDir, "latest.md"));
  const jsonPath = normalizeRepoPath(path.join(reportDir, "latest.json"));

  return {
    generatedAt: new Date().toISOString(),
    summary,
    failures,
    reruns,
    coverageCaveat,
    artifacts: {
      markdown: markdownPath,
      json: jsonPath,
    },
  };
}

async function main() {
  const rootDir = process.cwd();
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    printHelp();
    return;
  }

  const reportDir = path.resolve(rootDir, options.reportDir);
  const baseline = runCommand("bun", ["run", "test:unit"], {
    cwd: rootDir,
    env: {
      ...process.env,
      FORCE_COLOR: "0",
      NO_COLOR: "1",
    },
    passThrough: options.passThrough,
  });

  const combinedOutput = `${baseline.stdout}\n${baseline.stderr}`;
  const failures =
    baseline.status === 0 ? [] : parseFailedTests(combinedOutput);
  const reruns =
    failures.length > 0 ? runTargetedReruns(failures, rootDir) : [];
  const report = buildReport({
    baseline,
    coverageCaveat: readCoverageCaveat(rootDir),
    failures,
    reportDir: options.reportDir,
    reruns,
  });
  const markdown = buildMarkdownReport(report);

  mkdirSync(reportDir, { recursive: true });
  const markdownPath = path.join(reportDir, "latest.md");
  const jsonPath = path.join(reportDir, "latest.json");
  writeFileSync(markdownPath, markdown, "utf8");
  writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  console.log("\n==> Unit feedback report");
  console.log(markdown);

  const githubPost = maybePostGitHubComment(
    report,
    markdownPath,
    rootDir,
    options.githubIssue,
  );
  if (githubPost) {
    console.log(
      `==> GitHub issue ${githubPost.issue} comment ${githubPost.status}`,
    );
  } else if (options.githubIssue) {
    console.log("==> GitHub issue comment skipped because unit tests passed");
  }

  if (baseline.error) {
    console.error(`==> FAIL test:unit:feedback (${baseline.error})`);
  }

  process.exit(baseline.status);
}

const currentFile = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === currentFile) {
  main().catch((error) => {
    console.error(`==> FAIL test:unit:feedback (${error.message})`);
    process.exit(1);
  });
}
