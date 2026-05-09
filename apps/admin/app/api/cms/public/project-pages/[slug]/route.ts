import { NextResponse, type NextRequest } from "next/server";

import { getPayloadClient } from "../../../../../../src/cms/get-payload";
import {
  publicCmsPublishedPageResponse,
  readPublishedPageLike,
} from "../../../../../../src/cms/public/published-page-read";
import { resolveTenantFromRequest } from "../../../../../../src/cms/public/resolve-tenant";
import {
  ensureRequestTimeExecution,
  publicCmsRouteErrorResponse,
} from "../../../../../../src/cms/public/route-helpers";

type RouteContext = {
  params: Promise<{
    slug: string;
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

    const { slug: rawSlug } = await context.params;
    const result = await readPublishedPageLike({
      payload,
      tenant,
      descriptor: { kind: "project-page", slug: rawSlug ?? "" },
    });

    return publicCmsPublishedPageResponse(result);
  } catch (error) {
    return publicCmsRouteErrorResponse(error, {
      clientMessage: "Failed to fetch page content",
      logMessage: "Failed to fetch published project page.",
    });
  }
}
