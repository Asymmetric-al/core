import { NextResponse } from "next/server";

import { getMissionaryPortalSnapshot } from "./service";
import { missionaryScope } from "../shared/missionary-authority";
import { withPlatformOperation } from "../shared/with-operation";

export const GET = withPlatformOperation(
  async ({ supabaseAdmin, auth }) => {
    const portal = await getMissionaryPortalSnapshot({
      supabaseAdmin,
      ...missionaryScope(auth),
    });

    return NextResponse.json({ portal });
  },
  { roleClasses: ["missionary"] },
);
