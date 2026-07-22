import { describe, expect, it } from "vitest";

import {
  CLEAN_ENVIRONMENT,
  DocumentEnvironmentFixture,
  buildAssessmentInput,
  buildFixtureDetectors,
  fixtureProcedureReader,
} from "./document-cutover-test-fixture";
import {
  PHASE_18_DESTRUCTIVE_CUTOVER_PLAN,
  PHASE_18_PROTOTYPE_DOCUMENT_TABLES,
  assessDocumentCutoverEnvironment,
  digestCanonicalValue,
} from "../../../../packages/api/src/document-cutover";

import type { DocumentCutoverBlockingCode } from "../../../../packages/api/src/document-cutover";

function reasonCodes(
  blockingReasons: Array<{ code: DocumentCutoverBlockingCode }>,
): DocumentCutoverBlockingCode[] {
  return blockingReasons.map((reason) => reason.code);
}

describe("assessDocumentCutoverEnvironment", () => {
  it("records complete evidence for a fully known empty pre-production fixture", async () => {
    const fixture = new DocumentEnvironmentFixture();
    const assessment = await assessDocumentCutoverEnvironment(
      buildAssessmentInput(fixture),
    );

    expect(assessment.status).toBe("complete");
    expect(assessment.proposedOutcome).toBe("clean_preproduction_proof");
    expect(assessment.blockingReasons).toEqual([]);

    expect(assessment.environment).toEqual(CLEAN_ENVIRONMENT);
    expect(assessment.planDigest).toMatch(/^[0-9a-f]{64}$/);
    expect(assessment.toolVersion).toBeTruthy();
    expect(assessment.serializerVersion).toBeTruthy();
    expect(assessment.startedAt).toBeTruthy();
    expect(assessment.completedAt).toBeTruthy();
    expect(assessment.procedures.resetRebuild.present).toBe(true);
    expect(assessment.procedures.resetRebuild.digest).toMatch(/^[0-9a-f]{64}$/);
    expect(
      assessment.procedures.rollbackBeforeFirstCanonicalWrite.present,
    ).toBe(true);

    // Every plan surface produced evidence with its detector identity.
    expect(assessment.evidence).toHaveLength(
      PHASE_18_DESTRUCTIVE_CUTOVER_PLAN.surfaces.length,
    );
    for (const evidence of assessment.evidence) {
      expect(evidence.detectorId).toBeTruthy();
      expect(evidence.detectorVersion).toBeTruthy();
      expect(evidence.detectorQuery).toBeTruthy();
      expect(evidence.completeness).toBe("complete");
      expect(evidence.evidenceDigest).toMatch(/^[0-9a-f]{64}$/);
    }
  });

  it("carries the exact prototype table inventory in the plan contract, not an inference from one table", () => {
    const tables = PHASE_18_DESTRUCTIVE_CUTOVER_PLAN.surfaces
      .filter((surface) => surface.surfaceKind === "database_table")
      .map((surface) => surface.surfaceId);

    expect(tables).toEqual([...PHASE_18_PROTOTYPE_DOCUMENT_TABLES]);
    expect(tables).toContain("pdf_templates");
    expect(tables).toContain("pdf_template_batch_jobs");
    expect(tables).toContain("contribution_receipt_snapshots");
    expect(tables).toContain("gift_receipt_records");

    for (const surfaceKind of [
      "storage_location",
      "route",
      "background_job",
      "configuration",
      "prototype_test",
      "external_reference",
    ]) {
      expect(
        PHASE_18_DESTRUCTIVE_CUTOVER_PLAN.surfaces.some(
          (surface) => surface.surfaceKind === surfaceKind,
        ),
      ).toBe(true);
    }
  });

  it("stops the line for every individually seeded prototype table and leaves the fixture unchanged", async () => {
    for (const table of PHASE_18_PROTOTYPE_DOCUMENT_TABLES) {
      const fixture = new DocumentEnvironmentFixture();
      fixture.seedRow(table, {
        id: "row-1",
        tenant_id: "00000000-0000-4000-8000-000000000001",
      });
      const before = fixture.snapshot();

      const assessment = await assessDocumentCutoverEnvironment(
        buildAssessmentInput(fixture),
      );

      expect(assessment.proposedOutcome).toBe("stop_the_line");
      expect(reasonCodes(assessment.blockingReasons)).toContain("rows_present");
      expect(reasonCodes(assessment.blockingReasons)).toContain(
        "tenant_data_present",
      );
      expect(
        assessment.blockingReasons.some((reason) => reason.surfaceId === table),
      ).toBe(true);

      expect(fixture.snapshot()).toBe(before);
      expect(fixture.attemptedWrites).toEqual([]);
    }
  });

  it("stops the line for storage objects, external URLs, and active jobs", async () => {
    const cases: Array<{
      seed: (fixture: DocumentEnvironmentFixture) => void;
      code: DocumentCutoverBlockingCode;
    }> = [
      {
        seed: (fixture) =>
          fixture.seedStorageObject("tenant-a/artifacts/receipt.pdf"),
        code: "storage_objects_present",
      },
      {
        seed: (fixture) =>
          fixture.seedExternalUrl(
            "https://provider.example.com/artifacts/abc123?token=secret",
          ),
        code: "external_reference_present",
      },
      {
        seed: (fixture) => {
          fixture.activeJobs = 2;
        },
        code: "active_job_present",
      },
    ];

    for (const { seed, code } of cases) {
      const fixture = new DocumentEnvironmentFixture();
      seed(fixture);
      const before = fixture.snapshot();

      const assessment = await assessDocumentCutoverEnvironment(
        buildAssessmentInput(fixture),
      );

      expect(assessment.proposedOutcome).toBe("stop_the_line");
      expect(reasonCodes(assessment.blockingReasons)).toContain(code);
      expect(fixture.snapshot()).toBe(before);
    }
  });

  it("stops the line for production or protected classification and never infers safety from labels", async () => {
    for (const productionClassification of [
      "production",
      "protected_non_production",
      "unknown",
    ] as const) {
      const fixture = new DocumentEnvironmentFixture();
      const assessment = await assessDocumentCutoverEnvironment(
        buildAssessmentInput(fixture, {
          resolveEnvironment: async () => ({
            ...CLEAN_ENVIRONMENT,
            productionClassification,
          }),
        }),
      );

      expect(assessment.proposedOutcome).toBe("stop_the_line");
      expect(reasonCodes(assessment.blockingReasons)).toContain(
        productionClassification === "unknown"
          ? "unknown_environment_classification"
          : "production_classification",
      );
    }
  });

  it("stops the line when the operator-declared target does not match the resolved environment", async () => {
    const fixture = new DocumentEnvironmentFixture();
    const assessment = await assessDocumentCutoverEnvironment(
      buildAssessmentInput(fixture, {
        expectedEnvironment: {
          databaseProjectId: "some-other-project",
        },
      }),
    );

    expect(assessment.proposedOutcome).toBe("stop_the_line");
    expect(reasonCodes(assessment.blockingReasons)).toContain(
      "environment_identity_mismatch",
    );
  });

  it("treats environment resolution failure as stop-the-line evidence", async () => {
    const fixture = new DocumentEnvironmentFixture();
    const assessment = await assessDocumentCutoverEnvironment(
      buildAssessmentInput(fixture, {
        resolveEnvironment: async () => {
          throw new Error("resolver unavailable");
        },
      }),
    );

    expect(assessment.status).toBe("incomplete");
    expect(assessment.environment).toBeNull();
    expect(assessment.proposedOutcome).toBe("stop_the_line");
    expect(reasonCodes(assessment.blockingReasons)).toContain(
      "environment_resolution_failed",
    );
  });

  it("maps detector failures, permission errors, unknown schema, and timeouts to stop-the-line", async () => {
    const failureCases: Array<{
      override: () => Promise<never> | Promise<unknown>;
      expected: DocumentCutoverBlockingCode;
    }> = [
      {
        override: async () => {
          throw new Error("connection reset");
        },
        expected: "detector_error",
      },
      {
        override: async () => ({
          completeness: "indeterminate" as const,
          detectorQuery: "select ...",
          failure: {
            code: "permission_denied" as const,
            message: "permission denied for table pdf_templates",
          },
        }),
        expected: "permission_denied",
      },
      {
        override: async () => ({
          completeness: "indeterminate" as const,
          detectorQuery: "select ...",
          failure: {
            code: "unknown_schema" as const,
            message: "relation pdf_templates does not exist",
          },
        }),
        expected: "unknown_schema",
      },
      {
        override: () =>
          new Promise(() => {
            /* never resolves -> timeout */
          }),
        expected: "detector_timeout",
      },
    ];

    for (const { override, expected } of failureCases) {
      const fixture = new DocumentEnvironmentFixture();
      const assessment = await assessDocumentCutoverEnvironment(
        buildAssessmentInput(fixture, {
          detectors: buildFixtureDetectors(fixture, {
            database_table: override as never,
          }),
          detectorTimeoutMs: 50,
        }),
      );

      expect(assessment.status).toBe("incomplete");
      expect(assessment.proposedOutcome).toBe("stop_the_line");
      expect(reasonCodes(assessment.blockingReasons)).toContain(expected);
    }
  });

  it("stops the line when a procedure is missing or unpinned", async () => {
    const fixture = new DocumentEnvironmentFixture();

    const missing = await assessDocumentCutoverEnvironment(
      buildAssessmentInput(fixture, {
        readProcedure: fixtureProcedureReader({
          "docs/ops/document-cutover/reset-rebuild.md": null,
        }),
      }),
    );
    expect(missing.proposedOutcome).toBe("stop_the_line");
    expect(reasonCodes(missing.blockingReasons)).toContain("procedure_missing");
    expect(missing.procedures.resetRebuild.present).toBe(false);

    const unpinned = await assessDocumentCutoverEnvironment(
      buildAssessmentInput(fixture, {
        procedures: {
          resetRebuild: {
            reference: "docs/ops/document-cutover/reset-rebuild.md",
            pinnedVersion: "",
          },
          rollbackBeforeFirstCanonicalWrite: {
            reference:
              "docs/ops/document-cutover/rollback-before-first-canonical-write.md",
            pinnedVersion: "1",
          },
        },
      }),
    );
    expect(unpinned.proposedOutcome).toBe("stop_the_line");
    expect(reasonCodes(unpinned.blockingReasons)).toContain(
      "procedure_unpinned",
    );
  });

  it("fails detector completeness in both directions", async () => {
    const fixture = new DocumentEnvironmentFixture();
    const detectors = buildFixtureDetectors(fixture);

    // Drop the storage detector: a plan surface loses its detector.
    const withoutStorage = detectors.filter(
      (detector) => detector.surfaceKind !== "storage_location",
    );
    const missingDetector = await assessDocumentCutoverEnvironment(
      buildAssessmentInput(fixture, { detectors: withoutStorage }),
    );
    expect(missingDetector.status).toBe("incomplete");
    expect(missingDetector.proposedOutcome).toBe("stop_the_line");
    expect(reasonCodes(missingDetector.blockingReasons)).toContain(
      "plan_surface_without_detector",
    );

    // Add a detector for a surface the plan does not declare.
    const strayDetector = await assessDocumentCutoverEnvironment(
      buildAssessmentInput(fixture, {
        detectors: [
          ...detectors,
          {
            detectorId: "stray",
            detectorVersion: "1",
            surfaceKind: "database_table",
            surfaceIds: ["undeclared_table"],
            inspectSurface: async () => ({
              completeness: "complete",
              detectorQuery: "select ...",
              relianceCounts: { rows: 0 },
            }),
          },
        ],
      }),
    );
    expect(strayDetector.proposedOutcome).toBe("stop_the_line");
    expect(reasonCodes(strayDetector.blockingReasons)).toContain(
      "detector_without_plan_surface",
    );
  });

  it("redacts external references and diagnostic text in recorded evidence", async () => {
    const fixture = new DocumentEnvironmentFixture();
    fixture.seedExternalUrl(
      "https://provider.example.com/artifacts/donor-jane-doe.pdf?token=super-secret",
    );

    const assessment = await assessDocumentCutoverEnvironment(
      buildAssessmentInput(fixture, {
        detectors: buildFixtureDetectors(fixture, {
          background_job: async () => ({
            completeness: "indeterminate" as const,
            detectorQuery: "select ...",
            failure: {
              code: "permission_denied" as const,
              message:
                "permission denied for donor jane@example.com token=abc123 at /jobs?apikey=zzz",
            },
          }),
        }),
      }),
    );

    const external = assessment.evidence.find(
      (item) => item.surfaceKind === "external_reference",
    );
    expect(external?.externalReferenceSummaries).toEqual([
      "https://provider.example.com/…",
    ]);
    const serialized = JSON.stringify(assessment);
    expect(serialized).not.toContain("donor-jane-doe");
    expect(serialized).not.toContain("super-secret");
    expect(serialized).not.toContain("jane@example.com");
    expect(serialized).not.toContain("token=abc123");
  });

  it("never invokes any mutation path on the inspected fixture and reruns safely", async () => {
    const fixture = new DocumentEnvironmentFixture();
    fixture.seedRow("pdf_templates", { id: "t1", tenant_id: "tenant-1" });
    const before = fixture.snapshot();

    const first = await assessDocumentCutoverEnvironment(
      buildAssessmentInput(fixture),
    );
    const second = await assessDocumentCutoverEnvironment(
      buildAssessmentInput(fixture),
    );

    expect(fixture.attemptedWrites).toEqual([]);
    expect(fixture.snapshot()).toBe(before);
    // Rerunning produces a new assessment record, never an edit of the first.
    expect(second.assessmentId).not.toBe(first.assessmentId);
    expect(second.planDigest).toBe(first.planDigest);
  });
});

describe("procedure digest pinning", () => {
  it("stops the line when on-disk procedure content no longer matches its trusted digest", async () => {
    const fixture = new DocumentEnvironmentFixture();
    const trustedDigest = await digestCanonicalValue(
      "procedure body for docs/ops/document-cutover/reset-rebuild.md",
    );

    const clean = await assessDocumentCutoverEnvironment(
      buildAssessmentInput(fixture, {
        procedures: {
          resetRebuild: {
            reference: "docs/ops/document-cutover/reset-rebuild.md",
            pinnedVersion: "1",
            expectedDigest: trustedDigest,
          },
          rollbackBeforeFirstCanonicalWrite: {
            reference:
              "docs/ops/document-cutover/rollback-before-first-canonical-write.md",
            pinnedVersion: "1",
          },
        },
      }),
    );
    expect(clean.proposedOutcome).toBe("clean_preproduction_proof");

    const tampered = await assessDocumentCutoverEnvironment(
      buildAssessmentInput(fixture, {
        procedures: {
          resetRebuild: {
            reference: "docs/ops/document-cutover/reset-rebuild.md",
            pinnedVersion: "1",
            expectedDigest: trustedDigest,
          },
          rollbackBeforeFirstCanonicalWrite: {
            reference:
              "docs/ops/document-cutover/rollback-before-first-canonical-write.md",
            pinnedVersion: "1",
          },
        },
        readProcedure: fixtureProcedureReader({
          "docs/ops/document-cutover/reset-rebuild.md":
            "altered content labeled with the pinned version",
        }),
      }),
    );
    expect(tampered.proposedOutcome).toBe("stop_the_line");
    expect(reasonCodes(tampered.blockingReasons)).toContain(
      "procedure_digest_mismatch",
    );
  });
});
