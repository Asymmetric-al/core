import { serverEnv } from "@asym/env";
import { NextResponse } from "next/server";
import { z } from "zod";

import { parseAdminCrmNotesParams } from "./query";
import {
  createMissionControlCrmNote,
  listMissionControlCrmNotes,
} from "./service";
import { requireCrmAccess } from "../../../crm/auth/access";
import { resolveCrmSyncRuntimeConfig } from "../../../crm/sync/config";
import { createSupabaseCrmSyncStore } from "../../../crm/sync/store";
import { ensureJsonBody, toErrorResponse } from "../../../shared/http-errors";
import { withOperation } from "../../../shared/with-operation";

const createNoteSchema = z.object({
  body: z.string().trim().min(1, "Note body is required.").max(10_000),
  title: z.string().trim().min(1, "Note title is required.").max(160),
});

export const GET = withOperation(
  async ({ auth, request, requestId }) => {
    const actor = requireCrmAccess(auth, {
      action: "crm.note.read",
      resourceType: "note",
    });
    const params = parseAdminCrmNotesParams(new URL(request.url).searchParams);

    try {
      const response = await listMissionControlCrmNotes({
        actor,
        env: serverEnv,
        params,
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
        commandClient: supabaseAdmin,
        input,
        requestId,
        store: createSupabaseCrmSyncStore(supabaseAdmin),
        syncConfig: resolveCrmSyncRuntimeConfig(serverEnv),
      });

      return NextResponse.json({ ...response, requestId }, { status: 202 });
    } catch (error) {
      return toErrorResponse(error, "Failed to queue CRM note.", requestId);
    }
  },
  {
    roles: ["staff", "admin", "super_admin"],
  },
);
