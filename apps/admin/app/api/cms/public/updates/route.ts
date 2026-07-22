import { NextResponse, type NextRequest } from "next/server";

import { getPayloadClient } from "../../../../../src/cms/get-payload";
import { createPayloadPublishedContentReader } from "../../../../../src/cms/public/published-content-reader";
import {
  resolveTenantFromRequest,
  toPublicRequestContext,
} from "../../../../../src/cms/public/resolve-tenant";
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

    const limitParam = request.nextUrl.searchParams.get("limit");
    const limit = limitParam ? Number.parseInt(limitParam, 10) : undefined;

    const reader = createPayloadPublishedContentReader(payload);
    const result = await reader.getUpdates(toPublicRequestContext(tenant), {
      limit,
    });

    if (result.status === "unavailable") {
      return NextResponse.json({ error: result.error }, { status: 503 });
    }

    return NextResponse.json({
      tenant: result.tenant,
      updates: result.updates,
    });
  } catch (error) {
    return publicCmsRouteErrorResponse(error, {
      clientMessage: "Failed to fetch ministry updates",
      logMessage: "Failed to fetch ministry updates.",
    });
  }
}
