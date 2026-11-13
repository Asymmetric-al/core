import { assertAllowedPaymentStateCorrectionStatus } from "./payment-status-allowlist";
import { ApiHttpError } from "../../shared/http-errors";
import { isRecord } from "../../shared/json-coerce";

import type { ContributionActionType } from "./types";
import type { ContributionAdjustmentEffectiveValues } from "../contribution-shared/effective-values";

function requireReferenceIdOrNull(
  value: unknown,
  field: string,
): string | null {
  if (value === null) {
    return null;
  }
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }
  throw new ApiHttpError(
    400,
    `${field} must be a non-empty id string or null.`,
  );
}

function optionalReferenceIdOrNull(
  value: unknown,
  field: string,
): string | null {
  if (value === undefined) {
    return null;
  }
  return requireReferenceIdOrNull(value, field);
}

/**
 * The effective values a correction payload would apply, validated the same
 * way the correction operation validates them. Shared by the operation
 * (which applies them) and the detail read model (which describes a pending
 * request's change to its approver).
 */
export function correctionEffectiveValues(
  actionType: ContributionActionType,
  payload: Record<string, unknown>,
): ContributionAdjustmentEffectiveValues {
  if (actionType === "amount_correction") {
    const amount = payload.amount;
    if (
      typeof amount !== "number" ||
      !Number.isSafeInteger(amount) ||
      amount < 0
    ) {
      throw new ApiHttpError(
        400,
        "amount must be a non-negative safe integer.",
      );
    }
    return { amountCents: amount };
  }

  if (
    actionType === "designation_correction" ||
    actionType === "fund_correction"
  ) {
    return { fundId: requireReferenceIdOrNull(payload.fundId, "fundId") };
  }

  if (actionType === "allocation_correction") {
    const designationLines = payload.designationLines;
    if (Array.isArray(designationLines)) {
      const lines = designationLines.map((line, index) => {
        if (!isRecord(line)) {
          throw new ApiHttpError(400, "designationLines must be objects.");
        }
        const amountCents = line.amountCents;
        if (
          typeof amountCents !== "number" ||
          !Number.isSafeInteger(amountCents) ||
          amountCents < 0
        ) {
          throw new ApiHttpError(
            400,
            "Each designation line needs a non-negative amountCents safe integer.",
          );
        }
        return {
          id:
            typeof line.id === "string" && line.id.trim()
              ? line.id.trim()
              : `line-${index + 1}`,
          amountCents,
          fundId: optionalReferenceIdOrNull(line.fundId, "fundId"),
          missionaryId: optionalReferenceIdOrNull(
            line.missionaryId,
            "missionaryId",
          ),
          memo: typeof line.memo === "string" ? line.memo : null,
        };
      });
      return { designationLines: lines };
    }

    return {
      fundId: optionalReferenceIdOrNull(payload.fundId, "fundId"),
      missionaryId: optionalReferenceIdOrNull(
        payload.missionaryId,
        "missionaryId",
      ),
    };
  }

  if (actionType === "payment_state_correction") {
    const status = payload.status;
    if (typeof status !== "string" || status.trim().length === 0) {
      throw new ApiHttpError(400, "status is required.");
    }
    const normalizedStatus = status.trim();
    assertAllowedPaymentStateCorrectionStatus(normalizedStatus);
    return { paymentStatus: normalizedStatus };
  }

  throw new ApiHttpError(
    501,
    `${actionType} requires a dedicated operation adapter before it can be applied.`,
  );
}
