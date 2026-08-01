import { NextResponse } from "next/server";

import {
  clearEveRetentionHold,
  createEveReplayDownload,
  runEveRetentionExpiry,
  setEveRetentionHold,
  storeEveReplayArtifact,
} from "./control";
import { mutateEveRetentionSchema } from "./schema";
import { loadEveRetentionAdminView } from "./store";
import { toErrorResponse } from "../../shared/http-errors";
import { withOperation } from "../../shared/with-operation";

export const GET = withOperation(
  async ({ auth, requestId, supabaseAdmin }) => {
    try {
      return NextResponse.json({
        ...(await loadEveRetentionAdminView({
          supabaseAdmin,
          tenantId: auth.tenantId,
          ownerProfileId: auth.profileId,
        })),
        requestId,
      });
    } catch (error) {
      return toErrorResponse(error, "Failed to load Eve retention.", requestId);
    }
  },
  { roles: ["admin", "super_admin"] },
);

export const POST = withOperation(
  async ({ auth, request, requestId, supabaseAdmin }) => {
    try {
      const mutation = mutateEveRetentionSchema.parse(await request.json());
      let result: unknown;
      switch (mutation.action) {
        case "store_artifact":
          result = await storeEveReplayArtifact({
            auth,
            supabaseAdmin,
            ...mutation,
          });
          break;
        case "download_artifact":
          result = await createEveReplayDownload({
            auth,
            supabaseAdmin,
            ...mutation,
          });
          break;
        case "set_hold":
          result = {
            holdId: await setEveRetentionHold({
              auth,
              supabaseAdmin,
              ...mutation,
            }),
          };
          break;
        case "clear_hold":
          await clearEveRetentionHold({ auth, supabaseAdmin, ...mutation });
          result = { cleared: true };
          break;
        case "run_expiry":
          result = await runEveRetentionExpiry({
            auth,
            supabaseAdmin,
            ...mutation,
          });
          break;
      }
      return NextResponse.json({ result, requestId });
    } catch (error) {
      return toErrorResponse(
        error,
        "Failed to apply Eve retention action.",
        requestId,
      );
    }
  },
  { roles: ["admin", "super_admin"] },
);
