import { NextResponse } from "next/server";
import { z } from "zod";

import { ensureJsonBody } from "../../shared/http-errors";
import { withOperation } from "../../shared/with-operation";
import { finalizeMediaUpload } from "../../storage/media-store";

const finalizeMediaUploadBodySchema = z
  .object({
    assetId: z.string().uuid(),
  })
  .strict();

export const POST = withOperation(
  async ({ auth, request }) => {
    const rawBody = await ensureJsonBody(request);
    const parsed = finalizeMediaUploadBodySchema.parse(rawBody);

    const asset = await finalizeMediaUpload(auth, { assetId: parsed.assetId });

    return NextResponse.json({ asset }, { status: 200 });
  },
  {
    capability: "web_studio.edit",
    roleClasses: ["staff"],
  },
);
