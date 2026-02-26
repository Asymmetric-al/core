import { getPayloadClient } from "../get-payload";

import type { NextRequest } from "next/server";
import type { Payload } from "payload";

type TenantDoc = {
  id: number | string;
  slug?: string | null;
  primaryDomain?: string | null;
};

type TenantResolverPayloadClient = Pick<Payload, "find">;

function normalizeHost(host: string | null) {
  if (!host) {
    return null;
  }

  return host.replace(/:\d+$/, "").toLowerCase();
}

export async function resolveTenantFromRequest(
  request: NextRequest,
  payloadOverride?: TenantResolverPayloadClient,
): Promise<TenantDoc | null> {
  const payload = payloadOverride ?? (await getPayloadClient());
  const explicitTenant = request.nextUrl.searchParams.get("tenant");
  const host = normalizeHost(
    request.headers.get("x-forwarded-host") ?? request.headers.get("host"),
  );

  if (explicitTenant) {
    const bySlug = await payload.find({
      collection: "tenants",
      limit: 1,
      overrideAccess: true,
      pagination: false,
      where: {
        slug: {
          equals: explicitTenant,
        },
      },
    });

    if (bySlug.docs[0]) {
      return bySlug.docs[0] as TenantDoc;
    }
  }

  if (!host) {
    return null;
  }

  const byDomain = await payload.find({
    collection: "tenants",
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: {
      primaryDomain: {
        equals: host,
      },
    },
  });

  if (byDomain.docs[0]) {
    return byDomain.docs[0] as TenantDoc;
  }

  const [subdomain] = host.split(".");
  if (!subdomain || subdomain === "www" || subdomain === "localhost") {
    return null;
  }

  const bySubdomain = await payload.find({
    collection: "tenants",
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: {
      slug: {
        equals: subdomain,
      },
    },
  });

  return (bySubdomain.docs[0] as TenantDoc | undefined) ?? null;
}
