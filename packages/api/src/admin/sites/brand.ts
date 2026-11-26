import { NextResponse } from "next/server";

import {
  SITES_CAPABILITY,
  brandBodySchema,
  brandFromCommand,
  commandRefusal,
  readBody,
  sitesFailure,
  withNoStore,
  type SitesRpcClient,
} from "./contract";
import { withOperation } from "../../shared/with-operation";

export const POST = withNoStore(
  withOperation(
    async ({ auth, request, sessionClient, requestId }) => {
      const body = await readBody(request, brandBodySchema, "displayName");
      if (!body.ok) return body.response;
      const client = sessionClient as unknown as SitesRpcClient;
      const { data, error } = await client.rpc("set_account_brand", {
        p_tenant_id: auth.tenantId,
        p_display_name: body.data.displayName,
      });
      if (error) {
        return commandRefusal(
          "brand",
          error,
          { "23514": "INVALID_NAME", "23502": "INVALID_NAME" },
          requestId,
        );
      }
      const brand = brandFromCommand(data, auth.tenantId);
      if (!brand) return sitesFailure("brand", null, requestId);
      return NextResponse.json({ brand }, { status: 200 });
    },
    { capability: SITES_CAPABILITY },
  ),
);
