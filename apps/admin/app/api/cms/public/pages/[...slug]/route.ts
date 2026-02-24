import { NextResponse, connection, type NextRequest } from "next/server";

import { getPayloadClient } from "../../../../../../src/cms/get-payload";
import { resolveTenantFromRequest } from "../../../../../../src/cms/public/resolve-tenant";

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
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
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
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    return NextResponse.json({
      page,
      tenant: {
        id: tenant.id,
        slug: tenant.slug ?? null,
      },
    });
  } catch (error) {
    console.error("Failed to fetch published CMS page.", error);

    return NextResponse.json(
      { error: "Failed to fetch page content" },
      { status: 500 },
    );
  }
}
