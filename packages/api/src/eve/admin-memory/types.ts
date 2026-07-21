export const EVE_ADMIN_MEMORY_CATEGORIES = [
  "preference",
  "project_context",
  "decision",
] as const;

export type EveAdminMemoryCategory =
  (typeof EVE_ADMIN_MEMORY_CATEGORIES)[number];

export const EVE_ADMIN_MEMORY_EXCLUSION_CODES = [
  "credential",
  "customer_or_donor_pii",
  "one_time_code",
  "payment_data",
  "private_key",
  "secret",
  "sensitive_tenant_fact",
] as const;

export type EveAdminMemoryExclusionCode =
  (typeof EVE_ADMIN_MEMORY_EXCLUSION_CODES)[number];

export type EveAdminMemoryWriteSource = "auto_save" | "manual";

export interface EveAdminMemoryEntry {
  category: EveAdminMemoryCategory;
  content: string;
  createdAt: string;
  deletedAt?: string;
  id: string;
  isDeleted: boolean;
  ownerProfileId: string;
  scopeType: "admin_private";
  source: EveAdminMemoryWriteSource;
  tenantId: string;
  title: string;
  updatedAt: string;
  version: number;
}

export interface EveAdminMemoryHistoryRecord {
  action: "created" | "deleted" | "updated";
  category: EveAdminMemoryCategory;
  changedAt: string;
  changedByProfileId: string;
  content: string;
  entryId: string;
  id: string;
  source: EveAdminMemoryWriteSource;
  title: string;
  version: number;
}

export interface EveAdminMemorySetting {
  autoSaveEnabled: boolean;
  category: EveAdminMemoryCategory;
  updatedAt: string;
}

export interface EveAdminMemoryAdminView {
  entries: EveAdminMemoryEntry[];
  history: EveAdminMemoryHistoryRecord[];
  settings: EveAdminMemorySetting[];
}

export type EveAdminMemoryWriteResult =
  | {
      exclusions: EveAdminMemoryExclusionCode[];
      stored: false;
    }
  | {
      entry: EveAdminMemoryEntry;
      stored: true;
    };
