import { tenantScopedReadAccess } from "./tenant-access";
import { getTenantContext, isSuperAdmin } from "./tenant-context";

import type { Access, PayloadRequest, Where } from "payload";

/**
 * The public-read access policy (Phase 5 (Public Website Runtime Contract),
 * ruling A5; ADR-0028; issue #523).
 *
 * The published-content reader (the sole public choke-point) tags its Payload
 * Local API reads with a request-context marker carrying the resolved CMS
 * tenant. When the marker is present, access control constrains the read to
 * "the resolved tenant's published documents" — independently of the reader's
 * own `where` clause, so Payload enforces isolation even if an explicit
 * filter were ever wrong. Requests without the marker keep the existing
 * staff/admin behavior untouched.
 *
 * The marker takes precedence over any authenticated user: a signed-in donor
 * browsing a public route gets the same published-only view (no elevation on
 * public routes).
 */

const PUBLIC_READ_CONTEXT_KEY = "asymPublicRead";

export type PublicReadContext = {
  /** The resolved CMS tenant document id (`cms` schema). */
  cmsTenantId: number | string;
};

/**
 * Builds the request context the choke-point passes to Payload's Local API
 * (`payload.find({ context })`), which Payload exposes to access control as
 * `req.context`.
 */
export function buildPublicReadRequestContext(
  context: PublicReadContext,
): Record<string, unknown> {
  return { [PUBLIC_READ_CONTEXT_KEY]: { cmsTenantId: context.cmsTenantId } };
}

function isBlankTenantId(value: unknown): boolean {
  if (typeof value === "number") {
    return !Number.isFinite(value);
  }
  if (typeof value === "string") {
    return value.trim() === "";
  }
  return true;
}

/**
 * Reads and validates the public-read marker from a Payload request. A
 * missing, malformed, or blank-tenant marker returns `null` — the request is
 * then treated as an ordinary (staff) request, never as an unfiltered public
 * one.
 */
export function getPublicReadContext(
  req: PayloadRequest,
): PublicReadContext | null {
  const raw = (req.context as Record<string, unknown> | undefined)?.[
    PUBLIC_READ_CONTEXT_KEY
  ];
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const cmsTenantId = (raw as Record<string, unknown>).cmsTenantId;
  if (
    (typeof cmsTenantId !== "string" && typeof cmsTenantId !== "number") ||
    isBlankTenantId(cmsTenantId)
  ) {
    return null;
  }

  return { cmsTenantId };
}

/**
 * A future public-read predicate (restricted-country / sensitive / consent —
 * Phase 3 #496) appends a constraint for the resolved public context, or
 * returns `false` to deny the read outright. Adding one is additive: no
 * policy rewrite, no reader change.
 */
export type PublicReadPredicate = (
  publicRead: PublicReadContext,
) => Where | false;

export type PublishedPublicReadOptions = {
  /**
   * Whether the collection has Payload drafts (`versions.drafts`). Draft
   * documents carry `_status`, and a public read must only see
   * `_status: published`. Versionless collections have no `_status` column,
   * so the constraint would be an invalid query — every document in them is
   * live by definition.
   */
  draftable: boolean;
  extraPredicates?: readonly PublicReadPredicate[];
};

/**
 * Collection `read` access for public-serving content collections:
 * anonymous public reads see only the resolved tenant's published documents;
 * everything without the marker keeps the existing tenant-scoped staff
 * behavior.
 */
export const publishedPublicReadAccess = (
  tenantField: string = "tenant",
  options: PublishedPublicReadOptions,
): Access => {
  const staffAccess = tenantScopedReadAccess(tenantField);

  return (args) => {
    const publicRead = getPublicReadContext(args.req);
    if (!publicRead) {
      return staffAccess(args);
    }

    const constraints: Where[] = [
      { [tenantField]: { equals: publicRead.cmsTenantId } },
    ];
    if (options.draftable) {
      constraints.push({ _status: { equals: "published" } });
    }
    for (const predicate of options.extraPredicates ?? []) {
      const constraint = predicate(publicRead);
      if (constraint === false) {
        return false;
      }
      constraints.push(constraint);
    }

    return { and: constraints };
  };
};

/**
 * `tenants` read access with the public-read arm: a public request may see
 * exactly the resolved tenant's own document, and only while it is active —
 * a disabled tenant serves nothing. Staff behavior is unchanged.
 */
export const publicTenantReadAccess = (): Access => {
  return ({ req }) => {
    const publicRead = getPublicReadContext(req);
    if (publicRead) {
      const constraints: Where[] = [
        { id: { equals: publicRead.cmsTenantId } },
        { isActive: { equals: true } },
      ];
      const publicConstraint: Where = { and: constraints };
      return publicConstraint;
    }

    const context = getTenantContext(req);

    if (!context.isAuthenticated) {
      return false;
    }

    if (isSuperAdmin(context)) {
      return true;
    }

    if (!context.tenantId) {
      return false;
    }

    const staffConstraint: Where = {
      id: {
        equals: context.tenantId,
      },
    };
    return staffConstraint;
  };
};
