/**
 * Issue #2206 locale probe. Runs inside a child Vitest process started with
 * LANG/LC_ALL set by `../oracle.ts`, and writes what it observes through the
 * public purpose-catalog seams to the JSON file named by
 * `ACC_2206_PROBE_OUT`. It asserts nothing itself; the parent acceptance test
 * compares the report with the oracle.
 * Issue: {@link https://github.com/Asymmetric-al/core/issues/2206}
 *
 * Owned by Acceptance. Implementers must not edit this file to satisfy their PR.
 */

import { writeFileSync } from "node:fs";

import { it } from "vitest";

import {
  DOCUMENT_PURPOSE_CATALOG,
  DOCUMENT_PURPOSE_SERIALIZER_VERSION,
  admitDocumentPurpose,
  buildDocumentPurposeCatalogManifest,
  canonicalizeDocumentPurposeValue,
  createFailClosedQualificationPort,
  getDocumentPurposeCatalogDigest,
} from "../../../../../packages/api/src/generated-documents/purpose-catalog";
import { canonicalSampleInput } from "../oracle";

import type { LocaleProbeReport } from "../oracle";

it("reports the catalog digest seams under the process locale", async () => {
  const outFile = process.env.ACC_2206_PROBE_OUT;
  if (!outFile) throw new Error("ACC_2206_PROBE_OUT is not set");

  const manifest = buildDocumentPurposeCatalogManifest();
  // tribute.notification@1 is a governed-business purpose: with its one
  // launch gate passed it is admitted under the default fail-closed port.
  const admission = await admitDocumentPurpose(
    {
      purpose_id: "tribute.notification@1",
      context: {
        tenant_id: "00000000-0000-4000-8000-000000000001",
        gate_status: { phase14_tribute_contract: true },
        issuer_proof: {
          verified_us_issuer: false,
          active_ca_registered_charity_issuer: false,
        },
        registered_safe_data_views: [],
      },
    },
    {
      qualificationPort: createFailClosedQualificationPort(),
      now: () => new Date("2026-11-12T00:00:00.000Z"),
    },
  );

  const report: LocaleProbeReport = {
    env: {
      LANG: process.env.LANG ?? null,
      LC_ALL: process.env.LC_ALL ?? null,
    },
    collatorLocale: new Intl.Collator().resolvedOptions().locale,
    chVsH: Math.sign("ch".localeCompare("h")),
    uVsH: Math.sign("u".localeCompare("h")),
    localeSortedPurposeIds: Object.keys(DOCUMENT_PURPOSE_CATALOG).sort(
      (left, right) => left.localeCompare(right),
    ),
    digest: getDocumentPurposeCatalogDigest(),
    manifestDigest: manifest.digest,
    manifestAlgorithm: manifest.digest_algorithm,
    manifestSchemaVersion: manifest.schema_version,
    serializerVersion: DOCUMENT_PURPOSE_SERIALIZER_VERSION,
    manifestPurposeIds: manifest.entries.map(
      (entry) => `${entry.purpose_key}@${entry.purpose_version}`,
    ),
    canonicalSample: canonicalizeDocumentPurposeValue(canonicalSampleInput()),
    admissionDigest: admission.admitted ? admission.catalog_digest : null,
  };
  writeFileSync(outFile, JSON.stringify(report));
});
