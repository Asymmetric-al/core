import { describe, expect, it } from "vitest";

import {
  DocumentEnvironmentFixture,
  buildFixtureDetectors,
} from "./document-cutover-test-fixture";
import {
  PHASE_18_DESTRUCTIVE_CUTOVER_PLAN,
  checkDetectorCompleteness,
  digestDestructiveCutoverPlan,
  validateDestructiveCutoverPlan,
} from "../../../../packages/api/src/document-cutover";

import type { DestructiveCutoverPlan } from "../../../../packages/api/src/document-cutover";

describe("the Phase 18 destructive cutover plan contract", () => {
  it("is valid, uniquely keyed, and versioned", () => {
    expect(
      validateDestructiveCutoverPlan(PHASE_18_DESTRUCTIVE_CUTOVER_PLAN),
    ).toEqual([]);
    expect(PHASE_18_DESTRUCTIVE_CUTOVER_PLAN.planId).toBe(
      "phase-18-prototype-document-cutover",
    );
    expect(PHASE_18_DESTRUCTIVE_CUTOVER_PLAN.planVersion).toBeTruthy();
  });

  it("digests deterministically and changes digest on any plan edit", async () => {
    const digest = await digestDestructiveCutoverPlan(
      PHASE_18_DESTRUCTIVE_CUTOVER_PLAN,
    );
    expect(digest).toBe(
      await digestDestructiveCutoverPlan(
        structuredClone(PHASE_18_DESTRUCTIVE_CUTOVER_PLAN),
      ),
    );

    const edited: DestructiveCutoverPlan = structuredClone(
      PHASE_18_DESTRUCTIVE_CUTOVER_PLAN,
    );
    edited.surfaces = edited.surfaces.slice(1);
    expect(await digestDestructiveCutoverPlan(edited)).not.toBe(digest);
  });

  it("rejects duplicate or unnamed plan surfaces", () => {
    const duplicated: DestructiveCutoverPlan = structuredClone(
      PHASE_18_DESTRUCTIVE_CUTOVER_PLAN,
    );
    duplicated.surfaces.push({ ...duplicated.surfaces[0] });
    expect(
      validateDestructiveCutoverPlan(duplicated).map((reason) => reason.code),
    ).toContain("plan_invalid");

    const empty: DestructiveCutoverPlan = {
      planId: "empty",
      planTitle: "empty",
      planVersion: "1",
      surfaces: [],
    };
    expect(
      validateDestructiveCutoverPlan(empty).map((reason) => reason.code),
    ).toContain("plan_invalid");
  });
});

describe("detector completeness contract", () => {
  it("passes when the fixture detector set covers the plan exactly", () => {
    const fixture = new DocumentEnvironmentFixture();
    expect(
      checkDetectorCompleteness(
        PHASE_18_DESTRUCTIVE_CUTOVER_PLAN,
        buildFixtureDetectors(fixture),
      ),
    ).toEqual([]);
  });

  it("fails when the plan adds a surface without a corresponding detector", () => {
    const fixture = new DocumentEnvironmentFixture();
    const extended: DestructiveCutoverPlan = structuredClone(
      PHASE_18_DESTRUCTIVE_CUTOVER_PLAN,
    );
    extended.surfaces.push({
      surfaceKind: "database_table",
      surfaceId: "newly_added_prototype_table",
      action: "drop_table",
      description: "Added without a detector.",
    });

    const reasons = checkDetectorCompleteness(
      extended,
      buildFixtureDetectors(fixture),
    );
    expect(reasons.map((reason) => reason.code)).toContain(
      "plan_surface_without_detector",
    );
    expect(
      reasons.some(
        (reason) => reason.surfaceId === "newly_added_prototype_table",
      ),
    ).toBe(true);
  });

  it("fails when a detector covers a surface the plan does not declare", () => {
    const fixture = new DocumentEnvironmentFixture();
    const detectors = buildFixtureDetectors(fixture);
    detectors.push({
      detectorId: "unsanctioned",
      detectorVersion: "1",
      surfaceKind: "database_table",
      surfaceIds: ["table_outside_the_plan"],
      inspectSurface: async () => ({
        completeness: "complete",
        detectorQuery: "select ...",
        relianceCounts: { rows: 0 },
      }),
    });

    expect(
      checkDetectorCompleteness(
        PHASE_18_DESTRUCTIVE_CUTOVER_PLAN,
        detectors,
      ).map((reason) => reason.code),
    ).toContain("detector_without_plan_surface");
  });
});
