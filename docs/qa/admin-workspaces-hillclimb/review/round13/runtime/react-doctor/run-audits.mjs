import { spawn } from "node:child_process";
import { createWriteStream, existsSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const evidenceRoot = path.dirname(fileURLToPath(import.meta.url));
const runId = new Date().toISOString().replace(/[-:.]/g, "");
const results = [];
for (const mode of ["audit", "raw"]) {
  const outputDirectory = path.join(evidenceRoot, `${mode}-${runId}`);
  const args = ["run", `react-doctor:${mode}`, "--"];
  if (mode === "audit") args.push("--check");
  args.push(`--output=${outputDirectory}`);
  const stdoutPath = path.join(evidenceRoot, `${mode}-${runId}.stdout.log`);
  const stderrPath = path.join(evidenceRoot, `${mode}-${runId}.stderr.log`);
  if ([outputDirectory, stdoutPath, stderrPath].some(existsSync))
    throw new Error("Fresh evidence required.");
  const startedAt = new Date().toISOString();
  console.log(JSON.stringify({ mode, startedAt, command: ["bun", ...args] }));
  const child = spawn("bun", args, {
    cwd: process.cwd(),
    shell: false,
    windowsHide: true,
  });
  child.stdout.pipe(createWriteStream(stdoutPath, { flags: "wx" }));
  child.stderr.pipe(createWriteStream(stderrPath, { flags: "wx" }));
  let timedOut = false;
  const watchdog = setTimeout(() => {
    timedOut = true;
    spawn("taskkill", ["/PID", String(child.pid), "/T", "/F"], {
      shell: false,
      windowsHide: true,
      stdio: "ignore",
    });
  }, 900000);
  const completion = await new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("close", (exitCode, signal) => resolve({ exitCode, signal }));
  });
  clearTimeout(watchdog);
  const result = {
    mode,
    command: ["bun", ...args],
    cwd: process.cwd(),
    startedAt,
    endedAt: new Date().toISOString(),
    timeoutSeconds: 900,
    timedOut,
    ...completion,
    outputDirectory,
    stdoutPath,
    stderrPath,
  };
  results.push(result);
  writeFileSync(
    path.join(evidenceRoot, `commands-${runId}.json`),
    JSON.stringify(results, null, 2) + "\n",
  );
  console.log(JSON.stringify(result));
}
