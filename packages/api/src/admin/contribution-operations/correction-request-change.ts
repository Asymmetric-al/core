import { correctionEffectiveValues } from "./correction-effective-values";
import { formatSharedContributionAmount } from "../contribution-shared/row-contract";

import type { ContributionActionType } from "./types";
import type { ContributionAdjustmentEffectiveValues } from "../contribution-shared/effective-values";

/** One line of a pending correction's change: what it is now, what it becomes. */
export interface CorrectionChangeLine {
  label: string;
  from: string | null;
  to: string;
}

/** The gift as it stands, for the "from" side of a change. */
export interface CorrectionChangeCurrent {
  amountCents: number;
  currencyCode: string;
  fundId: string | null;
  fundName: string | null;
  missionaryId: string | null;
  missionaryName: string | null;
  paymentStatus: string | null;
  designationLineCount: number;
  donorId: string | null;
  donorName: string | null;
}

/** Display names for the funds, missionaries and donors a payload refers to. */
export interface CorrectionChangeNames {
  funds: ReadonlyMap<string, string>;
  missionaries: ReadonlyMap<string, string>;
  donors: ReadonlyMap<string, string>;
}

/**
 * Refund and donor relink requests go through the same approval flow as
 * corrections but are not adjustments, so their payloads are read here
 * (`refund {amount}`, `donor_relink {donorId}`), matching the commands.
 */
function describeNonAdjustment(
  actionType: string,
  payload: Record<string, unknown>,
  current: CorrectionChangeCurrent,
  names: CorrectionChangeNames,
): CorrectionChangeLine[] | null | undefined {
  if (actionType === "refund") {
    const amount = payload.amount;
    if (
      typeof amount !== "number" ||
      !Number.isSafeInteger(amount) ||
      amount <= 0
    ) {
      return null;
    }
    return [
      {
        label: "Refund amount",
        from: null,
        to: formatSharedContributionAmount(amount, current.currencyCode),
      },
    ];
  }
  if (actionType === "donor_relink") {
    const donorId = payload.donorId;
    if (typeof donorId !== "string" || !donorId.trim()) return null;
    return [
      {
        label: "Donor",
        from: current.donorName ?? (current.donorId ? "Unknown donor" : "None"),
        to: names.donors.get(donorId.trim()) ?? "Unknown donor",
      },
    ];
  }
  return undefined;
}

function readProposed(
  actionType: string,
  payload: Record<string, unknown>,
): ContributionAdjustmentEffectiveValues | null {
  try {
    return correctionEffectiveValues(
      actionType as ContributionActionType,
      payload,
    );
  } catch {
    return null;
  }
}

function sentenceCase(value: string): string {
  const words = value.replace(/[_-]+/g, " ").trim().toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function fundLabel(id: string | null, names: CorrectionChangeNames): string {
  if (!id) return "None";
  return names.funds.get(id) ?? "Unknown fund";
}

function missionaryLabel(
  id: string | null,
  names: CorrectionChangeNames,
): string {
  if (!id) return "None";
  return names.missionaries.get(id) ?? "Unknown missionary";
}

/**
 * What a pending correction request would change, as labelled
 * current → proposed lines for its approver. Built from the request's own
 * stored payload, so each request carries its own context. Returns null when
 * the payload cannot be read (malformed, or a correction type with no
 * operation adapter): the approver then cannot see the change, and the UI
 * must not offer approval.
 */
export function describeCorrectionRequestChange(input: {
  actionType: string;
  payload: Record<string, unknown>;
  current: CorrectionChangeCurrent;
  names: CorrectionChangeNames;
}): CorrectionChangeLine[] | null {
  const direct = describeNonAdjustment(
    input.actionType,
    input.payload,
    input.current,
    input.names,
  );
  if (direct !== undefined) return direct;
  const proposed = readProposed(input.actionType, input.payload);
  if (!proposed) return null;
  const { current, names } = input;
  const lines: CorrectionChangeLine[] = [];

  if (proposed.amountCents !== undefined) {
    lines.push({
      label: "Amount",
      from: formatSharedContributionAmount(
        current.amountCents,
        current.currencyCode,
      ),
      to: formatSharedContributionAmount(
        proposed.amountCents,
        current.currencyCode,
      ),
    });
  }
  if (proposed.designationLines !== undefined) {
    const count = current.designationLineCount;
    lines.push({
      label: "Designation",
      from: `${count} ${count === 1 ? "line" : "lines"}`,
      to: proposed.designationLines
        .map((line) => {
          const fund = fundLabel(line.fundId, names);
          const missionary = line.missionaryId
            ? ` (${missionaryLabel(line.missionaryId, names)})`
            : "";
          return `${fund}${missionary} ${formatSharedContributionAmount(
            line.amountCents,
            current.currencyCode,
          )}`;
        })
        .join("; "),
    });
  }
  if (proposed.fundId !== undefined) {
    lines.push({
      label: "Fund",
      from: current.fundName ?? fundLabel(current.fundId, names),
      to: fundLabel(proposed.fundId, names),
    });
  }
  if (proposed.missionaryId !== undefined) {
    lines.push({
      label: "Missionary",
      from:
        current.missionaryName ?? missionaryLabel(current.missionaryId, names),
      to: missionaryLabel(proposed.missionaryId, names),
    });
  }
  if (proposed.paymentStatus !== undefined) {
    lines.push({
      label: "Payment status",
      from: current.paymentStatus ? sentenceCase(current.paymentStatus) : null,
      to: sentenceCase(proposed.paymentStatus),
    });
  }
  return lines.length > 0 ? lines : null;
}

/**
 * The fund and missionary ids pending requests refer to, so the detail
 * loader can name them in one query each. Unreadable payloads contribute
 * nothing.
 */
export function correctionRequestReferenceIds(
  requests: ReadonlyArray<{
    actionType: string;
    payload: Record<string, unknown>;
  }>,
): { fundIds: string[]; missionaryIds: string[]; donorIds: string[] } {
  const fundIds = new Set<string>();
  const missionaryIds = new Set<string>();
  const donorIds = new Set<string>();
  for (const request of requests) {
    if (request.actionType === "donor_relink") {
      const donorId = request.payload.donorId;
      if (typeof donorId === "string" && donorId.trim()) {
        donorIds.add(donorId.trim());
      }
      continue;
    }
    const proposed = readProposed(request.actionType, request.payload);
    if (!proposed) continue;
    if (proposed.fundId) fundIds.add(proposed.fundId);
    if (proposed.missionaryId) missionaryIds.add(proposed.missionaryId);
    for (const line of proposed.designationLines ?? []) {
      if (line.fundId) fundIds.add(line.fundId);
      if (line.missionaryId) missionaryIds.add(line.missionaryId);
    }
  }
  return {
    fundIds: [...fundIds],
    missionaryIds: [...missionaryIds],
    donorIds: [...donorIds],
  };
}
