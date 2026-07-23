import { describe, expect, it } from "vitest";

import {
  CA_CASE_IDS,
  DOCUMENT_CASE_IDS,
  DOCUMENT_PURPOSE_CATALOG,
  DOCUMENT_PURPOSE_IDS,
  DOCUMENT_PURPOSE_LANES,
  DocumentPurposeContractError,
  FIXTURE_CLASSES,
  LEGAL_ISSUER_REQUIREMENTS,
  OUTPUT_POLICIES,
  PURPOSE_PREDICATES,
  RELEASE_EVIDENCE_CLASSES,
  REVIEW_FLOORS,
  STRUCTURED_BLOCK_IDS,
  UnknownDocumentPurposeError,
  US_CASE_IDS,
  assertDocumentPurposeContract,
  getDocumentPurposeContract,
  validateDocumentPurposeCatalog,
  validateDocumentPurposeContractShape,
} from "../../../../packages/api/src/generated-documents/purpose-catalog";

import type { DocumentPurposeContract } from "../../../../packages/api/src/generated-documents/purpose-catalog";

const REQUIRED_MANIFEST_FIELDS = [
  "purpose_key",
  "purpose_version",
  "lane",
  "source_owner",
  "legal_issuer_requirement",
  "recipient_role",
  "approved_data_view",
  "case_registry",
  "required_blocks",
  "optional_blocks",
  "forbidden_facts",
  "output_policy",
  "locale_policy",
  "publication_scope_policy",
  "review_floor",
  "identity_policy",
  "correction_policy",
  "delivery_policy",
  "access_policy",
  "records_schedule",
  "fixture_pack",
  "release_evidence",
  "launch",
] as const;

function cloneContract(purposeId: string): DocumentPurposeContract {
  return structuredClone(getDocumentPurposeContract(purposeId));
}

describe("the launch purpose catalog", () => {
  it("contains exactly the eleven launch purposes", () => {
    expect(Object.keys(DOCUMENT_PURPOSE_CATALOG).sort()).toEqual(
      [...DOCUMENT_PURPOSE_IDS].sort(),
    );
    expect(DOCUMENT_PURPOSE_IDS).toHaveLength(11);
  });

  it("keeps every closed vocabulary exact", () => {
    expect(DOCUMENT_PURPOSE_LANES).toEqual([
      "official_tax",
      "governed_business",
      "general_custom",
    ]);
    expect(LEGAL_ISSUER_REQUIREMENTS).toEqual([
      "none",
      "verified_us_issuer",
      "active_ca_registered_charity_issuer",
    ]);
    expect(OUTPUT_POLICIES).toEqual(["accessible-v1", "accessible-archive-v1"]);
    expect(REVIEW_FLOORS).toEqual(["standard", "protected"]);
    expect(PURPOSE_PREDICATES).toEqual([
      "has_value",
      "is_empty",
      "is_yes",
      "is_no",
      "is_option",
      "is_not_option",
    ]);
    expect(US_CASE_IDS).toHaveLength(8);
    expect(CA_CASE_IDS).toHaveLength(5);
    expect(STRUCTURED_BLOCK_IDS).toHaveLength(16);
    expect(FIXTURE_CLASSES).toHaveLength(6);
    expect(RELEASE_EVIDENCE_CLASSES).toHaveLength(7);
  });

  it("declares every required manifest field on every entry with no implicit defaults", () => {
    for (const purposeId of DOCUMENT_PURPOSE_IDS) {
      const contract = getDocumentPurposeContract(purposeId);
      for (const field of REQUIRED_MANIFEST_FIELDS) {
        expect(
          contract[field],
          `${purposeId} is missing ${field}`,
        ).toBeDefined();
      }
    }
  });

  it("validates cleanly at build verification", () => {
    expect(validateDocumentPurposeCatalog(DOCUMENT_PURPOSE_CATALOG)).toEqual(
      [],
    );
  });

  it("preserves the exact launch states instead of a blanket default", () => {
    const launch = (purposeId: string) =>
      getDocumentPurposeContract(purposeId).launch;

    for (const usOfficial of [
      "us.contribution_acknowledgment.single@1",
      "us.contribution_acknowledgment.annual@1",
      "us.qcd.acknowledgment@1",
    ]) {
      expect(launch(usOfficial).state).toBe("dark");
      expect(launch(usOfficial).gates).toContain("us_legal_finance_review");
      expect(launch(usOfficial).gates).toContain("core_d3_renderer_qualified");
    }
    expect(launch("us.contribution_acknowledgment.annual@1").gates).toContain(
      "phase19_statement_seam",
    );

    for (const caOfficial of [
      "ca.official_receipt.individual_cash@1",
      "ca.official_receipt.cumulative_cash@1",
      "ca.official_receipt.non_cash@1",
      "ca.official_receipt.advantage_split@1",
    ]) {
      expect(launch(caOfficial).state).toBe("absent_until_activation");
      expect(launch(caOfficial).gates).toContain("ca_pack_active");
    }

    expect(launch("giving.summary.informational@1")).toEqual({
      state: "supported_after_gates",
      gates: ["core_d3_renderer_qualified", "core_d4_artifact_pipeline"],
    });
    expect(launch("tribute.notification@1")).toEqual({
      state: "supported_after_gates",
      gates: ["phase14_tribute_contract"],
    });
    expect(launch("pledge.statement@1")).toEqual({
      state: "supported_after_gates",
      gates: ["phase16_pledge_contract"],
    });
    expect(launch("custom.business_document@1")).toEqual({
      state: "supported_after_gates",
      gates: ["registered_safe_data_view"],
    });
  });

  it("assigns official policies exactly: archive output, protected review, identity policy", () => {
    for (const purposeId of DOCUMENT_PURPOSE_IDS) {
      const contract = getDocumentPurposeContract(purposeId);
      if (contract.lane === "official_tax") {
        expect(contract.output_policy).toBe("accessible-archive-v1");
        expect(contract.review_floor).toBe("protected");
        expect(contract.identity_policy.public_reference).not.toBe("none");
        expect(contract.required_blocks).toContain("official_block@1");
        expect(contract.case_registry.length).toBeGreaterThan(0);
      } else {
        expect(contract.output_policy).toBe("accessible-v1");
        expect(contract.identity_policy.public_reference).toBe("none");
        expect(contract.required_blocks).not.toContain("official_block@1");
        expect(contract.optional_blocks).not.toContain("official_block@1");
        expect(contract.optional_blocks).not.toContain("signer_block@1");
      }
    }

    // Canadian receipts additionally carry the protected signer block.
    for (const caOfficial of [
      "ca.official_receipt.individual_cash@1",
      "ca.official_receipt.cumulative_cash@1",
      "ca.official_receipt.non_cash@1",
      "ca.official_receipt.advantage_split@1",
    ]) {
      const contract = getDocumentPurposeContract(caOfficial);
      expect(contract.required_blocks).toContain("signer_block@1");
      expect(contract.identity_policy.public_reference).toBe("ca_serial_r_v1");
      expect(contract.locale_policy.required_legal_variants).toContain("fr-CA");
    }
  });

  it("references only known cases and blocks", () => {
    for (const purposeId of DOCUMENT_PURPOSE_IDS) {
      const contract = getDocumentPurposeContract(purposeId);
      for (const caseId of contract.case_registry) {
        expect(DOCUMENT_CASE_IDS).toContain(caseId);
      }
      for (const block of [
        ...contract.required_blocks,
        ...contract.optional_blocks,
      ]) {
        expect(STRUCTURED_BLOCK_IDS).toContain(block);
      }
    }
  });
});

describe("catalog validation fail-closed behavior", () => {
  it("rejects a duplicate identity", () => {
    const catalog = structuredClone(DOCUMENT_PURPOSE_CATALOG) as Record<
      string,
      DocumentPurposeContract
    >;
    const duplicate = cloneContract("giving.summary.informational@1");
    catalog["giving.summary.duplicate@1"] = duplicate;

    const codes = validateDocumentPurposeCatalog(catalog).map(
      (item) => item.code,
    );
    expect(codes).toContain("duplicate_identity");
    expect(codes).toContain("unknown_purpose");
  });

  it("rejects a mutated key/version identity", () => {
    const contract = cloneContract("pledge.statement@1");
    const issues = validateDocumentPurposeContractShape(
      "pledge.statement@2",
      contract,
    );
    expect(issues.map((item) => item.code)).toContain("mutable_identity");
  });

  it("rejects unknown case, block, fixture, gate, and evidence references", () => {
    const contract = cloneContract("us.contribution_acknowledgment.single@1");
    (contract.case_registry as string[]).push("us.invented_case@1");
    (contract.required_blocks as string[]).push("hologram@1");
    (contract.fixture_pack.required_fixtures as string[]).push("vibes");
    (contract.release_evidence as string[]).push("handshake");
    (contract.launch.gates as string[]).push("trust_me_flag");

    const codes = validateDocumentPurposeContractShape(
      "us.contribution_acknowledgment.single@1",
      contract,
    ).map((item) => item.code);
    expect(codes).toContain("unknown_reference");
    expect(
      codes.filter((code) => code === "unknown_reference").length,
    ).toBeGreaterThanOrEqual(5);
  });

  it("rejects a required/optional block collision and protected-block exposure", () => {
    const collided = cloneContract("us.contribution_acknowledgment.single@1");
    (collided.optional_blocks as string[]).push("official_block@1");
    const collidedCodes = validateDocumentPurposeContractShape(
      "us.contribution_acknowledgment.single@1",
      collided,
    ).map((item) => item.code);
    expect(collidedCodes).toContain("required_block_conflict");
    expect(collidedCodes).toContain("protected_block_exposed");

    const leaked = cloneContract("custom.business_document@1");
    (leaked.required_blocks as string[]).push("official_block@1");
    expect(
      validateDocumentPurposeContractShape(
        "custom.business_document@1",
        leaked,
      ).map((item) => item.code),
    ).toContain("protected_block_exposed");
  });

  it("rejects an approved data view that exposes forbidden facts", () => {
    const contract = cloneContract("tribute.notification@1");
    (contract.approved_data_view.fields as string[]).push("gift_amount");

    expect(
      validateDocumentPurposeContractShape(
        "tribute.notification@1",
        contract,
      ).map((item) => item.code),
    ).toContain("forbidden_fact_exposed");
  });

  it("rejects missing fixtures and missing release evidence", () => {
    const contract = cloneContract("giving.summary.informational@1");
    contract.fixture_pack = {
      ...contract.fixture_pack,
      required_fixtures: ["ordinary"],
    };
    contract.release_evidence = [] as never;

    const codes = validateDocumentPurposeContractShape(
      "giving.summary.informational@1",
      contract,
    ).map((item) => item.code);
    expect(codes).toContain("missing_fixture");
    expect(codes).toContain("missing_release_evidence");
  });

  it("rejects impossible lane/issuer combinations", () => {
    const officialNoIssuer = cloneContract("us.qcd.acknowledgment@1");
    officialNoIssuer.legal_issuer_requirement = "none";
    expect(
      validateDocumentPurposeContractShape(
        "us.qcd.acknowledgment@1",
        officialNoIssuer,
      ).map((item) => item.code),
    ).toContain("impossible_lane_issuer_combination");

    const customWithIssuer = cloneContract("custom.business_document@1");
    customWithIssuer.legal_issuer_requirement = "verified_us_issuer";
    expect(
      validateDocumentPurposeContractShape(
        "custom.business_document@1",
        customWithIssuer,
      ).map((item) => item.code),
    ).toContain("impossible_lane_issuer_combination");
  });

  it("rejects an official purpose whose launch state was silently promoted", () => {
    const promoted = cloneContract("ca.official_receipt.individual_cash@1");
    promoted.launch = { state: "supported_after_gates", gates: [] };
    expect(
      validateDocumentPurposeContractShape(
        "ca.official_receipt.individual_cash@1",
        promoted,
      ).map((item) => item.code),
    ).toContain("launch_state_promoted");
  });

  it("rejects tenant-authored fields on a contract", () => {
    const contract = cloneContract("custom.business_document@1") as Record<
      string,
      unknown
    >;
    contract.tenant_id = "tenant-1";
    expect(
      validateDocumentPurposeContractShape(
        "custom.business_document@1",
        contract as never,
      ).map((item) => item.code),
    ).toContain("unknown_field");
  });
});

describe("purpose lookup and the assertion seam", () => {
  it("fails closed for unknown purposes and never falls back to custom", () => {
    expect(() => getDocumentPurposeContract("us.invented.purpose@1")).toThrow(
      UnknownDocumentPurposeError,
    );
    expect(() =>
      getDocumentPurposeContract("custom.business_document@2"),
    ).toThrow(UnknownDocumentPurposeError);

    try {
      getDocumentPurposeContract("nope@1");
      expect.unreachable("unknown purpose must throw");
    } catch (error) {
      expect(error).toBeInstanceOf(UnknownDocumentPurposeError);
      expect((error as Error).message).not.toContain("falling back");
    }
  });

  it("accepts the exact code-owned contract and rejects any tenant mutation of an official purpose", () => {
    const canonical = getDocumentPurposeContract(
      "ca.official_receipt.individual_cash@1",
    );
    expect(() => assertDocumentPurposeContract(canonical)).not.toThrow();

    const tampered = cloneContract("ca.official_receipt.individual_cash@1");
    tampered.forbidden_facts = { deny_set_version: 1, facts: [] };
    try {
      assertDocumentPurposeContract(tampered);
      expect.unreachable("tampered official contract must throw");
    } catch (error) {
      expect(error).toBeInstanceOf(DocumentPurposeContractError);
      expect(
        (error as DocumentPurposeContractError).issues.map((item) => item.code),
      ).toContain("official_purpose_tampered");
    }
  });

  it("rejects a tenant-invented official purpose contract outright", () => {
    const invented = cloneContract("us.qcd.acknowledgment@1");
    (invented as { purpose_key: string }).purpose_key =
      "us.tenant_invented.receipt";

    expect(() => assertDocumentPurposeContract(invented)).toThrow(
      DocumentPurposeContractError,
    );
  });
});

describe("malformed contracts fail closed with issues, never a crash", () => {
  it("treats null fields as missing and reports broken nested shapes", () => {
    const nullNested = cloneContract("custom.business_document@1") as Record<
      string,
      unknown
    >;
    nullNested.identity_policy = null;
    expect(
      validateDocumentPurposeContractShape(
        "custom.business_document@1",
        nullNested as never,
      ).map((item) => item.code),
    ).toContain("missing_field");

    const gatelessLaunch = cloneContract("pledge.statement@1") as Record<
      string,
      unknown
    >;
    gatelessLaunch.launch = { state: "supported_after_gates" };
    expect(
      validateDocumentPurposeContractShape(
        "pledge.statement@1",
        gatelessLaunch as never,
      ).map((item) => item.code),
    ).toContain("invalid_field_shape");

    const stringRegistry = cloneContract("pledge.statement@1") as Record<
      string,
      unknown
    >;
    stringRegistry.case_registry = "not-an-array";
    expect(
      validateDocumentPurposeContractShape(
        "pledge.statement@1",
        stringRegistry as never,
      ).map((item) => item.code),
    ).toContain("invalid_field_shape");
  });

  it("keeps the assertion seam typed for malformed input instead of crashing", () => {
    const broken = cloneContract("us.qcd.acknowledgment@1") as Record<
      string,
      unknown
    >;
    broken.identity_policy = null;
    broken.locale_policy = { fallback: "fail_closed" };

    try {
      assertDocumentPurposeContract(broken as never);
      expect.unreachable("malformed contract must throw the typed error");
    } catch (error) {
      expect(error).toBeInstanceOf(DocumentPurposeContractError);
      expect(
        (error as DocumentPurposeContractError).issues.length,
      ).toBeGreaterThan(0);
    }
  });
});
