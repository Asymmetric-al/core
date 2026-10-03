import { execFileSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";

import { describe, expect, it, vi } from "vitest";

import { publishSummary } from "../../../scripts/verify/shadscan-publish.mjs";

function summary() {
  return {
    engineVersion: "0.17.0",
    rulesetVersion: "2026.08.46",
    score: 80,
    coverage: { source: "complete" },
    applications: [
      { packageDir: "apps/admin", score: 80, floor: 35 },
      { packageDir: "apps/donor", score: 80, floor: 41 },
      { packageDir: "apps/missionary", score: 80, floor: 47 },
    ],
    libraries: [],
    findings: [],
    errors: [],
    passed: true,
  };
}

function context() {
  return {
    eventName: "pull_request",
    repository: "Asymmetric-al/core",
    ref: "refs/pull/1931/merge",
    runUrl: "https://github.com/Asymmetric-al/core/actions/runs/123",
    event: {
      repository: { full_name: "Asymmetric-al/core" },
      pull_request: {
        number: 1931,
        head: { repo: { full_name: "Asymmetric-al/core" } },
      },
    },
  };
}

describe("Shadscan artifact reporting", () => {
  it("starts the real publisher with only its two source files and no node_modules", () => {
    const root = mkdtempSync(path.join(os.tmpdir(), "core-shadscan-reporter-"));
    try {
      const sourceRoot = path.resolve("scripts/verify");
      for (const file of ["shadscan-publish.mjs", "shadscan-summary.mjs"])
        writeFileSync(
          path.join(root, file),
          readFileSync(path.join(sourceRoot, file)),
        );
      const reportRoot = path.join(root, "report");
      mkdirSync(reportRoot);
      writeFileSync(
        path.join(reportRoot, "shadscan.summary.json"),
        JSON.stringify(summary()),
      );
      const trigger = context();
      trigger.event.pull_request.head.repo.full_name = "contributor/core";
      const eventPath = path.join(root, "event.json");
      writeFileSync(eventPath, JSON.stringify(trigger.event));
      const output = execFileSync(
        process.execPath,
        [path.join(root, "shadscan-publish.mjs"), reportRoot],
        {
          cwd: root,
          encoding: "utf8",
          env: {
            GITHUB_EVENT_PATH: eventPath,
            GITHUB_EVENT_NAME: "pull_request",
            GITHUB_REPOSITORY: "Asymmetric-al/core",
            GITHUB_REF: "refs/pull/1931/merge",
            GITHUB_SERVER_URL: "https://github.com",
            GITHUB_RUN_ID: "123",
          },
        },
      );
      expect(output).toContain(
        "Fork pull requests retain read-only artifact reporting",
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
  it("does not publish a passing score from incomplete or contradictory evidence", async () => {
    const report = summary();
    report.errors.push("Source coverage is incomplete");
    const request = vi.fn(async () => []);
    await expect(publishSummary(report, context(), request)).rejects.toThrow(
      /passing/,
    );
    expect(request).not.toHaveBeenCalled();
  });

  it.each(["unclassified", "confirmed-defect"])(
    "refuses a passing summary with %s findings",
    async (classification) => {
      const report = { ...summary(), findings: [{ classification }] };
      const request = vi.fn(async () => []);
      await expect(publishSummary(report, context(), request)).rejects.toThrow(
        /passing/,
      );
      expect(request).not.toHaveBeenCalled();
    },
  );

  it.each([
    { score: 101, floor: 35 },
    { score: 80, floor: -1 },
    { score: 80, floor: 101 },
  ])("refuses out-of-bounds app scores or floors", async (invalid) => {
    const report = summary();
    report.applications[0] = { ...report.applications[0]!, ...invalid };
    const request = vi.fn(async () => []);
    await expect(publishSummary(report, context(), request)).rejects.toThrow(
      /passing/,
    );
    expect(request).not.toHaveBeenCalled();
  });

  it("keeps fork PR reporting read-only", async () => {
    const trigger = context();
    trigger.event.pull_request.head.repo.full_name = "contributor/core";
    const request = vi.fn(async () => []);
    expect(await publishSummary(summary(), trigger, request)).toMatchObject({
      published: false,
    });
    expect(request).not.toHaveBeenCalled();
  });

  it("updates only a bot-owned audit comment and keeps failures visible", async () => {
    const report = summary();
    report.passed = false;
    report.errors.push("apps/admin unexpected unclassified finding");
    const request = vi.fn(
      async (method: string, _pathname: string, _body?: unknown) =>
        method === "GET"
          ? [
              {
                id: 1,
                user: { type: "User" },
                body: "<!-- shadscan-report -->",
              },
              {
                id: 2,
                user: { type: "Bot" },
                body: "<!-- shadscan-report -->",
              },
            ]
          : {
              html_url:
                "https://github.com/Asymmetric-al/core/pull/1931#issuecomment-2",
            },
    );
    await publishSummary(report, context(), request);
    expect(request.mock.calls[1]?.[0]).toBe("PATCH");
    expect(request.mock.calls[1]?.[1]).toBe(
      "/repos/Asymmetric-al/core/issues/comments/2",
    );
    expect(request.mock.calls[1]?.[2]).toMatchObject({
      body: expect.stringContaining("Gate: **failed**"),
    });
  });

  it("does not retarget another repository or update issues on feature pushes", async () => {
    const trigger = context();
    trigger.event.repository.full_name = "another/core";
    const request = vi.fn(async () => []);
    await expect(publishSummary(summary(), trigger, request)).rejects.toThrow(
      /target/,
    );
    expect(request).not.toHaveBeenCalled();
    const feature = {
      ...context(),
      eventName: "push",
      ref: "refs/heads/feature/example",
    };
    expect(await publishSummary(summary(), feature, request)).toMatchObject({
      published: false,
    });
    expect(request).not.toHaveBeenCalled();
  });

  it("updates the existing bot tracking issue on develop and preserves unrelated issues", async () => {
    const request = vi.fn(
      async (method: string, _pathname: string, _body?: unknown) =>
        method === "GET"
          ? [
              {
                number: 1931,
                title: "AL-1931: Repair Shadscan",
                user: { type: "User" },
                body: "",
              },
              {
                number: 1800,
                title: "shadscan audit: 31/100",
                user: { type: "Bot" },
                body: "previous report",
              },
            ]
          : { html_url: "https://github.com/Asymmetric-al/core/issues/1800" },
    );
    await publishSummary(
      summary(),
      { ...context(), eventName: "push", ref: "refs/heads/develop" },
      request,
    );
    expect(request.mock.calls[1]?.[1]).toBe(
      "/repos/Asymmetric-al/core/issues/1800",
    );
    expect(request.mock.calls[1]?.[2]).toMatchObject({
      title: "AL-1800: Shadscan audit tracking",
    });
  });
});
