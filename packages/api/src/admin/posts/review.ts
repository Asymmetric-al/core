import { NextResponse } from "next/server";
import { z } from "zod";

import { commandClient } from "../../posts/command-client";
import { postIdParamSchema } from "../../schemas/posts";
import { readJsonBodyOrNull } from "../../shared/http-errors";
import { withOperation } from "../../shared/with-operation";
import { normalizesToNothing } from "../workers/safety-text";

const reviewBodySchema = z.object({
  decision: z.enum(["approve", "reject", "withdraw"]),
  reason: z.string().max(500).optional(),
});

export const POST = withOperation(
  async ({ auth, request, sessionClient }, routeContext) => {
    const params = postIdParamSchema.safeParse(await routeContext?.params);
    if (!params.success)
      return NextResponse.json({ error: "Update not found" }, { status: 404 });
    const body = reviewBodySchema.safeParse(await readJsonBodyOrNull(request));
    if (!body.success)
      return NextResponse.json({ error: "Invalid review" }, { status: 400 });
    const { decision, reason } = body.data;
    if (
      decision !== "approve" &&
      (reason === undefined || normalizesToNothing(reason))
    )
      return NextResponse.json({ error: "Give a reason." }, { status: 400 });

    const target = {
      p_tenant_id: auth.tenantId,
      p_post_id: params.data.postId,
    };
    const { error } = await commandClient(sessionClient).rpc(
      `${decision}_ministry_update`,
      decision === "approve" ? target : { ...target, p_reason: reason },
    );
    if (error?.code === "42501")
      return NextResponse.json(
        { error: "You can’t review this update." },
        { status: 403 },
      );
    if (error?.code === "22023")
      return NextResponse.json(
        { error: error.message ?? "This update can’t be reviewed now." },
        { status: 409 },
      );
    if (error)
      return NextResponse.json(
        { error: "Something went wrong. Nothing was changed." },
        { status: 500 },
      );
    return NextResponse.json({ success: true });
  },
  { capability: "updates.review" },
);
