import { type AuthenticatedContext } from "@asym/auth/context";
import { NextResponse } from "next/server";

import { getMissionaryPortalSnapshot } from "./service";
import { withOperation } from "../shared/with-operation";

export const GET = withOperation(
  async ({ supabaseAdmin, auth }) => {
    const ctx = auth as AuthenticatedContext;
    const portal = await getMissionaryPortalSnapshot({
      supabaseAdmin,
      profileId: ctx.profileId,
      tenantId: ctx.tenantId,
    });

    return NextResponse.json({ portal });
  },
  { roles: ["missionary"] },
);
