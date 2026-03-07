import { connection, type NextRequest } from "next/server";

import { getPayloadClient } from "../../../../../src/cms/get-payload";
import { resolveTenantFromRequest } from "../../../../../src/cms/public/resolve-tenant";
import {
  createPublicCmsErrorResponse,
  createPublicCmsJsonResponse,
  toCmsPublicUpdate,
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

    const limitParam = request.nextUrl.searchParams.get("limit");
    const limit = limitParam ? Number.parseInt(limitParam, 10) : 5;

    const updatesQuery = await payload.find({
      collection: "ministry-updates",
      limit: Number.isNaN(limit) ? 5 : Math.min(Math.max(limit, 1), 20),
      overrideAccess: true,
      pagination: false,
      sort: "-publishedAt",
      where: {
        and: [
          {
            tenant: {
              equals: tenant.id,
            },
          },
          {
            _status: {
              equals: "published",
            },
          },
        ],
      },
    });

    return createPublicCmsJsonResponse({
      tenant: toCmsTenantSummary(tenant),
      updates: updatesQuery.docs.map((update) => toCmsPublicUpdate(update)),
    });
  } catch (error) {
    console.error("Failed to fetch ministry updates.", error);

    return createPublicCmsErrorResponse(
      500,
      "UPSTREAM_FAILURE",
      "Failed to fetch ministry updates",
    );
  }
}
