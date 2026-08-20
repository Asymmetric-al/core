import { describe, expect, it } from "vitest";

import { buildFixtureContestInput } from "./renderer-qualification-test-fixture";
import {
  PHASE_18_RENDERER_ADAPTER_CONTRACT,
  PHASE_18_RENDERER_ADAPTER_CONTRACT_DIGEST,
  digestQualificationValue,
  digestRendererAdapterContract,
  freezeRendererQualificationCharter,
  loadCandidateWorkPacket,
  validateRendererQualificationCharterInput,
  verifyRendererQualificationCharter,
} from "../../../../packages/api/src/generated-documents/renderer-qualification";

import type {
  FrozenRendererQualificationCharter,
  RendererQualificationCharterInput,
} from "../../../../packages/api/src/generated-documents/renderer-qualification";

const FAILURE_CLASSIFICATIONS = [
  "invalid_input",
  "unsupported_capability",
  "validation_failure",
  "resource_limit",
  "timeout",
  "provider_unavailable",
  "provider_indeterminate",
  "sandbox_security_rejection",
  "internal_adapter_failure",
] as const;

function issueCodes(input: RendererQualificationCharterInput): string[] {
  return validateRendererQualificationCharterInput(input).map(
    (issue) => issue.code,
  );
}

function reforgeManifest(charter: FrozenRendererQualificationCharter): void {
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
}

describe("renderer qualification adapter contract", () => {
  it("freezes and discloses one candidate-neutral adapter contract", () => {
    const charter = freezeRendererQualificationCharter(
      buildFixtureContestInput(),
    );
    const expectedDigest = digestRendererAdapterContract(
      PHASE_18_RENDERER_ADAPTER_CONTRACT,
    );
    const princePacket = loadCandidateWorkPacket(
      charter,
      "P18-R-P",
      "operator-prince",
    );
    const typstPacket = loadCandidateWorkPacket(
      charter,
      "P18-R-T",
      "operator-typst",
    );

    expect(charter.adapter_contract).toEqual(
      PHASE_18_RENDERER_ADAPTER_CONTRACT,
    );
    expect(charter.adapter_contract_digest).toBe(expectedDigest);
    expect(princePacket.adapter_contract).toEqual(typstPacket.adapter_contract);
    expect(princePacket.adapter_contract_digest).toBe(expectedDigest);
    expect(typstPacket.adapter_contract_digest).toBe(expectedDigest);
  });

  it("encodes the complete shared request, discriminated result, and no-authority boundary", () => {
    const contract = PHASE_18_RENDERER_ADAPTER_CONTRACT;

    expect(contract.request).toEqual({
      semantic_document: "same_bounded_product_contract",
      compiled_source: {
        bytes: "frozen_compiled_source_bytes",
        media_type: "explicit",
      },
      correlation_metadata: {
        classification: "non_secret",
        identities: [
          "purpose_id",
          "publication_id",
          "facts_package_id",
          "request_id",
          "attempt_id",
        ],
      },
      bundles: {
        assets: "local_content_addressed",
        fonts: "local_content_addressed",
      },
      rendering_context: [
        "locale",
        "direction",
        "time_zone",
        "page_size",
        "metadata_clock",
        "output_profile",
      ],
      limits: [
        "deadline",
        "max_input_bytes",
        "max_output_bytes",
        "max_pages",
        "resource_budget",
      ],
    });
    expect(contract.result).toEqual({
      discriminator: "status",
      cardinality: "exactly_one_success_or_typed_failure",
      success: {
        status: "success",
        pdf_bytes: "candidate_pdf_bytes",
        safe_metrics: "required",
      },
      failure: {
        status: "failure",
        classifications: FAILURE_CLASSIFICATIONS,
        actionable_cause: "required",
        canonical_artifact_emitted: false,
      },
    });
    expect(contract.authority).toEqual({
      provider_identifiers_and_urls: "diagnostic_evidence_only",
      may_mark_artifact_canonical: false,
      may_advance_logical_document_head: false,
      may_issue_receipt: false,
      may_cause_delivery: false,
    });
    expect(contract.reconciliation).toEqual({
      timeout_or_provider_indeterminate: "same_attempt_identity",
      second_official_effect: "forbidden",
    });
    expect(contract.evidence).toEqual({
      candidate_specific_source: "retained",
      accommodations_and_semantic_losses: "listed",
      manual_pdf_edits: "forbidden",
      fixture_id_specific_branches: "forbidden",
    });
  });

  it("domain-separates and deep-freezes the protocol contract digest", () => {
    expect(PHASE_18_RENDERER_ADAPTER_CONTRACT_DIGEST).toBe(
      digestRendererAdapterContract(PHASE_18_RENDERER_ADAPTER_CONTRACT),
    );
    expect(PHASE_18_RENDERER_ADAPTER_CONTRACT_DIGEST).toMatch(/^[0-9a-f]{64}$/);
    expect(PHASE_18_RENDERER_ADAPTER_CONTRACT_DIGEST).not.toBe(
      digestQualificationValue(PHASE_18_RENDERER_ADAPTER_CONTRACT),
    );
    expect(Object.isFrozen(PHASE_18_RENDERER_ADAPTER_CONTRACT)).toBe(true);
    expect(Object.isFrozen(PHASE_18_RENDERER_ADAPTER_CONTRACT.request)).toBe(
      true,
    );
    expect(
      Object.isFrozen(
        PHASE_18_RENDERER_ADAPTER_CONTRACT.result.failure.classifications,
      ),
    ).toBe(true);
  });

  it("rejects missing, extra, or rewritten fixed contract fields", () => {
    const missing = buildFixtureContestInput();
    delete (missing as Partial<RendererQualificationCharterInput>)
      .adapter_contract;
    expect(
      issueCodes(missing as unknown as RendererQualificationCharterInput),
    ).toContain("protocol_fixed_field_changed");

    const extra = buildFixtureContestInput();
    (
      extra.adapter_contract as unknown as Record<string, unknown>
    ).selected_renderer = "P18-R-P";
    extra.adapter_contract_digest = digestRendererAdapterContract(
      extra.adapter_contract,
    );
    expect(issueCodes(extra)).toContain("protocol_fixed_field_changed");

    const wrongVersion = buildFixtureContestInput();
    (
      wrongVersion.adapter_contract as { contract_version: string }
    ).contract_version = "phase-18-renderer-adapter-contract/v2";
    wrongVersion.adapter_contract_digest = digestRendererAdapterContract(
      wrongVersion.adapter_contract,
    );
    expect(issueCodes(wrongVersion)).toContain("protocol_fixed_field_changed");

    const rewritten = buildFixtureContestInput();
    rewritten.adapter_contract.result.failure.classifications = [
      ...FAILURE_CLASSIFICATIONS.slice(0, -1),
    ];
    rewritten.adapter_contract_digest = digestRendererAdapterContract(
      rewritten.adapter_contract,
    );
    expect(issueCodes(rewritten)).toContain("protocol_fixed_field_changed");
  });

  it("rejects a changed contract, changed digest, and a self-consistent outer forgery", () => {
    const frozen = freezeRendererQualificationCharter(
      buildFixtureContestInput(),
    );

    const contractOnly = structuredClone(frozen);
    (
      contractOnly.adapter_contract.authority as {
        may_issue_receipt: boolean;
      }
    ).may_issue_receipt = true;
    expect(verifyRendererQualificationCharter(contractOnly).failures).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "digest_mismatch" }),
      ]),
    );

    const digestOnly = structuredClone(frozen);
    digestOnly.adapter_contract_digest = "0".repeat(64);
    expect(verifyRendererQualificationCharter(digestOnly).failures).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "digest_mismatch" }),
      ]),
    );

    const selfConsistent = structuredClone(frozen);
    (
      selfConsistent.adapter_contract.authority as {
        may_issue_receipt: boolean;
      }
    ).may_issue_receipt = true;
    selfConsistent.adapter_contract_digest = digestRendererAdapterContract(
      selfConsistent.adapter_contract,
    );
    reforgeManifest(selfConsistent);
    const result = verifyRendererQualificationCharter(selfConsistent);
    expect(result.valid).toBe(false);
    expect(result.failures.map((failure) => failure.code)).toContain(
      "structure_invalid",
    );
  });

  it("fails closed on a missing contract and keeps packet copies isolated", () => {
    const frozen = freezeRendererQualificationCharter(
      buildFixtureContestInput(),
    );
    const malformed = structuredClone(frozen);
    delete (malformed as Partial<FrozenRendererQualificationCharter>)
      .adapter_contract;
    expect(() => verifyRendererQualificationCharter(malformed)).not.toThrow();
    expect(verifyRendererQualificationCharter(malformed).valid).toBe(false);

    const princePacket = loadCandidateWorkPacket(
      frozen,
      "P18-R-P",
      "operator-prince",
    );
    const typstPacket = loadCandidateWorkPacket(
      frozen,
      "P18-R-T",
      "operator-typst",
    );
    (
      princePacket.adapter_contract.request.compiled_source as {
        media_type: string;
      }
    ).media_type = "mutated";

    expect(typstPacket.adapter_contract).toEqual(
      PHASE_18_RENDERER_ADAPTER_CONTRACT,
    );
    expect(frozen.adapter_contract).toEqual(PHASE_18_RENDERER_ADAPTER_CONTRACT);
  });
});
