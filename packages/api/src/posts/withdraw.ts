import { NextResponse } from "next/server";

import { commandClient } from "./command-client";
import { postIdParamSchema } from "../schemas/posts";
import { withOperation } from "../shared/with-operation";

const NOT_FOUND = { error: "Update not found" };

export const POST = withOperation(
  async ({ auth, sessionClient }, routeContext) => {
    const params = postIdParamSchema.safeParse(await routeContext?.params);
    if (!params.success) return NextResponse.json(NOT_FOUND, { status: 404 });
    const { error } = await commandClient(sessionClient).rpc(
      "withdraw_own_ministry_update",
      { p_tenant_id: auth.tenantId, p_post_id: params.data.postId },
    );
    if (error?.code === "42501")
      return NextResponse.json(NOT_FOUND, { status: 404 });
    if (error?.code === "22023")
      return NextResponse.json(
        { error: error.message ?? "That update can’t be withdrawn now." },
        { status: 409 },
      );
    if (error)
      return NextResponse.json(
        { error: "Couldn’t withdraw that update." },
        { status: 500 },
      );
    return NextResponse.json({ success: true });
  },
  { roleClasses: ["missionary"] },
);
