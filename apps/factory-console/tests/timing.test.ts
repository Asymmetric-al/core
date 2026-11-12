import { describe, expect, it } from "vitest";

import { duration, elapsed, scrub } from "../src/lib/contracts";
import {
  issueTiming,
  measure,
  runIntervals,
  union,
  type RoundTrace,
  type RunIntervals,
} from "../src/lib/timing";

describe("authoritative run wall intervals", () => {
  it("uses terminal lifecycle time instead of summing overlapping attempts", () => {
    expect(
      elapsed(
        "2026-11-10T00:00:00Z",
        "2026-11-10T00:02:00Z",
        Date.parse("2026-11-11T00:00:00Z"),
      ),
    ).toBe(120000);
    expect(duration(120000)).toBe("2m 0s");
    expect(duration(3_726_000)).toBe("1h 2m");
  });
  it("does not invent duration for corrupt or reversed timestamps", () => {
    expect(elapsed("invalid", null, 0)).toBeNull();
    expect(
      elapsed("2026-11-10T00:02:00Z", "2026-11-10T00:00:00Z", 0),
    ).toBeNull();
  });
  it("redacts common credentials and privileged paths", () => {
    expect(
      scrub(
        "password=fixture /home/admin/.claude/config C:\\Users\\owner\\file",
      ),
    ).not.toContain("fixture");
    expect(scrub("/home/admin/.claude/config")).toBe("[private path]");
  });
});

const T = (clock: string) => `2026-11-10T${clock}:00.000Z`;
const ms = (minutes: number) => minutes * 60_000;
const at = (clock: string) => Date.parse(T(clock));

function event(type: string, clock: string, step: string | null = null) {
  return { event_type: type, step_name: step, created_at: T(clock) };
}

function intervals(partial: Partial<RunIntervals> = {}): RunIntervals {
  return { attempts: [], waits: [], gaps: [], truncated: false, ...partial };
}

function round(partial: Partial<RoundTrace> & { run: string }): RoundTrace {
  return {
    round: 1,
    route: "initial",
    startedAt: null,
    endedAt: null,
    status: "completed",
    intervals: null,
    error: null,
    ...partial,
  };
}

describe("interval arithmetic", () => {
  it("merges overlapping spans so parallel work counts once", () => {
    expect(
      union([
        { start: 10, end: 20 },
        { start: 15, end: 30 },
        { start: 40, end: 50 },
      ]),
    ).toEqual([
      { start: 10, end: 30 },
      { start: 40, end: 50 },
    ]);
    expect(
      measure([
        { start: 10, end: 20 },
        { start: 12, end: 18 },
      ]),
    ).toBe(10);
  });
});

describe("run intervals from lifecycle events", () => {
  it("keeps every node attempt, including retries, and waits", () => {
    const result = runIntervals(
      [
        event("node_started", "10:00", "build"),
        event("node_failed", "10:05", "build"),
        event("node_started", "10:06", "build"),
        event("node_completed", "10:20", "build"),
        event("node_started", "10:21", "micaiah"),
        event("node_suspended", "10:25", "micaiah"),
        event("workflow_unpaused", "10:35"),
        event("node_started", "10:35", "micaiah"),
        event("node_completed", "10:50", "micaiah"),
        event("wait_started", "10:51"),
        event("wait_completed", "10:56"),
      ],
      { status: "completed", completedAt: T("11:00") },
    );
    expect(result.attempts).toEqual([
      { node: "build", start: T("10:00"), end: T("10:05"), outcome: "failed" },
      {
        node: "build",
        start: T("10:06"),
        end: T("10:20"),
        outcome: "completed",
      },
      {
        node: "micaiah",
        start: T("10:21"),
        end: T("10:25"),
        outcome: "suspended",
      },
      {
        node: "micaiah",
        start: T("10:35"),
        end: T("10:50"),
        outcome: "completed",
      },
    ]);
    expect(result.waits).toEqual([
      { kind: "suspended", start: T("10:25"), end: T("10:35") },
      { kind: "wait", start: T("10:51"), end: T("10:56") },
    ]);
    expect(result.gaps).toEqual([]);
  });

  it("marks the time before a stale-run resume as uncertain, but a failed run's wait as waiting", () => {
    const crash = runIntervals(
      [
        event("node_started", "10:00", "build"),
        event("tool_called", "10:04", "build"),
        event("workflow_resumed", "10:30"),
        event("node_started", "10:31", "build"),
        event("node_completed", "10:40", "build"),
      ],
      { status: "completed", completedAt: T("10:41") },
    );
    expect(crash.gaps).toEqual([
      {
        start: T("10:04"),
        end: T("10:30"),
        reason:
          "The engine resumed a run it had not recorded as stopped (for example after a restart); what ran in between is not known.",
      },
    ]);
    expect(crash.attempts[0]).toMatchObject({
      node: "build",
      end: T("10:04"),
      outcome: "interrupted",
    });
    const failed = runIntervals(
      [
        event("node_started", "10:00", "build"),
        event("node_failed", "10:05", "build"),
        event("workflow_failed", "10:05"),
        event("workflow_resumed", "10:20"),
        event("node_started", "10:20", "build"),
      ],
      { status: "running", completedAt: null },
    );
    expect(failed.gaps).toEqual([]);
    expect(failed.waits).toEqual([
      { kind: "failed", start: T("10:05"), end: T("10:20") },
    ]);
  });

  it("treats a paused run with no open wait as waiting since its last event", () => {
    const paused = runIntervals(
      [
        event("node_started", "10:00", "build"),
        event("node_completed", "10:10", "build"),
      ],
      { status: "paused", completedAt: null },
    );
    expect(paused.waits).toEqual([
      { kind: "paused", start: T("10:10"), end: null },
    ]);
  });
});

describe("issue timing", () => {
  const reviews = round({
    run: "r1",
    startedAt: T("09:50"),
    endedAt: T("10:40"),
    intervals: intervals({
      attempts: [
        {
          node: "micaiah",
          start: T("10:00"),
          end: T("10:30"),
          outcome: "completed",
        },
        {
          node: "luke",
          start: T("10:05"),
          end: T("10:20"),
          outcome: "completed",
        },
      ],
    }),
  });

  it("never adds parallel reviews or overlapping work to running time", () => {
    const timing = issueTiming({
      assignedAt: T("09:50"),
      finishedAt: T("10:40"),
      rounds: [reviews],
      now: at("12:00"),
    });
    expect(timing.wall.ms).toBe(ms(50));
    expect(timing.running).toEqual({ ms: ms(50), complete: true });
    const roles = Object.fromEntries(
      timing.roles.map((role) => [role.role, role.ms]),
    );
    expect(roles).toMatchObject({ Micaiah: ms(30), Luke: ms(15) });
    // Per-role totals overlap; their sum is not the issue's running time.
    expect(roles.Micaiah + roles.Luke).toBeGreaterThan(ms(40));
  });

  it("splits wall time into running, waits between rounds and waits inside a round", () => {
    const timing = issueTiming({
      assignedAt: T("09:00"),
      finishedAt: T("10:30"),
      rounds: [
        round({
          run: "r1",
          startedAt: T("09:10"),
          endedAt: T("09:40"),
          intervals: intervals({
            attempts: [
              {
                node: "cooldown",
                start: T("09:10"),
                end: T("09:15"),
                outcome: "completed",
              },
              {
                node: "build",
                start: T("09:15"),
                end: T("09:40"),
                outcome: "completed",
              },
            ],
          }),
        }),
        round({
          run: "r2",
          round: 2,
          route: "repair",
          startedAt: T("10:00"),
          endedAt: T("10:30"),
          intervals: intervals(),
        }),
      ],
      now: at("12:00"),
    });
    expect(timing.wall.ms).toBe(ms(90));
    expect(timing.running.ms).toBe(ms(55));
    expect(timing.waiting).toEqual({
      ms: ms(35),
      betweenRoundsMs: ms(30),
      inRoundMs: ms(5),
      reason: null,
    });
    expect(timing.uncertain.ms).toBe(0);
    expect(
      (timing.running.ms ?? 0) + (timing.waiting.ms ?? 0) + timing.uncertain.ms,
    ).toBe(timing.wall.ms);
  });

  it("keeps closed intervals fixed and extends only open ones, so refresh, sleep or reconnect cannot reset timing", () => {
    const live = round({
      run: "r2",
      round: 2,
      startedAt: T("10:00"),
      endedAt: null,
      status: "running",
      intervals: intervals({
        attempts: [
          { node: "build", start: T("10:05"), end: null, outcome: "running" },
        ],
      }),
    });
    const input = {
      assignedAt: T("09:00"),
      finishedAt: null,
      rounds: [reviews, live],
    };
    const first = issueTiming({ ...input, now: at("10:20") });
    const later = issueTiming({ ...input, now: at("11:20") });
    expect(later.wall.ms! - first.wall.ms!).toBe(ms(60));
    expect((later.attempt?.ms ?? 0) - (first.attempt?.ms ?? 0)).toBe(ms(60));
    expect(first.attempt?.ms).not.toBeNull();
    expect(first.attempt).toMatchObject({ round: 2, state: "running" });
    const closed = (timing: typeof first) =>
      timing.rounds.find((entry) => entry.run === "r1")?.ms;
    expect(closed(later)).toBe(closed(first));
    expect(closed(first)).toBe(ms(50));
    expect(issueTiming({ ...input, now: at("11:20") })).toEqual(later);
  });

  it("reports a crash gap as uncertain instead of running or waiting", () => {
    const timing = issueTiming({
      assignedAt: T("10:00"),
      finishedAt: T("11:00"),
      rounds: [
        round({
          run: "r1",
          startedAt: T("10:00"),
          endedAt: T("11:00"),
          intervals: intervals({
            gaps: [{ start: T("10:10"), end: T("10:40"), reason: "restart" }],
          }),
        }),
      ],
      now: at("12:00"),
    });
    expect(timing.uncertain.ms).toBe(ms(30));
    expect(timing.running.ms).toBe(ms(30));
    expect(timing.waiting.ms).toBe(0);
  });

  it("reports waiting as unavailable when a round's start is not recorded", () => {
    const timing = issueTiming({
      assignedAt: T("09:00"),
      finishedAt: T("11:00"),
      rounds: [
        round({ run: "old", round: 1, endedAt: T("09:30"), error: "gone" }),
        round({
          run: "r2",
          round: 2,
          startedAt: T("10:00"),
          endedAt: T("11:00"),
          intervals: intervals(),
        }),
      ],
      now: at("12:00"),
    });
    expect(timing.running).toEqual({ ms: ms(60), complete: false });
    expect(timing.waiting.ms).toBeNull();
    expect(timing.waiting.reason).toBe(
      "Round 1 has no recorded start, so waiting time cannot be measured.",
    );
    expect(timing.coverage).toEqual({ rounds: 2, observed: 1, missing: [1] });
  });

  it("counts local hooked checks and the wait for GitHub before feedback rounds separately", () => {
    const timing = issueTiming({
      assignedAt: T("09:50"),
      finishedAt: null,
      rounds: [
        round({
          run: "r1",
          startedAt: T("10:00"),
          endedAt: T("10:26"),
          intervals: intervals({
            attempts: [
              {
                node: "freeze",
                start: T("10:00"),
                end: T("10:03"),
                outcome: "completed",
              },
              {
                node: "publish",
                start: T("10:20"),
                end: T("10:25"),
                outcome: "completed",
              },
            ],
          }),
        }),
        round({
          run: "r2",
          round: 2,
          route: "feedback",
          startedAt: T("10:56"),
          endedAt: T("10:58"),
          intervals: intervals(),
        }),
      ],
      now: at("11:00"),
    });
    expect(timing.checks).toEqual({
      localMs: ms(8),
      githubWaitMs: ms(30),
      reason: null,
    });
  });

  it("states what the current attempt is doing: a role, a wait or nothing between steps", () => {
    const attempt = (attempts: RunIntervals["attempts"], waits = []) =>
      issueTiming({
        assignedAt: T("10:00"),
        finishedAt: null,
        rounds: [
          round({
            run: "r1",
            startedAt: T("10:00"),
            endedAt: null,
            status: "running",
            intervals: intervals({ attempts, waits }),
          }),
        ],
        now: at("10:30"),
      }).attempt;
    expect(
      attempt([
        { node: "cooldown", start: T("10:01"), end: null, outcome: "running" },
      ]),
    ).toMatchObject({ state: "waiting", detail: "cooldown" });
    expect(
      attempt([
        { node: "build", start: T("10:01"), end: null, outcome: "running" },
      ]),
    ).toMatchObject({ state: "running", detail: "Bezalel" });
    expect(
      attempt([
        {
          node: "build",
          start: T("10:01"),
          end: T("10:20"),
          outcome: "completed",
        },
      ]),
    ).toMatchObject({
      state: "between steps",
      // Inside a round, time that is not a known wait counts as running.
      runningMs: ms(30),
      waitingMs: 0,
      roles: [{ role: "Bezalel", ms: ms(19), attempts: 1 }],
    });
  });
});
