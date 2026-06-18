import { describe, expect, it } from "vitest";

import {
  AUTOMATION_LABELS,
  buildSignalDecision,
  requiredChecksForBase,
} from "../../../scripts/github/pr-signal-coordinator.mjs";

const BASE_NOW = "2026-06-11T17:00:00.000Z";
const RECENT_SIGNAL_START = "2026-06-11T16:55:00.000Z";
const STALE_SIGNAL_START = "2026-06-11T16:00:00.000Z";

function checkRun(name: string, conclusion = "success") {
  return {
    name,
    status: "completed",
    conclusion,
    app: { name: "GitHub Actions" },
  };
}

function baseContext(overrides = {}) {
  return {
    pr: {
      number: 304,
      baseRef: "develop",
      labels: [],
      signalStartedAt: RECENT_SIGNAL_START,
    },
    checkRuns: [],
    reviews: [],
    reviewComments: [],
    issueComments: [],
    now: BASE_NOW,
    graceMinutes: 20,
    eventName: "pull_request",
    eventAction: "labeled",
    ...overrides,
  };
}

describe("PR signal coordinator", () => {
  it("resets stale automation labels when a PR receives a new push", () => {
    const decision = buildSignalDecision(
      baseContext({
        eventName: "pull_request",
        eventAction: "synchronize",
        pr: {
          number: 304,
          baseRef: "develop",
          labels: [
            AUTOMATION_LABELS.ciSettled,
            AUTOMATION_LABELS.prIntakeReady,
          ],
          signalStartedAt: BASE_NOW,
        },
      }),
    );

    expect(decision.labelsToAdd).toContain(AUTOMATION_LABELS.signalsPending);
    expect(decision.labelsToRemove).toEqual(
      expect.arrayContaining([
        AUTOMATION_LABELS.ciSettled,
        AUTOMATION_LABELS.prIntakeReady,
      ]),
    );
    expect(decision.readyForIntake).toBe(false);
  });

  it("requires only ci-gate and integration-gate for develop PRs", () => {
    expect(requiredChecksForBase("develop")).toEqual([
      "ci-gate",
      "integration-gate",
    ]);
  });

  it("requires release and e2e gates for production PRs", () => {
    expect(requiredChecksForBase("production")).toEqual([
      "release-source-gate",
      "ci-gate",
      "integration-gate",
      "e2e-gate",
    ]);
  });

  it("settles CI and marks failed required checks", () => {
    const decision = buildSignalDecision(
      baseContext({
        checkRuns: [
          checkRun("ci-gate", "success"),
          checkRun("integration-gate", "failure"),
        ],
      }),
    );

    expect(decision.labelsToAdd).toEqual(
      expect.arrayContaining([
        AUTOMATION_LABELS.ciSettled,
        AUTOMATION_LABELS.ciFailed,
      ]),
    );
    expect(decision.readyForIntake).toBe(false);
  });

  it("marks Greptile findings from inline review comments", () => {
    const decision = buildSignalDecision(
      baseContext({
        reviewComments: [
          {
            user: { login: "greptile-apps[bot]" },
            body: "P1: existence check is allocation-type-agnostic",
          },
        ],
      }),
    );

    expect(decision.labelsToAdd).toEqual(
      expect.arrayContaining([
        AUTOMATION_LABELS.greptileSettled,
        AUTOMATION_LABELS.reviewFindings,
      ]),
    );
  });

  it("does not treat an intake snapshot mentioning pending bots as settled bot evidence", () => {
    const decision = buildSignalDecision(
      baseContext({
        issueComments: [
          {
            user: { login: "cursor[bot]" },
            body: [
              "<!-- core-pr-intake-coordinator -->",
              "Greptile: pending / no comments found by intake",
              "Cursor Bugbot: pending / no comments found by intake",
            ].join("\n"),
          },
        ],
      }),
    );

    expect(decision.labelsToAdd).not.toContain(
      AUTOMATION_LABELS.greptileSettled,
    );
    expect(decision.labelsToAdd).not.toContain(AUTOMATION_LABELS.bugbotSettled);
    expect(decision.readyForIntake).toBe(false);
  });

  it("does not settle Bugbot from human comments mentioning bugbot", () => {
    const decision = buildSignalDecision(
      baseContext({
        issueComments: [
          {
            user: { login: "human-reviewer" },
            body: "Waiting for bugbot before we decide whether this issue is real.",
          },
        ],
      }),
    );

    expect(decision.labelsToAdd).not.toContain(AUTOMATION_LABELS.bugbotSettled);
    expect(decision.labelsToAdd).not.toContain(
      AUTOMATION_LABELS.reviewFindings,
    );
    expect(decision.readyForIntake).toBe(false);
  });

  it("does not settle Cursor Security from human comments mentioning security review", () => {
    const decision = buildSignalDecision(
      baseContext({
        issueComments: [
          {
            user: { login: "human-reviewer" },
            body: "I finished my security review and found no issues.",
          },
        ],
      }),
    );

    expect(decision.labelsToAdd).not.toContain(
      AUTOMATION_LABELS.securitySettled,
    );
    expect(decision.labelsToAdd).not.toContain(
      AUTOMATION_LABELS.securityFailed,
    );
    expect(decision.readyForIntake).toBe(false);
  });

  it("ignores stale bot comments created before the current head signal window", () => {
    const decision = buildSignalDecision(
      baseContext({
        pr: {
          number: 304,
          baseRef: "develop",
          labels: [],
          signalStartedAt: RECENT_SIGNAL_START,
        },
        issueComments: [
          {
            user: { login: "cursor[bot]" },
            created_at: "2026-06-11T16:30:00.000Z",
            body: "Cursor Bugbot found a P1 issue before the latest push.",
          },
        ],
        reviewComments: [
          {
            user: { login: "greptile-apps[bot]" },
            created_at: "2026-06-11T16:30:00.000Z",
            body: "P1: finding from the previous head.",
          },
        ],
      }),
    );

    expect(decision.labelsToAdd).not.toContain(
      AUTOMATION_LABELS.greptileSettled,
    );
    expect(decision.labelsToAdd).not.toContain(AUTOMATION_LABELS.bugbotSettled);
    expect(decision.labelsToAdd).not.toContain(
      AUTOMATION_LABELS.reviewFindings,
    );
  });

  it("treats Cursor Security neutral failed-to-start as security failed", () => {
    const decision = buildSignalDecision(
      baseContext({
        checkRuns: [
          {
            name: "Cursor Security Agent: Security Reviewer",
            status: "completed",
            conclusion: "neutral",
            output: {
              summary:
                "Security Review run failed to start: team hard limit needs at least $2 remaining.",
            },
          },
        ],
      }),
    );

    expect(decision.labelsToAdd).toEqual(
      expect.arrayContaining([
        AUTOMATION_LABELS.securitySettled,
        AUTOMATION_LABELS.securityFailed,
      ]),
    );
  });

  it("marks missing bot signals after the grace window as timed out", () => {
    const decision = buildSignalDecision(
      baseContext({
        pr: {
          number: 304,
          baseRef: "develop",
          labels: [],
          signalStartedAt: STALE_SIGNAL_START,
        },
        checkRuns: [
          checkRun("ci-gate", "success"),
          checkRun("integration-gate", "success"),
        ],
      }),
    );

    expect(decision.labelsToAdd).toEqual(
      expect.arrayContaining([
        AUTOMATION_LABELS.greptileSettled,
        AUTOMATION_LABELS.bugbotSettled,
        AUTOMATION_LABELS.securitySettled,
        AUTOMATION_LABELS.securityFailed,
        AUTOMATION_LABELS.signalTimeout,
      ]),
    );
  });

  it("applies the intake-ready label once every prerequisite signal is terminal", () => {
    const decision = buildSignalDecision(
      baseContext({
        checkRuns: [
          checkRun("ci-gate", "success"),
          checkRun("integration-gate", "success"),
          {
            name: "Greptile Review",
            status: "completed",
            conclusion: "success",
            app: { name: "Greptile Apps" },
          },
          {
            name: "Cursor Bugbot",
            status: "completed",
            conclusion: "success",
          },
          {
            name: "Cursor Security Agent: Security Reviewer",
            status: "completed",
            conclusion: "success",
          },
        ],
      }),
    );

    expect(decision.readyForIntake).toBe(true);
    expect(decision.labelsToAdd).toEqual(
      expect.arrayContaining([
        AUTOMATION_LABELS.ciSettled,
        AUTOMATION_LABELS.greptileSettled,
        AUTOMATION_LABELS.bugbotSettled,
        AUTOMATION_LABELS.securitySettled,
        AUTOMATION_LABELS.prIntakeReady,
      ]),
    );
    expect(decision.labelsToAdd).not.toContain(AUTOMATION_LABELS.ciFailed);
  });
});
