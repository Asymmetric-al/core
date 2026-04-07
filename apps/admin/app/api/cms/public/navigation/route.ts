import { NextResponse, connection, type NextRequest } from "next/server";

import {
  getPayloadClient,
  isPayloadClientInitializationError,
} from "../../../../../src/cms/get-payload";
import { resolveTenantFromRequest } from "../../../../../src/cms/public/resolve-tenant";

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
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
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

    return NextResponse.json({
      navigation: navigationQuery.docs[0] ?? null,
      tenant: {
        id: tenant.id,
        slug: tenant.slug ?? null,
      },
    });
  } catch (error) {
    if (isPayloadClientInitializationError(error)) {
      console.error(error.message);

      return NextResponse.json(
        { error: "Failed to fetch navigation content" },
        { status: error.statusCode },
      );
    }

    console.error("Failed to fetch CMS navigation.", error);

    return NextResponse.json(
      { error: "Failed to fetch navigation content" },
      { status: 500 },
    );
  }
}
