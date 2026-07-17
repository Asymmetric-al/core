import {
  findFirstString,
  getNestedName,
  isRecord,
  timestampOrDefault,
} from "../../../shared/json-coerce";

import type { AdminCrmNotesParams } from "./query";
import type { CrmNoteRow } from "@asym/database/types";

function previewBody(body: string): string {
  const singleLine = body.replace(/\s+/g, " ").trim();
  if (singleLine.length <= 160) {
    return singleLine;
  }

  return `${singleLine.slice(0, 157).trimEnd()}...`;
}

function getArrayCandidate(value: unknown): unknown[] | null {
  if (Array.isArray(value)) {
    return value;
  }

  if (!isRecord(value)) {
    return null;
  }

  const candidates = [
    value.data,
    value.records,
    value.items,
    value.results,
    value.notes,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }

    if (isRecord(candidate)) {
      const nested = getArrayCandidate(candidate);
      if (nested) {
        return nested;
      }
    }
  }

  return null;
}

export function normalizeTwentyNotesResponse(response: unknown): CrmNoteRow[] {
  const records = getArrayCandidate(response) ?? [];

  return records.flatMap((record): CrmNoteRow[] => {
    if (!isRecord(record)) {
      return [];
    }

    const id = findFirstString(record, ["id", "recordId"]);
    const tenantId = findFirstString(record, [
      "asymTenantId",
      "tenantId",
      "asym_tenant_id",
    ]);

    if (!id || !tenantId) {
      return [];
    }

    const body =
      findFirstString(record, ["body", "content", "text", "note"]) ?? "";
    const title =
      (findFirstString(record, ["title", "name"]) ?? previewBody(body)) ||
      "Untitled note";
    const createdAt = timestampOrDefault(
      findFirstString(record, ["createdAt", "created_at"]),
    );
    const updatedAt = timestampOrDefault(
      findFirstString(record, ["updatedAt", "updated_at"]) ?? createdAt,
    );

    return [
      {
        authorName:
          findFirstString(record, ["authorName", "createdByName"]) ??
          getNestedName(record.author) ??
          getNestedName(record.createdBy),
        body,
        bodyPreview: previewBody(body || title),
        createdAt,
        id,
        linkedRecordId: findFirstString(record, [
          "linkedRecordId",
          "asymLinkedRecordId",
        ]),
        linkedRecordLabel:
          findFirstString(record, ["linkedRecordLabel", "relatedRecordName"]) ??
          getNestedName(record.person) ??
          getNestedName(record.company),
        linkedRecordType: findFirstString(record, [
          "linkedRecordType",
          "asymLinkedRecordType",
        ]),
        outboundJobId: null,
        source: "twenty",
        tenantId,
        title,
        updatedAt,
        visibility:
          findFirstString(record, ["visibility", "asymVisibility"]) ===
          "restricted"
            ? "restricted"
            : "standard",
      },
    ];
  });
}

export function filterCrmNotesForTenant(
  rows: readonly CrmNoteRow[],
  tenantId: string,
  search: string | null,
): CrmNoteRow[] {
  const normalizedSearch = search?.trim().toLowerCase() ?? "";

  return rows.filter((row) => {
    if (row.tenantId !== tenantId) {
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

export function buildQueuedCrmNoteRow(input: {
  body: string;
  linkedRecordId?: string | null;
  linkedRecordType?: string | null;
  outboundJobId: string;
  tenantId: string;
  title: string;
  visibility?: "standard" | "restricted";
  now?: Date;
}): CrmNoteRow {
  const timestamp = (input.now ?? new Date()).toISOString();
  return {
    authorName: null,
    body: input.body,
    bodyPreview: previewBody(input.body || input.title),
    createdAt: timestamp,
    id: `queued:${input.outboundJobId}`,
    linkedRecordId: input.linkedRecordId ?? null,
    linkedRecordLabel: null,
    linkedRecordType: input.linkedRecordType ?? null,
    outboundJobId: input.outboundJobId,
    source: "queued",
    tenantId: input.tenantId,
    title: input.title,
    updatedAt: timestamp,
    visibility: input.visibility ?? "standard",
  };
}
