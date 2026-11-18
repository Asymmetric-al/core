/**
 * #2708: tenant tables an anonymous caller may read through the Data API,
 * each by an owner ruling. Anything else readable without signing in fails
 * the isolation sweep. Adding an entry needs a new ruling
 * (docs/security/tenant-read-floor.md, "Forward rule").
 *
 * Sources: #2312 closed every other public read
 * (20261025120800_close_public_reads_tenant_scope.sql); the reads that stay
 * are listed in 20261117034926_close_default_privileges_and_demo_grants.sql
 * (AL-2674, audit NA-06): published posts, their comments and reactions, and
 * published locations.
 */
export const RULED_PUBLIC_READS: ReadonlySet<string> = new Set([
  "public.posts",
  "public.post_comments",
  "public.post_likes",
  "public.post_prayers",
  "public.post_fires",
  "public.locations",
]);
