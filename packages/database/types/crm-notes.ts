export type CrmNoteSortField = "createdAt" | "updatedAt" | "title";
export type CrmNoteSortDirection = "asc" | "desc";

export interface CrmNoteRow {
  id: string;
  tenantId: string;
  title: string;
  body: string;
  bodyPreview: string;
  authorName: string | null;
  linkedRecordId: string | null;
  linkedRecordLabel: string | null;
  linkedRecordType: string | null;
  visibility: "standard" | "restricted";
  source: "twenty" | "queued";
  outboundJobId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminCrmNotesListResponse {
  rows: CrmNoteRow[];
  nextCursor: string | null;
  hasMore: boolean;
  limit: number;
  configured: boolean;
  mode: "twenty" | "not_configured";
  missing: string[];
  sort: {
    field: CrmNoteSortField;
    direction: CrmNoteSortDirection;
  };
  filters: {
    search: string | null;
  };
  rollback: {
    existingCrmPath: "/crm";
    disableWritesByPausingDomain: "notes";
  };
}

export interface AdminCrmNoteCreateResponse {
  note: CrmNoteRow;
  outboundJobId: string;
  outboundStatus: string;
  commandLogId: string | null;
  replay: {
    outboundJobId: string;
  };
  rollback: {
    existingCrmPath: "/crm";
    disableWritesByPausingDomain: "notes";
  };
}
