import {
  normalizeSharedCurrencyCode,
  SHARED_GENERAL_FUND_NAME,
} from "./row-contract";

import type {
  ContributionDesignationLine,
  ContributionDesignationSet,
  ContributionDesignationFundType,
  SharedContributionDesignationSummary,
} from "@asym/database/types";

/**
 * Designation set builder (ADR-CD-008 / ADR-CD-009 / ADR-CD-010).
 *
 * A gift's complete designation set is financial truth: every line is equal
 * (no primary), every line resolves to exactly one fund (General Fund when
 * donor intent is unspecified), and the set must reconcile to the effective
 * gift amount. CRM rows, Hub rows, and contribution detail all derive their
 * designation displays from this one builder.
 */

export interface DesignationFundInput {
  id: string;
  name: string | null;
  missionary_id: string | null;
  goal_amount: number | null;
  start_date: string | null;
  end_date: string | null;
}

export interface DesignationAllocationInput {
  id: string;
  amount: number;
  fund_id: string | null;
  missionary_id: string | null;
  memo: string | null;
}

export interface BuildContributionDesignationSetInput {
  donation: {
    id: string;
    amount: number;
    currency: string;
    fund_id: string | null;
    missionary_id: string | null;
  };
  /** Effective gift amount the set must reconcile to (original + adjustments). */
  effectiveAmountCents: number;
  allocations: DesignationAllocationInput[];
  funds: Map<string, DesignationFundInput>;
  /** Missionary id → display name. */
  missionaries: Map<string, string | null>;
}

/**
 * Fund subtype derivation per the designation language ADR: missionary funds
 * support a missionary, campaigns have a goal and a defined season, projects
 * have a goal without a season, and everything else is a general fund.
 */
export function deriveFundType(
  fund: DesignationFundInput | null,
): ContributionDesignationFundType {
  if (!fund) {
    return "general";
  }
  if (fund.missionary_id) {
    return "missionary";
  }
  if (fund.start_date || fund.end_date) {
    return "campaign";
  }
  if ((fund.goal_amount ?? 0) > 0) {
    return "project";
  }
  return "general";
}

function buildLine(input: {
  id: string;
  amountCents: number;
  currencyCode: string;
  fund: DesignationFundInput | null;
  fundId: string | null;
  missionaryId: string | null;
  missionaryName: string | null;
  memo: string | null;
  issues: string[];
}): ContributionDesignationLine {
  const { fund, issues } = input;
  const hasFund = Boolean(fund);

  if (!hasFund && input.fundId) {
    issues.push(
      `Designation line ${input.id} references an unknown fund and was defaulted to ${SHARED_GENERAL_FUND_NAME}.`,
    );
  }

  return {
    id: input.id,
    amountCents: input.amountCents,
    currencyCode: input.currencyCode,
    fundId: fund?.id ?? null,
    fundName: fund?.name?.trim() || SHARED_GENERAL_FUND_NAME,
    fundType: deriveFundType(fund),
    missionaryId: input.missionaryId,
    missionaryName: input.missionaryName,
    memo: input.memo,
    restriction: null,
    correctionState: "none",
  };
}

export function buildContributionDesignationSet(
  input: BuildContributionDesignationSetInput,
): ContributionDesignationSet {
  const currencyCode = normalizeSharedCurrencyCode(input.donation.currency);
  const issues: string[] = [];

  const resolveMissionaryName = (missionaryId: string | null) =>
    missionaryId ? (input.missionaries.get(missionaryId) ?? null) : null;

  let lines: ContributionDesignationLine[];

  if (input.allocations.length > 0) {
    lines = input.allocations.map((allocation) => {
      const fund = allocation.fund_id
        ? (input.funds.get(allocation.fund_id) ?? null)
        : null;
      if (!allocation.fund_id) {
        issues.push(
          `Designation line ${allocation.id} has no fund; donor intent defaulted to ${SHARED_GENERAL_FUND_NAME}.`,
        );
      }

      // Preserve missionary identity: prefer the allocation's own missionary, but a
      // missionary fund already carries its missionary relationship, so fall back to it
      // when the allocation leaves missionary_id null.
      const missionaryId =
        allocation.missionary_id ?? fund?.missionary_id ?? null;

      return buildLine({
        id: allocation.id,
        amountCents: allocation.amount,
        currencyCode,
        fund,
        fundId: allocation.fund_id,
        missionaryId,
        missionaryName: resolveMissionaryName(missionaryId),
        memo: allocation.memo,
        issues,
      });
    });
  } else {
    const fund = input.donation.fund_id
      ? (input.funds.get(input.donation.fund_id) ?? null)
      : null;

    const missionaryId =
      input.donation.missionary_id ?? fund?.missionary_id ?? null;

    lines = [
      buildLine({
        id: `donation:${input.donation.id}`,
        amountCents: input.effectiveAmountCents,
        currencyCode,
        fund,
        fundId: input.donation.fund_id,
        missionaryId,
        missionaryName: resolveMissionaryName(missionaryId),
        memo: null,
        issues,
      }),
    ];
  }

  const totalAmountCents = lines.reduce(
    (total, line) => total + line.amountCents,
    0,
  );
  const reconcilesToGiftAmount =
    totalAmountCents === input.effectiveAmountCents;

  if (!reconcilesToGiftAmount) {
    issues.push(
      `Designation lines total ${totalAmountCents} and do not reconcile to the effective gift amount ${input.effectiveAmountCents}.`,
    );
  }

  return {
    lines,
    totalAmountCents,
    reconcilesToGiftAmount,
    issues,
  };
}

/**
 * The one shared derivation for compact designation summaries (CRM rows, Hub
 * rows, chips). Split gifts summarize as a count so no line reads as primary.
 */
export function summarizeContributionDesignationSet(
  set: ContributionDesignationSet,
): SharedContributionDesignationSummary {
  if (set.lines.length === 1) {
    const line = set.lines[0]!;
    return {
      fundId: line.fundId,
      fundName: line.fundName,
      missionaryId: line.missionaryId,
      missionaryName: line.missionaryName,
      lineCount: 1,
    };
  }

  return {
    fundId: null,
    fundName: `${set.lines.length} designations`,
    missionaryId: null,
    missionaryName: null,
    lineCount: set.lines.length,
  };
}

