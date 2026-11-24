import { NextResponse } from "next/server";

import { createCarePrivateNote, privateNoteSchema } from "./mutations";
import { toMutationErrorResponse } from "./route-helpers";
import { readJsonBodyOrNull } from "../../shared/http-errors";
import { withOperation } from "../../shared/with-operation";

export const POST = withOperation(
  async ({ auth, request, sessionClient }) => {
    const body = await readJsonBodyOrNull(request);
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
        sessionClient,
        auth.tenantId,
        parsed.data,
      );
      return NextResponse.json(result, { status: 201 });
    } catch (error) {
      return toMutationErrorResponse(error, "Internal error");
    }
  },
  { capability: "care.access" },
);
