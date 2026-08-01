import { PHASE_18_DESTRUCTIVE_CUTOVER_PLAN } from "../../../../packages/api/src/document-cutover";

import type {
  AssessDocumentCutoverEnvironmentInput,
  DocumentCutoverDetector,
  DocumentCutoverEnvironmentIdentity,
  DocumentCutoverSurfaceInspection,
} from "../../../../packages/api/src/document-cutover";

/**
 * Isolated in-memory database/storage fixture for the cutover gate tests.
 *
 * Reads go through the same accessors the fake detectors use; every mutating
 * method records itself and throws, so any test that reaches a write path
 * fails loudly. `snapshot()` supports the byte-for-byte unchanged assertions.
 */
export class DocumentEnvironmentFixture {
  readonly tables = new Map<string, Array<Record<string, unknown>>>();
  readonly storageObjects: string[] = [];
  readonly externalUrls: string[] = [];
  activeJobs = 0;
  readonly attemptedWrites: string[] = [];

  seedRow(table: string, row: Record<string, unknown>): void {
    this.tables.set(table, [...(this.tables.get(table) ?? []), row]);
  }

  seedStorageObject(objectKey: string): void {
    this.storageObjects.push(objectKey);
  }

  seedExternalUrl(url: string): void {
    this.externalUrls.push(url);
  }

  countRows(table: string): number {
    return this.tables.get(table)?.length ?? 0;
  }

  countTenantRows(table: string): number {
    return (this.tables.get(table) ?? []).filter(
      (row) => row.tenant_id !== null && row.tenant_id !== undefined,
    ).length;
  }

  snapshot(): string {
    return JSON.stringify({
      tables: Object.fromEntries(this.tables),
      storageObjects: this.storageObjects,
      externalUrls: this.externalUrls,
      activeJobs: this.activeJobs,
    });
  }

  /** Any invocation is a test failure: the assessment path must never write. */
  write(operation: string): never {
    this.attemptedWrites.push(operation);
    throw new Error(`Forbidden mutation attempted: ${operation}`);
  }

  deleteRows(table: string): never {
    return this.write(`delete from ${table}`);
  }

  truncate(table: string): never {
    return this.write(`truncate ${table}`);
  }

  removeObject(objectKey: string): never {
    return this.write(`remove object ${objectKey}`);
  }
}

function planSurfaceIds(surfaceKind: string): string[] {
  return PHASE_18_DESTRUCTIVE_CUTOVER_PLAN.surfaces
    .filter((surface) => surface.surfaceKind === surfaceKind)
    .map((surface) => surface.surfaceId);
}

export function buildFixtureDetectors(
  fixture: DocumentEnvironmentFixture,
  overrides: Partial<
    Record<
      string,
      (surfaceId: string) => Promise<DocumentCutoverSurfaceInspection>
    >
  > = {},
): DocumentCutoverDetector[] {
  const tableDetector: DocumentCutoverDetector = {
    detectorId: "fixture-table-census",
    detectorVersion: "1",
    surfaceKind: "database_table",
    surfaceIds: planSurfaceIds("database_table"),
    inspectSurface:
      overrides.database_table ??
      (async (table) => ({
        completeness: "complete",
        detectorQuery: `fixture count(${table})`,
        relianceCounts: {
          rows: fixture.countRows(table),
          tenants: fixture.countTenantRows(table),
          ...(table === "pdf_template_audit_events"
            ? { retainedHistory: fixture.countRows(table) }
            : {}),
        },
      })),
  };

  const storageDetector: DocumentCutoverDetector = {
    detectorId: "fixture-storage-census",
    detectorVersion: "1",
    surfaceKind: "storage_location",
    surfaceIds: planSurfaceIds("storage_location"),
    inspectSurface:
      overrides.storage_location ??
      (async () => ({
        completeness: "complete",
        detectorQuery: "fixture storage census",
        relianceCounts: { objects: fixture.storageObjects.length },
      })),
  };

  const externalDetector: DocumentCutoverDetector = {
    detectorId: "fixture-external-url-census",
    detectorVersion: "1",
    surfaceKind: "external_reference",
    surfaceIds: planSurfaceIds("external_reference"),
    inspectSurface:
      overrides.external_reference ??
      (async () => ({
        completeness: "complete",
        detectorQuery: "fixture external url census",
        relianceCounts: { externalReferences: fixture.externalUrls.length },
        externalReferences: fixture.externalUrls,
      })),
  };

  const jobDetector: DocumentCutoverDetector = {
    detectorId: "fixture-job-census",
    detectorVersion: "1",
    surfaceKind: "background_job",
    surfaceIds: planSurfaceIds("background_job"),
    inspectSurface:
      overrides.background_job ??
      (async () => ({
        completeness: "complete",
        detectorQuery: "fixture job census",
        relianceCounts: { activeJobs: fixture.activeJobs },
      })),
  };

  const inventoryDetector = (
    surfaceKind: "configuration" | "prototype_test" | "route",
  ): DocumentCutoverDetector => ({
    detectorId: `fixture-inventory-${surfaceKind}`,
    detectorVersion: "1",
    surfaceKind,
    surfaceIds: planSurfaceIds(surfaceKind),
    inspectSurface:
      overrides[surfaceKind] ??
      (async (surfaceId) => ({
        completeness: "complete",
        detectorQuery: `fixture stat ${surfaceId}`,
        inventoryFindings: { fileExists: true },
      })),
  });

  return [
    tableDetector,
    storageDetector,
    externalDetector,
    jobDetector,
    inventoryDetector("route"),
    inventoryDetector("configuration"),
    inventoryDetector("prototype_test"),
  ];
}

export const CLEAN_ENVIRONMENT: DocumentCutoverEnvironmentIdentity = {
  environmentLabel: "local",
  productionClassification: "non_production",
  databaseProjectId: "local:127.0.0.1:54321",
  storageIdentity: "local:127.0.0.1:54321/storage/v1",
  schemaVersion: "20260714090000",
  codeVersion: "0123456789abcdef0123456789abcdef01234567",
};

export const FIXTURE_PROCEDURES = {
  resetRebuild: {
    reference: "docs/ops/document-cutover/reset-rebuild.md",
    pinnedVersion: "1",
    // Digest of fixtureProcedureReader()'s default body for this reference.
    expectedDigest:
      "f7612c82364453cff064d5871e10c42401ada00bdcc8d3b26c0100be8e715fff",
  },
  rollbackBeforeFirstCanonicalWrite: {
    reference:
      "docs/ops/document-cutover/rollback-before-first-canonical-write.md",
    pinnedVersion: "1",
    expectedDigest:
      "4fac474f5497d0b7ad7217c5323f463973b7ca175d62131ae188ff80b03cd503",
  },
};

export function fixtureProcedureReader(
  contents: Record<string, string | null> = {},
): (reference: string) => Promise<string | null> {
  return async (reference) => {
    if (reference in contents) return contents[reference];
    return `procedure body for ${reference}`;
  };
}

export function buildAssessmentInput(
  fixture: DocumentEnvironmentFixture,
  overrides: Partial<AssessDocumentCutoverEnvironmentInput> = {},
): AssessDocumentCutoverEnvironmentInput {
  return {
    plan: PHASE_18_DESTRUCTIVE_CUTOVER_PLAN,
    resolveEnvironment: async () => CLEAN_ENVIRONMENT,
    detectors: buildFixtureDetectors(fixture),
    procedures: FIXTURE_PROCEDURES,
    readProcedure: fixtureProcedureReader(),
    ...overrides,
  };
}
