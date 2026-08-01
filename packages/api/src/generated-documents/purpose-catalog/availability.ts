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

const QUALIFICATION_FRESHNESS_WITHOUT_EXPIRY_MS = 5 * 60 * 1000;

/**
 * How far ahead of our own clock a port's `checked_at` may sit before we treat
 * it as a broken or forged clock rather than ordinary skew.
 *
 * The resolver samples `now` once on entry and only afterwards awaits the
 * qualification port, so a port that stamps `checked_at` when it answers is
 * *always* at or ahead of `now`. With a zero tolerance a single millisecond
 * tick between the two reads flipped a qualified purpose to `dark`, which made
 * `document-purpose-availability.test.ts` fail intermittently under load. A
 * real port is a separate process anyway, so its clock is never exactly ours.
 *
 * Five seconds absorbs call latency and normal NTP skew while still rejecting
 * evidence stamped meaningfully in the future.
 */
const QUALIFICATION_MAX_CLOCK_SKEW_MS = 5 * 1000;

export interface ResolvePurposeAvailabilityInput {
  purpose_id: string;
  context: PurposeAvailabilityContext;
  /** Injected clock for deterministic freshness checks. */
  now?: () => Date;
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
  now: Date,
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
      const nowMs = now.getTime();
      const checkedAtMs = Date.parse(evidence.checked_at);
      if (
        !Number.isFinite(nowMs) ||
        !Number.isFinite(checkedAtMs) ||
        checkedAtMs - nowMs > QUALIFICATION_MAX_CLOCK_SKEW_MS
      ) {
        return [
          cause(
            "qualification_not_ready",
            "Qualification evidence carries an invalid or future check time; only a current result activates an official purpose.",
          ),
        ];
      }

      if (evidence.expires_at !== undefined) {
        const expiresAtMs = Date.parse(evidence.expires_at);
        if (!Number.isFinite(expiresAtMs) || expiresAtMs <= nowMs) {
          return [
            cause(
              "qualification_expired",
              "The qualification evidence has expired or carries an invalid expiry; only a current result activates an official purpose.",
            ),
          ];
        }
      } else if (
        nowMs - checkedAtMs >
        QUALIFICATION_FRESHNESS_WITHOUT_EXPIRY_MS
      ) {
        return [
          cause(
            "qualification_expired",
            "Qualification evidence has no expiry and its freshness window has elapsed; only a current result activates an official purpose.",
          ),
        ];
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
    default:
      // A future adapter returning an unrecognized outcome must fail closed,
      // never crash a caller or accidentally activate a tax purpose.
      return [
        cause(
          "qualification_not_ready",
          "The qualification port returned an unrecognized outcome; unknown evidence keeps the purpose dark.",
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
 * and the shared qualification port. Official purposes require BOTH every
 * declared launch gate and an affirmative current exact `qualified` result —
 * qualification can never bypass the code-owned launch gates, and passing
 * gates can never substitute for qualification evidence. The resolver never
 * queries CRM, infers issuer proof, allocates, or renders.
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
    const structuralCauses = [
      ...resolveGatedLaunch(contract, context),
      ...resolveOfficialContext(contract, context),
    ];
    if (structuralCauses.length > 0) {
      return { purpose_id, state: "dark", causes: structuralCauses };
    }

    let evidence: DocumentQualificationEvidence;
    try {
      evidence = await qualificationPort.checkPurposeQualification({
        purpose_id,
        tenant_id: context.tenant_id,
      });
    } catch {
      return {
        purpose_id,
        state: "dark",
        causes: [
          cause(
            "qualification_not_ready",
            "Qualification evidence could not be checked; the official purpose stays dark.",
          ),
        ],
      };
    }
    const qualificationCauses = resolveOfficialQualification(
      purpose_id,
      evidence,
      (input.now ?? (() => new Date()))(),
    );
    if (qualificationCauses.length > 0) {
      return {
        purpose_id,
        state: "dark",
        causes: qualificationCauses,
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
