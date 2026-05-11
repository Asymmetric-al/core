-- Demo read-only RLS policy set
-- Intent:
-- - Allow anonymous/public SELECT for demo-visible tables.
-- - Block anonymous/authenticated writes everywhere in the demo surface.
-- - Keep internal/admin tables non-readable.

DO $$
DECLARE
  demo_table text;
  existing_policy text;
  internal_table text;
BEGIN
  -- Public demo surface: read-only for anon/authenticated.
  FOREACH demo_table IN ARRAY ARRAY[
    'tenants',
    'profiles',
    'missionaries',
    'donors',
    'funds',
    'posts',
    'post_likes',
    'post_prayers',
    'post_fires',
    'post_comments',
    'campaigns',
    'donations',
    'follows',
    'donor_feed_preferences',
    'donor_activities',
    'donor_pledges',
    'follower_requests',
    'locations',
    'missionary_tasks',
    'pdf_templates',
    'assets'
  ] LOOP
    IF EXISTS (
      SELECT 1
      FROM pg_tables
      WHERE schemaname = 'public'
        AND tablename = demo_table
    ) THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', demo_table);

      FOR existing_policy IN
        SELECT policyname
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = demo_table
      LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', existing_policy, demo_table);
      END LOOP;

      EXECUTE format(
        'CREATE POLICY "public read" ON public.%I FOR SELECT TO anon USING (true)',
        demo_table
      );

      EXECUTE format('REVOKE ALL ON TABLE public.%I FROM anon, authenticated', demo_table);
      EXECUTE format('GRANT SELECT ON TABLE public.%I TO anon, authenticated', demo_table);
    END IF;
  END LOOP;

  -- Internal/admin-only tables: no read/write for anon/authenticated.
  FOREACH internal_table IN ARRAY ARRAY[
    'notification_queue',
    'pledge_charge_attempts',
    'audit_logs',
    '_prisma_migrations'
  ] LOOP
    IF EXISTS (
      SELECT 1
      FROM pg_tables
      WHERE schemaname = 'public'
        AND tablename = internal_table
    ) THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', internal_table);

      FOR existing_policy IN
        SELECT policyname
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = internal_table
      LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', existing_policy, internal_table);
      END LOOP;

      EXECUTE format('REVOKE ALL ON TABLE public.%I FROM anon, authenticated', internal_table);
    END IF;
  END LOOP;

  -- Lock down migration backup tables created by previous migrations.
  FOR internal_table IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename LIKE 'backup\_%' ESCAPE '\'
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', internal_table);

    FOR existing_policy IN
      SELECT policyname
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = internal_table
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', existing_policy, internal_table);
    END LOOP;

    EXECUTE format('REVOKE ALL ON TABLE public.%I FROM anon, authenticated', internal_table);
  END LOOP;
END $$;
