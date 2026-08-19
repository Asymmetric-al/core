import type { UserRole } from "@asym/database/types";

export type CrmAction =
  | "crm.record.read"
  | "crm.record.create"
  | "crm.record.update"
  | "crm.record.delete"
  | "crm.note.read"
  | "crm.note.create"
  | "crm.relationship.read"
  | "crm.report.read"
  | "crm.report.export"
  | "crm.person.create"
  | "crm.person.update"
  | "crm.table_preferences.read"
  | "crm.table_preferences.write"
  | "crm.table_preferences.manage_defaults";

export type CrmResourceType =
  | "metadata"
  | "record"
  | "person"
  | "company"
  | "opportunity"
  | "task"
  | "note"
  | "relationship"
  | "report";

export type CrmCommandStatus =
  | "queued"
  | "attempted"
  | "succeeded"
  | "failed"
  | "skipped";

export interface ActorContext {
  userId: string;
  profileId: string | null;
  tenantId: string;
  authTenantId: string;
  role: UserRole;
  isSuperAdmin: boolean;
  action: CrmAction;
}
