import { NextResponse } from "next/server";

import { createCarePrivateNote, privateNoteSchema } from "./mutations";
import { toErrorResponse } from "../../shared/http-errors";
import { withOperation } from "../../shared/with-operation";

export const POST = withOperation(
  async ({ auth, request }) => {
    const body = await request.json().catch(() => null);
    const parsed = privateNoteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid request payload.",
          details: parsed.error.flatten(),
        },
        { status: 422 },
      );
    }

    try {
      const result = await createCarePrivateNote(
        auth.tenantId,
        auth.userId,
        parsed.data,
      );
      return NextResponse.json(result, { status: 201 });
    } catch (error) {
      return toErrorResponse(error, "Failed to create private note.");
    }
  },
  { roles: ["staff", "admin", "super_admin"] },
);
