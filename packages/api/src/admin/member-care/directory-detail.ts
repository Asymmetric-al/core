import { NextResponse } from "next/server";

import { toApiErrorResponse } from "./route-helpers";
import { readMemberCarePersonDetail } from "../../reads/member-care";
import { withOperation } from "../../shared/with-operation";

export const GET = withOperation<{ params: Promise<{ id: string }> }>(
  async ({ auth, sessionClient }, context) => {
    const resolved = context ? await context.params : undefined;
    const id = resolved?.id;
    if (!id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    try {
      const detail = await readMemberCarePersonDetail(
        sessionClient,
        auth.tenantId,
        id,
        auth.userId,
      );

      if (!detail.personnel) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }

      return NextResponse.json(detail);
    } catch (error) {
      return toApiErrorResponse(error, "Failed to load member care profile.");
    }
  },
  { capability: "care.access" },
);
