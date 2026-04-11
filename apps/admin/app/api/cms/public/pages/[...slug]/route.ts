import { NextResponse, type NextRequest } from "next/server";

import { getPayloadClient } from "../../../../../../src/cms/get-payload";
import { resolveTenantFromRequest } from "../../../../../../src/cms/public/resolve-tenant";
import {
  ensureRequestTimeExecution,
  publicCmsRouteErrorResponse,
} from "../../../../../../src/cms/public/route-helpers";
import { serializePublishedPageLike } from "../../../../../../src/cms/public/serialize-published-page";

type RouteContext = {
  params: Promise<{
    slug?: string[];
  }>;
};

function normalizeCmsSlug(segments: string[] | undefined) {
  const normalizedSegments = (segments ?? [])
    .map((segment) => {
      try {
        return decodeURIComponent(segment).trim();
      } catch {
        return segment.trim();
      }
    })
    .filter(Boolean);

  return normalizedSegments.join("/") || "home";
}

export async function GET(request: NextRequest, context: RouteContext) {
  await ensureRequestTimeExecution();

  try {
    const payload = await getPayloadClient();
    const tenant = await resolveTenantFromRequest(request, payload);

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const { slug } = await context.params;
    const pageSlug = normalizeCmsSlug(slug);

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
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    return NextResponse.json({
      page: serializePublishedPageLike(
        page as unknown as Record<string, unknown>,
      ),
      tenant: {
        id: tenant.id,
        slug: tenant.slug ?? null,
      },
    });
  } catch (error) {
    return publicCmsRouteErrorResponse(error, {
      clientMessage: "Failed to fetch page content",
      logMessage: "Failed to fetch published CMS page.",
    });
  }
}
