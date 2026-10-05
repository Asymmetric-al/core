import { spawn, spawnSync } from "node:child_process";
import {
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { expect, it, vi } from "vitest";

it("retains incomplete progress after a hard kill and replaces the previous finalized verdict", async () => {
  const directory = mkdtempSync(
    path.join(tmpdir(), "core-playwright-progress-"),
  );
  const sentinel = path.join(directory, "test-results", "sentinel.txt");
  mkdirSync(path.dirname(sentinel), { recursive: true });
  writeFileSync(sentinel, "caller-owned-results");
  const report = path.join(directory, "report");
  const statusFile = path.join(report, "run-status.json");
  const marker = path.join(directory, "second-started");
  const configFile = path.join(directory, "playwright.config.ts");
  const playwright = path.resolve("node_modules/@playwright/test/index.mjs");
  const reporter = path.resolve("tests/e2e/run-progress-reporter.ts");
  writeFileSync(
    path.join(directory, "progress.spec.ts"),
    `
import { test } from ${JSON.stringify(playwright)};
import { writeFileSync } from "node:fs";
test("finishes", () => {});
if (process.env.REPORTER_FAIL === "1") {
  test("confidential failure title", () => { throw new Error("confidential failure detail"); });
}
if (process.env.REPORTER_INTERRUPT === "1") {
  test("never finishes", async () => {
    writeFileSync(${JSON.stringify(marker)}, "started");
    await new Promise(() => {});
  });
}
`,
  );
  writeFileSync(
    configFile,
    `export default {
testDir: ${JSON.stringify(directory)}, outputDir: ${JSON.stringify(path.join(directory, "artifacts"))}, workers: 1, retries: 0,
reporter: [
  ["list"],
  ["html", {outputFolder: ${JSON.stringify(report)}, open: "never"}],
  ["json", {outputFile: ${JSON.stringify(path.join(report, "results.json"))}}],
  [${JSON.stringify(reporter)}, {outputFile: ${JSON.stringify(statusFile)}}]
]};`,
  );
  const args = [
    path.resolve("node_modules/@playwright/test/cli.js"),
    "test",
    "-c",
    configFile,
  ];
  const environment: NodeJS.ProcessEnv = {
    ...process.env,
    CI: "1",
    REPORTER_INTERRUPT: "0",
  };
  delete environment.NO_COLOR;
  const completed = spawnSync(process.execPath, args, {
    cwd: directory,
    encoding: "utf8",
    env: environment,
    timeout: 15_000,
  });
  let child: ReturnType<typeof spawn> | undefined;
  try {
    expect(completed.status, completed.stderr).toBe(0);
    expect(existsSync(sentinel)).toBe(true);
    expect(readFileSync(sentinel, "utf8")).toBe("caller-owned-results");
    const finalized = JSON.parse(readFileSync(statusFile, "utf8"));
    expect(finalized).toMatchObject({
      status: "passed",
      totalTests: 1,
      finishedAttempts: 1,
    });
    expect(finalized.finishedAt).toEqual(expect.any(String));
    expect(existsSync(path.join(report, "index.html"))).toBe(true);
    expect(
      JSON.parse(readFileSync(path.join(report, "results.json"), "utf8")).stats
        .expected,
    ).toBe(1);

    child = spawn(process.execPath, args, {
      cwd: directory,
      env: { ...environment, REPORTER_INTERRUPT: "1" },
      stdio: "ignore",
      detached: process.platform !== "win32",
    });
    const closed = new Promise<void>((resolve) =>
      child!.once("exit", () => resolve()),
    );
    await vi.waitFor(() => expect(existsSync(marker)).toBe(true), {
      timeout: 10_000,
      interval: 25,
    });
    if (process.platform === "win32") child.kill("SIGKILL");
    else process.kill(-child.pid!, "SIGKILL");
    await closed;
    expect(readFileSync(sentinel, "utf8")).toBe("caller-owned-results");
    const interrupted = JSON.parse(readFileSync(statusFile, "utf8"));
    expect(interrupted).toMatchObject({
      status: "running",
      totalTests: 2,
      finishedAttempts: 1,
      globalErrors: 0,
    });
    expect(interrupted.finishedAt).toBeUndefined();
    expect(interrupted.attempts).toEqual({
      passed: 1,
      failed: 0,
      timedOut: 0,
      skipped: 0,
      interrupted: 0,
    });
    expect(Object.keys(interrupted).sort()).toEqual([
      "attempts",
      "finishedAttempts",
      "globalErrors",
      "phase",
      "schemaVersion",
      "startedAt",
      "status",
      "totalTests",
    ]);

    const failed = spawnSync(process.execPath, args, {
      cwd: directory,
      encoding: "utf8",
      env: { ...environment, REPORTER_FAIL: "1" },
      timeout: 15_000,
    });
    expect(failed.status).toBe(1);
    expect(readFileSync(sentinel, "utf8")).toBe("caller-owned-results");
    const failureContent = readFileSync(statusFile, "utf8");
    expect(JSON.parse(failureContent)).toMatchObject({
      status: "failed",
      totalTests: 2,
      finishedAttempts: 2,
      attempts: { passed: 1, failed: 1 },
    });
    expect(failureContent).not.toContain("confidential");
    expect(
      JSON.parse(readFileSync(path.join(report, "results.json"), "utf8")).stats
        .unexpected,
    ).toBe(1);
  } finally {
    if (child && child.exitCode === null && child.signalCode === null) {
      if (process.platform === "win32") child.kill("SIGKILL");
      else process.kill(-child.pid!, "SIGKILL");
    }
    rmSync(directory, { recursive: true, force: true });
  }
}, 25_000);

it("survives HTML folder removal and a hard kill during report finalization without a false PASS", async () => {
  const directory = mkdtempSync(
    path.join(tmpdir(), "core-playwright-finalization-"),
  );
  const sentinel = path.join(directory, "test-results", "sentinel.txt");
  mkdirSync(path.dirname(sentinel), { recursive: true });
  writeFileSync(sentinel, "caller-owned-results");
  const report = path.join(directory, "report");
  const statusFile = path.join(directory, "report-run-status.json");
  const marker = path.join(directory, "report-finalization-started");
  const configFile = path.join(directory, "playwright.config.ts");
  const barrier = path.join(directory, "finalization-barrier.ts");
  writeFileSync(
    path.join(directory, "finalization.spec.ts"),
    "import {test} from " +
      JSON.stringify(path.resolve("node_modules/@playwright/test/index.mjs")) +
      "; test('finishes before reports',()=>{});",
  );
  // A public reporter extension pauses finalization after real HTML/JSON
  // generation, then removes the HTML-owned folder before the process is killed.
  writeFileSync(
    barrier,
    [
      'import {existsSync, rmSync, writeFileSync} from "node:fs";',
      "export default class FinalizationBarrier {",
      "  async onEnd() {",
      '    if(process.env.REPORTER_FINALIZATION_HANG !== "1") return;',
      "    const generated = {",
      "      html: existsSync(" +
        JSON.stringify(path.join(report, "index.html")) +
        "),",
      "      json: existsSync(" +
        JSON.stringify(path.join(report, "results.json")) +
        ")",
      "    };",
      "    rmSync(" +
        JSON.stringify(report) +
        ", {recursive:true, force:true});",
      "    writeFileSync(" +
        JSON.stringify(marker) +
        ", JSON.stringify(generated));",
      "    await new Promise(()=>setInterval(()=>{},1000));",
      "  }",
      "}",
    ].join("\n"),
  );
  writeFileSync(
    configFile,
    "export default " +
      JSON.stringify({
        testDir: directory,
        outputDir: path.join(directory, "artifacts"),
        workers: 1,
        retries: 0,
        reporter: [
          [
            path.resolve("tests/e2e/run-progress-reporter.ts"),
            { outputFile: statusFile },
          ],
          ["html", { outputFolder: report, open: "never" }],
          ["json", { outputFile: path.join(report, "results.json") }],
          [barrier],
        ],
      }) +
      ";",
  );
  const args = [
    path.resolve("node_modules/@playwright/test/cli.js"),
    "test",
    "-c",
    configFile,
  ];
  const environment = {
    ...process.env,
    CI: "1",
    REPORTER_FINALIZATION_HANG: "0",
  };
  let child: ReturnType<typeof spawn> | undefined;
  try {
    const completed = spawnSync(process.execPath, args, {
      cwd: directory,
      env: environment,
      encoding: "utf8",
      timeout: 15_000,
    });
    expect(completed.status, completed.stderr).toBe(0);
    expect(JSON.parse(readFileSync(statusFile, "utf8"))).toMatchObject({
      status: "passed",
      finishedAttempts: 1,
    });
    child = spawn(process.execPath, args, {
      cwd: directory,
      env: { ...environment, REPORTER_FINALIZATION_HANG: "1" },
      stdio: "ignore",
      detached: process.platform !== "win32",
    });
    const closed = new Promise<void>((resolve) =>
      child!.once("exit", () => resolve()),
    );
    await vi.waitFor(() => expect(existsSync(marker)).toBe(true), {
      timeout: 10_000,
      interval: 25,
    });
    expect(JSON.parse(readFileSync(marker, "utf8"))).toEqual({
      html: true,
      json: true,
    });
    expect(existsSync(report)).toBe(false);
    if (process.platform === "win32") child.kill("SIGKILL");
    else process.kill(-child.pid!, "SIGKILL");
    await closed;
    expect(readFileSync(sentinel, "utf8")).toBe("caller-owned-results");
    const unfinished = JSON.parse(readFileSync(statusFile, "utf8"));
    expect(unfinished).toMatchObject({
      status: "running",
      phase: "reporting",
      totalTests: 1,
      finishedAttempts: 1,
      globalErrors: 0,
      attempts: { passed: 1 },
    });
    expect(unfinished.finishedAt).toBeUndefined();
  } finally {
    if (child && child.exitCode === null && child.signalCode === null) {
      if (process.platform === "win32") child.kill("SIGKILL");
      else process.kill(-child.pid!, "SIGKILL");
    }
    rmSync(directory, { recursive: true, force: true });
  }
}, 25_000);
