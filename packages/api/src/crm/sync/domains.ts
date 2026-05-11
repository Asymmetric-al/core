import type { CrmSyncDomain } from "./types";

export const CRM_SYNC_DOMAINS = [
  "people",
  "companies",
  "churches",
  "households",
  "tasks",
  "notes",
  "ministry_activities",
  "relationship_commitments",
] as const satisfies readonly CrmSyncDomain[];

const OBJECT_DOMAIN_BY_NAME = new Map<string, CrmSyncDomain>([
  ["person", "people"],
  ["people", "people"],
  ["company", "companies"],
  ["companies", "companies"],
  ["church", "churches"],
  ["churches", "churches"],
  ["household", "households"],
  ["households", "households"],
  ["task", "tasks"],
  ["tasks", "tasks"],
  ["note", "notes"],
  ["notes", "notes"],
  ["ministryactivity", "ministry_activities"],
  ["ministryactivities", "ministry_activities"],
  ["ministry_activity", "ministry_activities"],
  ["ministry_activities", "ministry_activities"],
  ["relationshipcommitment", "relationship_commitments"],
  ["relationshipcommitments", "relationship_commitments"],
  ["relationship_commitment", "relationship_commitments"],
  ["relationship_commitments", "relationship_commitments"],
]);

function normalizeObjectName(value: string): string {
  return value.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase();
}

export function isCrmSyncDomain(value: string): value is CrmSyncDomain {
  return (CRM_SYNC_DOMAINS as readonly string[]).includes(value);
}

export function getCrmSyncDomainForTwentyObject(
  objectName: string,
): CrmSyncDomain | null {
  return OBJECT_DOMAIN_BY_NAME.get(normalizeObjectName(objectName)) ?? null;
}
