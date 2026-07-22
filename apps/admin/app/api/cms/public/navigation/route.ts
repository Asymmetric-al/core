import { NextResponse, type NextRequest } from "next/server";

import { getPayloadClient } from "../../../../../src/cms/get-payload";
import { createPayloadPublishedContentReader } from "../../../../../src/cms/public/published-content-reader";
import { resolveTenantFromRequest } from "../../../../../src/cms/public/resolve-tenant";
import {
  ensureRequestTimeExecution,
  publicCmsRouteErrorResponse,
} from "../../../../../src/cms/public/route-helpers";

export async function GET(request: NextRequest) {
  await ensureRequestTimeExecution();

  try {
    const payload = await getPayloadClient();
    const tenant = await resolveTenantFromRequest(request, payload);

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const reader = createPayloadPublishedContentReader(payload);
    const result = await reader.getNavigation({
      operationalTenantId: String(tenant.id),
      cmsTenantId: tenant.id,
      siteId: null,
    });

    if (result.status === "unavailable") {
      return NextResponse.json({ error: result.error }, { status: 503 });
    }

    return NextResponse.json({
      navigation: result.navigation,
      tenant: result.tenant,
    });
  } catch (error) {
    return publicCmsRouteErrorResponse(error, {
      clientMessage: "Failed to fetch navigation content",
      logMessage: "Failed to fetch CMS navigation.",
    });
  }
}
