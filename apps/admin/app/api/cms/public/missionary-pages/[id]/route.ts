import { NextResponse, type NextRequest } from "next/server";

import { MISSIONARY_GIVING_PAGES_SLUG } from "../../../../../../src/cms/constants";
import { getPayloadClient } from "../../../../../../src/cms/get-payload";
import { resolveTenantFromRequest } from "../../../../../../src/cms/public/resolve-tenant";
import {
  ensureRequestTimeExecution,
  publicCmsRouteErrorResponse,
} from "../../../../../../src/cms/public/route-helpers";
import { serializePublishedPageLike } from "../../../../../../src/cms/public/serialize-published-page";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  await ensureRequestTimeExecution();

  try {
    const payload = await getPayloadClient();
    const tenant = await resolveTenantFromRequest(request, payload);

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const { id: rawId } = await context.params;
    let missionaryId = rawId?.trim() ?? "";
    try {
      missionaryId = decodeURIComponent(missionaryId);
    } catch {
      /* keep raw */
    }

    if (!missionaryId) {
      return NextResponse.json(
        { error: "Missionary id required" },
        { status: 400 },
      );
    }

    const pageQuery = await payload.find({
      collection: MISSIONARY_GIVING_PAGES_SLUG,
      limit: 1,
      overrideAccess: true,
      pagination: false,
      sort: "-updatedAt",
      where: {
        and: [
          { tenant: { equals: tenant.id } },
          { missionaryId: { equals: missionaryId } },
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
      logMessage: "Failed to fetch published missionary giving page.",
    });
  }
}
