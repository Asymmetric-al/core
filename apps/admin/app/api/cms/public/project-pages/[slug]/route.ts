import { NextResponse, type NextRequest } from "next/server";

import { PROJECT_PAGES_SLUG } from "../../../../../../src/cms/constants";
import { getPayloadClient } from "../../../../../../src/cms/get-payload";
import { resolveTenantFromRequest } from "../../../../../../src/cms/public/resolve-tenant";
import {
  ensureRequestTimeExecution,
  publicCmsRouteErrorResponse,
} from "../../../../../../src/cms/public/route-helpers";
import { serializePublishedPageLike } from "../../../../../../src/cms/public/serialize-published-page";

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

function normalizeSlug(raw: string) {
  try {
    return decodeURIComponent(raw).trim();
  } catch {
    return raw.trim();
  }
}

export async function GET(request: NextRequest, context: RouteContext) {
  await ensureRequestTimeExecution();

  try {
    const payload = await getPayloadClient();
    const tenant = await resolveTenantFromRequest(request, payload);

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const { slug: rawSlug } = await context.params;
    const slug = normalizeSlug(rawSlug ?? "");
    if (!slug) {
      return NextResponse.json({ error: "Slug required" }, { status: 400 });
    }

    const pageQuery = await payload.find({
      collection: PROJECT_PAGES_SLUG,
      limit: 1,
      overrideAccess: true,
      pagination: false,
      sort: "-updatedAt",
      where: {
        and: [
          { tenant: { equals: tenant.id } },
          { slug: { equals: slug } },
          { _status: { equals: "published" } },
        ],
      },
    });

    const doc = pageQuery.docs[0];
    if (!doc) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    return NextResponse.json({
      page: serializePublishedPageLike(
        doc as unknown as Record<string, unknown>,
      ),
      tenant: {
        id: tenant.id,
        slug: tenant.slug ?? null,
      },
    });
  } catch (error) {
    return publicCmsRouteErrorResponse(error, {
      clientMessage: "Failed to fetch page content",
      logMessage: "Failed to fetch published project page.",
    });
  }
}
