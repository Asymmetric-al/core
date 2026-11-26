import type { CrmNoteRow } from "@asym/database/types";

type CrmNoteRecord = Record<string, unknown>;

export function previewBody(body: string): string {
  const singleLine = body.replace(/\s+/g, " ").trim();
  if (singleLine.length <= 160) {
    return singleLine;
  }

  return `${singleLine.slice(0, 157).trimEnd()}...`;
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function isRestricted(value: unknown): value is "restricted" {
  return value === "restricted";
}

export function mapCrmNoteRow(record: CrmNoteRecord): CrmNoteRow | null {
  const id = asString(record.id);
  const tenantId = asString(record.tenant_id);
  const title = asString(record.title);
  const body = asString(record.body) ?? "";

  if (!id || !tenantId || !title) {
    return null;
  }

  const createdAt = asString(record.created_at) ?? new Date(0).toISOString();
  const updatedAt = asString(record.updated_at) ?? createdAt;

  return {
    authorName: asString(record.author_name) ?? "Mission Control",
    body,
    bodyPreview: previewBody(body || title),
    createdAt,
    id,
    linkedRecordId: asString(record.linked_record_id),
    linkedRecordLabel: asString(record.linked_record_label),
    linkedRecordType: asString(record.linked_record_type),
    source: "local",
    tenantId,
    title,
    updatedAt,
    visibility: isRestricted(record.visibility) ? "restricted" : "standard",
  };
}
