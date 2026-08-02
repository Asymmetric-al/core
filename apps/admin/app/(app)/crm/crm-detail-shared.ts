import { toast } from "sonner";

import type {
  CrmGiftHistoryColumnSettings,
  CrmGiftHistoryFiltersSortSettings,
} from "@asym/database/types";

/** Placeholder shown for missing CRM record fields. */
export const EMPTY_CELL_VALUE = "N/A";

/**
 * Per-scope view settings patch: absent = unchanged, null = scoped reset,
 * value = replace (#272).
 */
export interface ViewSettingsPatch {
  pinnedActionId?: string | null;
  columns?: Partial<CrmGiftHistoryColumnSettings> | null;
  filtersSort?: Partial<CrmGiftHistoryFiltersSortSettings> | null;
  activeViewId?: string | null;
}

export function makeDisplayDate(value?: string | number | Date): Date {
  return value === undefined
    ? new globalThis.Date()
    : new globalThis.Date(value);
}

export function viewMutationErrorToast(error: unknown) {
  toast.error(
    error instanceof Error ? error.message : "Failed to update named views.",
  );
}
