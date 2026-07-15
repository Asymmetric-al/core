import { revalidateTag } from "next/cache";

export const CACHE_TAGS = {
  // Legacy broad tag retained for compatibility with older paths.
  posts: "posts",
  tenantPosts: (tenantId: string) => `posts:tenant:${tenantId}`,
  post: (postId: string) => `post:${postId}`,
} as const;

/**
 * Cache tag strategy for Mission Control admin data (Next.js Cache
 * Components).
 *
 * Naming convention:
 * - `admin:<domain>` — broad tag covering every cached read in a domain.
 * - `admin:<domain>:tenant:<tenantId>` — tenant-scoped variant.
 * - `admin:<domain>:<resource>` — one resource family within a domain.
 *
 * Cached reads (`'use cache'`) for an admin domain must `cacheTag` the broad
 * domain tag, the tenant tag, and the most specific resource tag that
 * applies. Mutation route handlers call the matching `revalidateAdmin*Cache`
 * helper after a successful write, mirroring the client-side
 * `queryClient.invalidateQueries` they already perform. Until cached admin
 * reads exist for a domain, revalidation is a safe no-op.
 *
 * New domains (for example `admin:tasks` or `admin:events` once they gain
 * server mutation routes) should follow the same shape.
 */
export const ADMIN_CACHE_TAGS = {
  contributions: {
    base: "admin:contributions",
    tenant: (tenantId: string) => `admin:contributions:tenant:${tenantId}`,
    list: "admin:contributions:list",
    stagedGifts: "admin:contributions:staged-gifts",
    summary: "admin:contributions:summary",
  },
  crm: {
    base: "admin:crm",
    tenant: (tenantId: string) => `admin:crm:tenant:${tenantId}`,
    records: "admin:crm:records",
    notes: "admin:crm:notes",
    relationships: "admin:crm:relationships",
    projections: "admin:crm:projections",
    reports: "admin:crm:reports",
  },
} as const;

/**
 * Member-care read models and mutations share this tag family. The cached
 * reads in `reads/member-care.ts` attach these tags; the mutation helper
 * `revalidateMemberCareCache` must revalidate the same set, or directory /
 * activity / private-note lists go stale after a staff write.
 */
export const MEMBER_CARE_CACHE_TAGS = {
  base: "member-care",
  tenant: (tenantId: string) => `member-care:${tenantId}`,
  dashboard: "member-care:dashboard",
  directory: "member-care:directory",
  activity: "member-care:activity",
  activityForMissionary: (missionaryId: string) =>
    `member-care:activity:${missionaryId}`,
  privateNotes: "member-care:private-notes",
} as const;

/**
 * Read-only dashboard / portal cache tags. No mutation revalidates these
 * today; the constants exist so a future mutation invalidates them by
 * reference instead of retyping the string, and so every cached read draws
 * its tags from one place.
 */
export const READ_CACHE_TAGS = {
  dashboardStats: "dashboard-stats",
  dashboardHomeMissionary: "dashboard-home-missionary",
  donorHistory: "donor-history",
  donorProfile: "donor-profile",
  missionaryMetrics: "missionary-metrics",
  tenant: (tenantId: string) => `tenant:${tenantId}`,
  donor: (donorId: string) => `donor:${donorId}`,
  profile: (profileId: string) => `profile:${profileId}`,
  missionary: (missionaryId: string) => `missionary:${missionaryId}`,
} as const;

function revalidateTags(tags: string[]): void {
  for (const tag of tags) {
    try {
      revalidateTag(tag, "max");
    } catch (error) {
      console.error(`Failed to revalidate cache tag "${tag}"`, error);
    }
  }
}

/**
 * Invalidate every cached admin CRM read after a CRM mutation (note
 * creation, sync replay/reconcile, inbound Twenty webhook). Pass `null` when
 * the mutation has no tenant context (for example inbound webhooks resolved
 * downstream).
 */
export function revalidateAdminCrmCache(tenantId: string | null): void {
  const crm = ADMIN_CACHE_TAGS.crm;
  revalidateTags([
    crm.base,
    ...(tenantId ? [crm.tenant(tenantId)] : []),
    crm.records,
    crm.notes,
    crm.relationships,
    crm.projections,
    crm.reports,
  ]);
}

/**
 * Invalidate every cached admin contributions read after a giving mutation
 * (staged gift review/approve/retry/receipt, replay, reconciliation, or the
 * Stripe webhook / donation saga that stages and settles gifts). Pass `null`
 * when the mutation has no tenant context.
 */
export function revalidateAdminContributionsCache(
  tenantId: string | null,
): void {
  const contributions = ADMIN_CACHE_TAGS.contributions;
  revalidateTags([
    contributions.base,
    ...(tenantId ? [contributions.tenant(tenantId)] : []),
    contributions.list,
    contributions.stagedGifts,
    contributions.summary,
  ]);
}

/**
 * Invalidate cached member-care reads after a member-care mutation (thread
 * post, private note, care goal/requirement upsert, activity log, manual
 * attention flag). Mirrors the tag set attached by the cached reads in
 * `reads/member-care.ts`.
 */
export function revalidateMemberCareCache(tenantId: string): void {
  const memberCare = MEMBER_CARE_CACHE_TAGS;
  revalidateTags([
    memberCare.base,
    memberCare.tenant(tenantId),
    memberCare.dashboard,
    memberCare.directory,
    memberCare.activity,
    memberCare.privateNotes,
  ]);
}
