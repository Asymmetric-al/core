import { getPayloadClient } from "../get-payload";

import type { PublicRequestContext } from "@asym/api/cms/public";
import type { NextRequest } from "next/server";
import type { Payload } from "payload";

type TenantDoc = {
  id: number | string;
  slug?: string | null;
  primaryDomain?: string | null;
};

type TenantResolverPayloadClient = Pick<Payload, "find">;

/**
 * Builds the published-content reader's required request context from a
 * resolved tenant. The reserved `siteId` seam stays null until #524 formalizes
 * the unified host→tenant/site resolver.
 */
export function toPublicRequestContext(tenant: {
  id: number | string;
}): PublicRequestContext {
  return {
    operationalTenantId: String(tenant.id),
    cmsTenantId: tenant.id,
    siteId: null,
  };
}

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

/**
 * Non-production tenant-selection aids — the loopback default tenant and the
 * `?tenant=` slug override — are development conveniences only.
 *
 * In production the tenant must come from the platform-trusted host (Phase 5
 * ruling A6). A request-controlled selector would let a visitor on one
 * ministry's domain read another ministry's published content, which is the
 * cross-tenant exposure ADR-0028 exists to prevent.
 */
function isNonProductionTenantSelectionAllowed() {
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

  if (explicitTenant && isNonProductionTenantSelectionAllowed()) {
    return findTenantBySlug(payload, explicitTenant);
  }

  if (isLoopbackHost(host) && isNonProductionTenantSelectionAllowed()) {
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
