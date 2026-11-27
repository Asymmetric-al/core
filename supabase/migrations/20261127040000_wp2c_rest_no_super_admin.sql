-- AL-2675 (WP2c rest, pull request B; brief stage5/wp2c-rest.md, part B;
-- plan 5.4 and 12, WP2c; ADR-0228, decision 1; record D-65, D-82 and D-109):
-- no super-admin branch anywhere, and every staff-wide read on one staff-read
-- helper.
--
-- Why. 37 read policies in `public` kept `(SELECT authz.is_super_admin()) OR
-- (...)` beside their tenant condition; WP2b's second release left them to
-- this package. The branch admits a login whose profile row says
-- `super_admin` to every organization's rows of those tables, whatever the
-- request names. No product path sets that role (a database edit would). The
-- platform's authority is the operator list (authz.platform_operators), and an
-- operator reaches an organization's data only under WP10's support grant.
-- Only these 37 policies call the function; no application code does.
--
-- What.
-- 1. authz.staff_read(), the staff-read helper: today exactly
--    authz.assignment_is('staff') under another name. WP10 adds the support
--    grant here and nowhere else. SQL, STABLE, PARALLEL SAFE, SECURITY
--    INVOKER, SET search_path = '', owner postgres, EXECUTE for authenticated
--    and service_role by name and for nobody else.
-- 2. 62 ALTER POLICY statements, in the order of their table names, each
--    replacing its USING alone: the name, command, roles, permissive flag,
--    tenant condition and every other condition stay.
--    - 37 lose the branch: 30 pure staff-wide reads (audit_logs,
--      crm_command_logs, crm_record_links, notification_queue, pdf_templates,
--      the six pdf_template_* tables, 17 Support Hub tables,
--      support_contacts, support_tickets); the staff-or-own reads of donors,
--      donations, donor_pledges and donor_activities; the narrowed reads of
--      support_notification_preferences and support_saved_views; and
--      field_policies_read, which stays on authz.current_tenant_id() alone
--      (its reviewed pin in docs/security/tenant-policy-exceptions.json
--      changes with it).
--    - 59 stand on the helper: those 30 and 22 more pure staff-wide reads,
--      funds' among them, and the staff branch of the seven staff-or-own
--      reads (donors, donations, donor_pledges, donor_activities, follows,
--      parties, account_links).
--    Kept as they are, on the bare staff check or the sub-role check: the
--    narrowed reads (the four member_care_* reads, crm_notes_tenant_select,
--    support_notification_preferences, support_saved_views,
--    crm_table_user_preferences, crm_table_named_views), the own-row reads
--    and every insert, update and delete policy.
-- 3. DROP FUNCTION authz.is_super_admin(), last and without CASCADE, so a
--    dependent this file missed fails it.
-- No removed branch becomes an operator check.
--
-- For every person who can exist (each staff sub-role and the administrator
-- flag, a donor, a missionary, in two organizations), each altered policy
-- admits exactly the rows it admitted before; only a profile whose role says
-- super_admin loses the reads it had across organizations
-- (tests/unit/acceptance/issue-2675/no-super-admin.realstack.acceptance.test.ts
-- and its PostgREST run). The catalog gate keeps it on every later chain:
-- it fails any policy that names the role, a write policy that calls the
-- helper, and a signed-in read of a tenant table on the bare staff check
-- other than the nine kept reads (scripts/verify/tenant-rls-catalog.mjs).
--
-- Locks, under lock_timeout: each ALTER POLICY takes ACCESS EXCLUSIVE on its
-- table, in the order of the statements (by table name), held to COMMIT; the
-- DROP locks the function only. A run that cannot take a lock in 5 seconds
-- stops with 55P03 and applies nothing.
--
-- Hosted. Before a release that carries this file, read on each hosted
-- database how many profiles say super_admin:
--   SELECT count(*) FROM public.profiles WHERE role = 'super_admin';
-- Those logins lose every read across organizations, as intended; nothing
-- else changes for anyone.
--
-- Recovery. If this file fails in a release (55P03 on a lock, or a dependent
-- it missed), the release's one `supabase db push` has applied and recorded
-- the earlier files in their own transactions, this one applies nothing, and
-- the job stops before Payload's migrations, the gates, the heads and the
-- deployment; the running build is untouched. A fresh Release dispatch from
-- `production`, never Re-run, continues from this file. A second run of the
-- applied file stops at its first CREATE (authz.staff_read, 42723) and
-- changes nothing. This file has committed when this read-only check is
-- true; it answers false, never an error, before:
--   SELECT to_regprocedure('authz.staff_read()') IS NOT NULL
-- Then follow docs/ops/release-job.md, "If the migration committed but its
-- ledger row is missing", with this check and this file's version,
-- 20261127040000.
--
-- Down, an operator's last resort, after the build that relies on this file
-- is rolled back, in one transaction: it restores the function with its
-- grants, every branch, and authz.assignment_is('staff') where the helper
-- stood, then drops the helper. Run the lines between the two markers
-- without their leading "-- ".
-- Down begins
-- BEGIN;
-- SET LOCAL lock_timeout = '5s';
-- CREATE FUNCTION authz.is_super_admin()
-- RETURNS boolean
-- LANGUAGE sql
-- STABLE
-- PARALLEL SAFE
-- SECURITY DEFINER
-- SET search_path = public
-- AS $f$
--   SELECT EXISTS (
--     SELECT 1
--     FROM public.profiles p
--     WHERE p.user_id = auth.uid()
--       AND p.role = 'super_admin'
--   );
-- $f$;
-- ALTER FUNCTION authz.is_super_admin() OWNER TO postgres;
-- REVOKE ALL ON FUNCTION authz.is_super_admin() FROM PUBLIC;
-- GRANT EXECUTE ON FUNCTION authz.is_super_admin() TO authenticated, service_role;
-- DO $d$
-- DECLARE
--   saved text := current_setting('search_path');
--   r record;
--   v text;
-- BEGIN
--   -- Every name in the policy text read back is schema-qualified.
--   PERFORM set_config('search_path', 'pg_catalog', true);
--   FOR r IN
--     SELECT c.relname, p.polname, pg_get_expr(p.polqual, p.polrelid) AS q,
--            b.t IS NOT NULL AS branch
--       FROM pg_policy p
--       JOIN pg_class c ON c.oid = p.polrelid
--       LEFT JOIN (VALUES
--         ('audit_logs', 'authz staff tenant select audit_logs'),
--         ('crm_command_logs', 'authz staff tenant select crm_command_logs'),
--         ('crm_record_links', 'authz staff tenant select crm_record_links'),
--         ('donations', 'donations owner or staff select'),
--         ('donor_activities', 'donor activities owner or staff select'),
--         ('donor_pledges', 'donor pledges owner or staff select'),
--         ('donors', 'donors owner or staff select'),
--         ('field_policies', 'field_policies_read'),
--         ('notification_queue', 'authz staff tenant select notification_queue'),
--         ('pdf_template_artifacts', 'pdf template artifacts select'),
--         ('pdf_template_audit_events', 'pdf template audit events select'),
--         ('pdf_template_batch_jobs', 'pdf template batch jobs select'),
--         ('pdf_template_batches', 'pdf template batches select'),
--         ('pdf_template_renders', 'pdf template renders select'),
--         ('pdf_template_versions', 'pdf template versions select'),
--         ('pdf_templates', 'authz staff tenant select pdf_templates'),
--         ('support_agents', 'support hub staff select'),
--         ('support_assignments', 'support hub staff select'),
--         ('support_audit_log', 'support hub staff select'),
--         ('support_automation_rules', 'support hub staff select'),
--         ('support_business_hours', 'support hub staff select'),
--         ('support_canned_responses', 'support hub staff select'),
--         ('support_contacts', 'support contacts select'),
--         ('support_conversation_labels', 'support hub staff select'),
--         ('support_conversations', 'support hub staff select'),
--         ('support_inbox_settings', 'support hub staff select'),
--         ('support_inboxes', 'support hub staff select'),
--         ('support_labels', 'support hub staff select'),
--         ('support_macros', 'support hub staff select'),
--         ('support_message_attachments', 'support hub staff select'),
--         ('support_messages', 'support hub staff select'),
--         ('support_notification_preferences', 'support hub staff select'),
--         ('support_saved_views', 'support hub staff select'),
--         ('support_signatures', 'support hub staff select'),
--         ('support_sla_policies', 'support hub staff select'),
--         ('support_teams', 'support hub staff select'),
--         ('support_tickets', 'support tickets select')
--       ) AS b(t, n) ON b.t = c.relname AND b.n = p.polname
--      WHERE c.relnamespace = 'public'::regnamespace
--        AND p.polcmd = 'r'
--        AND (b.t IS NOT NULL
--             OR pg_get_expr(p.polqual, p.polrelid) LIKE '%authz.staff_read()%')
--      ORDER BY c.relname, p.polname
--   LOOP
--     v := replace(r.q, '( SELECT authz.staff_read() AS staff_read)',
--                  '( SELECT authz.assignment_is(''staff''::authz.membership_role) AS assignment_is)');
--     IF r.branch THEN
--       v := '(SELECT authz.is_super_admin()) OR (' || v || ')';
--     END IF;
--     EXECUTE format('ALTER POLICY %I ON public.%I USING (%s)', r.polname, r.relname, v);
--   END LOOP;
--   PERFORM set_config('search_path', saved, true);
-- END
-- $d$;
-- DROP FUNCTION authz.staff_read();
-- NOTIFY pgrst, 'reload schema';
-- COMMIT;
-- Down ends

BEGIN;
SET LOCAL lock_timeout = '5s';

-- 1. The staff-read helper.
CREATE FUNCTION authz.staff_read()
RETURNS boolean
LANGUAGE sql
STABLE
PARALLEL SAFE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT authz.assignment_is('staff'::authz.membership_role)
$$;

ALTER FUNCTION authz.staff_read() OWNER TO postgres;
REVOKE ALL ON FUNCTION authz.staff_read()
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION authz.staff_read() TO authenticated, service_role;
COMMENT ON FUNCTION authz.staff_read() IS
  'AL-2675 (WP2c rest B): the staff-read helper. Every staff-wide read policy calls it, and no write policy does; today it is authz.assignment_is(''staff''), and WP10 adds the operator''s support grant here.';

-- 2. The policies, by table name.
ALTER POLICY "account_claim_requests_staff_select" ON public.account_claim_requests
  USING (tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.staff_read()));

ALTER POLICY "account links own or staff read" ON public.account_links
  USING (
    tenant_id = (SELECT authz.current_tenant_id())
    AND (user_id = (SELECT authz.current_user_id()) OR (SELECT authz.staff_read()))
  );

ALTER POLICY "tenant scoped read" ON public.assets
  USING (tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.staff_read()));

ALTER POLICY "authz staff tenant select audit_logs" ON public.audit_logs
  USING (tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.staff_read()));

ALTER POLICY "tenant scoped read" ON public.campaigns
  USING (tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.staff_read()));

ALTER POLICY "crm staff read" ON public.contribution_adjustments
  USING (tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.staff_read()));

ALTER POLICY "crm staff read" ON public.contribution_approval_policies
  USING (tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.staff_read()));

ALTER POLICY "crm staff read" ON public.contribution_correction_requests
  USING (tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.staff_read()));

ALTER POLICY "crm staff read" ON public.contribution_corrections
  USING (tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.staff_read()));

ALTER POLICY "authz staff tenant select crm_command_logs" ON public.crm_command_logs
  USING (tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.staff_read()));

ALTER POLICY "authz staff tenant select crm_record_links" ON public.crm_record_links
  USING (tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.staff_read()));

ALTER POLICY "crm staff read" ON public.crm_table_tenant_defaults
  USING (tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.staff_read()));

ALTER POLICY "crm staff read" ON public.donation_crm_links
  USING (tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.staff_read()));

ALTER POLICY "donations owner or staff select" ON public.donations
  USING (
    tenant_id = (SELECT authz.current_tenant_id())
    AND (
      (SELECT authz.staff_read())
      OR (
        (SELECT authz.assignment_is('donor'::authz.membership_role))
        AND donor_id IN (
          SELECT d.id
            FROM public.donors d
           WHERE d.tenant_id = (SELECT authz.current_tenant_id())
             AND d.party_id IN (
               SELECT al.party_id
                 FROM public.account_links al
                WHERE al.tenant_id = (SELECT authz.current_tenant_id())
                  AND al.user_id = (SELECT authz.current_user_id())
             )
        )
      )
      OR (
        (SELECT authz.assignment_is('missionary'::authz.membership_role))
        AND missionary_id IN (SELECT authz.caller_missionary_ids())
      )
    )
  );

ALTER POLICY "donor activities owner or staff select" ON public.donor_activities
  USING (
    tenant_id = (SELECT authz.current_tenant_id())
    AND (
      (SELECT authz.staff_read())
      OR (
        (SELECT authz.assignment_is('donor'::authz.membership_role))
        AND donor_id IN (
          SELECT d.id
            FROM public.donors d
           WHERE d.tenant_id = (SELECT authz.current_tenant_id())
             AND d.party_id IN (
               SELECT al.party_id
                 FROM public.account_links al
                WHERE al.tenant_id = (SELECT authz.current_tenant_id())
                  AND al.user_id = (SELECT authz.current_user_id())
             )
        )
      )
    )
  );

ALTER POLICY "crm staff read" ON public.donor_merge_candidates
  USING (tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.staff_read()));

ALTER POLICY "donor pledges owner or staff select" ON public.donor_pledges
  USING (
    tenant_id = (SELECT authz.current_tenant_id())
    AND (
      (SELECT authz.staff_read())
      OR (
        (SELECT authz.assignment_is('donor'::authz.membership_role))
        AND donor_id IN (
          SELECT d.id
            FROM public.donors d
           WHERE d.tenant_id = (SELECT authz.current_tenant_id())
             AND d.party_id IN (
               SELECT al.party_id
                 FROM public.account_links al
                WHERE al.tenant_id = (SELECT authz.current_tenant_id())
                  AND al.user_id = (SELECT authz.current_user_id())
             )
        )
      )
      OR (
        (SELECT authz.assignment_is('missionary'::authz.membership_role))
        AND missionary_id IN (SELECT authz.caller_missionary_ids())
      )
    )
  );

ALTER POLICY "donors owner or staff select" ON public.donors
  USING (
    tenant_id = (SELECT authz.current_tenant_id())
    AND (
      (SELECT authz.staff_read())
      OR (
        (SELECT authz.assignment_is('donor'::authz.membership_role))
        AND party_id IN (
          SELECT al.party_id
            FROM public.account_links al
           WHERE al.tenant_id = (SELECT authz.current_tenant_id())
             AND al.user_id = (SELECT authz.current_user_id())
        )
      )
    )
  );

ALTER POLICY "external identifiers staff read" ON public.external_identifiers
  USING (tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.staff_read()));

-- The branch goes; the read stays on authz.current_tenant_id() alone.
ALTER POLICY "field_policies_read" ON public.field_policies
  USING (
    (tenant_id IS NULL OR tenant_id = (SELECT authz.current_tenant_id()))
    AND (SELECT authz.current_tenant_id()) IS NOT NULL
  );

ALTER POLICY "tenant scoped own or staff read" ON public.follows
  USING (
    tenant_id = (SELECT authz.current_tenant_id())
    AND (
      (SELECT authz.staff_read())
      OR (
        (SELECT authz.assignment_is('donor'::authz.membership_role))
        AND donor_id IN (
          SELECT d.id
            FROM public.donors d
           WHERE d.tenant_id = (SELECT authz.current_tenant_id())
             AND d.party_id IN (
               SELECT al.party_id
                 FROM public.account_links al
                WHERE al.tenant_id = (SELECT authz.current_tenant_id())
                  AND al.user_id = (SELECT authz.current_user_id())
             )
        )
      )
    )
  );

ALTER POLICY "tenant scoped read" ON public.funds
  USING (
    tenant_id = (SELECT authz.current_tenant_id())
    AND (SELECT authz.staff_read())
    AND system_purpose IS NULL
  );

ALTER POLICY "giving source codes staff tenant select" ON public.giving_source_codes
  USING (tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.staff_read()));

ALTER POLICY "legacy_account_invitations_staff_select" ON public.legacy_account_invitations
  USING (tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.staff_read()));

ALTER POLICY "legal entities staff tenant select" ON public.legal_entities
  USING (tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.staff_read()));

ALTER POLICY "media_assets_staff_select" ON public.media_assets
  USING (tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.staff_read()));

ALTER POLICY "crm staff read" ON public.missionaries
  USING (tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.staff_read()));

ALTER POLICY "authz staff tenant select notification_queue" ON public.notification_queue
  USING (tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.staff_read()));

ALTER POLICY "parties staff or own read" ON public.parties
  USING (
    tenant_id = (SELECT authz.current_tenant_id())
    AND (
      (SELECT authz.staff_read())
      OR id IN (
        SELECT al.party_id
          FROM public.account_links al
         WHERE al.tenant_id = (SELECT authz.current_tenant_id())
           AND al.user_id = (SELECT authz.current_user_id())
      )
    )
  );

ALTER POLICY "payment account bindings staff tenant select" ON public.payment_account_bindings
  USING (tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.staff_read()));

ALTER POLICY "payment onboarding intents staff tenant select" ON public.payment_onboarding_intents
  USING (tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.staff_read()));

ALTER POLICY "payment provider accounts staff tenant select" ON public.payment_provider_accounts
  USING (tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.staff_read()));

ALTER POLICY "pdf template artifacts select" ON public.pdf_template_artifacts
  USING (tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.staff_read()));

ALTER POLICY "pdf template audit events select" ON public.pdf_template_audit_events
  USING (tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.staff_read()));

ALTER POLICY "pdf template batch jobs select" ON public.pdf_template_batch_jobs
  USING (tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.staff_read()));

ALTER POLICY "pdf template batches select" ON public.pdf_template_batches
  USING (tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.staff_read()));

ALTER POLICY "pdf template renders select" ON public.pdf_template_renders
  USING (tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.staff_read()));

ALTER POLICY "pdf template versions select" ON public.pdf_template_versions
  USING (tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.staff_read()));

ALTER POLICY "authz staff tenant select pdf_templates" ON public.pdf_templates
  USING (tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.staff_read()));

ALTER POLICY "crm staff read" ON public.staged_gift_allocations
  USING (tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.staff_read()));

ALTER POLICY "crm staff read" ON public.staged_gifts
  USING (tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.staff_read()));

ALTER POLICY "support hub staff select" ON public.support_agents
  USING (tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.staff_read()));

ALTER POLICY "support hub staff select" ON public.support_assignments
  USING (tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.staff_read()));

ALTER POLICY "support hub staff select" ON public.support_audit_log
  USING (tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.staff_read()));

ALTER POLICY "support hub staff select" ON public.support_automation_rules
  USING (tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.staff_read()));

ALTER POLICY "support hub staff select" ON public.support_business_hours
  USING (tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.staff_read()));

ALTER POLICY "support hub staff select" ON public.support_canned_responses
  USING (tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.staff_read()));

ALTER POLICY "support contacts select" ON public.support_contacts
  USING (tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.staff_read()));

ALTER POLICY "support hub staff select" ON public.support_conversation_labels
  USING (tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.staff_read()));

ALTER POLICY "support hub staff select" ON public.support_conversations
  USING (tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.staff_read()));

ALTER POLICY "support hub staff select" ON public.support_inbox_settings
  USING (tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.staff_read()));

ALTER POLICY "support hub staff select" ON public.support_inboxes
  USING (tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.staff_read()));

ALTER POLICY "support hub staff select" ON public.support_labels
  USING (tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.staff_read()));

ALTER POLICY "support hub staff select" ON public.support_macros
  USING (tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.staff_read()));

ALTER POLICY "support hub staff select" ON public.support_message_attachments
  USING (tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.staff_read()));

ALTER POLICY "support hub staff select" ON public.support_messages
  USING (tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.staff_read()));

-- A narrowed read: the branch goes, the bare staff check stays.
ALTER POLICY "support hub staff select" ON public.support_notification_preferences
  USING (
    tenant_id = (SELECT authz.current_tenant_id())
    AND (SELECT authz.assignment_is('staff'::authz.membership_role))
    AND (
      (SELECT authz.assignment_is_tenant_admin())
      OR agent_id IN (
        SELECT a.id
          FROM public.support_agents a
         WHERE a.tenant_id = (SELECT authz.current_tenant_id())
           AND a.user_id = (SELECT authz.current_user_id())
      )
    )
  );

-- A narrowed read: the branch goes, the bare staff check stays.
ALTER POLICY "support hub staff select" ON public.support_saved_views
  USING (
    tenant_id = (SELECT authz.current_tenant_id())
    AND (SELECT authz.assignment_is('staff'::authz.membership_role))
    AND (
      scope <> 'personal'
      OR owner_agent_id IS NULL
      OR (SELECT authz.assignment_is_tenant_admin())
      OR owner_agent_id IN (
        SELECT a.id
          FROM public.support_agents a
         WHERE a.tenant_id = (SELECT authz.current_tenant_id())
           AND a.user_id = (SELECT authz.current_user_id())
      )
    )
  );

ALTER POLICY "support hub staff select" ON public.support_signatures
  USING (tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.staff_read()));

ALTER POLICY "support hub staff select" ON public.support_sla_policies
  USING (tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.staff_read()));

ALTER POLICY "support hub staff select" ON public.support_teams
  USING (tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.staff_read()));

ALTER POLICY "support tickets select" ON public.support_tickets
  USING (tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.staff_read()));

-- 3. The function, last, without CASCADE: a dependent this file missed fails
-- the file.
DROP FUNCTION authz.is_super_admin();

DO $$
-- post-assert: no super-admin branch
DECLARE
  problem text;
  on_helper integer;
BEGIN
  SELECT string_agg(format('%s.%s %s', n.nspname, c.relname, p.polname), ', ')
  INTO problem
  FROM pg_policy p
  JOIN pg_class c ON c.oid = p.polrelid
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE coalesce(pg_get_expr(p.polqual, p.polrelid), '')
        || coalesce(pg_get_expr(p.polwithcheck, p.polrelid), '') ~* 'super_admin';
  IF problem IS NOT NULL THEN
    RAISE EXCEPTION 'AL-2675: a policy still names super_admin: %', problem;
  END IF;

  SELECT string_agg(format('%s.%s %s', n.nspname, c.relname, p.polname), ', ')
  INTO problem
  FROM pg_policy p
  JOIN pg_class c ON c.oid = p.polrelid
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE p.polcmd <> 'r'
    AND coalesce(pg_get_expr(p.polqual, p.polrelid), '')
        || coalesce(pg_get_expr(p.polwithcheck, p.polrelid), '') LIKE '%authz.staff_read()%';
  IF problem IS NOT NULL THEN
    RAISE EXCEPTION 'AL-2675: a write policy calls the staff-read helper: %', problem;
  END IF;

  SELECT count(*)
  INTO on_helper
  FROM pg_policy p
  WHERE p.polcmd = 'r'
    AND pg_get_expr(p.polqual, p.polrelid) LIKE '%authz.staff_read()%';
  IF on_helper <> 59 THEN
    RAISE EXCEPTION 'AL-2675: % read policies stand on the staff-read helper, not 59', on_helper;
  END IF;
END $$;

COMMIT;
