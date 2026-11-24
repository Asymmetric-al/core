import { NextResponse } from "next/server";

import { careRequirementSchema, upsertCareRequirement } from "./mutations";
import { readJsonBody, toMutationErrorResponse } from "./route-helpers";
import { withOperation } from "../../shared/with-operation";

export const POST = withOperation(
  async ({ auth, request, sessionClient }) => {
    const body = await readJsonBody(request, careRequirementSchema);
    if (!body.ok) {
      return body.response;
    }

    try {
      const result = await upsertCareRequirement(
        sessionClient,
        auth.tenantId,
        body.body,
      );
      return NextResponse.json(result);
    } catch (error) {
      return toMutationErrorResponse(
        error,
        "Failed to upsert care requirement.",
      );
    }
  },
  { capability: "care.access" },
);
