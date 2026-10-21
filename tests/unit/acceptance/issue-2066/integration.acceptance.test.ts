/**
 * Acceptance tests for GitHub issue #2066 — integration layer (injected detectors).
 * Spec (rev 2, Blake-approved): {@link https://github.com/Asymmetric-al/core/issues/2066#issuecomment-6306182304}
 *
 * Covers done criteria DC1 (one stop_the_line case per DB-/storage-backed plan
 * surface, enumerated from PHASE_18_DESTRUCTIVE_CUTOVER_PLAN) and DC2 (fixture
 * state digest identical before and after each run).
 *
 * Owned by Acceptance. Implementers must not edit this file to satisfy their PR.
 */

import { describe, expect, it } from "vitest";

import {
  PHASE_18_DESTRUCTIVE_CUTOVER_PLAN,
  assessDocumentCutoverEnvironment,
  sha256HexOfText,
} from "../../../../packages/api/src/document-cutover";
import {
  DocumentEnvironmentFixture,
  buildAssessmentInput,
} from "../../packages/api/document-cutover-test-fixture";

import type {
  DestructiveCutoverPlanSurface,
  DocumentCutoverSurfaceKind,
} from "../../../../packages/api/src/document-cutover";

/**
 * Surface kinds whose detectors read the database or object store (the
 * Supabase table/storage/external-URL/job censuses). Routes, configuration and
 * prototype tests are repo-file inventories and are out of DC1's scope.
 */
const DB_OR_STORAGE_BACKED_KINDS: ReadonlySet<DocumentCutoverSurfaceKind> =
  new Set([
    "database_table",
    "storage_location",
    "external_reference",
    "background_job",
  ]);

/** Enumerated from the plan, not hard-coded (DC1). */
const BACKED_SURFACES: DestructiveCutoverPlanSurface[] =
  PHASE_18_DESTRUCTIVE_CUTOVER_PLAN.surfaces.filter((surface) =>
    DB_OR_STORAGE_BACKED_KINDS.has(surface.surfaceKind),
  );

/** Seed exactly one surface into a fresh fixture. */
function seedOnly(
  fixture: DocumentEnvironmentFixture,
  surface: DestructiveCutoverPlanSurface,
): void {
  switch (surface.surfaceKind) {
    case "database_table":
      fixture.seedRow(surface.surfaceId, {
        id: "acceptance-row-1",
        tenant_id: "acceptance-tenant-1",
      });
      return;
    case "storage_location":
      fixture.seedStorageObject("acceptance-bucket/acceptance-object.bin");
      return;
    case "external_reference":
      fixture.seedExternalUrl("https://files.example.test/acceptance/object");
      return;
    case "background_job":
      fixture.activeJobs = 1;
      return;
    default:
      throw new Error(`No seeding rule for ${surface.surfaceKind}`);
  }
}

describe("issue #2066 — integration layer: seeding one surface alone stops the line", () => {
  it("DC1 precondition: the plan exposes DB- and storage-backed surfaces of every backed kind", () => {
    expect(BACKED_SURFACES.length).toBeGreaterThan(0);
    expect(new Set(BACKED_SURFACES.map((s) => s.surfaceKind))).toEqual(
      DB_OR_STORAGE_BACKED_KINDS,
    );
  });

  it("baseline: an unseeded fresh fixture is clean (so each seeded case isolates one surface)", async () => {
    const assessment = await assessDocumentCutoverEnvironment(
      buildAssessmentInput(new DocumentEnvironmentFixture()),
    );
    expect(assessment.proposedOutcome).toBe("clean_preproduction_proof");
    expect(assessment.blockingReasons).toEqual([]);
  });

  describe.each(
    BACKED_SURFACES.map((surface) => ({
      key: `${surface.surfaceKind}:${surface.surfaceId}`,
      surface,
    })),
  )("$key", ({ surface }) => {
    it("DC1: seeding only this surface yields stop_the_line with a blocking reason whose surfaceId names it", async () => {
      const fixture = new DocumentEnvironmentFixture();
      seedOnly(fixture, surface);

      const assessment = await assessDocumentCutoverEnvironment(
        buildAssessmentInput(fixture),
      );

      expect(assessment.proposedOutcome).toBe("stop_the_line");
      const naming = assessment.blockingReasons.filter(
        (reason) =>
          reason.surfaceId === surface.surfaceId &&
          reason.surfaceKind === surface.surfaceKind,
      );
      expect(naming.length).toBeGreaterThan(0);
      // Seeded alone: no other surface carries a blocking reason.
      const others = assessment.blockingReasons.filter(
        (reason) => reason.surfaceId !== surface.surfaceId,
      );
      expect(others).toEqual([]);
    });

    it("DC2: the fixture state digest is identical before and after the run, and no write was attempted", async () => {
      const fixture = new DocumentEnvironmentFixture();
      seedOnly(fixture, surface);
      const before = await sha256HexOfText(fixture.snapshot());

      await assessDocumentCutoverEnvironment(buildAssessmentInput(fixture));

      const after = await sha256HexOfText(fixture.snapshot());
      expect(after).toBe(before);
      expect(fixture.attemptedWrites).toEqual([]);
    });
  });
});
