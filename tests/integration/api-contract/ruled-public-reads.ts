/**
 * #2708: tenant tables an anonymous caller may read through the Data API, and
 * which of their rows, each by an owner ruling. The ruling covers rows, not
 * tables: published posts, their comments and reactions, and published
 * locations. Any other row readable without signing in, or by a user of
 * another tenant, fails the isolation sweep. Adding an entry or widening a
 * predicate needs a new ruling (docs/security/tenant-read-floor.md, "Forward
 * rule").
 *
 * Sources: #2312 closed every other public read
 * (20261025120800_close_public_reads_tenant_scope.sql). The row predicates
 * below are the ones the policies apply today
 * (20260625002117_canonical_tanstack_db_realtime_rls.sql, policy
 * "tanstack browser read": posts published and public, interaction rows of
 * such a post, locations published). The in-flight AL-2674 migration
 * 20261117034926_close_default_privileges_and_demo_grants.sql (not on develop
 * yet; audit NA-06) lists the same reads as the ones that stay.
 *
 * `publicRows` is SQL over the table aliased `t`, evaluated by the admin
 * connection to compute exactly which rows the ruling makes public.
 */
export type RuledPublicRead = { publicRows: string };

const PUBLIC_POST = (postId: string) =>
  `exists (select 1 from public.posts p where p.id = ${postId} and p.status = 'published' and p.visibility = 'public')`;

export const RULED_PUBLIC_READS: ReadonlyMap<string, RuledPublicRead> = new Map(
  [
    [
      "public.posts",
      { publicRows: "t.status = 'published' and t.visibility = 'public'" },
    ],
    ["public.post_comments", { publicRows: PUBLIC_POST("t.post_id") }],
    ["public.post_likes", { publicRows: PUBLIC_POST("t.post_id") }],
    ["public.post_prayers", { publicRows: PUBLIC_POST("t.post_id") }],
    ["public.post_fires", { publicRows: PUBLIC_POST("t.post_id") }],
    ["public.locations", { publicRows: "t.status = 'published'" }],
  ],
);
