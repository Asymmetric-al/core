/**
 * Effective contribution values (ADR-CD-004).
 *
 * Corrections and refunds never rewrite original donation truth. They are
 * persisted as immutable adjustment records linked to `donation.id`, and the
 * current effective view of a gift derives from the original donation plus
 * every applied adjustment in chronological order.
 */

export interface ContributionAdjustmentEffectiveValues {
  amountCents?: number;
  fundId?: string | null;
  missionaryId?: string | null;
  paymentStatus?: string;
  /** Replacement designation lines for allocation corrections. */
  designationLines?: Array<{
    id: string;
    amountCents: number;
    fundId: string | null;
    missionaryId: string | null;
    memo: string | null;
  }>;
}

export interface ContributionAdjustmentRecord {
  id: string;
  adjustmentType: string;
  status: "applied" | "reversed";
  effectiveValues: ContributionAdjustmentEffectiveValues;
  reason: string;
  actorProfileId: string | null;
  sourceSurface: string;
  createdAt: string;
}

export interface OriginalContributionValues {
  amountCents: number;
  fundId: string | null;
  missionaryId: string | null;
  paymentStatus: string;
}

export interface EffectiveContributionResult {
  effective: OriginalContributionValues;
  /**
   * Replacement designation lines from the latest applied allocation
   * adjustment, if any. `null` means the staged allocation lines stand.
   */
  effectiveDesignationLines: NonNullable<
    ContributionAdjustmentEffectiveValues["designationLines"]
  > | null;
  changedFields: string[];
  materiallyDiffers: boolean;
}

/** Maps a `contribution_adjustments` database row to an adjustment record. */
export function mapContributionAdjustmentRow(
  row: Record<string, unknown>,
): ContributionAdjustmentRecord {
  return {
    id: typeof row.id === "string" ? row.id : "",
    adjustmentType:
      typeof row.adjustment_type === "string" ? row.adjustment_type : "unknown",
    // Fail closed: only an explicit "applied" status affects effective values. The DB
    // CHECK constrains status to ('applied','reversed'); treating any unexpected value as
    // not-applied means an unapproved/unknown row can never change displayed financial truth.
    status: row.status === "applied" ? "applied" : "reversed",
    effectiveValues:
      typeof row.effective_values === "object" && row.effective_values !== null
        ? (row.effective_values as ContributionAdjustmentEffectiveValues)
        : {},
    reason: typeof row.reason === "string" ? row.reason : "",
    actorProfileId:
      typeof row.actor_profile_id === "string" ? row.actor_profile_id : null,
    sourceSurface:
      typeof row.source_surface === "string" ? row.source_surface : "api",
    createdAt:
      typeof row.created_at === "string"
        ? row.created_at
        : new Date(0).toISOString(),
  };
}

export function deriveEffectiveContribution(input: {
  original: OriginalContributionValues;
  adjustments: ContributionAdjustmentRecord[];
}): EffectiveContributionResult {
  const applied = input.adjustments
    .filter((adjustment) => adjustment.status === "applied")
    .sort(
      (left, right) =>
        new Date(left.createdAt).getTime() -
        new Date(right.createdAt).getTime(),
    );

  const effective: OriginalContributionValues = { ...input.original };
  let effectiveDesignationLines: EffectiveContributionResult["effectiveDesignationLines"] =
    null;

  for (const adjustment of applied) {
    const values = adjustment.effectiveValues;
    if (values.amountCents !== undefined) {
      effective.amountCents = values.amountCents;
    }
    if (values.fundId !== undefined) {
      effective.fundId = values.fundId;
    }
    if (values.missionaryId !== undefined) {
      effective.missionaryId = values.missionaryId;
    }
    if (values.paymentStatus !== undefined) {
      effective.paymentStatus = values.paymentStatus;
    }
    if (values.designationLines !== undefined) {
      effectiveDesignationLines = values.designationLines;
    }
  }

  const changedFields: string[] = (
    Object.keys(input.original) as Array<keyof OriginalContributionValues>
  ).filter((field) => effective[field] !== input.original[field]);
  if (effectiveDesignationLines) {
    changedFields.push("designationLines");
  }

  return {
    effective,
    effectiveDesignationLines,
    changedFields,
    materiallyDiffers: changedFields.length > 0,
  };
}
