import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/** Absent or "" → 3; otherwise digits only, ≥ 1 and exact; else null. */
export const parseAttemptCount = (raw) => {
  if (raw === undefined || raw === "") return 3;
  const count = /^[0-9]+$/.test(raw) ? Number(raw) : Number.NaN;
  return count >= 1 && Number.isSafeInteger(count) ? count : null;
};

const runOnce = () =>
  new Promise((resolve) => {
    const child = spawn("bun", ["run", "verify:e2e"], {
      stdio: ["inherit", "pipe", "pipe"],
      env: process.env,
    });

    let stdout = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      process.stderr.write(chunk);
    });

    child.on("error", () =>
      resolve({ ok: false, raw: "", error: "Failed to start verify:e2e" }),
    );
    child.on("close", (code) => resolve({ code: code ?? 1, raw: stdout }));
  });

const formatFailure = (failure) => {
  const parts = [`${failure.test}: ${failure.message}`];
  if (failure.tracePath) parts.push(`trace: ${failure.tracePath}`);
  if (failure.videoPath) parts.push(`video: ${failure.videoPath}`);
  return parts.join(" | ");
};

const main = async () => {
  const maxAttempts = parseAttemptCount(process.argv[2]);
  if (maxAttempts === null) {
    process.stderr.write(
      `verify:e2e:loop: attempt count must be a positive integer, got "${process.argv[2]}"\n`,
    );
    process.exit(1);
  }
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    process.stderr.write(`Attempt ${attempt}/${maxAttempts}\n`);
    const result = await runOnce();
    if (result.error) {
      process.stderr.write(`${result.error}\n`);
      process.exit(1);
    }

    let summary = null;
    try {
      summary = JSON.parse(result.raw.trim());
    } catch (error) {
      process.stderr.write("Failed to parse verify:e2e JSON output.\n");
      process.stderr.write(`${result.raw}\n`);
      process.exit(1);
    }
    if (typeof summary?.ok !== "boolean") {
      process.stderr.write("verify:e2e output has no boolean ok.\n");
      process.stderr.write(`${result.raw}\n`);
      process.exit(1);
    }

    process.stdout.write(`${result.raw.trim()}\n`);

    // An attempt passes only when the exit code and the summary agree.
    if (summary.ok !== (result.code === 0)) {
      process.stderr.write(
        `verify:e2e exited ${result.code} with ok=${summary.ok}; treating attempt as failed\n`,
      );
    } else if (summary.ok) {
      if (attempt > 1) {
        process.stderr.write(
          `Passed on attempt ${attempt}/${maxAttempts} after ${attempt - 1} failed attempt(s)\n`,
        );
      }
      process.exit(0);
    }

    const failures = Array.isArray(summary.failed) ? summary.failed : [];
    const topFailures = failures.slice(0, 3);
    if (topFailures.length > 0) {
      process.stderr.write("Failures:\n");
      for (const failure of topFailures) {
        process.stderr.write(`${formatFailure(failure)}\n`);
      }
    }

    if (attempt === maxAttempts) {
      process.stderr.write(
        `Reached max attempts (${maxAttempts}) without a pass\n`,
      );
      process.exit(1);
    }
  }
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
