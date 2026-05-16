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

  const normalized = host.trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  try {
    return new URL(`http://${normalized}`).hostname.replace(/^\[|\]$/g, "");
  } catch {
    if (normalized.startsWith("[") && normalized.includes("]")) {
      return normalized.slice(1, normalized.indexOf("]"));
    }

    return normalized.replace(/:\d+$/, "");
  }
}

function isLoopbackHost(host: string | null) {
  return host === "localhost" || host === "127.0.0.1" || host === "::1";
}

function isLocalTenantFallbackAllowed() {
  return process.env.NODE_ENV !== "production";
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

async function findOnlyActiveTenant(payload: TenantResolverPayloadClient) {
  const result = await payload.find({
    collection: "tenants",
    limit: 2,
    overrideAccess: true,
    pagination: false,
    where: {
      isActive: {
        equals: true,
      },
    },
  });

  if (result.docs.length !== 1) {
    return null;
  }

  return result.docs[0] as TenantDoc;
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
    if (
      subdomain &&
      subdomain !== "www" &&
      subdomain !== "localhost" &&
      !isLoopbackHost(host)
    ) {
      const bySubdomain = await findTenantBySlug(payload, subdomain);
      if (bySubdomain) {
        return bySubdomain;
      }
    }
  }

  if (explicitTenant) {
    return findTenantBySlug(payload, explicitTenant);
  }

  if (isLoopbackHost(host) && isLocalTenantFallbackAllowed()) {
    const localDefaultTenantSlug = process.env.CMS_LOCAL_DEFAULT_TENANT_SLUG;
    if (localDefaultTenantSlug) {
      const localTenant = await findTenantBySlug(
        payload,
        localDefaultTenantSlug,
      );
      if (localTenant) {
        return localTenant;
      }
    }

    return findOnlyActiveTenant(payload);
  }

  return null;
}
