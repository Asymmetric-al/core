import { NextResponse, connection, type NextRequest } from "next/server";

import { getPayloadClient } from "@/src/cms/get-payload";
import { resolveTenantFromRequest } from "@/src/cms/public/resolve-tenant";

export async function GET(request: NextRequest) {
  await connection();

  const payload = await getPayloadClient();
  const tenant = await resolveTenantFromRequest(request);

  if (!tenant) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
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

  return NextResponse.json({
    tenant: {
      id: tenant.id,
      slug: tenant.slug ?? null,
    },
    updates: updatesQuery.docs,
  });
}
