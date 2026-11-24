import { NextResponse } from "next/server";

import { toApiErrorResponse } from "./route-helpers";
import {
  MEMBER_CARE_DIRECTORY_LIMIT,
  readMemberCareDirectorySnapshot,
} from "../../reads/member-care";
import { withOperation } from "../../shared/with-operation";

export const GET = withOperation(
  async ({ auth, sessionClient }) => {
    try {
      const directory = await readMemberCareDirectorySnapshot(
        sessionClient,
        auth.tenantId,
      );
      return NextResponse.json(directory.personnel, {
        headers: {
          "X-Total-Count": String(directory.total),
          "X-Directory-Limit": String(MEMBER_CARE_DIRECTORY_LIMIT),
        },
      });
    } catch (error) {
      return toApiErrorResponse(error, "Failed to load member care directory.");
    }
  },
  { capability: "care.access" },
);
