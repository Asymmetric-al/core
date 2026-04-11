import type { CrmGridRow } from "@asym/database/types";

export type { CrmGridRow };

export type ActivityType =
  | "note"
  | "call"
  | "email"
  | "meeting"
  | "stage_change"
  | "gift";

export interface Activity {
  id: string;
  type: ActivityType;
  date: string;
  title: string;
  description?: string;
  amount?: number;
}

/** Drawer model: grid row plus timeline (loaded incrementally later). */
export type CrmRecord = CrmGridRow & {
  activities: Activity[];
};

export function toCrmRecord(row: CrmGridRow): CrmRecord {
  return { ...row, activities: [] };
}

export const PORTAL_BADGE_CLASS: Record<
  CrmGridRow["portalAccessLabel"],
  string
> = {
  linked:
    "bg-emerald-50 text-emerald-800 border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900",
  none: "bg-muted text-muted-foreground border-border",
};
