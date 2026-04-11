import { NextResponse, type NextRequest } from "next/server";

import { getPayloadClient } from "../../../../../src/cms/get-payload";
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

    const navigationQuery = await payload.find({
      collection: "navigation",
      limit: 1,
      overrideAccess: true,
      pagination: false,
      sort: "-updatedAt",
      where: {
        tenant: {
          equals: tenant.id,
        },
      },
    });

    return NextResponse.json({
      navigation: navigationQuery.docs[0] ?? null,
      tenant: {
        slug: tenant.slug ?? null,
      },
    });
  } catch (error) {
    return publicCmsRouteErrorResponse(error, {
      clientMessage: "Failed to fetch navigation content",
      logMessage: "Failed to fetch CMS navigation.",
    });
  }
}
