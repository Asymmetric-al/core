import { connection, type NextRequest } from "next/server";

import { getPayloadClient } from "../../../../../../src/cms/get-payload";
import { resolveTenantFromRequest } from "../../../../../../src/cms/public/resolve-tenant";
import {
  createPublicCmsErrorResponse,
  createPublicCmsJsonResponse,
  toCmsPublicPage,
  toCmsTenantSummary,
} from "../../../../../../src/cms/public/response";

type RouteContext = {
  params: Promise<{
    slug: string[];
  }>;
};

async function ensureRequestTimeExecution() {
  if (process.env.NODE_ENV === "test") {
    return;
  }

  await connection();
}

export async function GET(request: NextRequest, context: RouteContext) {
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

    const { slug } = await context.params;
    const slugSegments = Array.isArray(slug) ? slug : [];
    const pageSlug =
      slugSegments
        .map((segment) => segment.trim())
        .filter(Boolean)
        .join("/") || "home";

    const pageQuery = await payload.find({
      collection: "pages",
      limit: 1,
      overrideAccess: true,
      pagination: false,
      sort: "-updatedAt",
      where: {
        and: [
          {
            tenant: {
              equals: tenant.id,
            },
          },
          {
            slug: {
              equals: pageSlug,
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

    const page = pageQuery.docs[0];
    if (!page) {
      return createPublicCmsErrorResponse(
        404,
        "PAGE_NOT_FOUND",
        "Page not found",
      );
    }

    return createPublicCmsJsonResponse({
      page: toCmsPublicPage(page),
      tenant: toCmsTenantSummary(tenant),
    });
  } catch (error) {
    console.error("Failed to fetch published CMS page.", error);

    return createPublicCmsErrorResponse(
      500,
      "UPSTREAM_FAILURE",
      "Failed to fetch page content",
    );
  }
}
