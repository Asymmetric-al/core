import {
  compareQualificationKeys,
  digestQualificationValue,
} from "./canonical";

import type { QualificationCaseId, SyntheticCorpusProof } from "./types";

export interface SyntheticCorpusFixtureBinding {
  case_id: QualificationCaseId;
  facts_digest: string;
  document_digest: string;
}

const FIXTURE_MANIFEST_DIGEST_DOMAIN =
  "phase-18-synthetic-corpus-fixture-manifest/v1";
const PROOF_DIGEST_DOMAIN = "phase-18-synthetic-corpus-proof/v1";

/**
 * Bind the aggregate proof to every case identity and both fixture artifacts.
 * Case ordering is semantic noise, so sort with the charter's locale-independent
 * comparator before hashing.
 */
export function digestSyntheticCorpusFixtureManifest(
  bindings: readonly SyntheticCorpusFixtureBinding[],
): string {
  const fixtures = [...bindings].sort((left, right) =>
    compareQualificationKeys(left.case_id, right.case_id),
  );

  return digestQualificationValue({
    domain: FIXTURE_MANIFEST_DIGEST_DOMAIN,
    fixtures,
  });
}

/** Content-address every attestation claim without recursively hashing itself. */
export function digestSyntheticCorpusProof(
  proof: Omit<SyntheticCorpusProof, "proof_digest"> | SyntheticCorpusProof,
): string {
  const claims = {
    proof_id: proof.proof_id,
    schema_version: proof.schema_version,
    assurance: proof.assurance,
    fixture_manifest_digest: proof.fixture_manifest_digest,
    procedure: proof.procedure,
    generation_evidence_digest: proof.generation_evidence_digest,
    attested_by: proof.attested_by,
    attested_at: proof.attested_at,
  };

  return digestQualificationValue({
    domain: PROOF_DIGEST_DOMAIN,
    proof: claims,
  });
}
