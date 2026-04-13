import type { CrmGridRow } from "@asym/database/types";

export type { CrmGridRow };

type DonorRow = {
  id: string;
  profile_id: string | null;
  missionary_id: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  location: string | null;
  type: string | null;
  status: string | null;
  total_given: number | string | null;
  last_gift_date: string | null;
  tags: string[] | null;
  organization: string | null;
  title: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

function toNumber(value: number | string | null | undefined): number {
  if (value == null) return 0;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

function previewNotes(
  notes: string | null | undefined,
  max = 120,
): string | null {
  if (!notes?.trim()) return null;
  const t = notes.trim();
  return t.length <= max ? t : `${t.slice(0, max)}…`;
}

export function buildCrmGridRow(
  donor: DonorRow,
  missionaryDisplayName: string | null,
): CrmGridRow {
  const linked = donor.profile_id != null && donor.profile_id.length > 0;
  return {
    id: donor.id,
    recordType: donor.type,
    displayName: donor.name,
    title: donor.title,
    primaryOrganization: donor.organization,
    primaryContactLine: donor.title,
    location: donor.location,
    lifecycleStatus: donor.status,
    lastGiftAt: donor.last_gift_date,
    lifetimeGiving: toNumber(donor.total_given),
    fundsGivenToSummary: null,
    lastTouchAt: donor.updated_at,
    nextTaskSummary: null,
    portalAccessLabel: linked ? "linked" : "none",
    linkedAuthUserId: donor.profile_id,
    tags: donor.tags ?? [],
    assignedMissionaryName: missionaryDisplayName,
    avatarUrl: donor.avatar_url,
    email: donor.email,
    phone: donor.phone,
    notesPreview: previewNotes(donor.notes),
    createdAt: donor.created_at,
    updatedAt: donor.updated_at,
  };
}
