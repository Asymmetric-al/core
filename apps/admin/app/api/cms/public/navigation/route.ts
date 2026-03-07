import { connection, type NextRequest } from "next/server";

import { getPayloadClient } from "../../../../../src/cms/get-payload";
import { resolveTenantFromRequest } from "../../../../../src/cms/public/resolve-tenant";
import {
  createPublicCmsErrorResponse,
  createPublicCmsJsonResponse,
  toCmsPublicNavigation,
  toCmsTenantSummary,
} from "../../../../../src/cms/public/response";

async function ensureRequestTimeExecution() {
  if (process.env.NODE_ENV === "test") {
    return;
  }

  await connection();
}

export async function GET(request: NextRequest) {
  await ensureRequestTimeExecution();

  try {
    const payload = await getPayloadClient();
    const tenant = await resolveTenantFromRequest(request, payload);

    if (!tenant) {
      return createPublicCmsErrorResponse(
        404,
        "TENANT_NOT_FOUND",
        "Tenant not found",
      );
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

    return createPublicCmsJsonResponse({
      navigation: navigationQuery.docs[0]
        ? toCmsPublicNavigation(navigationQuery.docs[0])
        : null,
      tenant: toCmsTenantSummary(tenant),
    });
  } catch (error) {
    console.error("Failed to fetch CMS navigation.", error);

    return createPublicCmsErrorResponse(
      500,
      "UPSTREAM_FAILURE",
      "Failed to fetch navigation content",
    );
  }
}
