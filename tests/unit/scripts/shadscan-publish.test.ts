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

import {
  publishSummary,
  publishUnavailable,
} from "../../../scripts/shadscan-publish.mjs";
import { summarizeReport } from "../../../scripts/shadscan-summary.mjs";

const HEAD = "0123456789abcdef0123456789abcdef01234567";

function finding(
  packageDir: string,
  id: string,
  category: string,
  status: "pass" | "fail",
) {
  return {
    id,
    category,
    packageDir,
    status,
    maxScore: 2,
    score: status === "pass" ? 2 : 0,
    impactsScore: true,
    evidence: [],
  };
}

// A raw report with category data for every expected application.
function report() {
  const apps = [
    "apps/admin",
    "apps/donor",
    "apps/factory-console",
    "apps/missionary",
  ];
  return {
    engineVersion: "0.17.0",
    rulesetVersion: "2026.08.46",
    schemaVersion: 9,
    score: 62,
    coverage: { source: "complete" },
    workspace: {
      truncated: 0,
      projects: [
        ...apps.map((packageDir, index) => ({
          packageDir,
          kind: "application",
          poolsIntoScore: true,
          score: 60 + index,
        })),
        {
          packageDir: "packages/ui",
          kind: "library",
          poolsIntoScore: false,
          score: 33,
        },
      ],
    },
    findings: apps.flatMap((packageDir) => [
      finding(packageDir, "dialog-has-title", "accessibility", "pass"),
      finding(packageDir, "icon-button-has-label", "accessibility", "fail"),
      finding(packageDir, "form-has-pending-state", "forms", "pass"),
      finding(packageDir, "theme-hotkey-present", "foundation", "fail"),
    ]),
  };
}

function summary() {
  return summarizeReport(report());
}

function context() {
  return {
    eventName: "pull_request",
    repository: "Asymmetric-al/core",
    ref: "refs/pull/1931/merge",
    headSha: HEAD,
    runUrl: "https://github.com/Asymmetric-al/core/actions/runs/123",
    event: {
      repository: { full_name: "Asymmetric-al/core" },
      pull_request: {
        number: 1931,
        head: { sha: HEAD, repo: { full_name: "Asymmetric-al/core" } },
      },
    },
  };
}

const existingComments = [
  { id: 1, user: { type: "User" }, body: "<!-- shadscan-report -->" },
  {
    id: 2,
    user: { type: "Bot" },
    body: "<!-- shadscan-report -->\n| Application | Overall |\n| apps/admin | 43 |",
  },
];

function commentRequest(comments: unknown[] = existingComments) {
  return vi.fn(async (method: string, _pathname: string, _body?: unknown) =>
    method === "GET"
      ? comments
      : {
          html_url:
            "https://github.com/Asymmetric-al/core/pull/1931#issuecomment-2",
        },
  );
}

function runRealPublisher(args: string[], withSummary: boolean) {
  const root = mkdtempSync(path.join(os.tmpdir(), "core-shadscan-reporter-"));
  try {
    for (const file of ["shadscan-publish.mjs", "shadscan-summary.mjs"])
      writeFileSync(
        path.join(root, file),
        readFileSync(path.resolve("scripts", file)),
      );
    const reportRoot = path.join(root, "report");
    mkdirSync(reportRoot);
    if (withSummary)
      writeFileSync(
        path.join(reportRoot, "shadscan.summary.json"),
        JSON.stringify(summary()),
      );
    const trigger = context();
    trigger.event.pull_request.head.repo.full_name = "contributor/core";
    const eventPath = path.join(root, "event.json");
    writeFileSync(eventPath, JSON.stringify(trigger.event));
    const stepSummary = path.join(root, "step-summary.md");
    const output = execFileSync(
      process.execPath,
      [
        path.join(root, "shadscan-publish.mjs"),
        ...args.map((arg) => (arg === "<report>" ? reportRoot : arg)),
      ],
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
          GITHUB_STEP_SUMMARY: stepSummary,
          SHADSCAN_HEAD_SHA: HEAD,
        },
      },
    );
    return { output, stepSummary: readFileSync(stepSummary, "utf8") };
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

describe("Shadscan advisory reporting", () => {
  it("starts the real publisher with only its two source files and no node_modules", () => {
    const { output, stepSummary } = runRealPublisher(["<report>"], true);
    expect(output).toContain("Fork pull requests keep job-summary-only");
    expect(stepSummary).toContain("| apps/admin | 60 |");
  });

  it("publishes unavailable evidence for the head commit when no summary file exists", () => {
    const { output, stepSummary } = runRealPublisher(
      ["--unavailable", "dependency installation failed"],
      false,
    );
    expect(output).toContain("Fork pull requests keep job-summary-only");
    expect(stepSummary).toContain("Audit evidence is unavailable");
    expect(stepSummary).toContain(HEAD);
    expect(stepSummary).toContain("dependency installation failed");
    expect(stepSummary).not.toMatch(/\| apps\/admin \|/);
  });

  it("publishes each application's overall score, category scores and failing rule IDs", async () => {
    const request = commentRequest([]);
    await publishSummary(summary(), context(), request);
    expect(request.mock.calls[1]?.[0]).toBe("POST");
    const body = (request.mock.calls[1]?.[2] as { body: string }).body;
    expect(body).toContain("<!-- shadscan-report -->");
    expect(body).toContain(HEAD);
    // Overall, then foundation, interaction, states, accessibility, forms,
    // production polish: unassessed categories read n/a, not zero.
    expect(body).toContain(
      "| apps/admin | 60 | 0 | n/a | n/a | 50 | 100 | n/a |",
    );
    expect(body).toContain("| apps/missionary | 63 |");
    expect(body).toContain("`icon-button-has-label`");
    expect(body).toContain("`theme-hotkey-present`");
    expect(body).not.toMatch(/floor|classification|gate/i);
  });

  it("updates only the bot-owned report comment in place", async () => {
    const request = commentRequest();
    await publishSummary(summary(), context(), request);
    expect(request).toHaveBeenCalledTimes(2);
    expect(request.mock.calls[1]?.[0]).toBe("PATCH");
    expect(request.mock.calls[1]?.[1]).toBe(
      "/repos/Asymmetric-al/core/issues/comments/2",
    );
  });

  it("replaces a comment that showed earlier scores with unavailable evidence naming the head", async () => {
    const request = commentRequest();
    await publishUnavailable(context(), request, "the audit did not finish");
    expect(request.mock.calls[1]?.[0]).toBe("PATCH");
    expect(request.mock.calls[1]?.[1]).toBe(
      "/repos/Asymmetric-al/core/issues/comments/2",
    );
    const body = (request.mock.calls[1]?.[2] as { body: string }).body;
    expect(body).toContain("<!-- shadscan-report -->");
    expect(body).toContain("Audit evidence is unavailable");
    expect(body).toContain(HEAD);
    expect(body).not.toContain("| apps/admin |");
  });

  it.each([
    [
      "a missing application",
      (value: ReturnType<typeof summary>) => {
        value.applications.splice(1, 1);
      },
    ],
    [
      "an out-of-bounds score",
      (value: ReturnType<typeof summary>) => {
        Object.assign(value.applications[0]!, { score: 101 });
      },
    ],
    [
      "an unavailable status",
      (value: ReturnType<typeof summary>) => {
        Object.assign(value, { status: "unavailable" });
      },
    ],
  ])("refuses to publish a summary with %s", async (_name, corrupt) => {
    const value = summary();
    corrupt(value);
    const request = commentRequest();
    await expect(publishSummary(value, context(), request)).rejects.toThrow(
      /summary/,
    );
    expect(request).not.toHaveBeenCalled();
  });

  it("keeps fork pull request reporting job-summary-only in both modes", async () => {
    const trigger = context();
    trigger.event.pull_request.head.repo.full_name = "contributor/core";
    const request = commentRequest();
    expect(await publishSummary(summary(), trigger, request)).toMatchObject({
      published: false,
    });
    expect(
      await publishUnavailable(
        trigger,
        request,
        "dependency installation failed",
      ),
    ).toMatchObject({ published: false });
    expect(request).not.toHaveBeenCalled();
  });

  it("does not retarget another repository or update issues on feature pushes", async () => {
    const trigger = context();
    trigger.event.repository.full_name = "another/core";
    const request = vi.fn(async () => []);
    await expect(publishSummary(summary(), trigger, request)).rejects.toThrow(
      /target/,
    );
    await expect(
      publishUnavailable(trigger, request, "the audit failed"),
    ).rejects.toThrow(/target/);
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
