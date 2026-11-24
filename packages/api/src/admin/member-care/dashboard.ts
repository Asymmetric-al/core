import { NextResponse } from "next/server";

import { toApiErrorResponse } from "./route-helpers";
import { readMemberCareDashboardSnapshot } from "../../reads/member-care";
import { withOperation } from "../../shared/with-operation";

export const GET = withOperation(
  async ({ auth, sessionClient }) => {
    try {
      const snapshot = await readMemberCareDashboardSnapshot(
        sessionClient,
        auth.tenantId,
      );
      return NextResponse.json(snapshot);
    } catch (error) {
      return toApiErrorResponse(error, "Failed to load member care dashboard.");
    }
  },
  { capability: "care.access" },
);
