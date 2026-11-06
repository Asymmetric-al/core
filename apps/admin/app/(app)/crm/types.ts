import type { CrmDonorDetailResponse, CrmGridRow } from "@asym/database/types";
import type { Badge } from "@asym/ui/components/shadcn/badge";
import type { ComponentProps } from "react";

type BadgeVariant = ComponentProps<typeof Badge>["variant"];

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
    assignedMissionaryName:
      detail.support.byMissionary[0]?.missionaryName ?? null,
    avatarUrl: donor.avatarUrl,
    email: donor.email,
    phone: donor.phone,
    notesPreview: donor.notesPreview,
    createdAt,
    updatedAt,
    activities: [],
  };
}

export const PORTAL_BADGE_VARIANT: Record<
  CrmGridRow["portalAccessLabel"],
  BadgeVariant
> = {
  linked: "success",
  none: "secondary",
};
