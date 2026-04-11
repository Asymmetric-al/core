/**
 * Shared CRM grid contract — server list routes and admin UI use the same shape.
 */
export interface CrmGridRow {
  id: string;
  recordType: string | null;
  displayName: string | null;
  title: string | null;
  primaryOrganization: string | null;
  primaryContactLine: string | null;
  location: string | null;
  lifecycleStatus: string | null;
  lastGiftAt: string | null;
  lifetimeGiving: number;
  fundsGivenToSummary: string | null;
  lastTouchAt: string | null;
  nextTaskSummary: string | null;
  portalAccessLabel: "linked" | "none";
  linkedAuthUserId: string | null;
  tags: string[];
  assignedMissionaryName: string | null;
  avatarUrl: string | null;
  email: string | null;
  phone: string | null;
  notesPreview: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminCrmListResponse {
  rows: CrmGridRow[];
  nextCursor: string | null;
  hasMore: boolean;
  limit: number;
  sort: {
    field: string;
    direction: "asc" | "desc";
  };
  filters: {
    recordTypes: string[];
    lifecycleStatuses: string[];
    tags: string[];
    hasPortal: boolean | null;
  };
}
