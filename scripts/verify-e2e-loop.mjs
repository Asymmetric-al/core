import { spawn } from "node:child_process";

const maxAttempts = Number.parseInt(process.argv[2] || "3", 10);

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

    process.stdout.write(`${result.raw.trim()}\n`);

    if (summary.ok) {
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
      process.exit(1);
    }
  }
};

main();
