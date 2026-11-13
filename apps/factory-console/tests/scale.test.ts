// Scale and labeling: the TEST-ONLY synthetic ~2,000-issue fixture with long
// histories parses through the production read models, every snapshot of a
// fixture-backed Console carries its label, and snapshot summaries stay
// bounded however long an issue's history grows.
import { describe, expect, it } from "vitest";

import { RUN } from "./fixtures/factory-fixture";
import { harness } from "./fixtures/harness";
import { SCALE_LABEL, seedScale } from "./fixtures/scale-fixture";
import { factoryConfiguration } from "../src/server/factory-config";
import { LIST_OUTPUT_LIMIT } from "../src/server/state";

const BASE = Date.parse("2026-11-10T12:00:00Z");

describe("synthetic fixture label", () => {
  it("is off unless the test-only flag is set, and then labels every snapshot", async () => {
    expect(factoryConfiguration({}).fixtureLabel).toBeNull();
    expect(
      factoryConfiguration({ FACTORY_FIXTURE_LABEL: "x".repeat(400) })
        .fixtureLabel,
    ).toHaveLength(160);
    const plain = await harness({ base: BASE }).factory.snapshot();
    expect(plain.settings.fixture).toBeNull();
    const labeled = await harness({
      base: BASE,
      env: { FACTORY_FIXTURE_LABEL: SCALE_LABEL },
    }).factory.snapshot();
    expect(labeled.settings.fixture).toBe(SCALE_LABEL);
  });
});

describe("bounded snapshot summaries", () => {
  it("keeps only the latest rounds in the snapshot, links engine runs to issues from full histories, and the issue detail keeps every recorded round", async () => {
    const { factory, state } = harness({ base: BASE });
    const name = "core/issues/103";
    const value = state.value<Record<string, unknown>>(name) ?? {};
    const history = Array.from({ length: 40 }, (_, index) => ({
      round: index + 1,
      run:
        index === 0
          ? RUN.select
          : `0000${String(index).padStart(4, "0")}-0000-4000-8000-000000000103`,
      route: index % 2 ? "feedback" : "repair",
      outcome: index === 39 ? "PR_READY" : "continue",
      next: index === 39 ? null : "feedback",
      at: new Date(BASE - (40 - index) * 60_000).toISOString(),
      summary: `Round ${index + 1}: ${"long summary ".repeat(30)}`,
    }));
    state.set(name, { ...value, round: 40, history });
    const snapshot = await factory.snapshot();
    if (snapshot.factory.state !== "available")
      throw new Error("expected factory state");
    const summary = snapshot.factory.data.issues.find(
      (issue) => issue.issue === 103,
    );
    expect(summary?.history).toHaveLength(2);
    expect(summary?.history.at(-1)?.round).toBe(40);
    expect(summary?.history.at(-1)?.summary?.length).toBeLessThanOrEqual(201);
    expect(summary?.history[0].summary).toBeNull();
    // Round 1 ran as an engine run on the current page: the server links it.
    expect(snapshot.runIssues[RUN.select]).toEqual([103]);
    const detail = await factory.issue(103);
    expect(detail.item?.history).toHaveLength(40);
    expect(detail.item?.history[0].summary?.length).toBeGreaterThan(300);
  });
});

describe("synthetic scale fixture", () => {
  it("builds about 2,000 labeled issues with long histories that every read model accepts", async () => {
    const { factory, state } = harness({ base: BASE });
    state.docs.clear();
    for (const [name, value] of Object.entries(
      seedScale({ base: BASE, issues: 2000, history: 40 }),
    ))
      state.set(name, value);
    const snapshot = await factory.snapshot();
    if (snapshot.factory.state !== "available")
      throw new Error("expected factory state");
    expect(snapshot.factory.data.malformed).toEqual([]);
    expect(snapshot.factory.data.issues).toHaveLength(2000);
    expect(snapshot.factory.data.factory?.reason).toContain(SCALE_LABEL);
    expect(
      Math.max(...snapshot.factory.data.issues.map((issue) => issue.round)),
    ).toBe(40);
    // The whole snapshot stays small enough to poll every ten seconds.
    expect(JSON.stringify(snapshot).length).toBeLessThan(3_000_000);
    const history = await factory.ledger({
      view: "history",
      offset: 1000,
      limit: 25,
    });
    expect(history.total).toBeGreaterThan(2000 * 12);
    if (history.view !== "history") throw new Error("expected history");
    expect(history.events).toHaveLength(25);
    expect(history.malformed).toEqual([]);
    const performance = await factory.performance();
    expect(performance.totals.delivered).toBeGreaterThan(100);
    expect(performance.cycle.PR_READY.enough).toBe(true);
  }, 60_000);
});

describe("bounded state listing", () => {
  it("reads the whole scale fixture through one bounded CLI listing", () => {
    const documents = Object.entries(
      seedScale({ base: BASE, issues: 2000, history: 40 }),
    )
      .filter(([name]) => name.startsWith("core/issues/"))
      .map(([name, value]) => ({ name, revision: 1, value, lease: null }));
    const size = JSON.stringify({ documents }).length;
    expect(size).toBeGreaterThan(16_000_000);
    expect(size).toBeLessThan(LIST_OUTPUT_LIMIT);
    expect(LIST_OUTPUT_LIMIT).toBeLessThanOrEqual(64_000_000);
  });
});
