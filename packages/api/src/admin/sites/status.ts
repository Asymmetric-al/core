import { NextResponse } from "next/server";

import {
  SITES_CAPABILITY,
  commandRefusal,
  readBody,
  siteFromCommand,
  siteStatusBodySchema,
  sitesFailure,
  withNoStore,
  type SitesRpcClient,
} from "./contract";
import { withOperation } from "../../shared/with-operation";

export const POST = withNoStore(
  withOperation(
    async ({ auth, request, sessionClient, requestId }) => {
      const body = await readBody(request, siteStatusBodySchema);
      if (!body.ok) return body.response;
      const client = sessionClient as unknown as SitesRpcClient;
      const { data, error } = await client.rpc("set_site_status", {
        p_tenant_id: auth.tenantId,
        p_site_id: body.data.siteId,
        p_status: body.data.status,
      });
      if (error) {
        return commandRefusal(
          "status",
          error,
          { P0002: "SITE_NOT_FOUND", "23514": "DEFAULT_SITE_ALWAYS_ACTIVE" },
          requestId,
        );
      }
      const site = siteFromCommand(data, auth.tenantId);
      if (!site) return sitesFailure("status", null, requestId);
      return NextResponse.json({ site }, { status: 200 });
    },
    { capability: SITES_CAPABILITY },
  ),
);
