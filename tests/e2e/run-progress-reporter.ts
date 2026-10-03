import { mkdirSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";

import type {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
  TestCase,
  TestResult,
} from "@playwright/test/reporter";

/** Persist bounded diagnostics before reporters that only finalize at onEnd.
 * A hard-killed invocation retains status=running, never a preceding run's pass.
 * Titles, errors, requests, environment values, and credentials are omitted.
 */
export default class RunProgressReporter implements Reporter {
  private readonly outputFile: string;
  private pendingResult?: FullResult;
  private state: {
    schemaVersion: 1;
    status: "running" | FullResult["status"];
    phase: "setup" | "tests" | "reporting";
    startedAt: string;
    finishedAt?: string;
    totalTests: number | null;
    finishedAttempts: number;
    globalErrors: number;
    attempts: Record<TestResult["status"], number>;
  };

  constructor(options: { outputFile: string }) {
    this.outputFile = path.resolve(options.outputFile);
    // The public reporter constructor precedes global setup. onBegin does not.
    // Never retain a previous invocation's verdict while setup is still running.
    this.state = {
      schemaVersion: 1,
      status: "running",
      phase: "setup",
      startedAt: new Date().toISOString(),
      totalTests: null,
      finishedAttempts: 0,
      globalErrors: 0,
      attempts: {
        passed: 0,
        failed: 0,
        timedOut: 0,
        skipped: 0,
        interrupted: 0,
      },
    };
    this.flush();
  }

  onBegin(_config: FullConfig, suite: Suite) {
    const totalTests = suite.allTests().length;
    // Early setup/collection failures can emit onBegin with an empty suite.
    // Zero here does not prove that the intended inventory was collected.
    if (totalTests > 0) {
      this.state.phase = "tests";
      this.state.totalTests = totalTests;
    }
    this.flush();
  }

  printsToStdio() {
    return false;
  }

  onTestEnd(_test: TestCase, result: TestResult) {
    this.state.finishedAttempts += 1;
    this.state.attempts[result.status] += 1;
    this.flush();
  }

  onError() {
    this.state.globalErrors += 1;
    this.flush();
  }

  onEnd(result: FullResult) {
    // Configure this reporter first so finalization is recorded before HTML
    // clears its own directory. Keep the run incomplete until onExit.
    this.pendingResult = result;
    // Preserve an early setup/collection failure's unknown inventory.
    if (this.state.totalTests !== null) this.state.phase = "reporting";
    this.flush();
  }

  async onExit() {
    if (!this.pendingResult) return;
    // Playwright completes every reporter's onEnd before invoking onExit.
    this.state.status = this.pendingResult.status;
    this.state.finishedAt = new Date().toISOString();
    this.flush();
  }

  private flush() {
    mkdirSync(path.dirname(this.outputFile), { recursive: true });
    const temporaryFile = `${this.outputFile}.${process.pid}.tmp`;
    writeFileSync(temporaryFile, `${JSON.stringify(this.state, null, 2)}\n`);
    renameSync(temporaryFile, this.outputFile);
  }
}
