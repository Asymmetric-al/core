// History & decisions, Checks & reviews and Performance read models. All of
// them are built on the server from the factory's state documents; the
// browser receives one page at a time.
import { afterEach, describe, expect, it, vi } from "vitest";

import { RUN } from "./fixtures/factory-fixture";
import { ENVIRONMENT, harness } from "./fixtures/harness";
import { dispatch } from "../src/server/api";

import type { FixtureState } from "./fixtures/factory-fixture";

const BASE = Date.parse("2026-11-10T12:00:00Z");
const SHA = (seed: string) => seed.repeat(40).slice(0, 40);
const PR_URL = "https://github.com/Asymmetric-al/core/pull/9103";

function edit(
  state: FixtureState,
  name: string,
  change: (value: Record<string, unknown>) => Record<string, unknown>,
) {
  state.set(name, change(state.value(name) ?? {}));
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("history and decisions", () => {
  it("merges selections, assignments, rounds, directions, proposals, dispositions and recommendations, newest first", async () => {
    const { factory } = harness({ base: BASE });
    const page = await factory.ledger({
      view: "history",
      offset: 0,
      limit: 100,
    });
    if (page.view !== "history") throw new Error("expected history");
    expect(new Set(page.events.map((event) => event.kind))).toEqual(
      new Set([
        "selection",
        "assignment",
        "round",
        "delivery",
        "blocked",
        "direction",
        "proposal",
        "disposition",
        "recommendation",
        "analysis",
      ]),
    );
    const times = page.events.map((event) => Date.parse(event.at));
    expect([...times].sort((left, right) => right - left)).toEqual(times);
    expect(page.total).toBe(page.events.length);

    const selection = page.events.find(
      (event) => event.kind === "selection" && event.issue === 102,
    );
    expect(selection).toMatchObject({
      title: "Samson selected #102",
      actor: "Samson (selector)",
      sources: ["roadmap:fixture", "issue #102"],
      run: RUN.select,
    });
    expect(selection?.detail).toContain(
      "Highest roadmap priority in the frontier",
    );
    expect(
      page.events.find(
        (event) => event.kind === "direction" && event.issue === 107,
      ),
    ).toMatchObject({ title: "Hold #107", actor: "conrad" });
    expect(
      page.events.find((event) => event.kind === "proposal"),
    ).toMatchObject({
      issue: 102,
      title: "Samson proposed: hold #102",
      outcome: "not applied",
    });
    expect(
      page.events.find(
        (event) =>
          event.kind === "disposition" && event.title.includes("thread-1"),
      ),
    ).toMatchObject({
      issue: 103,
      outcome: "fix-implementation",
      link: PR_URL,
    });
    expect(
      page.events.find((event) => event.kind === "recommendation"),
    ).toMatchObject({
      title: "Reviews repeatedly find missing labels",
      outcome: "open",
      detail:
        "Scope factory. The pack records attention items as open only; whether Samson accepted, routed or rejected the finding is not recorded.",
    });
    expect(
      page.events.find(
        (event) => event.kind === "delivery" && event.issue === 103,
      ),
    ).toMatchObject({ outcome: "PR_READY", link: PR_URL });
    // Outcomes say whether the delivery is verified by bound evidence.
    expect(
      page.events.find(
        (event) => event.kind === "delivery" && event.issue === 103,
      )?.detail,
    ).toContain("Verified: CLEAR reviews and PASS final acceptance");
    expect(
      page.events.find(
        (event) => event.kind === "delivery" && event.issue === 105,
      )?.detail,
    ).toContain("Not verified: No final acceptance is recorded");
  });

  it("searches, filters by kind and pages on the server", async () => {
    const { factory } = harness({ base: BASE });
    const search = await factory.ledger({
      view: "history",
      offset: 0,
      limit: 100,
      q: "ROADMAP",
    });
    if (search.view !== "history") throw new Error("expected history");
    expect(search.events.map((event) => event.kind)).toEqual([
      "selection",
      "selection",
    ]);
    const deliveries = await factory.ledger({
      view: "history",
      offset: 0,
      limit: 100,
      kind: "delivery",
    });
    if (deliveries.view !== "history") throw new Error("expected history");
    expect(deliveries.events.map((event) => event.issue).sort()).toEqual([
      103, 105,
    ]);
    const all = await factory.ledger({ view: "history", offset: 0, limit: 3 });
    const next = await factory.ledger({ view: "history", offset: 3, limit: 3 });
    if (all.view !== "history" || next.view !== "history")
      throw new Error("expected history");
    expect(all.events).toHaveLength(3);
    expect(all.total).toBeGreaterThan(6);
    expect(next.events[0].id).not.toBe(all.events[0].id);
    expect(all.counts.selection).toBe(2);
  });
});

describe("checks and reviews", () => {
  it("separates internal and external reviews, local and GitHub checks, current and superseded evidence", async () => {
    const { factory, state } = harness({ base: BASE });
    edit(state, "core/issues/103/feedback", (value) => ({
      ...value,
      dispositions: {
        ...(value.dispositions as Record<string, unknown>),
        "check-555": {
          action: "rerun-flake",
          reason: "Unrelated network timeout in the e2e job",
          head: SHA("6"),
          at: new Date(BASE - 30 * 60_000).toISOString(),
          run: RUN.published103,
        },
        "review-777": {
          action: "rebut",
          reason: "The bot misread the guard",
          head: SHA("0"),
          at: new Date(BASE - 60 * 60_000).toISOString(),
          run: RUN.published103,
        },
      },
    }));
    const page = await factory.ledger({
      view: "evidence",
      offset: 0,
      limit: 100,
      q: "#103",
      currency: "all",
    });
    if (page.view !== "evidence") throw new Error("expected evidence");
    const row = (source: string) =>
      page.rows.find((entry) => entry.source === source);
    expect(row("Micaiah")).toMatchObject({
      category: "internal-review",
      result: "CLEAR",
      candidate: SHA("6"),
      current: true,
    });
    expect(row("Luke")).toMatchObject({
      category: "internal-review",
      result: "CLEAR (findings cleared by assessment)",
      current: true,
    });
    expect(row("Ezra (final acceptance)")).toMatchObject({
      category: "acceptance",
      result: "PASS",
      detail: "2 of 2 criteria PASS",
      current: true,
    });
    expect(row("Hooked pre-push (ci:preflight)")).toMatchObject({
      category: "local-check",
      result: "publication recorded",
      current: true,
      link: PR_URL,
    });
    expect(row("GitHub check run 555")).toMatchObject({
      category: "github-check",
      result: "rerun-flake",
      current: true,
      link: "https://github.com/Asymmetric-al/core/runs/555",
    });
    expect(row("GitHub review 777")).toMatchObject({
      category: "external-review",
      result: "rebut",
      current: false,
      link: `${PR_URL}#pullrequestreview-777`,
    });
    expect(row("PR comment 2")).toMatchObject({
      category: "external-review",
      result: "decline-nit",
      link: `${PR_URL}#issuecomment-2`,
    });
    expect(row("Review thread thread-1")).toMatchObject({
      category: "external-review",
      result: "fix-implementation",
      link: PR_URL,
    });
  });

  it("marks reviews and final acceptance of an earlier candidate as superseded", async () => {
    const { factory, state } = harness({ base: BASE });
    edit(state, "core/issues/103", (value) => ({ ...value, head: SHA("9") }));
    const page = await factory.ledger({
      view: "evidence",
      offset: 0,
      limit: 100,
      q: "#103",
      currency: "superseded",
    });
    if (page.view !== "evidence") throw new Error("expected evidence");
    expect(page.rows.map((entry) => entry.source).sort()).toEqual(
      [
        "Ezra (final acceptance)",
        "Hooked pre-push (ci:preflight)",
        "Luke",
        "Micaiah",
      ].sort(),
    );
    expect(page.rows.every((entry) => entry.current === false)).toBe(true);
  });

  it("explains repairs and failures with the role they return to", async () => {
    const { factory } = harness({ base: BASE });
    const repairs = await factory.ledger({
      view: "evidence",
      offset: 0,
      limit: 100,
      category: "repair",
      currency: "all",
    });
    if (repairs.view !== "evidence") throw new Error("expected evidence");
    expect(
      repairs.rows.find(
        (entry) => entry.issue === 101 && entry.current === true,
      ),
    ).toMatchObject({
      source: "Bezalel (implementation repair)",
      result: "1 item",
      detail: "[M1] Widget label is not announced",
    });
    expect(
      repairs.rows.find(
        (entry) =>
          entry.issue === 101 &&
          entry.run === RUN.history101 &&
          entry.result === "returned",
      ),
    ).toMatchObject({
      source: "Round 1 returned to Bezalel (repair)",
      detail: "after-assess: 1 repair item(s) for Bezalel",
    });
    const failures = await factory.ledger({
      view: "evidence",
      offset: 0,
      limit: 100,
      category: "failure",
      currency: "current",
    });
    if (failures.view !== "evidence") throw new Error("expected evidence");
    expect(failures.rows).toEqual([
      expect.objectContaining({
        issue: 104,
        result: "BLOCKED",
        detail:
          "after-scope: scope-blocked\nRecovery: Clarify the request on GitHub, then retry",
        current: true,
      }),
    ]);
    expect(failures.counts.failure).toEqual({ current: 1, superseded: 0 });
  });

  it("records re-binding, fix state, reconciled rounds and merges outside the factory", async () => {
    const { factory, state } = harness({ base: BASE });
    const at = new Date(BASE - 5 * 60_000).toISOString();
    edit(state, "core/issues/104", (value) => ({
      ...value,
      requests: [
        {
          id: "cr-fixtureretry-0000000000000000-0000000000000000",
          action: "retry",
          by: "conrad",
          at,
          policy: { from: "c".repeat(64), to: "1".repeat(64) },
          profile: { from: "a".repeat(64), to: "2".repeat(64) },
        },
      ],
    }));
    edit(state, "core/issues/105", (value) => ({
      ...value,
      history: [
        {
          round: 1,
          run: RUN.blocked104,
          route: "initial",
          outcome: "reconciled",
          next: "initial",
          at,
          summary: "Run ended (cancelled) without recording its round",
        },
        {
          ...(value.history as Record<string, unknown>[])[0],
          external: true,
        },
      ],
    }));
    edit(state, "core/issues/103/feedback", (value) => ({
      ...value,
      dispositions: {
        ...(value.dispositions as Record<string, unknown>),
        "thread-1": {
          action: "fix-implementation",
          reason: "Reviewer found a missing label",
          head: SHA("6"),
          kind: "review-thread",
          status: "fixed",
          fixedIn: SHA("6"),
          resolvedAt: at,
          at,
          run: RUN.published103,
        },
      },
    }));
    const page = await factory.ledger({
      view: "history",
      offset: 0,
      limit: 100,
    });
    if (page.view !== "history") throw new Error("expected history");
    expect(
      page.events.find(
        (event) => event.kind === "direction" && event.issue === 104,
      ),
    ).toMatchObject({
      title: "Retry #104",
      detail: `Re-bound to the installed release: policy ${"c".repeat(12)} → ${"1".repeat(12)}; owner profile re-bound.`,
    });
    expect(
      page.events.find((event) => event.kind === "round" && event.issue === 105)
        ?.title,
    ).toBe("Round 1 (initial) of #105: reconciled, next initial");
    expect(
      page.events.find(
        (event) => event.kind === "delivery" && event.issue === 105,
      )?.detail,
    ).toContain("Merged outside the factory");
    expect(
      page.events.find(
        (event) =>
          event.kind === "disposition" && event.title.includes("thread-1"),
      ),
    ).toMatchObject({ outcome: "fix-implementation (fixed)" });
    const evidence = await factory.ledger({
      view: "evidence",
      offset: 0,
      limit: 100,
      q: "#103",
      currency: "all",
    });
    if (evidence.view !== "evidence") throw new Error("expected evidence");
    expect(
      evidence.rows.find((row) => row.source === "Review thread thread-1"),
    ).toMatchObject({
      result: "fix-implementation (fixed)",
      detail: `Reviewer found a missing label\nFixed in ${SHA("6").slice(0, 12)}`,
    });
  });
});

describe("performance", () => {
  function delivered(
    state: FixtureState,
    issue: number,
    hours: number,
    extra: Record<string, unknown> = {},
  ) {
    const source = state.value<Record<string, unknown>>("core/issues/103")!;
    const assignedAt = new Date(BASE - (hours + 1) * 3_600_000).toISOString();
    const at = new Date(BASE - 3_600_000).toISOString();
    state.set(`core/issues/${issue}`, {
      ...source,
      issue,
      assignment: {
        ...(source.assignment as Record<string, unknown>),
        assignedAt,
      },
      history: [
        {
          round: 1,
          run: RUN.published103,
          route: "initial",
          outcome: "PR_READY",
          next: null,
          at,
          summary: "PR ready",
        },
      ],
      ...extra,
    });
  }

  it("counts a delivery as verified only with matching evidence and explains the rest", async () => {
    const { factory } = harness({ base: BASE });
    const view = await factory.performance();
    expect(view.totals).toMatchObject({
      delivered: 2,
      verified: 1,
      unverified: 1,
    });
    expect(view.deliveries.find((entry) => entry.issue === 103)).toMatchObject({
      verified: true,
      reason: null,
      repairRounds: 0,
    });
    expect(view.deliveries.find((entry) => entry.issue === 105)).toMatchObject({
      verified: false,
      reason: "No final acceptance is recorded",
      mergedOutside: true,
    });
  });

  it("says there is not enough history below the minimum sample instead of estimating", async () => {
    const { factory } = harness({ base: BASE });
    const view = await factory.performance();
    expect(view.cycle.PR_READY).toEqual({
      n: 1,
      enough: false,
      median: null,
      low: null,
      high: null,
      latestAt: expect.any(String),
    });
    expect(view.minSample).toBe(5);
  });

  it("reports the median and middle-half range of comparable verified deliveries", async () => {
    const { factory, state } = harness({ base: BASE });
    [1, 2, 3, 4, 5, 6].forEach((hours, index) =>
      delivered(state, 201 + index, hours),
    );
    state.docs.delete("core/issues/103");
    const view = await factory.performance();
    expect(view.cycle.PR_READY).toMatchObject({
      n: 6,
      enough: true,
      median: 3.5 * 3_600_000,
      low: 2.25 * 3_600_000,
      high: 4.75 * 3_600_000,
    });
    expect(view.owners).toEqual([
      {
        owner: "conrad",
        verified: 6,
        delivered: 7,
        medianCycleMs: 3.5 * 3_600_000,
        reworked: 0,
      },
    ]);
    expect(Object.keys(view.owners[0]).sort()).toEqual(
      ["delivered", "medianCycleMs", "owner", "reworked", "verified"].sort(),
    );
  });

  it("reports wait time as unavailable until rounds record their start, then measures it", async () => {
    const { factory, state } = harness({ base: BASE });
    const before = await factory.performance();
    expect(before.wait).toMatchObject({
      n: 0,
      enough: false,
      unavailable:
        "Rounds do not record when they started, so time spent waiting cannot be measured across issues.",
    });
    edit(state, "core/issues/103", (value) => ({
      ...value,
      history: (value.history as Record<string, unknown>[]).map((entry) => ({
        ...entry,
        startedAt: new Date(
          Date.parse(String(entry.at)) - 10 * 60_000,
        ).toISOString(),
      })),
    }));
    const after = await factory.performance();
    const delivery = after.deliveries.find((entry) => entry.issue === 103);
    expect(delivery?.waitMs).toBe((delivery?.cycleMs ?? 0) - 3 * 10 * 60_000);
    expect(after.wait).toMatchObject({ n: 1, unavailable: null });
  });
});

describe("ledger routes", () => {
  it("serves paged history, evidence and performance and rejects bad parameters", async () => {
    const { factory } = harness({ base: BASE });
    const request = (path: string) =>
      new Request(`${ENVIRONMENT.CONSOLE_ORIGIN}/api/console/${path}`);
    const history = await dispatch(
      request("ledger?view=history&offset=0&limit=5&q=roadmap"),
      factory,
    );
    expect(history.status).toBe(200);
    expect(await history.json()).toMatchObject({ view: "history", total: 2 });
    const evidence = await dispatch(
      request("ledger?view=evidence&category=internal-review&currency=current"),
      factory,
    );
    expect(await evidence.json()).toMatchObject({ view: "evidence" });
    const performance = await dispatch(request("performance"), factory);
    expect(await performance.json()).toMatchObject({ minSample: 5 });
    for (const bad of [
      "ledger?view=secrets",
      "ledger?view=history&limit=500",
      "ledger?view=history&offset=-1",
      "ledger?view=evidence&category=unknown",
      `ledger?view=history&q=${"x".repeat(300)}`,
    ])
      expect((await dispatch(request(bad), factory)).status).toBe(400);
  });
});
