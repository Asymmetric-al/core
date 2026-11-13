// Server side of durable timing: run details carry every node attempt rebuilt
// from all lifecycle events, and an issue's detail gathers each of its
// rounds from the engine so the sheet can show wall, running, waiting, check
// and per-role time without the browser inventing any timestamp.
import { describe, expect, it } from "vitest";

import { RUN } from "./fixtures/factory-fixture";
import { harness } from "./fixtures/harness";
import { issueTiming } from "../src/lib/timing";

describe("durable round traces", () => {
  it("carries rebuilt node attempts in every run detail", async () => {
    const { factory } = harness();
    const snapshot = await factory.snapshot();
    if (snapshot.engine.state !== "available")
      throw new Error("expected the engine to be available");
    const intervals = snapshot.engine.data.details[RUN.review].intervals;
    expect(intervals.attempts.map((attempt) => attempt.node)).toEqual([
      "claim",
      "context",
      "scope",
      "after-scope",
      "define",
      "after-define",
      "build",
      "freeze",
      "micaiah",
      "luke",
    ]);
    expect(
      intervals.attempts.find((attempt) => attempt.node === "micaiah"),
    ).toMatchObject({ end: null, outcome: "running" });
  });

  it("reads every round of an issue from the engine, oldest first", async () => {
    const base = Date.parse("2026-11-10T12:00:00Z");
    const { factory } = harness({ base });
    const detail = await factory.issue(101);
    expect(
      detail.rounds.map((round) => ({
        round: round.round,
        run: round.run,
        route: round.route,
        status: round.status,
        open: round.endedAt === null,
        error: round.error,
      })),
    ).toEqual([
      {
        round: 1,
        run: RUN.history101,
        route: "initial",
        status: "completed",
        open: false,
        error: null,
      },
      {
        round: 2,
        run: RUN.repair,
        route: "repair",
        status: "running",
        open: true,
        error: null,
      },
    ]);
    const timing = issueTiming({
      assignedAt: detail.item?.assignment.assignedAt ?? null,
      finishedAt: null,
      rounds: detail.rounds,
      now: base,
    });
    expect(timing.attempt).toMatchObject({
      round: 2,
      state: "running",
      detail: "Bezalel",
    });
    expect(timing.coverage).toEqual({ rounds: 2, observed: 2, missing: [] });
  });

  it("keeps a round the engine no longer has, with the reason and its recorded times", async () => {
    const { factory, state } = harness();
    const name = "core/issues/105";
    const value = state.value<Record<string, unknown>>(name) ?? {};
    state.set(name, {
      ...value,
      history: [
        {
          round: 1,
          run: "99999999-0000-4000-8000-000000000999",
          route: "initial",
          outcome: "continue",
          next: "feedback",
          at: "2026-11-09T10:00:00.000Z",
          startedAt: "2026-11-09T09:00:00.000Z",
          summary: "Published",
        },
        ...(value.history as unknown[]),
      ],
    });
    const detail = await factory.issue(105);
    expect(detail.rounds[0]).toEqual({
      round: 1,
      run: "99999999-0000-4000-8000-000000000999",
      route: "initial",
      startedAt: "2026-11-09T09:00:00.000Z",
      endedAt: "2026-11-09T10:00:00.000Z",
      status: null,
      intervals: null,
      error: "Archon refused the request (HTTP 404)",
    });
  });
});
