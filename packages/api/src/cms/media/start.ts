import { NextResponse } from "next/server";
import { z } from "zod";

import { ApiHttpError, ensureJsonBody } from "../../shared/http-errors";
import { withOperation } from "../../shared/with-operation";
import {
  MEDIA_ALLOWED_MIME_TYPES,
  MEDIA_MAX_BYTES,
} from "../../storage/media-constants";
import { issueSignedUpload } from "../../storage/media-store";

const startMediaUploadBodySchema = z
  .object({
    byteSize: z.number().int().min(1).max(MEDIA_MAX_BYTES),
    mimeType: z.enum(MEDIA_ALLOWED_MIME_TYPES),
  })
  .strict();

function parseStartRpcPayload(data: unknown): {
  assetId: string;
  declaredByteSize: number;
  declaredMimeType: string;
} {
  if (!data || typeof data !== "object") {
    throw new ApiHttpError(500, "Failed to start media upload");
  }
  const record = data as Record<string, unknown>;
  if (typeof record.asset_id !== "string") {
    throw new ApiHttpError(500, "Failed to start media upload");
  }
  return {
    assetId: record.asset_id,
    declaredByteSize: Number(record.declared_byte_size),
    declaredMimeType: String(record.declared_mime_type),
  };
}

export const POST = withOperation(
  async ({ auth, request, sessionClient }) => {
    const rawBody = await ensureJsonBody(request);
    const parsed = startMediaUploadBodySchema.parse(rawBody);

    const { data, error } = await sessionClient.rpc("start_media_upload", {
      p_tenant_id: auth.tenantId,
      p_byte_size: parsed.byteSize,
      p_mime_type: parsed.mimeType,
    });

    if (error) {
      if (error.code === "22023" || error.code === "22004") {
        throw new ApiHttpError(400, error.message);
      }
      if (error.code === "42501") {
        throw new ApiHttpError(403, "Forbidden");
      }
      throw new ApiHttpError(500, "Failed to start media upload");
    }

    const started = parseStartRpcPayload(data);
    const signed = await issueSignedUpload(auth, { assetId: started.assetId });

    return NextResponse.json(
      {
        assetId: signed.assetId,
        stagingPath: signed.stagingPath,
        token: signed.token,
        signedUrl: signed.signedUrl,
        status: "uploading",
        declaredByteSize: started.declaredByteSize,
        declaredMimeType: started.declaredMimeType,
      },
      { status: 201 },
    );
  },
  {
    capability: "web_studio.edit",
    roleClasses: ["staff"],
  },
);
