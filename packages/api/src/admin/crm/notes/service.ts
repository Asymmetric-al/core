import { mapCrmNoteRow } from "./model";
import { encodeCrmNoteCursor, type AdminCrmNotesParams } from "./query";
import { assertCrmTenantAccess } from "../../../crm/auth/access";
import { ApiHttpError } from "../../../shared/api-http-error";

import type { ActorContext } from "../../../crm/types";
import type {
  AdminCrmNoteCreateResponse,
  AdminCrmNotesListResponse,
} from "@asym/database/types";

type JsonRecord = Record<string, unknown>;

export type NotesClient = {
  rpc: (
    fn: "crm_notes_page",
    args: NotesPageArgs,
  ) => PromiseLike<{
    data: unknown;
    error: { message?: string; code?: string } | null;
  }>;
};

type NotesPageArgs = {
  p_tenant_id: string;
  p_search: string | null;
  p_sort: string;
  p_descending: boolean;
  p_offset: number;
  p_limit: number;
};

export type NoteCommandClient = {
  rpc: (
    fn: "create_crm_note",
    args: CreateCrmNoteCommandArgs,
  ) => PromiseLike<{
    data: unknown;
    error: { message?: string; code?: string } | null;
  }>;
};

export type CreateCrmNoteCommandArgs = {
  p_tenant_id: string;
  p_idempotency_key: string;
  p_title: string;
  p_body: string;
  p_visibility: "standard" | "restricted";
  p_linked_record_id: string | null;
  p_linked_record_type:
    "donor_profile" | "missionary_profile" | "organization" | null;
  p_linked_record_label: string | null;
  p_request_id: string | null;
};

export interface ListMissionControlCrmNotesOptions {
  actor: ActorContext;
  params: AdminCrmNotesParams;
  supabase: NotesClient;
}

export interface CreateMissionControlCrmNoteInput {
  title: string;
  body: string;
  linkedRecordId?: string | null;
  linkedRecordType?:
    "donor_profile" | "missionary_profile" | "organization" | null;
  linkedRecordLabel?: string | null;
  visibility?: "standard" | "restricted";
}

export interface CreateMissionControlCrmNoteOptions {
  actor: ActorContext;
  supabase: NoteCommandClient;
  input: CreateMissionControlCrmNoteInput;
  idempotencyKey: string;
  requestId?: string | null;
}

const ROLLBACK_CONTRACT = {
  existingCrmPath: "/crm",
} as const;

const COMMAND_REFUSALS: Record<string, [number, string]> = {
  "22023": [400, "The CRM note is not valid."],
  "23505": [409, "This submission key was already used for another CRM note."],
};

function commandRefusal(error: { message?: string; code?: string }): Error {
  if (error.code === "42501") {
    return new ApiHttpError(
      403,
      /tenant-administrator flag/i.test(error.message ?? "")
        ? "Restricted CRM notes require the tenant-administrator flag."
        : "Forbidden: this assignment cannot create CRM notes.",
    );
  }
  const refusal = error.code ? COMMAND_REFUSALS[error.code] : undefined;
  if (refusal) {
    return new ApiHttpError(refusal[0], refusal[1]);
  }
  return new Error(error.message ?? "Failed to save CRM note.");
}

function readCommandResult(data: unknown): {
  note: JsonRecord;
  commandLogId: string;
  duplicate: boolean;
} | null {
  if (!data || typeof data !== "object") {
    return null;
  }
  const result = data as JsonRecord;
  if (
    !result.note ||
    typeof result.note !== "object" ||
    typeof result.commandLogId !== "string"
  ) {
    return null;
  }
  return {
    commandLogId: result.commandLogId,
    duplicate: result.duplicate === true,
    note: result.note as JsonRecord,
  };
}

async function loadNotesPage(
  supabase: NotesClient,
  args: NotesPageArgs,
): Promise<{ totalCount: number; rows: JsonRecord[] }> {
  const { data, error } = await supabase.rpc("crm_notes_page", args);

  if (error) {
    throw new Error(error.message ?? "Failed to load CRM notes.");
  }

  const page = data as { totalCount?: unknown; rows?: unknown } | null;
  if (
    !page ||
    typeof page.totalCount !== "number" ||
    !Array.isArray(page.rows)
  ) {
    throw new Error("Failed to load CRM notes.");
  }

  return { totalCount: page.totalCount, rows: page.rows as JsonRecord[] };
}

export async function listMissionControlCrmNotes(
  options: ListMissionControlCrmNotesOptions,
): Promise<AdminCrmNotesListResponse> {
  assertCrmTenantAccess(options.actor);

  const offset = options.params.cursor?.offset ?? 0;
  const page = await loadNotesPage(options.supabase, {
    p_tenant_id: options.actor.tenantId,
    p_search: options.params.search,
    p_sort: options.params.sort.field,
    p_descending: options.params.sort.direction !== "asc",
    p_offset: offset,
    p_limit: options.params.limit,
  });
  const pageRows = page.rows.flatMap((record) => {
    const row = mapCrmNoteRow(record);
    return row ? [row] : [];
  });
  const nextOffset = offset + page.rows.length;
  const hasMore = nextOffset < page.totalCount;

  return {
    configured: true,
    filters: {
      search: options.params.search,
    },
    hasMore,
    limit: options.params.limit,
    missing: [],
    mode: "local",
    nextCursor: hasMore ? encodeCrmNoteCursor({ offset: nextOffset }) : null,
    rollback: ROLLBACK_CONTRACT,
    rows: pageRows,
    sort: options.params.sort,
    totalCount: page.totalCount,
  };
}

export async function createMissionControlCrmNote(
  options: CreateMissionControlCrmNoteOptions,
): Promise<AdminCrmNoteCreateResponse> {
  assertCrmTenantAccess(options.actor);

  const title = options.input.title.trim();
  const body = options.input.body.trim();
  const visibility = options.input.visibility ?? "standard";
  const linkedRecordId = options.input.linkedRecordId?.trim() || null;
  const linkedRecordType = options.input.linkedRecordType ?? null;
  const linkedRecordLabel = options.input.linkedRecordLabel?.trim() || null;

  if (!title || !body) {
    throw new ApiHttpError(400, "Note title and body are required.");
  }

  const { data, error } = await options.supabase.rpc("create_crm_note", {
    p_body: body,
    p_idempotency_key: options.idempotencyKey,
    p_linked_record_id: linkedRecordId,
    p_linked_record_label: linkedRecordLabel,
    p_linked_record_type: linkedRecordType,
    p_request_id: options.requestId ?? null,
    p_tenant_id: options.actor.tenantId,
    p_title: title,
    p_visibility: visibility,
  });

  if (error) {
    throw commandRefusal(error);
  }

  const result = readCommandResult(data);
  const note = result ? mapCrmNoteRow(result.note) : null;
  if (!result || !note) {
    throw new Error("Failed to save CRM note.");
  }

  return {
    commandLogId: result.commandLogId,
    duplicate: result.duplicate,
    note,
    rollback: ROLLBACK_CONTRACT,
  };
}
