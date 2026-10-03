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

import { afterEach, beforeEach, expect, it, vi } from "vitest";

let directory: string;
let statusFile: string;
let marker: string;
let sentinel: string;
let args: string[];
let child: ReturnType<typeof spawn> | undefined;
const environment: NodeJS.ProcessEnv = {
  ...process.env,
  CI: "1",
  REPORTER_SETUP_MODE: "pass",
};
delete environment.NO_COLOR;

beforeEach(() => {
  directory = mkdtempSync(
    path.join(tmpdir(), "core-playwright-setup-progress-"),
  );
  sentinel = path.join(directory, "test-results", "sentinel.txt");
  mkdirSync(path.dirname(sentinel), { recursive: true });
  writeFileSync(sentinel, "caller-owned-results");
  const report = path.join(directory, "report");
  statusFile = path.join(report, "run-status.json");
  marker = path.join(directory, "setup-started");
  const configFile = path.join(directory, "playwright.config.ts");
  const setup = path.join(directory, "global-setup.ts");
  writeFileSync(
    setup,
    `import {writeFileSync} from "node:fs";
export default async function setup(){
  if(process.env.REPORTER_SETUP_MODE==="hang") {
    writeFileSync(${JSON.stringify(marker)}, "setup");
    await new Promise(()=>setInterval(()=>{},1000));
  }
  if(process.env.REPORTER_SETUP_MODE==="fail") throw new Error("confidential setup error");
}`,
  );
  writeFileSync(
    path.join(directory, "setup.spec.ts"),
    `import {test} from ${JSON.stringify(path.resolve("node_modules/@playwright/test/index.mjs"))};test("runs",()=>{});`,
  );
  writeFileSync(
    configFile,
    `export default {
  testDir:${JSON.stringify(directory)}, outputDir:${JSON.stringify(path.join(directory, "artifacts"))}, globalSetup:${JSON.stringify(setup)}, workers:1,retries:0,
  reporter:[
    ["list"],["html",{outputFolder:${JSON.stringify(report)},open:"never"}],
    ["json",{outputFile:${JSON.stringify(path.join(report, "results.json"))}}],
    [${JSON.stringify(path.resolve("tests/e2e/run-progress-reporter.ts"))},{outputFile:${JSON.stringify(statusFile)}}]
  ]};`,
  );
  args = [
    path.resolve("node_modules/@playwright/test/cli.js"),
    "test",
    "-c",
    configFile,
  ];
  const prior = spawnSync(process.execPath, args, {
    cwd: directory,
    env: environment,
    encoding: "utf8",
    timeout: 15_000,
  });
  expect(prior.status, prior.stderr).toBe(0);
  expect(existsSync(sentinel)).toBe(true);
  expect(readFileSync(sentinel, "utf8")).toBe("caller-owned-results");
  expect(JSON.parse(readFileSync(statusFile, "utf8")).status).toBe("passed");
});

afterEach(() => {
  if (child && child.exitCode === null && child.signalCode === null) {
    if (process.platform === "win32") child.kill("SIGKILL");
    else process.kill(-child.pid!, "SIGKILL");
  }
  child = undefined;
  if (directory) rmSync(directory, { recursive: true, force: true });
});

it("invalidates the previous PASS before a global setup hang can be hard-killed", async () => {
  child = spawn(process.execPath, args, {
    cwd: directory,
    env: { ...environment, REPORTER_SETUP_MODE: "hang" },
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
  const status = JSON.parse(readFileSync(statusFile, "utf8"));
  expect(status).toMatchObject({
    status: "running",
    phase: "setup",
    totalTests: null,
    finishedAttempts: 0,
    globalErrors: 0,
  });
  expect(status.finishedAt).toBeUndefined();
}, 15_000);

it("finalizes an early global setup error as failed with unknown inventory", () => {
  const failed = spawnSync(process.execPath, args, {
    cwd: directory,
    env: { ...environment, REPORTER_SETUP_MODE: "fail" },
    encoding: "utf8",
    timeout: 15_000,
  });
  expect(failed.status).toBe(1);
  expect(readFileSync(sentinel, "utf8")).toBe("caller-owned-results");
  expect(existsSync(statusFile)).toBe(true);
  const contents = readFileSync(statusFile, "utf8");
  expect(JSON.parse(contents)).toMatchObject({
    status: "failed",
    phase: "setup",
    totalTests: null,
    finishedAttempts: 0,
    globalErrors: 1,
  });
  expect(JSON.parse(contents).finishedAt).toEqual(expect.any(String));
  expect(contents).not.toContain("confidential");
}, 20_000);
