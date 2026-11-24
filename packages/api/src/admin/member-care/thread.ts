import { NextResponse } from "next/server";

import { createCareThreadPost, threadPostSchema } from "./mutations";
import { readJsonBody, toMutationErrorResponse } from "./route-helpers";
import { withOperation } from "../../shared/with-operation";

export const POST = withOperation(
  async ({ auth, request, sessionClient }) => {
    const body = await readJsonBody(request, threadPostSchema);
    if (!body.ok) {
      return body.response;
    }

    try {
      const result = await createCareThreadPost(
        sessionClient,
        auth.tenantId,
        body.body,
      );
      return NextResponse.json(result, { status: 201 });
    } catch (error) {
      return toMutationErrorResponse(error, "Failed to create thread post.");
    }
  },
  { capability: "care.access" },
);
