import { NextResponse } from "next/server";
import { z } from "zod";

import { parseAdminCrmNotesParams } from "./query";
import {
  createMissionControlCrmNote,
  listMissionControlCrmNotes,
  type NoteCommandClient,
  type NotesClient,
} from "./service";
import { requireCrmAccess } from "../../../crm/auth/access";
import { ApiHttpError } from "../../../shared/api-http-error";
import { revalidateAdminCrmCache } from "../../../shared/cache-tags";
import { ensureJsonBody, toErrorResponse } from "../../../shared/http-errors";
import { withOperation } from "../../../shared/with-operation";

const SUBMISSION_KEY_HEADER = "idempotency-key";
const SUBMISSION_KEY =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function readSubmissionKey(request: Request): string {
  const sent = request.headers.get(SUBMISSION_KEY_HEADER)?.trim();
  if (!sent) {
    return crypto.randomUUID();
  }
  if (!SUBMISSION_KEY.test(sent)) {
    throw new ApiHttpError(400, "Idempotency-Key must be a UUID.");
  }
  return sent.toLowerCase();
}

const createNoteSchema = z.object({
  body: z.string().trim().min(1, "Note body is required.").max(10_000),
  linkedRecordId: z.string().trim().min(1).max(160).nullable().optional(),
  linkedRecordLabel: z.string().trim().min(1).max(160).nullable().optional(),
  linkedRecordType: z
    .enum(["donor_profile", "missionary_profile", "organization"])
    .nullable()
    .optional(),
  title: z.string().trim().min(1, "Note title is required.").max(160),
  visibility: z.enum(["standard", "restricted"]).default("standard"),
});

export const GET = withOperation(
  async ({ auth, request, requestId, sessionClient }) => {
    const actor = requireCrmAccess(auth, {
      action: "crm.note.read",
      resourceType: "note",
    });
    const params = parseAdminCrmNotesParams(new URL(request.url).searchParams);

    try {
      const response = await listMissionControlCrmNotes({
        actor,
        params,
        supabase: sessionClient as unknown as NotesClient,
      });

      return NextResponse.json({ ...response, requestId });
    } catch (error) {
      return toErrorResponse(error, "Failed to load CRM notes.", requestId);
    }
  },
  {
    capability: "admin.crm.manage",
  },
);

export const POST = withOperation(
  async ({ auth, request, requestId, sessionClient }) => {
    const actor = requireCrmAccess(auth, {
      action: "crm.note.create",
      resourceType: "note",
    });
    const input = createNoteSchema.parse(await ensureJsonBody(request));

    try {
      const response = await createMissionControlCrmNote({
        actor,
        idempotencyKey: readSubmissionKey(request),
        input,
        requestId,
        supabase: sessionClient as unknown as NoteCommandClient,
      });

      revalidateAdminCrmCache(actor.tenantId);

      return NextResponse.json({ ...response, requestId }, { status: 201 });
    } catch (error) {
      return toErrorResponse(error, "Failed to save CRM note.", requestId);
    }
  },
  {
    capability: "admin.crm.manage",
  },
);
