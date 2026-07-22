import { DOCUMENT_PURPOSE_CATALOG } from "./catalog";
import { isDocumentPurposeId } from "./lookup";

import type {
  DocumentPurposeContract,
  DocumentQualificationAvailabilityPort,
  DocumentQualificationEvidence,
  DocumentQualificationOutcome,
  PurposeAvailabilityCause,
  PurposeAvailabilityContext,
  PurposeAvailabilityResult,
} from "./types";

export interface ResolvePurposeAvailabilityInput {
  purpose_id: string;
  context: PurposeAvailabilityContext;
}

/**
 * The default production adapter always fails closed: no purpose can present
 * itself as qualified until T53 backs this same interface with current exact
 * evidence. There is deliberately no environment flag around this.
 */
export function createFailClosedQualificationPort(): DocumentQualificationAvailabilityPort {
  return {
    async checkPurposeQualification({ purpose_id }) {
      return {
        outcome: "not_ready",
        purpose_id,
        checked_at: new Date().toISOString(),
      };
    },
  };
}

/** Deterministic test fake: answers from an explicit outcome map only. */
export function createStaticQualificationPort(
  outcomes: Readonly<Record<string, DocumentQualificationOutcome>>,
  now = () => new Date(),
): DocumentQualificationAvailabilityPort {
  return {
    async checkPurposeQualification({ purpose_id }) {
      return {
        outcome: outcomes[purpose_id] ?? "not_ready",
        purpose_id,
        checked_at: now().toISOString(),
      };
    },
  };
}

function cause(
  code: PurposeAvailabilityCause["code"],
  explanation: string,
  gate?: PurposeAvailabilityCause["gate"],
): PurposeAvailabilityCause {
  return gate ? { code, gate, explanation } : { code, explanation };
}

function resolveOfficialQualification(
  purposeId: string,
  evidence: DocumentQualificationEvidence,
): PurposeAvailabilityCause[] {
  if (evidence.purpose_id !== purposeId) {
    return [
      cause(
        "qualification_not_ready",
        "Qualification evidence does not name this exact purpose; only a current exact result activates it.",
      ),
    ];
  }

  switch (evidence.outcome) {
    case "qualified": {
      if (evidence.expires_at !== undefined) {
        const expiresAt = Date.parse(evidence.expires_at);
        if (!Number.isFinite(expiresAt)) {
          return [
            cause(
              "qualification_not_ready",
              "Qualification evidence has no valid expiry; only a current exact result activates this purpose.",
            ),
          ];
        }
        if (expiresAt <= Date.now()) {
          return [
            cause(
              "qualification_expired",
              "The recorded qualification evidence has expired; the purpose stays dark until it is re-proved.",
            ),
          ];
        }
      }
      return [];
    }
    case "expired":
      return [
        cause(
          "qualification_expired",
          "The recorded qualification evidence has expired; the purpose stays dark until it is re-proved.",
        ),
      ];
    case "revoked":
      return [
        cause(
          "qualification_revoked",
          "Qualification for this purpose was revoked; the purpose stays dark.",
        ),
      ];
    case "not_ready":
      return [
        cause(
          "contract_dark",
          "This purpose launches production-dark and no current qualification evidence exists yet.",
        ),
      ];
  }
}

function resolveOfficialContext(
  contract: DocumentPurposeContract,
  context: PurposeAvailabilityContext,
): PurposeAvailabilityCause[] {
  const causes: PurposeAvailabilityCause[] = [];

  if (
    contract.legal_issuer_requirement === "verified_us_issuer" &&
    !context.issuer_proof.verified_us_issuer
  ) {
    causes.push(
      cause(
        "issuer_proof_missing",
        "The context carries no verified U.S. issuer proof, so the official purpose cannot activate.",
      ),
    );
  }
  if (
    contract.legal_issuer_requirement ===
      "active_ca_registered_charity_issuer" &&
    !context.issuer_proof.active_ca_registered_charity_issuer
  ) {
    causes.push(
      cause(
        "issuer_proof_missing",
        "The context carries no active registered-charity issuer proof, so the official purpose cannot activate.",
      ),
    );
  }

  return causes;
}

function resolveGatedLaunch(
  contract: DocumentPurposeContract,
  context: PurposeAvailabilityContext,
): PurposeAvailabilityCause[] {
  const causes: PurposeAvailabilityCause[] = [];

  for (const gate of contract.launch.gates) {
    if (gate === "registered_safe_data_view") {
      const requested = context.requested_data_view;
      if (
        !requested ||
        !context.registered_safe_data_views.includes(requested)
      ) {
        causes.push(
          cause(
            "data_view_not_registered",
            "General documents are supported only for a registered safe Approved Data View.",
            gate,
          ),
        );
      }
      continue;
    }

    if (context.gate_status[gate] !== true) {
      causes.push(
        cause(
          "launch_gate_unmet",
          `Launch gate ${gate} has not passed for this context.`,
          gate,
        ),
      );
    }
  }

  return causes;
}

/**
 * One fail-closed answer combining contract launch state, injected context,
 * and the shared qualification port. The resolver never queries CRM, infers
 * issuer proof, allocates identity, or renders anything.
 */
export async function resolvePurposeAvailability(
  input: ResolvePurposeAvailabilityInput,
  qualificationPort: DocumentQualificationAvailabilityPort,
): Promise<PurposeAvailabilityResult> {
  const { purpose_id, context } = input;

  if (!isDocumentPurposeId(purpose_id)) {
    return {
      purpose_id,
      state: "absent",
      causes: [
        cause(
          "purpose_unknown",
          "No such purpose exists in the code-owned catalog; unknown purposes never fall back to a general one.",
        ),
      ],
    };
  }

  const contract = DOCUMENT_PURPOSE_CATALOG[purpose_id];

  if (contract.launch.state === "absent_until_activation") {
    if (context.gate_status.ca_pack_active !== true) {
      return {
        purpose_id,
        state: "absent",
        causes: [
          cause(
            "jurisdiction_not_active",
            "The Canadian pack has not been deliberately activated, so this purpose is structurally absent.",
            "ca_pack_active",
          ),
        ],
      };
    }
  }

  if (contract.lane === "official_tax") {
    const contextCauses = resolveOfficialContext(contract, context);
    if (contextCauses.length > 0) {
      return { purpose_id, state: "dark", causes: contextCauses };
    }

    const evidence = await qualificationPort.checkPurposeQualification({
      purpose_id,
      tenant_id: context.tenant_id,
    });
    const qualificationCauses = resolveOfficialQualification(
      purpose_id,
      evidence,
    );
    if (qualificationCauses.length > 0) {
      return {
        purpose_id,
        state: "dark",
        causes: qualificationCauses,
        qualification_outcome: evidence.outcome,
      };
    }

    const gateCauses = resolveGatedLaunch(contract, context);
    if (gateCauses.length > 0) {
      return {
        purpose_id,
        state: "dark",
        causes: gateCauses,
        qualification_outcome: evidence.outcome,
      };
    }

    return {
      purpose_id,
      state: "supported",
      causes: [],
      qualification_outcome: evidence.outcome,
    };
  }

  const gateCauses = resolveGatedLaunch(contract, context);
  if (gateCauses.length > 0) {
    return { purpose_id, state: "dark", causes: gateCauses };
  }

  return { purpose_id, state: "supported", causes: [] };
}
