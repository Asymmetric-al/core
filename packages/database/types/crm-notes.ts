export type CrmNoteSortField = "updatedAt" | "createdAt" | "title";
export type CrmNoteSortDirection = "asc" | "desc";

export type CrmNoteRow = {
  id: string;
  tenantId: string;
  title: string;
  body: string;
  bodyPreview: string;
  authorName: string;
  linkedRecordId: string | null;
  linkedRecordLabel: string | null;
  linkedRecordType: string | null;
  visibility: "standard" | "restricted";
  source: "local";
  createdAt: string;
  updatedAt: string;
};

export type AdminCrmNotesSort = {
  field: CrmNoteSortField;
  direction: CrmNoteSortDirection;
};

export type AdminCrmNotesListResponse = {
  mode: "local";
  configured: boolean;
  missing: string[];
  rows: CrmNoteRow[];
  nextCursor: string | null;
  hasMore: boolean;
  limit: number;
  sort: AdminCrmNotesSort;
  filters: { search: string | null };
  rollback: { existingCrmPath: "/crm" };
};

export type CreateAdminCrmNoteInput = {
  title: string;
  body: string;
  visibility?: "standard" | "restricted";
  linkedRecordId?: string | null;
  linkedRecordType?: string | null;
  linkedRecordLabel?: string | null;
};

export type AdminCrmNoteCreateResponse = {
  note: CrmNoteRow;
  commandLogId: string;
  duplicate?: boolean;
  rollback: {
    existingCrmPath: "/crm";
  };
};
