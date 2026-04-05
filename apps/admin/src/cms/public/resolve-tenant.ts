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

async function findTenantBySlug(
  payload: TenantResolverPayloadClient,
  slug: string,
) {
  const result = await payload.find({
    collection: "tenants",
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: {
      slug: {
        equals: slug,
      },
    },
  });

  return (result.docs[0] as TenantDoc | undefined) ?? null;
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

  if (host) {
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
    if (subdomain && subdomain !== "www" && subdomain !== "localhost") {
      const bySubdomain = await findTenantBySlug(payload, subdomain);
      if (bySubdomain) {
        return bySubdomain;
      }
    }
  }

  if (!explicitTenant) {
    return null;
  }

  return findTenantBySlug(payload, explicitTenant);
}
