import { ApiHttpError } from "../../../shared/http-errors";
import {
  isInlineContributionActionType,
  pickNextBestInlineContributionAction,
} from "../../contribution-operations/inline-actions";

import type {
  CrmGiftInlineActionEntry,
  CrmGiftInlineActionType,
} from "@asym/database/types";

/**
 * CRM row action preferences (issue #271, ADR-CD-021).
 *
 * Users may pin a preferred row action by stable operation id; tenant admins
 * may set a tenant default. Preferences are personalization only — resolution
 * always re-validates against the capability/state-filtered inline action
 * entries, so a pin or default can never bypass capabilities, row state,
 * tenant policy, blocked rules, or the shared operation contracts.
 */

export const CRM_GIFT_HISTORY_TABLE_ID = "crm.giftHistory";

/**
 * Version of the pinned-action preference schema. Stored preferences carry
 * the version they were written with; older ids are migrated forward through
 * the rename map below, and unknown (removed) ids resolve to null.
 */
export const CRM_ROW_ACTION_SCHEMA_VERSION = 1;

/** Operation ids renamed in earlier iterations of the operation registry. */
const RENAMED_ROW_ACTION_IDS: Record<string, CrmGiftInlineActionType> = {
  approve_gift: "approve_staged_gift",
  retry_crm_posting: "retry_staged_gift",
  send_receipt: "resend_receipt",
};

export function migrateCrmRowActionId(
  storedActionId: string | null,
): CrmGiftInlineActionType | null {
  if (!storedActionId) {
    return null;
  }

  if (isInlineContributionActionType(storedActionId)) {
    return storedActionId;
  }

  return RENAMED_ROW_ACTION_IDS[storedActionId] ?? null;
}

/**
 * Validates a stored/pinned operation id before persistence. Renamed ids are
 * written using the current stable id; unknown ids are rejected so saved
 * preferences never accumulate stale operation identifiers.
 */
export function normalizeCrmPinnedActionId(
  actionId: string | null,
): CrmGiftInlineActionType | null {
  if (actionId === null) {
    return null;
  }

  const migrated = migrateCrmRowActionId(actionId);
  if (!migrated) {
    throw new ApiHttpError(400, `Unknown operation id "${actionId}".`);
  }

  return migrated;
}

export interface CrmRowActionPreferenceInput {
  actionId: string | null;
  schemaVersion?: number;
}

export type CrmRowActionSource = "user_pin" | "tenant_default" | "system";

export interface ResolvedCrmRowAction {
  actionType: CrmGiftInlineActionType | null;
  source: CrmRowActionSource;
  explanation: string | null;
}

function humanizeActionId(actionId: string): string {
  return actionId.replace(/_/g, " ");
}

/**
 * Validates one stored preference against the row's inline action entries.
 * Returns the action when usable; otherwise records why it was skipped.
 */
function validatePreference(
  label: "Your pinned action" | "The tenant default action",
  preference: CrmRowActionPreferenceInput | null,
  entries: CrmGiftInlineActionEntry[],
  notes: string[],
): CrmGiftInlineActionType | null {
  if (!preference?.actionId) {
    return null;
  }

  const migrated = migrateCrmRowActionId(preference.actionId);
  if (!migrated) {
    notes.push(
      `${label} "${humanizeActionId(preference.actionId)}" no longer exists, so it was skipped.`,
    );
    return null;
  }

  const entry = entries.find((candidate) => candidate.actionType === migrated);
  if (!entry) {
    notes.push(
      `${label} "${humanizeActionId(migrated)}" isn't available to you on this gift, so it was skipped.`,
    );
    return null;
  }

  if (!entry.available) {
    const reason = entry.blockedReason ?? "It is blocked for this gift.";
    notes.push(
      `${label} "${humanizeActionId(migrated)}" is blocked: ${reason}`,
    );
    return null;
  }

  return migrated;
}

export function resolveCrmRowAction(input: {
  userPin: CrmRowActionPreferenceInput | null;
  tenantDefault: CrmRowActionPreferenceInput | null;
  entries: CrmGiftInlineActionEntry[];
}): ResolvedCrmRowAction {
  const notes: string[] = [];

  const pinnedAction = validatePreference(
    "Your pinned action",
    input.userPin,
    input.entries,
    notes,
  );
  if (pinnedAction) {
    return { actionType: pinnedAction, source: "user_pin", explanation: null };
  }

  const tenantAction = validatePreference(
    "The tenant default action",
    input.tenantDefault,
    input.entries,
    notes,
  );
  if (tenantAction) {
    return {
      actionType: tenantAction,
      source: "tenant_default",
      explanation: notes.length > 0 ? notes.join(" ") : null,
    };
  }

  return {
    actionType: pickNextBestInlineContributionAction(input.entries),
    source: "system",
    explanation: notes.length > 0 ? notes.join(" ") : null,
  };
}
