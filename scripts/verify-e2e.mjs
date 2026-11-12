import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Same report dir rule as playwright.config.ts, so a stale report is never read.
const reportPath = path.resolve(
  process.env.PLAYWRIGHT_REPORT_DIR || "playwright-report",
  "results.json",
);

const runPlaywright = () =>
  new Promise((resolve) => {
    if (fs.existsSync(reportPath)) {
      fs.rmSync(reportPath, { force: true });
    }

    const projects = process.env.VERIFY_E2E_PROJECTS;
    const args =
      projects === "all"
        ? ["run", "test:e2e"]
        : [
            "run",
            "test:e2e",
            "--project=chromium",
            "--project=mobile-chrome",
            "--project=chromium-donor",
            "--project=chromium-admin",
          ];
    const child = spawn("bun", args, {
      stdio: ["inherit", "pipe", "pipe"],
      env: process.env,
    });

    child.stdout.on("data", (chunk) => {
      process.stderr.write(chunk);
    });
    child.stderr.on("data", (chunk) => {
      process.stderr.write(chunk);
    });

    child.on("error", () => resolve(1));
    child.on("close", (code) => resolve(code ?? 1));
  });

const isFailureStatus = (status) =>
  status === "failed" || status === "timedOut" || status === "interrupted";

const getErrorMessage = (result) => {
  const error = result?.error || result?.errors?.[0];
  if (!error) return "Unknown error";
  return error.message || error.value || error.stack || "Unknown error";
};

const collectAttachments = (result) => {
  const attachments = Array.isArray(result?.attachments)
    ? result.attachments.filter(isObject)
    : [];
  const trace = attachments.find(
    (attachment) =>
      attachment.name?.toLowerCase().includes("trace") ||
      attachment.path?.toLowerCase().endsWith(".zip"),
  );
  const video = attachments.find(
    (attachment) =>
      attachment.name?.toLowerCase().includes("video") ||
      attachment.path?.toLowerCase().endsWith(".webm"),
  );
  return { tracePath: trace?.path, videoPath: video?.path };
};

const collectFailures = (suite, parents = [], notRun = []) => {
  const failures = [];
  const nextParents = suite?.title ? [...parents, suite.title] : parents;

  for (const childSuite of suite?.suites || []) {
    failures.push(...collectFailures(childSuite, nextParents, notRun));
  }

  for (const spec of suite?.specs || []) {
    const testTitleBase = [...nextParents, spec.title]
      .filter(Boolean)
      .join(" > ");
    for (const test of spec.tests || []) {
      const results = test.results || [];
      if (test.status !== "skipped" && !results.length)
        notRun.push(testTitleBase);
      // `status` is the aggregate outcome; only "unexpected" is a failure.
      if (test.status !== "unexpected") continue;
      // The last failing attempt is the terminal outcome of a retried test.
      const last = results.at(-1);
      const result =
        results.findLast((entry) => isFailureStatus(entry.status)) || last;
      const unexpectedPass =
        test.expectedStatus === "failed" && last?.status === "passed";
      const { tracePath, videoPath } = collectAttachments(result);
      failures.push({
        test: testTitleBase,
        message: unexpectedPass
          ? "Expected to fail, but passed."
          : getErrorMessage(result),
        file: spec.file,
        line: spec.line || 0,
        ...(tracePath ? { tracePath } : {}),
        ...(videoPath ? { videoPath } : {}),
      });
    }
  }

  return failures;
};

const STATS = ["expected", "unexpected", "flaky", "skipped"];

const isObject = (value) =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

// An optional nested list: absent is fine, anything else must be an array.
const badList = (owner, key) =>
  owner[key] !== undefined && !Array.isArray(owner[key]);

/** First malformed nested path under `suites`, or null. */
const findInvalidNested = (suites, at = "suites") => {
  for (const [i, suite] of suites.entries()) {
    const s = `${at}[${i}]`;
    if (!isObject(suite)) return s;
    if (badList(suite, "suites")) return `${s}.suites`;
    if (badList(suite, "specs")) return `${s}.specs`;
    for (const [j, spec] of (suite.specs || []).entries()) {
      const p = `${s}.specs[${j}]`;
      if (!isObject(spec)) return p;
      if (badList(spec, "tests")) return `${p}.tests`;
      for (const [k, test] of (spec.tests || []).entries()) {
        const t = `${p}.tests[${k}]`;
        if (!isObject(test)) return t;
        if (badList(test, "results")) return `${t}.results`;
        // Each attempt must be an object before collectFailures reads it.
        const r = (test.results || []).findIndex((entry) => !isObject(entry));
        if (r !== -1) return `${t}.results[${r}]`;
        // Aggregate status: "interrupted" etc. are per-attempt statuses only.
        if (!STATS.includes(test.status)) return `${t}.status`;
      }
    }
    const nested = findInvalidNested(suite.suites || [], `${s}.suites`);
    if (nested) return nested;
  }
  return null;
};

const findInvalidField = (report) => {
  if (!isObject(report)) return "(root)";
  if (!Array.isArray(report.suites)) return "suites";
  if (!Array.isArray(report.errors)) return "errors";
  if (!report.stats || typeof report.stats !== "object") return "stats";
  const key = STATS.find(
    (k) => !Number.isInteger(report.stats[k]) || report.stats[k] < 0,
  );
  if (key) return `stats.${key}`;
  return findInvalidNested(report.suites);
};

/** Listed test cases per aggregate status, walking nested suites. */
const countListed = (
  suites,
  counts = { expected: 0, unexpected: 0, flaky: 0, skipped: 0 },
) => {
  for (const suite of suites) {
    for (const spec of suite.specs || []) {
      for (const test of spec.tests || []) counts[test.status] += 1;
    }
    countListed(suite.suites || [], counts);
  }
  return counts;
};

const collectFailuresFromReport = (report, reportPath) => {
  const failures = [];
  const fail = (message) =>
    failures.push({
      test: "playwright-report",
      message,
      file: reportPath,
      line: 0,
    });
  const invalid = findInvalidField(report);
  if (invalid) {
    fail(`Invalid Playwright JSON report: ${invalid}`);
    return failures;
  }
  for (const error of report.errors) {
    failures.push({
      test: "playwright-runner",
      message: getErrorMessage({ error }),
      file: error?.location?.file || reportPath,
      line: error?.location?.line || 0,
    });
  }
  const notRun = [];
  const tests = report.suites.flatMap((s) => collectFailures(s, [], notRun));
  failures.push(...tests);
  const { expected, flaky, skipped } = report.stats;
  if (expected + flaky === 0) {
    fail(
      `No tests executed (expected=${expected}, flaky=${flaky}, skipped=${skipped})`,
    );
  }
  if (notRun.length) {
    fail(
      `Incomplete run: ${notRun.length} test(s) without results: ${notRun[0]}`,
    );
  }
  // Every stats counter must match the listed cases with that aggregate status.
  const listed = countListed(report.suites);
  for (const key of STATS) {
    if (report.stats[key] !== listed[key]) {
      fail(
        `Incomplete run: stats.${key}=${report.stats[key]} but ${listed[key]} ${key} test(s) listed`,
      );
    }
  }
  return failures;
};

/**
 * Pure verdict: pass only when the child exit, report shape, runner errors,
 * test outcomes and execution completeness all agree. `reportText` is null
 * when the report could not be read.
 */
export const summarizeRun = ({ exitCode, reportText, reportPath }) => {
  let report;
  try {
    report = JSON.parse(reportText ?? "");
  } catch {
    const summary = {
      ok: false,
      failed: [
        {
          test: "playwright-report",
          message:
            "Failed to read JSON report. Check stderr for Playwright output.",
          file: reportPath,
          line: 0,
        },
      ],
      artifacts: { reportPath },
    };
    return { summary, exit: exitCode || 1 };
  }

  const failures = collectFailuresFromReport(report, reportPath);
  if (failures.length === 0 && exitCode !== 0) {
    failures.push({
      test: "playwright-process",
      message: `Playwright exited with code ${exitCode} but the report lists no failures`,
      file: reportPath,
      line: 0,
    });
  }
  const traces = failures.map((failure) => failure.tracePath).filter(Boolean);
  const videos = failures.map((failure) => failure.videoPath).filter(Boolean);

  const summary = {
    ok: failures.length === 0,
    failed: failures,
    artifacts: {
      reportPath,
      ...(traces.length ? { traces } : {}),
      ...(videos.length ? { videos } : {}),
    },
  };

  return { summary, exit: summary.ok ? 0 : 1, flaky: report?.stats?.flaky };
};

const main = async () => {
  const exitCode = await runPlaywright();
  let reportText = null;
  try {
    reportText = fs.readFileSync(reportPath, "utf-8");
  } catch {
    // Missing or unreadable: summarizeRun reports it (O7).
  }
  const run = summarizeRun({ exitCode, reportText, reportPath });
  if (run.summary.ok && run.flaky > 0) {
    process.stderr.write(
      `verify:e2e: ${run.flaky} flaky test(s) passed on retry\n`,
    );
  }
  process.stdout.write(`${JSON.stringify(run.summary)}\n`);
  process.exit(run.exit);
};

// Realpaths on both sides, so a relative or symlinked argv[1] still runs main().
const isEntrypoint = () => {
  try {
    return (
      fs.realpathSync(path.resolve(process.argv[1])) ===
      fs.realpathSync(fileURLToPath(import.meta.url))
    );
  } catch {
    return false;
  }
};
if (process.argv[1] && isEntrypoint()) main();
