import { NextResponse, type NextRequest } from "next/server";

import { getPayloadClient } from "@/src/cms/get-payload";
import { resolveTenantFromRequest } from "@/src/cms/public/resolve-tenant";

type RouteContext = {
  params: Promise<{
    slug: string[];
  }>;
};

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, context: RouteContext) {
  const payload = await getPayloadClient();
  const tenant = await resolveTenantFromRequest(request);

  if (!tenant) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }

  const { slug } = await context.params;
  const pageSlug = slug.length ? slug.join("/") : "home";

  const pageQuery = await payload.find({
    collection: "pages",
    limit: 1,
    overrideAccess: true,
    pagination: false,
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
    page,
    tenant: {
      id: tenant.id,
      slug: tenant.slug ?? null,
    },
  });
}
