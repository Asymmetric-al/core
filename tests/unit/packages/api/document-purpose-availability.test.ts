import { describe, expect, it, vi } from "vitest";

import {
  admitDocumentPurpose,
  createFailClosedQualificationPort,
  createStaticQualificationPort,
  getDocumentPurposeCatalogDigest,
  listDocumentPurposeContracts,
  resolvePurposeAvailability,
} from "../../../../packages/api/src/generated-documents/purpose-catalog";

import type {
  DocumentQualificationAvailabilityPort,
  PurposeAvailabilityContext,
} from "../../../../packages/api/src/generated-documents/purpose-catalog";

const OFFICIAL_PURPOSE_IDS = [
  "us.contribution_acknowledgment.single@1",
  "us.contribution_acknowledgment.annual@1",
  "us.qcd.acknowledgment@1",
  "ca.official_receipt.individual_cash@1",
  "ca.official_receipt.cumulative_cash@1",
  "ca.official_receipt.non_cash@1",
  "ca.official_receipt.advantage_split@1",
] as const;

function context(
  overrides: Partial<PurposeAvailabilityContext> = {},
): PurposeAvailabilityContext {
  return {
    tenant_id: "00000000-0000-4000-8000-000000000001",
    gate_status: {},
    issuer_proof: {
      verified_us_issuer: false,
      active_ca_registered_charity_issuer: false,
    },
    registered_safe_data_views: [],
    ...overrides,
  };
}

/**
 * A context whose non-official gates all pass and whose issuer proof is fully
 * present — the "domain-ready fixture". Even here, official purposes must stay
 * dark under the default fail-closed port.
 */
function domainReadyContext(): PurposeAvailabilityContext {
  return context({
    gate_status: {
      us_legal_finance_review: true,
      core_d3_renderer_qualified: true,
      core_d4_artifact_pipeline: true,
      phase19_statement_seam: true,
      ca_pack_active: true,
      ca_issuer_coverage_case_proof: true,
      phase14_tribute_contract: true,
      phase16_pledge_contract: true,
    },
    issuer_proof: {
      verified_us_issuer: true,
      active_ca_registered_charity_issuer: true,
    },
    registered_safe_data_views: ["custom.registered_safe_view"],
    requested_data_view: "custom.registered_safe_view",
  });
}

describe("resolvePurposeAvailability", () => {
  it("keeps every official purpose production-dark under the default port, even domain-ready", async () => {
    const port = createFailClosedQualificationPort();

    for (const purposeId of OFFICIAL_PURPOSE_IDS) {
      const result = await resolvePurposeAvailability(
        { purpose_id: purposeId, context: domainReadyContext() },
        port,
      );
      expect(result.state, purposeId).toBe("dark");
      expect(result.causes.length).toBeGreaterThan(0);
      expect(result.qualification_outcome).toBe("not_ready");
    }
  });

  it("supports an official purpose only for an affirmative current exact qualified result", async () => {
    const qualifiedPort = createStaticQualificationPort({
      "us.contribution_acknowledgment.single@1": "qualified",
    });

    const supported = await resolvePurposeAvailability(
      {
        purpose_id: "us.contribution_acknowledgment.single@1",
        context: domainReadyContext(),
      },
      qualifiedPort,
    );
    expect(supported.state).toBe("supported");
    expect(supported.causes).toEqual([]);

    // The same port qualifies only that exact purpose; a sibling stays dark.
    const sibling = await resolvePurposeAvailability(
      { purpose_id: "us.qcd.acknowledgment@1", context: domainReadyContext() },
      qualifiedPort,
    );
    expect(sibling.state).toBe("dark");
  });

  it("treats not-ready, expired, and revoked evidence as dark with distinct safe causes", async () => {
    const cases = [
      { outcome: "not_ready", code: "contract_dark" },
      { outcome: "expired", code: "qualification_expired" },
      { outcome: "revoked", code: "qualification_revoked" },
    ] as const;

    for (const { outcome, code } of cases) {
      const port = createStaticQualificationPort({
        "us.contribution_acknowledgment.single@1": outcome,
      });
      const result = await resolvePurposeAvailability(
        {
          purpose_id: "us.contribution_acknowledgment.single@1",
          context: domainReadyContext(),
        },
        port,
      );
      expect(result.state).toBe("dark");
      expect(result.causes.map((item) => item.code)).toContain(code);
    }
  });

  it("rejects qualification evidence that names a different purpose", async () => {
    const confusedPort: DocumentQualificationAvailabilityPort = {
      async checkPurposeQualification() {
        return {
          outcome: "qualified",
          purpose_id: "us.qcd.acknowledgment@1",
          checked_at: new Date().toISOString(),
        };
      },
    };

    const result = await resolvePurposeAvailability(
      {
        purpose_id: "us.contribution_acknowledgment.single@1",
        context: domainReadyContext(),
      },
      confusedPort,
    );
    expect(result.state).toBe("dark");
  });

  it("makes Canadian official purposes structurally absent while the pack is inactive", async () => {
    const port = createStaticQualificationPort({
      "ca.official_receipt.individual_cash@1": "qualified",
    });
    const inactive = domainReadyContext();
    const result = await resolvePurposeAvailability(
      {
        purpose_id: "ca.official_receipt.individual_cash@1",
        context: {
          ...inactive,
          gate_status: { ...inactive.gate_status, ca_pack_active: false },
        },
      },
      port,
    );

    expect(result.state).toBe("absent");
    expect(result.causes.map((item) => item.code)).toContain(
      "jurisdiction_not_active",
    );

    // Structural absence also removes the purpose from contextual listings.
    const listed = listDocumentPurposeContracts({
      ...inactive,
      gate_status: { ...inactive.gate_status, ca_pack_active: false },
    });
    expect(
      listed.some(
        (contract) =>
          contract.purpose_key === "ca.official_receipt.individual_cash",
      ),
    ).toBe(false);
    expect(listDocumentPurposeContracts()).toHaveLength(11);
  });

  it("keeps an official purpose dark when the context lacks issuer proof, even if the port would qualify it", async () => {
    const port = createStaticQualificationPort({
      "us.contribution_acknowledgment.single@1": "qualified",
      "ca.official_receipt.individual_cash@1": "qualified",
    });

    const noUsProof = domainReadyContext();
    noUsProof.issuer_proof.verified_us_issuer = false;
    const us = await resolvePurposeAvailability(
      {
        purpose_id: "us.contribution_acknowledgment.single@1",
        context: noUsProof,
      },
      port,
    );
    expect(us.state).toBe("dark");
    expect(us.causes.map((item) => item.code)).toContain(
      "issuer_proof_missing",
    );

    const noCaProof = domainReadyContext();
    noCaProof.issuer_proof.active_ca_registered_charity_issuer = false;
    const ca = await resolvePurposeAvailability(
      {
        purpose_id: "ca.official_receipt.individual_cash@1",
        context: noCaProof,
      },
      port,
    );
    expect(ca.state).toBe("dark");
    expect(ca.causes.map((item) => item.code)).toContain(
      "issuer_proof_missing",
    );
  });

  it("resolves governed purposes from their launch gates", async () => {
    const port = createFailClosedQualificationPort();

    const gatesUnmet = await resolvePurposeAvailability(
      { purpose_id: "tribute.notification@1", context: context() },
      port,
    );
    expect(gatesUnmet.state).toBe("dark");
    expect(gatesUnmet.causes.map((item) => item.code)).toContain(
      "launch_gate_unmet",
    );
    expect(gatesUnmet.causes[0]?.gate).toBe("phase14_tribute_contract");

    const gatesMet = await resolvePurposeAvailability(
      {
        purpose_id: "tribute.notification@1",
        context: context({ gate_status: { phase14_tribute_contract: true } }),
      },
      port,
    );
    expect(gatesMet.state).toBe("supported");
  });

  it("supports custom business documents only for a registered safe data view", async () => {
    const port = createFailClosedQualificationPort();

    const unregistered = await resolvePurposeAvailability(
      {
        purpose_id: "custom.business_document@1",
        context: context({
          registered_safe_data_views: [],
          requested_data_view: "custom.registered_safe_view",
        }),
      },
      port,
    );
    expect(unregistered.state).toBe("dark");
    expect(unregistered.causes.map((item) => item.code)).toContain(
      "data_view_not_registered",
    );

    const registered = await resolvePurposeAvailability(
      {
        purpose_id: "custom.business_document@1",
        context: context({
          registered_safe_data_views: ["custom.registered_safe_view"],
          requested_data_view: "custom.registered_safe_view",
        }),
      },
      port,
    );
    expect(registered.state).toBe("supported");
  });

  it("returns absent with a safe cause for unknown purposes", async () => {
    const port = createFailClosedQualificationPort();
    const result = await resolvePurposeAvailability(
      { purpose_id: "us.invented.purpose@1", context: domainReadyContext() },
      port,
    );

    expect(result.state).toBe("absent");
    expect(result.causes.map((item) => item.code)).toEqual(["purpose_unknown"]);
    expect(JSON.stringify(result)).not.toContain("custom.business_document");
  });
});

describe("the public admission adapter", () => {
  it("admits a supported purpose with the catalog digest pin and allocates nothing", async () => {
    const result = await admitDocumentPurpose(
      {
        purpose_id: "tribute.notification@1",
        context: context({ gate_status: { phase14_tribute_contract: true } }),
      },
      { qualificationPort: createFailClosedQualificationPort() },
    );

    expect(result.admitted).toBe(true);
    if (result.admitted) {
      expect(result.purpose_id).toBe("tribute.notification@1");
      expect(result.lane).toBe("governed_business");
      expect(result.catalog_digest).toBe(getDocumentPurposeCatalogDigest());
      // No artifact/document/reference identity exists at this seam.
      expect(result).not.toHaveProperty("artifact_id");
      expect(result).not.toHaveProperty("document_id");
    }
  });

  it("keeps a known dark purpose dark through admission", async () => {
    const result = await admitDocumentPurpose(
      {
        purpose_id: "us.contribution_acknowledgment.single@1",
        context: domainReadyContext(),
      },
      { qualificationPort: createFailClosedQualificationPort() },
    );

    expect(result.admitted).toBe(false);
    if (!result.admitted) {
      expect(result.state).toBe("dark");
      expect(result.causes.length).toBeGreaterThan(0);
    }
  });

  it("rejects unknown and proof-missing purposes before any artifact seam is invoked", async () => {
    const qualificationSpy = vi.fn(async (input: { purpose_id: string }) => ({
      outcome: "qualified" as const,
      purpose_id: input.purpose_id,
      checked_at: new Date().toISOString(),
    }));
    const port: DocumentQualificationAvailabilityPort = {
      checkPurposeQualification: qualificationSpy,
    };

    const unknown = await admitDocumentPurpose(
      { purpose_id: "nope@1", context: domainReadyContext() },
      { qualificationPort: port },
    );
    expect(unknown.admitted).toBe(false);
    if (!unknown.admitted) expect(unknown.state).toBe("absent");
    // Unknown purposes never even reach the qualification port.
    expect(qualificationSpy).not.toHaveBeenCalled();

    const missingProof = domainReadyContext();
    missingProof.issuer_proof.verified_us_issuer = false;
    const proofMissing = await admitDocumentPurpose(
      {
        purpose_id: "us.contribution_acknowledgment.single@1",
        context: missingProof,
      },
      { qualificationPort: port },
    );
    expect(proofMissing.admitted).toBe(false);
    if (!proofMissing.admitted) {
      expect(proofMissing.causes.map((item) => item.code)).toContain(
        "issuer_proof_missing",
      );
    }
    // Structural context failures short-circuit before qualification.
    expect(qualificationSpy).not.toHaveBeenCalled();
  });
});
