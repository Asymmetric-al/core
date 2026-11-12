import type { CrmDonorDetailResponse, CrmGridRow } from "@asym/database/types";
export type { CrmGridRow };

export type ActivityType =
  "note" | "call" | "email" | "meeting" | "stage_change" | "gift";

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
  /**
   * The owner's id (`donors.missionary_id`) when the record came from the
   * detail read. With `assignedMissionaryName` null it means the record has
   * an owner whose name that read does not carry (the drawer looks it up).
   * Grid rows leave it unset.
   */
  assignedMissionaryId?: string | null;
};

export function toCrmRecord(row: CrmGridRow): CrmRecord {
  return { ...row, activities: [] };
}

export function toCrmRecordFromDetail(
  detail: CrmDonorDetailResponse,
): CrmRecord {
  const donor = detail.donor;
  const createdAt = donor.createdAt ?? new Date(0).toISOString();
  const updatedAt = donor.updatedAt ?? createdAt;

  return {
    id: donor.id,
    recordType: donor.type,
    displayName: donor.name,
    title: donor.title,
    primaryOrganization: donor.organization,
    primaryContactLine: donor.email ?? donor.phone,
    location: donor.location,
    lifecycleStatus: donor.status,
    lastGiftAt: detail.support.lastGiftAt,
    lifetimeGiving: detail.support.lifetimeGivingCents,
    fundsGivenToSummary: detail.support.byFund[0]?.fundName ?? null,
    lastTouchAt: updatedAt,
    nextTaskSummary: null,
    portalAccessLabel:
      donor.profileId != null && donor.profileId.length > 0 ? "linked" : "none",
    linkedAuthUserId: donor.profileId,
    tags: donor.tags,
    // The owner is `donors.missionary_id`, a profile id, named from profiles
    // by the detail read as the grid names it. Never the gift totals per
    // missionary (`support.byMissionary`), which are keyed by
    // `missionaries.id` and say who received gifts, not who owns the record.
    assignedMissionaryName: donor.missionaryName ?? null,
    assignedMissionaryId: donor.missionaryId,
    avatarUrl: donor.avatarUrl,
    email: donor.email,
    phone: donor.phone,
    notesPreview: donor.notesPreview,
    createdAt,
    updatedAt,
    activities: [],
  };
}
