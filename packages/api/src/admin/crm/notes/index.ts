import { NextResponse } from "next/server";
import { z } from "zod";

import { parseAdminCrmNotesParams } from "./query";
import {
  createMissionControlCrmNote,
  listMissionControlCrmNotes,
  type NotesClient,
} from "./service";
import { requireCrmAccess } from "../../../crm/auth/access";
import { revalidateAdminCrmCache } from "../../../shared/cache-tags";
import { ensureJsonBody, toErrorResponse } from "../../../shared/http-errors";
import { withOperation } from "../../../shared/with-operation";

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
  async ({ auth, request, requestId, supabaseAdmin }) => {
    const actor = requireCrmAccess(auth, {
      action: "crm.note.read",
      resourceType: "note",
    });
    const params = parseAdminCrmNotesParams(new URL(request.url).searchParams);

    try {
      const response = await listMissionControlCrmNotes({
        actor,
        params,
        supabase: supabaseAdmin as unknown as NotesClient,
      });

      return NextResponse.json({ ...response, requestId });
    } catch (error) {
      return toErrorResponse(error, "Failed to load CRM notes.", requestId);
    }
  },
  {
    roles: ["staff", "admin", "super_admin"],
  },
);

export const POST = withOperation(
  async ({ auth, request, requestId, supabaseAdmin }) => {
    const actor = requireCrmAccess(auth, {
      action: "crm.note.create",
      resourceType: "note",
    });
    const input = createNoteSchema.parse(await ensureJsonBody(request));

    try {
      const response = await createMissionControlCrmNote({
        actor,
        input,
        requestId,
        supabase: supabaseAdmin as unknown as NotesClient,
      });

      revalidateAdminCrmCache(actor.tenantId);

      return NextResponse.json({ ...response, requestId }, { status: 201 });
    } catch (error) {
      return toErrorResponse(error, "Failed to save CRM note.", requestId);
    }
  },
  {
    roles: ["staff", "admin", "super_admin"],
  },
);
