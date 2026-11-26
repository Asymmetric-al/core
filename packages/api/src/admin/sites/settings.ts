import { NextResponse } from "next/server";

import {
  SITES_CAPABILITY,
  commandRefusal,
  createSiteBodySchema,
  readBody,
  siteFromCommand,
  siteSettingsRpcSchema,
  sitesFailure,
  withNoStore,
  type SitesRpcClient,
} from "./contract";
import { withOperation } from "../../shared/with-operation";

export const GET = withNoStore(
  withOperation(
    async ({ auth, sessionClient, requestId }) => {
      const client = sessionClient as unknown as SitesRpcClient;
      const { data, error } = await client.rpc("tenant_site_settings", {
        p_tenant_id: auth.tenantId,
      });
      if (error) return commandRefusal("read", error, {}, requestId);
      const parsed = siteSettingsRpcSchema.safeParse(data);
      if (!parsed.success) return sitesFailure("read", null, requestId);
      return NextResponse.json(parsed.data, { status: 200 });
    },
    { capability: SITES_CAPABILITY },
  ),
);

export const POST = withNoStore(
  withOperation(
    async ({ auth, request, sessionClient, requestId }) => {
      const body = await readBody(request, createSiteBodySchema, "name");
      if (!body.ok) return body.response;
      const client = sessionClient as unknown as SitesRpcClient;
      const { data, error } = await client.rpc("create_site", {
        p_tenant_id: auth.tenantId,
        p_name: body.data.name,
      });
      if (error) {
        return commandRefusal(
          "create",
          error,
          { "23514": "INVALID_NAME", "23502": "INVALID_NAME" },
          requestId,
        );
      }
      const site = siteFromCommand(data, auth.tenantId);
      if (!site) return sitesFailure("create", null, requestId);
      return NextResponse.json({ site }, { status: 201 });
    },
    { capability: SITES_CAPABILITY },
  ),
);
