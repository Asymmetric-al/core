import { NextResponse } from "next/server";
import { z } from "zod";

import { ApiHttpError, ensureJsonBody } from "../../shared/http-errors";
import { withOperation } from "../../shared/with-operation";

const deleteMediaAssetBodySchema = z
  .object({
    assetId: z.string().uuid(),
  })
  .strict();

function parseDeleteRpcPayload(data: unknown): {
  assetId: string;
  deletedAt: string;
  purgeAfter: string;
  alreadyDeleted: boolean;
  stagingQueued: boolean;
} {
  if (!data || typeof data !== "object") {
    throw new ApiHttpError(500, "Failed to delete media asset");
  }
  const record = data as Record<string, unknown>;
  if (
    typeof record.asset_id !== "string" ||
    typeof record.deleted_at !== "string" ||
    typeof record.purge_after !== "string"
  ) {
    throw new ApiHttpError(500, "Failed to delete media asset");
  }
  return {
    assetId: record.asset_id,
    deletedAt: record.deleted_at,
    purgeAfter: record.purge_after,
    alreadyDeleted: Boolean(record.already_deleted),
    stagingQueued: Boolean(record.staging_queued),
  };
}

export const POST = withOperation(
  async ({ auth, request, sessionClient }) => {
    const rawBody = await ensureJsonBody(request);
    const parsed = deleteMediaAssetBodySchema.parse(rawBody);

    const { data, error } = await sessionClient.rpc("delete_media_asset", {
      p_tenant_id: auth.tenantId,
      p_asset_id: parsed.assetId,
    });

    if (error) {
      if (error.code === "P0002") {
        throw new ApiHttpError(404, "Media asset not found");
      }
      if (error.code === "22004" || error.code === "22023") {
        throw new ApiHttpError(400, error.message);
      }
      if (error.code === "42501") {
        throw new ApiHttpError(403, "Forbidden");
      }
      throw new ApiHttpError(500, "Failed to delete media asset");
    }

    const deleted = parseDeleteRpcPayload(data);
    return NextResponse.json(
      {
        assetId: deleted.assetId,
        status: "deleted",
        deletedAt: deleted.deletedAt,
        purgeAfter: deleted.purgeAfter,
        alreadyDeleted: deleted.alreadyDeleted,
        stagingQueued: deleted.stagingQueued,
      },
      { status: 200 },
    );
  },
  {
    capability: "web_studio.edit",
    roleClasses: ["staff"],
  },
);
