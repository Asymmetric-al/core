import { NextResponse } from "next/server";

import {
  SITES_CAPABILITY,
  commandRefusal,
  createSiteBodySchema,
  readBody,
  sameTenant,
  siteFromCommand,
  siteSettingsRpcSchema,
  sitesFailure,
  withNoStore,
  type SitesRpcClient,
} from "./contract";
import { reportOperationFailure } from "../../shared/http-errors";
import {
  withOperation,
  type OperationRouteContext,
} from "../../shared/with-operation";

import type { NextRequest } from "next/server";

export type SitesPostHandler = (
  request: NextRequest,
  routeContext?: OperationRouteContext,
) => Promise<NextResponse>;

export type CoreSite = { id: string; tenantId: string };

export type SiteCreated = {
  siteId: string;
  tenantId: string;
  readSite: (siteId: string) => Promise<CoreSite | null>;
};

export type SiteCreatedStep = (created: SiteCreated) => Promise<void>;

export function tenantSiteReader(
  client: SitesRpcClient,
  tenantId: string,
): SiteCreated["readSite"] {
  return async (siteId) => {
    const { data, error } = await client.rpc("tenant_site_settings", {
      p_tenant_id: tenantId,
    });
    if (error) {
      throw Object.assign(new Error("Core could not read the Sites."), {
        code: error.code,
      });
    }
    const parsed = siteSettingsRpcSchema.safeParse(data);
    if (!parsed.success) {
      throw new Error("Core answered the Sites read in an unknown shape.");
    }
    const site = parsed.data.sites.find((candidate) =>
      sameTenant(candidate.id, siteId),
    );
    return site ? { id: site.id, tenantId } : null;
  };
}

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

export function createSitePost(
  afterCreate?: SiteCreatedStep,
): SitesPostHandler {
  return withNoStore(
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
        if (afterCreate) {
          try {
            await afterCreate({
              siteId: site.id,
              tenantId: auth.tenantId,
              readSite: tenantSiteReader(client, auth.tenantId),
            });
          } catch (failure) {
            await reportOperationFailure(
              "admin.sites.create.presentation",
              failure,
              requestId,
              500,
            );
          }
        }
        return NextResponse.json({ site }, { status: 201 });
      },
      { capability: SITES_CAPABILITY },
    ),
  );
}

export const POST = createSitePost();
