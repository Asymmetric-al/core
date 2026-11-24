import { NextResponse } from "next/server";

import { manualAttentionSchema, setManualAttentionFlag } from "./mutations";
import { readJsonBody, toMutationErrorResponse } from "./route-helpers";
import { withOperation } from "../../shared/with-operation";

export const PATCH = withOperation(
  async ({ auth, request, sessionClient }) => {
    const body = await readJsonBody(request, manualAttentionSchema);
    if (!body.ok) {
      return body.response;
    }

    try {
      const result = await setManualAttentionFlag(
        sessionClient,
        auth.tenantId,
        body.body,
      );
      return NextResponse.json(result);
    } catch (error) {
      return toMutationErrorResponse(
        error,
        "Failed to set manual attention flag.",
      );
    }
  },
  { capability: "care.access" },
);
