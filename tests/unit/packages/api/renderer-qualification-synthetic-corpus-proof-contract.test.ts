import { describe, expect, it } from "vitest";

import {
  buildFixtureContestInput,
  syntheticDigest,
} from "./renderer-qualification-test-fixture";
import {
  digestQualificationValue,
  digestSyntheticCorpusProof,
  freezeRendererQualificationCharter,
  loadCandidateWorkPacket,
  validateRendererQualificationCharterInput,
  verifyRendererQualificationCharter,
  type FrozenRendererQualificationCharter,
  type RendererQualificationCharterInput,
  type SyntheticCorpusProof,
} from "../../../../packages/api/src/generated-documents/renderer-qualification";

function issueCodes(input: RendererQualificationCharterInput): string[] {
  return validateRendererQualificationCharterInput(input).map(
    (issue) => issue.code,
  );
}

function replaceProofClaims(
  input: RendererQualificationCharterInput,
  changes: Partial<Omit<SyntheticCorpusProof, "proof_digest">>,
): RendererQualificationCharterInput {
  const claims: Omit<SyntheticCorpusProof, "proof_digest"> = {
    ...input.synthetic_corpus_proof,
    ...changes,
  };

  return {
    ...input,
    synthetic_corpus_proof: {
      ...claims,
      proof_digest: digestSyntheticCorpusProof(claims),
    },
  };
}

describe("renderer qualification synthetic-corpus proof contract", () => {
  it("does not accept caller-supplied fixture digests on synthetic=true alone", () => {
    const input = buildFixtureContestInput();
    const open_corpus = input.open_corpus.map((item) =>
      item.case_id === "O01"
        ? {
            ...item,
            fixture: {
              ...item.fixture,
              facts_digest: syntheticDigest(
                "opaque-prohibited-real-tenant-facts",
              ),
              document_digest: syntheticDigest(
                "opaque-prohibited-real-tenant-document",
              ),
            },
          }
        : item,
    );

    const codes = issueCodes({
      ...input,
      open_corpus,
    });

    expect(codes).toContain("corpus_synthetic_proof_invalid");
  });

  it("freezes a complete custodian-attested proof and ignores corpus ordering", () => {
    const input = buildFixtureContestInput();
    const reordered = {
      ...input,
      open_corpus: [...input.open_corpus].reverse(),
      held_back_corpus: [...input.held_back_corpus].reverse(),
    };

    expect(issueCodes(input)).not.toContain("corpus_synthetic_proof_invalid");
    expect(freezeRendererQualificationCharter(reordered).manifest_digest).toBe(
      freezeRendererQualificationCharter(input).manifest_digest,
    );
  });

  it("reports an absent or undeclared proof field as typed validation", () => {
    const missing = structuredClone(
      buildFixtureContestInput(),
    ) as unknown as Record<string, unknown>;
    delete missing.synthetic_corpus_proof;

    expect(() =>
      validateRendererQualificationCharterInput(
        missing as unknown as RendererQualificationCharterInput,
      ),
    ).not.toThrow();
    expect(
      issueCodes(missing as unknown as RendererQualificationCharterInput),
    ).toContain("corpus_synthetic_proof_invalid");

    const input = buildFixtureContestInput();
    const proofWithSourcePath = {
      ...input.synthetic_corpus_proof,
      source_path: "tenant-export.json",
    };
    expect(
      issueCodes({
        ...input,
        synthetic_corpus_proof:
          proofWithSourcePath as unknown as SyntheticCorpusProof,
      }),
    ).toContain("corpus_synthetic_proof_invalid");
  });

  it.each([
    ["wrong schema", { schema_version: "future-proof/v2" }],
    ["wrong assurance", { assurance: "redacted_real_data" }],
    ["wrong custodian", { attested_by: "operator-prince" }],
    ["zone-less attestation", { attested_at: "2026-07-22T11:00:00" }],
    ["post-freeze attestation", { attested_at: "2026-07-22T12:01:00.000Z" }],
    [
      "malformed evidence digest",
      { generation_evidence_digest: "not-a-digest" },
    ],
  ])(
    "rejects %s even when its proof digest is recomputed",
    (_label, changes) => {
      const input = buildFixtureContestInput();
      const changed = replaceProofClaims(
        input,
        changes as Partial<Omit<SyntheticCorpusProof, "proof_digest">>,
      );

      expect(issueCodes(changed)).toContain("corpus_synthetic_proof_invalid");
    },
  );

  it("rejects proof-body tampering under the old proof digest", () => {
    const input = buildFixtureContestInput();
    const tampered = {
      ...input,
      synthetic_corpus_proof: {
        ...input.synthetic_corpus_proof,
        procedure: {
          ...input.synthetic_corpus_proof.procedure,
          digest: syntheticDigest("different-generator"),
        },
      },
    };

    expect(issueCodes(tampered)).toContain("corpus_synthetic_proof_invalid");
  });

  it("binds proof changes into the charter manifest", () => {
    const input = buildFixtureContestInput();
    const changed = replaceProofClaims(input, {
      generation_evidence_digest: syntheticDigest(
        "replacement-synthetic-generation-evidence",
      ),
    });

    const original = freezeRendererQualificationCharter(input);
    const replacement = freezeRendererQualificationCharter(changed);
    expect(replacement.manifest_digest).not.toBe(original.manifest_digest);
  });

  it("rejects a self-consistent outer manifest with an invalid attestor", () => {
    const charter = structuredClone(
      freezeRendererQualificationCharter(buildFixtureContestInput()),
    );
    charter.synthetic_corpus_proof.attested_by = "operator-prince";
    charter.synthetic_corpus_proof.proof_digest = digestSyntheticCorpusProof(
      charter.synthetic_corpus_proof,
    );
    const {
      schema_version,
      serializer_version,
      manifest_digest: _oldManifestDigest,
      ...frozenFields
    } = charter;
    charter.manifest_digest = digestQualificationValue({
      schema_version,
      serializer_version,
      charter: frozenFields,
    });

    const result = verifyRendererQualificationCharter(
      charter as FrozenRendererQualificationCharter,
    );
    expect(result.valid).toBe(false);
    expect(result.failures.map((failure) => failure.code)).toContain(
      "structure_invalid",
    );
  });

  it("keeps synthetic-generation evidence out of candidate packets", () => {
    const charter = freezeRendererQualificationCharter(
      buildFixtureContestInput(),
    );
    const packet = loadCandidateWorkPacket(
      charter,
      "P18-R-P",
      "operator-prince",
    );
    const serialized = JSON.stringify(packet);

    expect(serialized).not.toContain("synthetic_corpus_proof");
    expect(serialized).not.toContain(charter.synthetic_corpus_proof.proof_id);
    expect(serialized).not.toContain(
      charter.synthetic_corpus_proof.generation_evidence_digest,
    );
  });
});
