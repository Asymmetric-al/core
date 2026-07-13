BEGIN;

-- Canonical TanStack DB browser collection safety posture.
--
-- This migration intentionally does two things before browser collections become
-- the default data layer:
-- 1. Remove the demo-wide anon "public read" policy from tables that contain
--    secrets, donor PII, finance state, workflow state, or document internals.
-- 2. Add duplicate-safe Realtime publication entries only for tables that are
--    actively visible in live UI and whose payloads are acceptable for browser
--    sync after RLS filtering.
--
-- Supabase Auth and RLS remain the browser security boundary. Server commands
-- in packages/api remain the authority for payments, donations, receipts,
-- audits, webhooks, role changes, RPC counter workflows, and multi-table writes.

DO $$
DECLARE
  blocked_table text;
BEGIN
  FOREACH blocked_table IN ARRAY ARRAY[
    'tenants',
    'profiles',
    'donors',
    'donations',
    'donor_activities',
    'donor_pledges',
    'donor_feed_preferences',
    'follower_requests',
    'missionary_tasks',
    'pdf_templates'
  ]
  LOOP
    IF to_regclass(format('public.%I', blocked_table)) IS NOT NULL THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', blocked_table);
      EXECUTE format('DROP POLICY IF EXISTS "public read" ON public.%I', blocked_table);
    END IF;
  END LOOP;
END $$;

-- Secret-bearing tenant rows must never be browser-table readable. Use
-- server-side redacted read models or safe views for tenant public metadata.
REVOKE ALL ON TABLE public.tenants FROM anon, authenticated;

-- Profiles contain email/phone and are not safe as an anon-wide table. Users may
-- read their own profile; staff can read tenant profiles through membership.
GRANT SELECT ON TABLE public.profiles TO authenticated;

DROP POLICY IF EXISTS "profiles select own authenticated" ON public.profiles;
CREATE POLICY "profiles select own authenticated"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    OR id = (SELECT auth.uid())
  );

DROP POLICY IF EXISTS "profiles staff tenant select" ON public.profiles;
CREATE POLICY "profiles staff tenant select"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    (SELECT authz.is_super_admin())
    OR (
      tenant_id IS NOT NULL
      AND (SELECT authz.has_staff_membership(tenant_id, NULL))
    )
  );

-- Public ministry content can be read by anonymous visitors and authenticated
-- users. Writes remain constrained by server commands or table-specific RLS
-- added later; this migration only establishes safe read visibility for live
-- browser collections.
--
-- The legacy demo-wide anon "public read" policy is dropped from every visible
-- table so this migration's policies are the single read contract: content
-- tables with publication state expose only published/public rows, and the
-- interaction tables expose only rows attached to a browser-visible post.
GRANT SELECT ON TABLE public.missionaries TO anon, authenticated;
GRANT SELECT ON TABLE public.funds TO anon, authenticated;
GRANT SELECT ON TABLE public.posts TO anon, authenticated;
GRANT SELECT ON TABLE public.post_comments TO anon, authenticated;
GRANT SELECT ON TABLE public.post_likes TO anon, authenticated;
GRANT SELECT ON TABLE public.post_prayers TO anon, authenticated;
GRANT SELECT ON TABLE public.post_fires TO anon, authenticated;
GRANT SELECT ON TABLE public.follows TO anon, authenticated;
GRANT SELECT ON TABLE public.locations TO anon, authenticated;
GRANT SELECT ON TABLE public.assets TO anon, authenticated;

DO $$
DECLARE
  visible_table text;
  visible_predicate text;
BEGIN
  FOREACH visible_table IN ARRAY ARRAY[
    'missionaries',
    'funds',
    'posts',
    'post_comments',
    'post_likes',
    'post_prayers',
    'post_fires',
    'follows',
    'locations',
    'assets'
  ]
  LOOP
    IF to_regclass(format('public.%I', visible_table)) IS NOT NULL THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', visible_table);

      -- Replace the demo-wide anon policy so stale unrestricted reads cannot
      -- survive alongside the row-filtered policies defined below.
      EXECUTE format('DROP POLICY IF EXISTS "public read" ON public.%I', visible_table);
      EXECUTE format(
        'DROP POLICY IF EXISTS "tanstack browser authenticated select" ON public.%I',
        visible_table
      );
      EXECUTE format(
        'DROP POLICY IF EXISTS "tanstack browser read" ON public.%I',
        visible_table
      );

      -- Posts carry status/visibility state; only published, public rows are
      -- browser-table visible. Draft and partners_only posts stay behind the
      -- auth-gated server feed (`GET /api/posts`). Interaction rows inherit the
      -- parent post's browser visibility. Locations expose published rows only.
      IF visible_table = 'posts' THEN
        visible_predicate := $pred$(status = 'published' AND visibility = 'public')$pred$;
      ELSIF visible_table IN ('post_comments', 'post_likes', 'post_prayers', 'post_fires') THEN
        visible_predicate := format(
          $pred$EXISTS (
            SELECT 1
            FROM public.posts parent_post
            WHERE parent_post.id = %I.post_id
              AND parent_post.status = 'published'
              AND parent_post.visibility = 'public'
          )$pred$,
          visible_table
        );
      ELSIF visible_table = 'locations' THEN
        visible_predicate := $pred$(status = 'published')$pred$;
      ELSE
        visible_predicate := 'true';
      END IF;

      EXECUTE format(
        'CREATE POLICY "tanstack browser read" ON public.%I FOR SELECT TO anon, authenticated USING (%s)',
        visible_table,
        visible_predicate
      );
    END IF;
  END LOOP;
END $$;

-- Donor/finance reads are scoped for authenticated users but remain
-- server-command owned for writes. These policies support existing browser
-- collection reads without restoring anon-wide access.
GRANT SELECT ON TABLE public.donors TO authenticated;
GRANT SELECT ON TABLE public.donations TO authenticated;
GRANT SELECT ON TABLE public.donor_activities TO authenticated;
GRANT SELECT ON TABLE public.donor_pledges TO authenticated;

DROP POLICY IF EXISTS "donors owner or staff select" ON public.donors;
CREATE POLICY "donors owner or staff select"
  ON public.donors
  FOR SELECT
  TO authenticated
  USING (
    (SELECT authz.is_super_admin())
    OR (
      tenant_id IS NOT NULL
      AND (SELECT authz.has_staff_membership(tenant_id, NULL))
    )
    OR EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = donors.profile_id
        AND (p.user_id = (SELECT auth.uid()) OR p.id = (SELECT auth.uid()))
    )
  );

DROP POLICY IF EXISTS "donations owner or staff select" ON public.donations;
CREATE POLICY "donations owner or staff select"
  ON public.donations
  FOR SELECT
  TO authenticated
  USING (
    (SELECT authz.is_super_admin())
    OR (
      tenant_id IS NOT NULL
      AND (SELECT authz.has_staff_membership(tenant_id, NULL))
    )
    OR EXISTS (
      SELECT 1
      FROM public.donors d
      JOIN public.profiles p ON p.id = d.profile_id
      WHERE d.id = donations.donor_id
        AND (p.user_id = (SELECT auth.uid()) OR p.id = (SELECT auth.uid()))
    )
    OR EXISTS (
      SELECT 1
      FROM public.missionaries m
      JOIN public.profiles p ON p.id = m.profile_id
      WHERE m.id = donations.missionary_id
        AND (p.user_id = (SELECT auth.uid()) OR p.id = (SELECT auth.uid()))
    )
  );

DROP POLICY IF EXISTS "donor activities owner or staff select" ON public.donor_activities;
CREATE POLICY "donor activities owner or staff select"
  ON public.donor_activities
  FOR SELECT
  TO authenticated
  USING (
    (SELECT authz.is_super_admin())
    OR EXISTS (
      SELECT 1
      FROM public.donors d
      LEFT JOIN public.profiles p ON p.id = d.profile_id
      WHERE d.id = donor_activities.donor_id
        AND (
          (
            d.tenant_id IS NOT NULL
            AND (SELECT authz.has_staff_membership(d.tenant_id, NULL))
          )
          OR p.user_id = (SELECT auth.uid())
          OR p.id = (SELECT auth.uid())
        )
    )
  );

DROP POLICY IF EXISTS "donor pledges owner or staff select" ON public.donor_pledges;
CREATE POLICY "donor pledges owner or staff select"
  ON public.donor_pledges
  FOR SELECT
  TO authenticated
  USING (
    (SELECT authz.is_super_admin())
    OR (
      tenant_id IS NOT NULL
      AND (SELECT authz.has_staff_membership(tenant_id, NULL))
    )
    OR EXISTS (
      SELECT 1
      FROM public.donors d
      JOIN public.profiles p ON p.id = d.profile_id
      WHERE d.id = donor_pledges.donor_id
        AND (p.user_id = (SELECT auth.uid()) OR p.id = (SELECT auth.uid()))
    )
    OR EXISTS (
      SELECT 1
      FROM public.missionaries m
      JOIN public.profiles p ON p.id = m.profile_id
      WHERE m.id = donor_pledges.missionary_id
        AND (p.user_id = (SELECT auth.uid()) OR p.id = (SELECT auth.uid()))
    )
  );

-- Keep these requested tables server-only until a dedicated safe browser read
-- model or stricter ownership policy exists.
REVOKE ALL ON TABLE public.donor_feed_preferences FROM anon, authenticated;
REVOKE ALL ON TABLE public.follower_requests FROM anon, authenticated;
REVOKE ALL ON TABLE public.missionary_tasks FROM anon, authenticated;
REVOKE ALL ON TABLE public.pdf_templates FROM anon, authenticated;

DO $$
DECLARE
  realtime_table text;
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication
    WHERE pubname = 'supabase_realtime'
  ) THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;

  FOREACH realtime_table IN ARRAY ARRAY[
    'missionaries',
    'funds',
    'posts',
    'post_comments',
    'post_likes',
    'post_prayers',
    'post_fires',
    'follows',
    'locations'
  ]
  LOOP
    IF to_regclass(format('public.%I', realtime_table)) IS NOT NULL
      AND NOT EXISTS (
        SELECT 1
        FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
          AND schemaname = 'public'
          AND tablename = realtime_table
      )
    THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', realtime_table);
    END IF;
  END LOOP;
END $$;

COMMIT;
