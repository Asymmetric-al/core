import type { AdminCrmNotesParams } from "./query";
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

export function filterCrmNotesForTenant(
  rows: readonly CrmNoteRow[],
  tenantId: string,
  search: string | null,
  options?: { includeRestricted?: boolean },
): CrmNoteRow[] {
  const normalizedSearch = search?.trim().toLowerCase() ?? "";
  const includeRestricted = options?.includeRestricted ?? true;

  return rows.filter((row) => {
    if (row.tenantId !== tenantId) {
      return false;
    }

    if (!includeRestricted && row.visibility === "restricted") {
      return false;
    }

    if (!normalizedSearch) {
      return true;
    }

    return [
      row.title,
      row.body,
      row.bodyPreview,
      row.authorName,
      row.linkedRecordId,
      row.linkedRecordLabel,
      row.linkedRecordType,
    ]
      .filter(Boolean)
      .some((value) => value!.toLowerCase().includes(normalizedSearch));
  });
}

function compareNullableText(left: string | null, right: string | null) {
  return (left ?? "").localeCompare(right ?? "");
}

export function sortCrmNotes(
  rows: readonly CrmNoteRow[],
  sort: AdminCrmNotesParams["sort"],
): CrmNoteRow[] {
  const direction = sort.direction === "asc" ? 1 : -1;

  return [...rows].sort((left, right) => {
    let compared = 0;

    if (sort.field === "title") {
      compared = compareNullableText(left.title, right.title);
    } else if (sort.field === "createdAt") {
      compared =
        new Date(left.createdAt).getTime() -
        new Date(right.createdAt).getTime();
    } else {
      compared =
        new Date(left.updatedAt).getTime() -
        new Date(right.updatedAt).getTime();
    }

    if (compared !== 0) {
      return compared * direction;
    }

    return left.id.localeCompare(right.id);
  });
}

export function canActorReadRestrictedNotes(role: string | null | undefined) {
  return role === "admin" || role === "super_admin";
}
