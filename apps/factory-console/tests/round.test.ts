import path from "node:path";
import { pathToFileURL } from "node:url";

import { describe, expect, it } from "vitest";

import { RUN } from "./fixtures/factory-fixture";
import { harness } from "./fixtures/harness";
import {
  deriveLanes,
  deriveSteps,
  focusLanes,
  plannedSteps,
} from "../src/lib/round";

async function lanes() {
  const snapshot = await harness().factory.snapshot();
  if (
    snapshot.factory.state !== "available" ||
    snapshot.engine.state !== "available"
  )
    throw new Error("expected available");
  return deriveLanes(
    snapshot.factory.data.issues,
    snapshot.engine.data.details,
    snapshot.engine.data.detailErrors,
  );
}

describe("live work map derivation", () => {
  it("shows a repair return to Bezalel with reused scope and the running build", async () => {
    const lane = (await lanes()).find((entry) => entry.issue.issue === 101);
    expect(lane?.runId).toBe(RUN.repair);
    expect(lane?.returnedFrom).toEqual({
      round: 1,
      to: "Bezalel (repair)",
      summary: "after-assess: 1 repair item(s) for Bezalel",
    });
    const steps = Object.fromEntries(
      (lane?.steps ?? []).map((step) => [step.id, step]),
    );
    expect(steps.claim.state).toBe("completed");
    expect(steps.scope).toMatchObject({
      state: "skipped",
      note: "Reuses the recorded brief",
    });
    expect(steps.define).toMatchObject({
      state: "skipped",
      note: "Acceptance unchanged",
    });
    expect(steps.build.state).toBe("running");
    expect(steps.build.roles[0]).toMatchObject({
      name: "Bezalel",
      timing: { model: "claude-opus-fixture" },
    });
    expect(steps.reviews.state).toBe("pending");
    expect(steps.feedback.state).toBe("not-planned");
  });

  it("shows the two independent reviews in parallel and adjudication as conditional", async () => {
    const lane = (await lanes()).find((entry) => entry.issue.issue === 102);
    const reviews = lane?.steps.find((step) => step.id === "reviews");
    expect(reviews).toMatchObject({ parallel: true, state: "running" });
    expect(reviews?.roles.map((role) => `${role.name}:${role.state}`)).toEqual([
      "Micaiah:running",
      "Luke:completed",
    ]);
    expect(lane?.steps.find((step) => step.id === "adjudicate")).toMatchObject({
      conditional: true,
      state: "pending",
    });
  });

  it("includes held and admitted-but-unstarted lineages without inventing node progress", async () => {
    const all = await lanes();
    expect(all.map((lane) => lane.issue.issue)).toEqual([101, 102, 107]);
    const held = all.find((lane) => lane.issue.issue === 107);
    expect(held).toMatchObject({
      runId: null,
      steps: [],
      waiting: "Held by an operator; the next claim refuses",
    });
    expect(
      deriveSteps("initial", null).every((step) => step.state === "unobserved"),
    ).toBe(true);
  });

  it("plans steps from the pack's claim stage table", () => {
    expect([...plannedSteps("feedback")]).toEqual([
      "claim",
      "feedback",
      "readiness",
      "record",
    ]);
    expect(plannedSteps("initial").has("define")).toBe(true);
    expect(plannedSteps("repair").has("define")).toBe(false);
  });

  it("plans exactly the stages the pack's own table runs for each route", async () => {
    const { roundStages } = (await import(
      pathToFileURL(
        path.resolve(
          import.meta.dirname,
          "../../../scripts/archon-factory/pack/deliver/scripts/claim-logic.mjs",
        ),
      ).href
    )) as {
      roundStages: (route: string) => Record<string, "yes" | "no">;
    };
    for (const route of [
      "initial",
      "repair",
      "oracle",
      "review",
      "feedback",
      "deliver",
    ]) {
      const stages = roundStages(route);
      const planned = plannedSteps(route);
      expect([route, planned.has("scope")]).toEqual([
        route,
        stages.do_scope === "yes",
      ]);
      expect([route, planned.has("define")]).toEqual([
        route,
        stages.do_define === "yes",
      ]);
      expect([route, planned.has("feedback")]).toEqual([
        route,
        stages.do_feedback === "yes",
      ]);
      // A review round opens the build gates but runs no Bezalel build.
      expect([route, planned.has("build")]).toEqual([
        route,
        stages.do_build === "yes" && route !== "review",
      ]);
    }
  });

  it("treats a define that ran on a repair route as planned (context changed)", () => {
    const steps = deriveSteps("repair", {
      run: {} as never,
      nodes: [
        { node_id: "after-scope", state: "completed" },
        { node_id: "define", state: "running" },
      ],
      timings: {},
      intervals: { attempts: [], waits: [], gaps: [], truncated: false },
      events: [],
      observedAt: new Date().toISOString(),
    });
    expect(steps.find((step) => step.id === "define")).toMatchObject({
      planned: true,
      state: "running",
    });
  });
});

describe("focused work map", () => {
  it("puts live rounds first and shows at most the limit until asked for every lane", () => {
    const lane = (issue: number, live: boolean) =>
      ({ issue: { issue }, runId: live ? `run-${issue}` : null }) as never;
    const lanes = [
      lane(1, false),
      lane(2, true),
      lane(3, false),
      lane(4, true),
    ];
    const focused = focusLanes(lanes, 3, false);
    expect(
      focused.shown.map(
        (entry: { issue: { issue: number } }) => entry.issue.issue,
      ),
    ).toEqual([2, 4, 1]);
    expect(focused.total).toBe(4);
    expect(focusLanes(lanes, 3, true).shown).toHaveLength(4);
  });
});
