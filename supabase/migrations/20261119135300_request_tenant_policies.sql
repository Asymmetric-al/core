-- AL-2675 (WP2b, second release: the policy migration; plan 5.1, 5.2, 5.4,
-- 5.5 and the WP2b paragraph of section 12; audit NR-01, NR-02, NR-09,
-- NR-47, NR-54, NR-60, NR-61, NR-66, A19; record D-25). After it, the
-- database itself admits a signed-in read only for the tenant and the
-- assignment that the request names. The activation review that lists every
-- policy this switches on, and the questions still open, is
-- docs/security/tenant-policy-activation-review.md.
--
-- 1. The request's tenant and assignment, in the form the caller-token proof
--    measured (docs/audits/core-crm-cms-database-proofs/tp1-caller-token-crm-read.md,
--    section 8). All STABLE and PARALLEL SAFE; none takes a column of a row.
--    - authz.request_tenant_id(): the `x-asym-tenant` header the Data API puts
--      in `request.headers`. Absent or blank is no value; a hyphenated UUID
--      in any letter case is compared as a uuid; anything else raises 22P02.
--      That is the command lane's rule (tenant_guard.request_assignment_id),
--      so both lanes read a header the same way (review Q11).
--    - authz.request_assignment_id(): the `x-asym-assignment` header, the same
--      way.
--    - authz.request_assignment(): the one membership row the request acts
--      under. The row the assignment header names, when it is the caller's,
--      live and in the named tenant; with no assignment header, the caller's
--      one live row there. Otherwise no row. The tenant row must exist; WP3
--      adds its status test here, so every policy gets it at once. The one
--      definer: its lookup does not pass through the memberships policy.
--    - authz.current_tenant_id() is repointed onto it: the named tenant when
--      the assignment resolves, else NULL. It no longer reads the token claim,
--      and a request that names no tenant gets none.
--    - authz.assignment_is(role, sub-roles), authz.assignment_is_tenant_admin()
--      and authz.assignment_holds(capability) judge that one row. The last
--      asks authz.assignment_capabilities, which mirrors the code registry.
--    - authz.has_membership and authz.has_staff_membership keep their
--      signatures and grants and judge the same row: true only when the
--      request's assignment is in the tenant they are given and of the class
--      asked. No helper admits on a person's other rows (plan 5.1).
--    - authz.caller_profile_ids(): the caller's profile ids, for own-row
--      branches written as an uncorrelated set.
--    - authz.caller_tenant_ids(): the tenants where the caller holds any live
--      row, for Storage, which cannot carry the headers.
--    - authz.caller_assignment(tenant, class), behind the member directory and
--      the CRM table-preference functions, follows plan 5.1 with no header:
--      it counts every live row of the caller in the tenant, so a person with
--      a staff and a donor row there passes its staff check only when the
--      request names the staff row (review defect 9). A tenant header that
--      names another tenant than the one asked about selects nothing, so the
--      directory answers only for the tenant the request selected (council
--      R8); with no header, the one live row there still serves.
-- 2. Every signed-in policy on a tenant table requires the row's tenant to
--    equal authz.current_tenant_id(), plus its role-class or own-row condition,
--    each a whole sub-select so that it runs once for a statement. An own-row
--    branch is bound to its class: the donor branch admits only under a donor
--    assignment, the missionary branch only under a missionary assignment.
--    Each own-row sub-select over donors or support_agents carries the
--    request's tenant itself, so it never leans on that table's policy for
--    it (council R11). The one over missionaries cannot name m.tenant_id,
--    which signed-in users may not select (defect 10); the missionaries
--    policy carries the tenant and has no super-admin branch. A
--    policy compares the caller through authz.current_user_id(), marked
--    PARALLEL SAFE below, not auth.uid() (council R12).
--    Each `is_super_admin()` branch is kept with the same meaning until WP2c,
--    written as a sub-select (review Q6). The listed exceptions keep no tenant
--    condition (review section 3). The staff tenant-select policy on profiles
--    is dropped (plan 5.1, NR-54). member_care_private_notes needs a live
--    staff row in the tenant beside authorship. A restricted crm_notes row
--    needs the tenant-administrator flag on the selected row, not
--    profiles.role (plan 5.5).
-- 3. The governed write grants are revoked in this migration, beside the
--    repoint: audit_logs (insert), the four member-care tables, field_policies,
--    notification_queue, the 19 Support Hub tables, support_contacts,
--    support_tickets, the six pdf_template_* child tables, crm_command_logs,
--    crm_merge_candidates (insert, update; review Q8) and the six finance
--    tables 20260513173739 opened to the Data API. Only server code writes
--    them (review section 4). Their write policies are dropped with the
--    grants, so an accidental re-grant fails the catalog gate (review Q7).
--    The write policies of pdf_templates and crm_record_links are dropped
--    too: signed-in users never held a write grant on either, and no
--    signed-in write policy stands without the grant for its command (the
--    coordinator's follow-up on Q7; the gate's WRITE_POLICY_WITHOUT_GRANT).
--    Two Support Hub tables are narrowed further: another agent's
--    notification preferences and personal saved views are read only under
--    the tenant-administrator flag (review Q1). The crm_notes insert binds its
--    author to the caller, and a signed-in insert has its author name and
--    timestamps stamped (review defect 2). Commenters' names come from the
--    first release's narrow read, public.post_comment_authors, which ships
--    with that release's apps (council R1), so that a profile readable by its
--    owner only takes no author away from the running release.
-- 4. Storage: every policy of the profiles bucket and of the editor images in
--    document-uploads that signed-in users reach (upload, replace, read and
--    delete) tests a live membership of the caller in the tenant the object
--    path names, in place of profiles.tenant_id or the owner alone (plan 5.2;
--    review Q10). The replace (update) policies test it on the object as it
--    stands (USING) and as it will be (WITH CHECK), whatever statement the
--    Storage server sends (council R5).
-- 5. Realtime: funds, locations, posts and the four post-reaction and comment
--    tables leave the supabase_realtime publication where they are in it.
--
-- Release order (council R6; docs/ops/release-job.md): this migration is
-- released to an environment only after a release that carries the first
-- release of WP2b's apps has completed there, because only those apps send
-- the two headers; an application that sends none gets nothing from a
-- tenant table, since every signed-in policy there fails closed. Once it has
-- shipped, no application rollback goes below the first release. Nothing in
-- the database enforces the order: a rebuild from source applies the whole
-- chain to a database with no recorded heads, and a guard would stop it.
--
-- Down: supabase/migrations/rollback_20261119135300_request_tenant_policies.sql,
-- run by hand in one transaction. It restores the chain before this
-- migration exactly: every policy, grant, function, parallel mark and
-- publication member this migration changed, and only the privileges each
-- table held before (council R10). Proven on a disposable database: the
-- chain, then the rollback, has the schema fingerprint of the chain without
-- this migration (scripts/release/schema-fingerprint.mjs).

BEGIN;

-- The ALTER and DROP POLICY statements below take an ACCESS EXCLUSIVE lock on
-- some fifty tables until COMMIT. lock_timeout bounds the wait for each lock,
-- as 20261025070000 and 20261025100000 do, so a table held by a long reader
-- fails the migration fast (55P03, nothing applied) instead of queueing every
-- later query behind it; re-run it when the database is quiet (council R9).
SET LOCAL lock_timeout = '5s';

-- 1. The request's tenant and assignment.

CREATE OR REPLACE FUNCTION authz.request_tenant_id()
RETURNS UUID
LANGUAGE plpgsql
STABLE
PARALLEL SAFE
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_headers TEXT := NULLIF(pg_catalog.current_setting('request.headers', true), '');
  v_value TEXT;
BEGIN
  IF v_headers IS NULL THEN
    RETURN NULL;
  END IF;
  v_value := NULLIF(pg_catalog.btrim(v_headers::JSONB ->> 'x-asym-tenant'), '');
  IF v_value IS NULL THEN
    RETURN NULL;
  END IF;
  IF v_value !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
    RAISE EXCEPTION 'authz: the tenant header is not a UUID'
      USING ERRCODE = '22P02';
  END IF;
  RETURN v_value::UUID;
END;
$$;

CREATE OR REPLACE FUNCTION authz.request_assignment_id()
RETURNS UUID
LANGUAGE plpgsql
STABLE
PARALLEL SAFE
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_headers TEXT := NULLIF(pg_catalog.current_setting('request.headers', true), '');
  v_value TEXT;
BEGIN
  IF v_headers IS NULL THEN
    RETURN NULL;
  END IF;
  v_value := NULLIF(pg_catalog.btrim(v_headers::JSONB ->> 'x-asym-assignment'), '');
  IF v_value IS NULL THEN
    RETURN NULL;
  END IF;
  IF v_value !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
    RAISE EXCEPTION 'authz: the assignment header is not a UUID'
      USING ERRCODE = '22P02';
  END IF;
  RETURN v_value::UUID;
END;
$$;

CREATE OR REPLACE FUNCTION authz.request_assignment(
  OUT membership_id UUID,
  OUT tenant_id UUID,
  OUT role authz.membership_role,
  OUT staff_role authz.staff_role,
  OUT is_tenant_admin BOOLEAN
)
LANGUAGE plpgsql
STABLE
PARALLEL SAFE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user UUID := auth.uid();
  v_tenant UUID := authz.request_tenant_id();
  v_named UUID := authz.request_assignment_id();
  v_rows BIGINT;
BEGIN
  IF v_user IS NULL OR v_tenant IS NULL THEN
    RETURN;
  END IF;

  -- One live row of the caller there, the named one if a row is named; the
  -- window count sees every match, so several unnamed rows resolve nothing.
  SELECT m.id, m.tenant_id, m.role, m.staff_role, m.is_tenant_admin,
         pg_catalog.count(*) OVER ()
    INTO membership_id, tenant_id, role, staff_role, is_tenant_admin, v_rows
    FROM authz.memberships AS m
    JOIN public.tenants AS t ON t.id = m.tenant_id
   WHERE m.user_id = v_user
     AND m.tenant_id = v_tenant
     AND m.is_active
     AND m.revoked_at IS NULL
     AND (v_named IS NULL OR m.id = v_named)
   LIMIT 1;

  IF v_rows IS DISTINCT FROM 1 THEN
    membership_id := NULL;
    tenant_id := NULL;
    role := NULL;
    staff_role := NULL;
    is_tenant_admin := NULL;
  END IF;
END;
$$;

COMMENT ON FUNCTION authz.request_assignment() IS
  'The one membership row a signed-in Data API request acts under: the row '
  'x-asym-assignment names, or the caller''s one live row in the x-asym-tenant '
  'tenant. Every tenant policy judges this row alone (plan 5.1, 5.4; AL-2675).';

CREATE OR REPLACE FUNCTION authz.current_tenant_id()
RETURNS UUID
LANGUAGE sql
STABLE
PARALLEL SAFE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT a.tenant_id FROM authz.request_assignment() AS a;
$$;

COMMENT ON FUNCTION authz.current_tenant_id() IS
  'The request''s active tenant: the x-asym-tenant tenant when the request''s '
  'assignment resolves there, else NULL. Reads no token claim (AL-2675).';

CREATE OR REPLACE FUNCTION authz.assignment_is(
  p_role authz.membership_role,
  p_staff_roles authz.staff_role[] DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
PARALLEL SAFE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT COALESCE(
    (SELECT a.role = p_role
            AND (p_staff_roles IS NULL OR a.staff_role = ANY (p_staff_roles))
       FROM authz.request_assignment() AS a
      WHERE a.membership_id IS NOT NULL),
    false
  );
$$;

CREATE OR REPLACE FUNCTION authz.assignment_is_tenant_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
PARALLEL SAFE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT COALESCE(
    (SELECT a.role = 'staff' AND a.is_tenant_admin
       FROM authz.request_assignment() AS a
      WHERE a.membership_id IS NOT NULL),
    false
  );
$$;

CREATE OR REPLACE FUNCTION authz.assignment_holds(p_capability TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
PARALLEL SAFE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT COALESCE(
    (SELECT p_capability = ANY (authz.assignment_capabilities(a.membership_id))
       FROM authz.request_assignment() AS a
      WHERE a.membership_id IS NOT NULL),
    false
  );
$$;

COMMENT ON FUNCTION authz.assignment_holds(TEXT) IS
  'Whether the request''s one assignment holds a capability of the code '
  'registry, through authz.assignment_capabilities (AL-2675).';

CREATE OR REPLACE FUNCTION authz.has_membership(
  target_tenant UUID,
  required_roles authz.membership_role[] DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
PARALLEL SAFE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
      FROM authz.request_assignment() AS a
     WHERE a.membership_id IS NOT NULL
       AND a.tenant_id = target_tenant
       AND (required_roles IS NULL OR a.role = ANY (required_roles))
  );
$$;

CREATE OR REPLACE FUNCTION authz.has_staff_membership(
  target_tenant UUID,
  required_staff_roles authz.staff_role[] DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
PARALLEL SAFE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
      FROM authz.request_assignment() AS a
     WHERE a.membership_id IS NOT NULL
       AND a.tenant_id = target_tenant
       AND a.role = 'staff'
       AND (required_staff_roles IS NULL OR a.staff_role = ANY (required_staff_roles))
  );
$$;

CREATE OR REPLACE FUNCTION authz.caller_profile_ids()
RETURNS SETOF UUID
LANGUAGE sql
STABLE
PARALLEL SAFE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT p.id
    FROM public.profiles AS p
   WHERE p.user_id = auth.uid() OR p.id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION authz.caller_tenant_ids()
RETURNS SETOF UUID
LANGUAGE sql
STABLE
PARALLEL SAFE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT DISTINCT m.tenant_id
    FROM authz.memberships AS m
   WHERE m.user_id = auth.uid()
     AND m.is_active
     AND m.revoked_at IS NULL;
$$;

COMMENT ON FUNCTION authz.caller_tenant_ids() IS
  'The tenants where the signed-in caller holds any live membership row. For '
  'Storage policies only, which cannot carry the assignment header (AL-2675).';

-- Owners and grants. The existing helpers keep theirs (CREATE OR REPLACE).
ALTER FUNCTION authz.request_tenant_id() OWNER TO postgres;
ALTER FUNCTION authz.request_assignment_id() OWNER TO postgres;
ALTER FUNCTION authz.request_assignment() OWNER TO postgres;
ALTER FUNCTION authz.assignment_is(authz.membership_role, authz.staff_role[]) OWNER TO postgres;
ALTER FUNCTION authz.assignment_is_tenant_admin() OWNER TO postgres;
ALTER FUNCTION authz.assignment_holds(TEXT) OWNER TO postgres;
ALTER FUNCTION authz.caller_profile_ids() OWNER TO postgres;
ALTER FUNCTION authz.caller_tenant_ids() OWNER TO postgres;

REVOKE ALL ON FUNCTION authz.request_tenant_id() FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION authz.request_assignment_id() FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION authz.request_assignment() FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION authz.assignment_is(authz.membership_role, authz.staff_role[]) FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION authz.assignment_is_tenant_admin() FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION authz.assignment_holds(TEXT) FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION authz.caller_profile_ids() FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION authz.caller_tenant_ids() FROM PUBLIC, anon, authenticated, service_role;

-- Policies call them as the signed-in user. The service key bypasses row
-- security, but authz.current_tenant_id() has always been executable by it,
-- so the helpers beneath it are too, and answer NULL or false with no caller.
GRANT EXECUTE ON FUNCTION authz.request_tenant_id() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION authz.request_assignment_id() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION authz.request_assignment() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION authz.assignment_is(authz.membership_role, authz.staff_role[]) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION authz.assignment_is_tenant_admin() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION authz.assignment_holds(TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION authz.caller_profile_ids() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION authz.caller_tenant_ids() TO authenticated, service_role;

-- The super-admin branch that every rewritten policy keeps until WP2c calls
-- authz.is_super_admin(). Its meaning is unchanged (review Q6); it is marked
-- PARALLEL SAFE, as the other helpers are, because a policy that names a
-- parallel-unsafe function denies every caller-token read a parallel plan
-- (caller-token proof, section 6.2).
--
-- Why the mark is true. The function (20260226113000, lines 143-156) is one
-- STABLE SQL statement, SECURITY DEFINER owned by postgres:
--   SELECT EXISTS (SELECT 1 FROM public.profiles p
--                   WHERE p.user_id = auth.uid() AND p.role = 'super_admin')
-- It reads one permanent table, public.profiles, which a parallel worker
-- reads as the leader does. It calls auth.uid(), which reads two settings,
-- request.jwt.claim.sub and request.jwt.claims; a parallel worker starts
-- with the leader's settings, so it reads the same caller. auth.uid() is
-- marked parallel-unsafe only by default; the request-tenant helpers above
-- call it too. The function writes nothing: no insert, update or delete, no
-- sequence, no temporary table, no cursor, no prepared statement, no lock
-- beyond the read, and no setting change other than its own search_path for
-- the call, which Postgres allows in a worker because it ends with the call.
ALTER FUNCTION authz.is_super_admin() PARALLEL SAFE;

-- The caller-id helper the policies compare the caller with (council R12):
-- authz.current_user_id() is `SELECT auth.uid()`, an INVOKER SQL function
-- (20260226113000) that reads the token's subject from the two settings a
-- parallel worker shares with the leader, as authz.is_super_admin() does
-- above, and writes nothing. Marked PARALLEL SAFE for the same reason: a
-- policy that names a parallel-unsafe function denies every caller-token
-- read a parallel plan. auth.uid() itself is Supabase's and keeps its mark.
ALTER FUNCTION authz.current_user_id() PARALLEL SAFE;

-- assignment_holds reads authz.assignment_capabilities as its owner.
-- The guard role keeps EXECUTE on the two membership helpers (AL-2674).

-- The caller's selected live row of one class in a tenant (plan 5.1): the row
-- the assignment header names, when it is the caller's, live, in that tenant
-- and of that class; or, with no header, the caller's one live row there,
-- when it is of that class. A caller with several live rows there, of any
-- classes, and none named has no assignment (review defect 9). A tenant
-- header that names another tenant than p_tenant_id selects nothing, so a
-- caller of the member directory or a table-preference function cannot be
-- answered for a tenant the request did not select (council R8). Signature,
-- owner and grants as WP2a created them.
CREATE OR REPLACE FUNCTION authz.caller_assignment(
  p_tenant_id UUID,
  p_role authz.membership_role
)
RETURNS UUID
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_user UUID := auth.uid();
  v_tenant UUID := authz.request_tenant_id();
  v_named UUID := tenant_guard.request_assignment_id();
  v_id UUID;
  v_role authz.membership_role;
  v_rows BIGINT;
BEGIN
  IF v_user IS NULL OR p_tenant_id IS NULL OR p_role IS NULL THEN
    RETURN NULL;
  END IF;
  IF v_tenant IS NOT NULL AND v_tenant <> p_tenant_id THEN
    RETURN NULL;
  END IF;

  SELECT m.id, m.role, pg_catalog.count(*) OVER ()
    INTO v_id, v_role, v_rows
    FROM authz.memberships AS m
   WHERE m.user_id = v_user
     AND m.tenant_id = p_tenant_id
     AND m.is_active
     AND m.revoked_at IS NULL
     AND (v_named IS NULL OR m.id = v_named)
   LIMIT 1;

  IF v_rows IS DISTINCT FROM 1 OR v_role IS DISTINCT FROM p_role THEN
    RETURN NULL;
  END IF;
  RETURN v_id;
END;
$$;

-- A signed-in insert into crm_notes is stamped with its author's name and the
-- time; the insert policy binds the author to the caller (review defect 2).
-- Server code on the service key writes these fields itself and is left as
-- it is.
CREATE OR REPLACE FUNCTION public.crm_notes_stamp_signed_in_author()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  IF CURRENT_USER = 'authenticated' THEN
    NEW.author_name := COALESCE(
      (SELECT COALESCE(
                NULLIF(pg_catalog.btrim(p.display_name), ''),
                NULLIF(pg_catalog.btrim(p.full_name), ''),
                NULLIF(pg_catalog.btrim(pg_catalog.concat_ws(' ', p.first_name, p.last_name)), '')
              )
         FROM public.profiles AS p
        WHERE p.id = NEW.author_profile_id),
      'Mission Control'
    );
    NEW.created_at := pg_catalog.now();
    NEW.updated_at := pg_catalog.now();
  END IF;
  RETURN NEW;
END;
$$;

ALTER FUNCTION public.crm_notes_stamp_signed_in_author() OWNER TO postgres;
REVOKE ALL ON FUNCTION public.crm_notes_stamp_signed_in_author() FROM PUBLIC, anon, authenticated, service_role;

DROP TRIGGER IF EXISTS crm_notes_stamp_signed_in_author ON public.crm_notes;
CREATE TRIGGER crm_notes_stamp_signed_in_author
  BEFORE INSERT ON public.crm_notes
  FOR EACH ROW EXECUTE FUNCTION public.crm_notes_stamp_signed_in_author();

-- 2. The policies. ALTER POLICY keeps each name, command and role list; the
-- write policies of tables whose grants go are dropped, and so are those of
-- pdf_templates and crm_record_links, where no signed-in write grant stands.

-- support_agents
ALTER POLICY "support hub staff select" ON public.support_agents
  USING (
    (SELECT authz.is_super_admin())
    OR (tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.assignment_is('staff')))
  );
DROP POLICY "support hub staff insert" ON public.support_agents;
DROP POLICY "support hub staff update" ON public.support_agents;
DROP POLICY "support hub staff delete" ON public.support_agents;

-- support_assignments
ALTER POLICY "support hub staff select" ON public.support_assignments
  USING (
    (SELECT authz.is_super_admin())
    OR (tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.assignment_is('staff')))
  );
DROP POLICY "support hub staff insert" ON public.support_assignments;
DROP POLICY "support hub staff update" ON public.support_assignments;
DROP POLICY "support hub staff delete" ON public.support_assignments;

-- support_audit_log
ALTER POLICY "support hub staff select" ON public.support_audit_log
  USING (
    (SELECT authz.is_super_admin())
    OR (tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.assignment_is('staff')))
  );
DROP POLICY "support hub staff insert" ON public.support_audit_log;
DROP POLICY "support hub staff update" ON public.support_audit_log;
DROP POLICY "support hub staff delete" ON public.support_audit_log;

-- support_automation_rules
ALTER POLICY "support hub staff select" ON public.support_automation_rules
  USING (
    (SELECT authz.is_super_admin())
    OR (tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.assignment_is('staff')))
  );
DROP POLICY "support hub staff insert" ON public.support_automation_rules;
DROP POLICY "support hub staff update" ON public.support_automation_rules;
DROP POLICY "support hub staff delete" ON public.support_automation_rules;

-- support_business_hours
ALTER POLICY "support hub staff select" ON public.support_business_hours
  USING (
    (SELECT authz.is_super_admin())
    OR (tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.assignment_is('staff')))
  );
DROP POLICY "support hub staff insert" ON public.support_business_hours;
DROP POLICY "support hub staff update" ON public.support_business_hours;
DROP POLICY "support hub staff delete" ON public.support_business_hours;

-- support_canned_responses
ALTER POLICY "support hub staff select" ON public.support_canned_responses
  USING (
    (SELECT authz.is_super_admin())
    OR (tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.assignment_is('staff')))
  );
DROP POLICY "support hub staff insert" ON public.support_canned_responses;
DROP POLICY "support hub staff update" ON public.support_canned_responses;
DROP POLICY "support hub staff delete" ON public.support_canned_responses;

-- support_conversation_labels
ALTER POLICY "support hub staff select" ON public.support_conversation_labels
  USING (
    (SELECT authz.is_super_admin())
    OR (tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.assignment_is('staff')))
  );
DROP POLICY "support hub staff insert" ON public.support_conversation_labels;
DROP POLICY "support hub staff update" ON public.support_conversation_labels;
DROP POLICY "support hub staff delete" ON public.support_conversation_labels;

-- support_conversations
ALTER POLICY "support hub staff select" ON public.support_conversations
  USING (
    (SELECT authz.is_super_admin())
    OR (tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.assignment_is('staff')))
  );
DROP POLICY "support hub staff insert" ON public.support_conversations;
DROP POLICY "support hub staff update" ON public.support_conversations;
DROP POLICY "support hub staff delete" ON public.support_conversations;

-- support_inbox_settings
ALTER POLICY "support hub staff select" ON public.support_inbox_settings
  USING (
    (SELECT authz.is_super_admin())
    OR (tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.assignment_is('staff')))
  );
DROP POLICY "support hub staff insert" ON public.support_inbox_settings;
DROP POLICY "support hub staff update" ON public.support_inbox_settings;
DROP POLICY "support hub staff delete" ON public.support_inbox_settings;

-- support_inboxes
ALTER POLICY "support hub staff select" ON public.support_inboxes
  USING (
    (SELECT authz.is_super_admin())
    OR (tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.assignment_is('staff')))
  );
DROP POLICY "support hub staff insert" ON public.support_inboxes;
DROP POLICY "support hub staff update" ON public.support_inboxes;
DROP POLICY "support hub staff delete" ON public.support_inboxes;

-- support_labels
ALTER POLICY "support hub staff select" ON public.support_labels
  USING (
    (SELECT authz.is_super_admin())
    OR (tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.assignment_is('staff')))
  );
DROP POLICY "support hub staff insert" ON public.support_labels;
DROP POLICY "support hub staff update" ON public.support_labels;
DROP POLICY "support hub staff delete" ON public.support_labels;

-- support_macros
ALTER POLICY "support hub staff select" ON public.support_macros
  USING (
    (SELECT authz.is_super_admin())
    OR (tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.assignment_is('staff')))
  );
DROP POLICY "support hub staff insert" ON public.support_macros;
DROP POLICY "support hub staff update" ON public.support_macros;
DROP POLICY "support hub staff delete" ON public.support_macros;

-- support_message_attachments
ALTER POLICY "support hub staff select" ON public.support_message_attachments
  USING (
    (SELECT authz.is_super_admin())
    OR (tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.assignment_is('staff')))
  );
DROP POLICY "support hub staff insert" ON public.support_message_attachments;
DROP POLICY "support hub staff update" ON public.support_message_attachments;
DROP POLICY "support hub staff delete" ON public.support_message_attachments;

-- support_messages
ALTER POLICY "support hub staff select" ON public.support_messages
  USING (
    (SELECT authz.is_super_admin())
    OR (tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.assignment_is('staff')))
  );
DROP POLICY "support hub staff insert" ON public.support_messages;
DROP POLICY "support hub staff update" ON public.support_messages;
DROP POLICY "support hub staff delete" ON public.support_messages;

-- support_notification_preferences
ALTER POLICY "support hub staff select" ON public.support_notification_preferences
  USING (
    (SELECT authz.is_super_admin())
    OR (
      tenant_id = (SELECT authz.current_tenant_id())
      AND (SELECT authz.assignment_is('staff'))
      AND ((SELECT authz.assignment_is_tenant_admin()) OR agent_id IN (SELECT a.id FROM public.support_agents AS a WHERE a.tenant_id = (SELECT authz.current_tenant_id()) AND a.user_id = (SELECT authz.current_user_id())))
    )
  );
DROP POLICY "support hub staff insert" ON public.support_notification_preferences;
DROP POLICY "support hub staff update" ON public.support_notification_preferences;
DROP POLICY "support hub staff delete" ON public.support_notification_preferences;

-- support_saved_views
ALTER POLICY "support hub staff select" ON public.support_saved_views
  USING (
    (SELECT authz.is_super_admin())
    OR (
      tenant_id = (SELECT authz.current_tenant_id())
      AND (SELECT authz.assignment_is('staff'))
      AND (
        scope <> 'personal'
        OR owner_agent_id IS NULL
        OR (SELECT authz.assignment_is_tenant_admin())
        OR owner_agent_id IN (SELECT a.id FROM public.support_agents AS a WHERE a.tenant_id = (SELECT authz.current_tenant_id()) AND a.user_id = (SELECT authz.current_user_id()))
      )
    )
  );
DROP POLICY "support hub staff insert" ON public.support_saved_views;
DROP POLICY "support hub staff update" ON public.support_saved_views;
DROP POLICY "support hub staff delete" ON public.support_saved_views;

-- support_signatures
ALTER POLICY "support hub staff select" ON public.support_signatures
  USING (
    (SELECT authz.is_super_admin())
    OR (tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.assignment_is('staff')))
  );
DROP POLICY "support hub staff insert" ON public.support_signatures;
DROP POLICY "support hub staff update" ON public.support_signatures;
DROP POLICY "support hub staff delete" ON public.support_signatures;

-- support_sla_policies
ALTER POLICY "support hub staff select" ON public.support_sla_policies
  USING (
    (SELECT authz.is_super_admin())
    OR (tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.assignment_is('staff')))
  );
DROP POLICY "support hub staff insert" ON public.support_sla_policies;
DROP POLICY "support hub staff update" ON public.support_sla_policies;
DROP POLICY "support hub staff delete" ON public.support_sla_policies;

-- support_teams
ALTER POLICY "support hub staff select" ON public.support_teams
  USING (
    (SELECT authz.is_super_admin())
    OR (tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.assignment_is('staff')))
  );
DROP POLICY "support hub staff insert" ON public.support_teams;
DROP POLICY "support hub staff update" ON public.support_teams;
DROP POLICY "support hub staff delete" ON public.support_teams;

-- notification_queue
ALTER POLICY "authz staff tenant select notification_queue" ON public.notification_queue
  USING (
    (SELECT authz.is_super_admin())
    OR (tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.assignment_is('staff')))
  );
DROP POLICY "authz staff tenant insert notification_queue" ON public.notification_queue;
DROP POLICY "authz staff tenant update notification_queue" ON public.notification_queue;
DROP POLICY "authz staff tenant delete notification_queue" ON public.notification_queue;

-- pdf_templates
ALTER POLICY "authz staff tenant select pdf_templates" ON public.pdf_templates
  USING (
    (SELECT authz.is_super_admin())
    OR (tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.assignment_is('staff')))
  );
DROP POLICY "authz staff tenant insert pdf_templates" ON public.pdf_templates;
DROP POLICY "authz staff tenant update pdf_templates" ON public.pdf_templates;
DROP POLICY "authz staff tenant delete pdf_templates" ON public.pdf_templates;

-- audit_logs
ALTER POLICY "authz staff tenant select audit_logs" ON public.audit_logs
  USING (
    (SELECT authz.is_super_admin())
    OR (tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.assignment_is('staff')))
  );
DROP POLICY "authz staff tenant insert audit_logs" ON public.audit_logs;

-- crm_command_logs
ALTER POLICY "authz staff tenant select crm_command_logs" ON public.crm_command_logs
  USING (
    (SELECT authz.is_super_admin())
    OR (tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.assignment_is('staff')))
  );
DROP POLICY "authz staff tenant insert crm_command_logs" ON public.crm_command_logs;

-- crm_merge_candidates
ALTER POLICY "authz staff tenant select crm_merge_candidates" ON public.crm_merge_candidates
  USING (
    (SELECT authz.is_super_admin())
    OR (tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.assignment_is('staff')))
  );
DROP POLICY "authz staff tenant insert crm_merge_candidates" ON public.crm_merge_candidates;
DROP POLICY "authz staff tenant update crm_merge_candidates" ON public.crm_merge_candidates;

-- crm_record_links
ALTER POLICY "authz staff tenant select crm_record_links" ON public.crm_record_links
  USING (
    (SELECT authz.is_super_admin())
    OR (tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.assignment_is('staff')))
  );
DROP POLICY "authz staff tenant insert crm_record_links" ON public.crm_record_links;
DROP POLICY "authz staff tenant update crm_record_links" ON public.crm_record_links;

-- pdf_template_artifacts
ALTER POLICY "pdf template artifacts select" ON public.pdf_template_artifacts
  USING (
    (SELECT authz.is_super_admin())
    OR (tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.assignment_is('staff')))
  );
DROP POLICY "pdf template artifacts insert" ON public.pdf_template_artifacts;

-- pdf_template_audit_events
ALTER POLICY "pdf template audit events select" ON public.pdf_template_audit_events
  USING (
    (SELECT authz.is_super_admin())
    OR (tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.assignment_is('staff')))
  );
DROP POLICY "pdf template audit events insert" ON public.pdf_template_audit_events;

-- pdf_template_batch_jobs
ALTER POLICY "pdf template batch jobs select" ON public.pdf_template_batch_jobs
  USING (
    (SELECT authz.is_super_admin())
    OR (tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.assignment_is('staff')))
  );
DROP POLICY "pdf template batch jobs insert" ON public.pdf_template_batch_jobs;
DROP POLICY "pdf template batch jobs update" ON public.pdf_template_batch_jobs;

-- pdf_template_batches
ALTER POLICY "pdf template batches select" ON public.pdf_template_batches
  USING (
    (SELECT authz.is_super_admin())
    OR (tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.assignment_is('staff')))
  );
DROP POLICY "pdf template batches insert" ON public.pdf_template_batches;
DROP POLICY "pdf template batches update" ON public.pdf_template_batches;

-- pdf_template_renders
ALTER POLICY "pdf template renders select" ON public.pdf_template_renders
  USING (
    (SELECT authz.is_super_admin())
    OR (tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.assignment_is('staff')))
  );
DROP POLICY "pdf template renders insert" ON public.pdf_template_renders;
DROP POLICY "pdf template renders update" ON public.pdf_template_renders;

-- pdf_template_versions
ALTER POLICY "pdf template versions select" ON public.pdf_template_versions
  USING (
    (SELECT authz.is_super_admin())
    OR (tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.assignment_is('staff')))
  );
DROP POLICY "pdf template versions insert" ON public.pdf_template_versions;
DROP POLICY "pdf template versions update" ON public.pdf_template_versions;

-- support_contacts
ALTER POLICY "support contacts select" ON public.support_contacts
  USING (
    (SELECT authz.is_super_admin())
    OR (tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.assignment_is('staff')))
  );
DROP POLICY "support contacts insert" ON public.support_contacts;
DROP POLICY "support contacts update" ON public.support_contacts;
DROP POLICY "support contacts delete" ON public.support_contacts;

-- support_tickets
ALTER POLICY "support tickets select" ON public.support_tickets
  USING (
    (SELECT authz.is_super_admin())
    OR (tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.assignment_is('staff')))
  );
DROP POLICY "support tickets insert" ON public.support_tickets;
DROP POLICY "support tickets update" ON public.support_tickets;
DROP POLICY "support tickets delete" ON public.support_tickets;

-- account_claim_requests
ALTER POLICY "account_claim_requests_staff_select" ON public.account_claim_requests
  USING (
    tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.assignment_is('staff'))
  );

-- legacy_account_invitations
ALTER POLICY "legacy_account_invitations_staff_select" ON public.legacy_account_invitations
  USING (
    tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.assignment_is('staff'))
  );

-- persons
ALTER POLICY "persons_staff_select" ON public.persons
  USING (
    tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.assignment_is('staff'))
  );

-- crm_notes
ALTER POLICY "crm_notes_tenant_select" ON public.crm_notes
  USING (
    tenant_id = (SELECT authz.current_tenant_id())
    AND (SELECT authz.assignment_is('staff'))
    AND (visibility <> 'restricted' OR (SELECT authz.assignment_is_tenant_admin()))
  );
ALTER POLICY "crm_notes_tenant_insert" ON public.crm_notes
  WITH CHECK (
    tenant_id = (SELECT authz.current_tenant_id())
    AND (SELECT authz.assignment_is('staff'))
    AND (visibility <> 'restricted' OR (SELECT authz.assignment_is_tenant_admin()))
    AND author_profile_id IN (SELECT authz.caller_profile_ids())
  );

-- member_care_activities
ALTER POLICY "member care activities select" ON public.member_care_activities
  USING (
    (SELECT authz.is_super_admin())
    OR (tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.assignment_is('staff')))
  );
DROP POLICY "member care activities insert" ON public.member_care_activities;
DROP POLICY "member care activities update" ON public.member_care_activities;
DROP POLICY "member care activities delete" ON public.member_care_activities;

-- member_care_goals
ALTER POLICY "member care goals select" ON public.member_care_goals
  USING (
    (SELECT authz.is_super_admin())
    OR (tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.assignment_is('staff')))
  );
DROP POLICY "member care goals insert" ON public.member_care_goals;
DROP POLICY "member care goals update" ON public.member_care_goals;
DROP POLICY "member care goals delete" ON public.member_care_goals;

-- member_care_requirements
ALTER POLICY "member care requirements select" ON public.member_care_requirements
  USING (
    (SELECT authz.is_super_admin())
    OR (tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.assignment_is('staff')))
  );
DROP POLICY "member care requirements insert" ON public.member_care_requirements;
DROP POLICY "member care requirements update" ON public.member_care_requirements;
DROP POLICY "member care requirements delete" ON public.member_care_requirements;

-- member_care_private_notes
ALTER POLICY "member care private notes select" ON public.member_care_private_notes
  USING (
    (SELECT authz.is_super_admin())
    OR (tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.assignment_is('staff')) AND author_user_id = (SELECT authz.current_user_id()))
  );
DROP POLICY "member care private notes insert" ON public.member_care_private_notes;
DROP POLICY "member care private notes update" ON public.member_care_private_notes;
DROP POLICY "member care private notes delete" ON public.member_care_private_notes;

-- donors
ALTER POLICY "donors owner or staff select" ON public.donors
  USING (
    (SELECT authz.is_super_admin())
    OR (
      tenant_id = (SELECT authz.current_tenant_id())
      AND (
        (SELECT authz.assignment_is('staff'))
        OR ((SELECT authz.assignment_is('donor')) AND profile_id IN (SELECT authz.caller_profile_ids()))
      )
    )
  );

-- donations
ALTER POLICY "donations owner or staff select" ON public.donations
  USING (
    (SELECT authz.is_super_admin())
    OR (
      tenant_id = (SELECT authz.current_tenant_id())
      AND (
        (SELECT authz.assignment_is('staff'))
        OR ((SELECT authz.assignment_is('donor')) AND donor_id IN (SELECT d.id FROM public.donors AS d WHERE d.tenant_id = (SELECT authz.current_tenant_id()) AND d.profile_id IN (SELECT authz.caller_profile_ids())))
        OR ((SELECT authz.assignment_is('missionary')) AND missionary_id IN (SELECT m.id FROM public.missionaries AS m WHERE m.profile_id IN (SELECT authz.caller_profile_ids())))
      )
    )
  );

-- donor_pledges
ALTER POLICY "donor pledges owner or staff select" ON public.donor_pledges
  USING (
    (SELECT authz.is_super_admin())
    OR (
      tenant_id = (SELECT authz.current_tenant_id())
      AND (
        (SELECT authz.assignment_is('staff'))
        OR ((SELECT authz.assignment_is('donor')) AND donor_id IN (SELECT d.id FROM public.donors AS d WHERE d.tenant_id = (SELECT authz.current_tenant_id()) AND d.profile_id IN (SELECT authz.caller_profile_ids())))
        OR ((SELECT authz.assignment_is('missionary')) AND missionary_id IN (SELECT m.id FROM public.missionaries AS m WHERE m.profile_id IN (SELECT authz.caller_profile_ids())))
      )
    )
  );

-- donor_activities
ALTER POLICY "donor activities owner or staff select" ON public.donor_activities
  USING (
    (SELECT authz.is_super_admin())
    OR EXISTS (
      SELECT 1 FROM public.donors AS d
       WHERE d.id = donor_activities.donor_id
         AND d.tenant_id = (SELECT authz.current_tenant_id())
         AND ((SELECT authz.assignment_is('staff')) OR ((SELECT authz.assignment_is('donor')) AND d.profile_id IN (SELECT authz.caller_profile_ids())))
    )
  );

-- missionaries
ALTER POLICY "missionaries own row key read" ON public.missionaries
  USING (
    tenant_id = (SELECT authz.current_tenant_id())
    AND (SELECT authz.assignment_is('missionary'))
    AND profile_id IN (SELECT authz.caller_profile_ids())
  );

-- assets
ALTER POLICY "tenant scoped read" ON public.assets
  USING (
    tenant_id = (SELECT authz.current_tenant_id())
    AND (
      (SELECT authz.assignment_is('staff'))
    )
  );

-- campaigns
ALTER POLICY "tenant scoped read" ON public.campaigns
  USING (
    tenant_id = (SELECT authz.current_tenant_id())
    AND (
      (SELECT authz.assignment_is('staff'))
    )
  );

-- funds
ALTER POLICY "tenant scoped read" ON public.funds
  USING (
    tenant_id = (SELECT authz.current_tenant_id())
    AND (
      (SELECT authz.assignment_is('staff'))
    )
  );

-- follows
ALTER POLICY "tenant scoped own or staff read" ON public.follows
  USING (
    tenant_id = (SELECT authz.current_tenant_id())
    AND (
      (SELECT authz.assignment_is('staff'))
      OR ((SELECT authz.assignment_is('donor')) AND donor_id IN (SELECT d.id FROM public.donors AS d WHERE d.tenant_id = (SELECT authz.current_tenant_id()) AND d.profile_id IN (SELECT authz.caller_profile_ids())))
    )
  );

-- donor_feed_preferences
ALTER POLICY "donor_feed_preferences_own_select" ON public.donor_feed_preferences
  USING (
    tenant_id = (SELECT authz.current_tenant_id())
    AND (SELECT authz.assignment_is('donor'))
    AND donor_id IN (SELECT d.id FROM public.donors AS d WHERE d.tenant_id = (SELECT authz.current_tenant_id()) AND d.profile_id IN (SELECT authz.caller_profile_ids()))
  );
ALTER POLICY "donor_feed_preferences_own_insert" ON public.donor_feed_preferences
  WITH CHECK (
    tenant_id = (SELECT authz.current_tenant_id())
    AND (SELECT authz.assignment_is('donor'))
    AND donor_id IN (SELECT d.id FROM public.donors AS d WHERE d.tenant_id = (SELECT authz.current_tenant_id()) AND d.profile_id IN (SELECT authz.caller_profile_ids()))
  );
ALTER POLICY "donor_feed_preferences_own_update" ON public.donor_feed_preferences
  USING (
    tenant_id = (SELECT authz.current_tenant_id())
    AND (SELECT authz.assignment_is('donor'))
    AND donor_id IN (SELECT d.id FROM public.donors AS d WHERE d.tenant_id = (SELECT authz.current_tenant_id()) AND d.profile_id IN (SELECT authz.caller_profile_ids()))
  )
  WITH CHECK (
    tenant_id = (SELECT authz.current_tenant_id())
    AND (SELECT authz.assignment_is('donor'))
    AND donor_id IN (SELECT d.id FROM public.donors AS d WHERE d.tenant_id = (SELECT authz.current_tenant_id()) AND d.profile_id IN (SELECT authz.caller_profile_ids()))
  );

-- field_policies
ALTER POLICY "field_policies_read" ON public.field_policies
  USING (
    (SELECT authz.is_super_admin())
    OR (
      (tenant_id IS NULL OR tenant_id = (SELECT authz.current_tenant_id()))
      AND (SELECT authz.current_tenant_id()) IS NOT NULL
    )
  );
DROP POLICY "field_policies_super_admin_insert" ON public.field_policies;
DROP POLICY "field_policies_super_admin_update" ON public.field_policies;
DROP POLICY "field_policies_super_admin_delete" ON public.field_policies;

-- profiles: a profile is readable by its owner only (plan 5.1, NR-54). Staff
-- read names through public.tenant_member_directory.
DROP POLICY "profiles staff tenant select" ON public.profiles;

-- 3. The governed write grants, revoked beside the repoint.
REVOKE INSERT ON TABLE public.audit_logs FROM authenticated;
REVOKE INSERT, UPDATE ON TABLE public.crm_merge_candidates FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.member_care_activities FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.member_care_goals FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.member_care_private_notes FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.member_care_requirements FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.field_policies FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.notification_queue FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.support_agents FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.support_assignments FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.support_audit_log FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.support_automation_rules FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.support_business_hours FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.support_canned_responses FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.support_conversation_labels FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.support_conversations FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.support_inbox_settings FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.support_inboxes FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.support_labels FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.support_macros FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.support_message_attachments FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.support_messages FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.support_notification_preferences FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.support_saved_views FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.support_signatures FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.support_sla_policies FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.support_teams FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.support_contacts FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.support_tickets FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.pdf_template_artifacts FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.pdf_template_audit_events FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.pdf_template_batch_jobs FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.pdf_template_batches FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.pdf_template_renders FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.pdf_template_versions FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.crm_command_logs FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.stripe_raw_events FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.staged_gifts FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.staged_gift_allocations FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.staged_gift_audit_events FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.donation_crm_links FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.giving_reconciliation_runs FROM authenticated;

-- 4. Storage. The tenant in the object path must be one where the caller holds
-- a live membership row, of any class: Storage requests carry no headers.
ALTER POLICY "profiles owner folder insert" ON storage.objects
  WITH CHECK (
    bucket_id = 'profiles'
    AND (pg_catalog.string_to_array(name, '/'))[1] = ANY (ARRAY['avatars', 'covers'])
    AND (pg_catalog.string_to_array(name, '/'))[2] IN (
      SELECT t::TEXT FROM authz.caller_tenant_ids() AS t
    )
    AND (pg_catalog.string_to_array(name, '/'))[3] = ((SELECT auth.uid()))::TEXT
    AND (pg_catalog.string_to_array(name, '/'))[4] <> ''
  );
-- A replace tests the membership on the object as it stands (USING) as well
-- as on the object as it will be (WITH CHECK), so a person whose membership
-- in the source folder's tenant has ended cannot update an object there,
-- however the Storage server phrases its statement (council R5).
ALTER POLICY "profiles owner folder update" ON storage.objects
  USING (
    bucket_id = 'profiles'
    AND owner = (SELECT auth.uid())
    AND (pg_catalog.string_to_array(name, '/'))[1] = ANY (ARRAY['avatars', 'covers'])
    AND (pg_catalog.string_to_array(name, '/'))[2] IN (
      SELECT t::TEXT FROM authz.caller_tenant_ids() AS t
    )
    AND (pg_catalog.string_to_array(name, '/'))[3] = ((SELECT auth.uid()))::TEXT
    AND (pg_catalog.string_to_array(name, '/'))[4] <> ''
  )
  WITH CHECK (
    bucket_id = 'profiles'
    AND owner = (SELECT auth.uid())
    AND (pg_catalog.string_to_array(name, '/'))[1] = ANY (ARRAY['avatars', 'covers'])
    AND (pg_catalog.string_to_array(name, '/'))[2] IN (
      SELECT t::TEXT FROM authz.caller_tenant_ids() AS t
    )
    AND (pg_catalog.string_to_array(name, '/'))[3] = ((SELECT auth.uid()))::TEXT
    AND (pg_catalog.string_to_array(name, '/'))[4] <> ''
  );
ALTER POLICY "editor images owner folder insert" ON storage.objects
  WITH CHECK (
    bucket_id = 'document-uploads'
    AND (pg_catalog.string_to_array(name, '/'))[1] = 'editor'
    AND (pg_catalog.string_to_array(name, '/'))[2] IN (
      SELECT t::TEXT FROM authz.caller_tenant_ids() AS t
    )
    AND (pg_catalog.string_to_array(name, '/'))[3] = ((SELECT auth.uid()))::TEXT
    AND (pg_catalog.string_to_array(name, '/'))[4] <> ''
  );
ALTER POLICY "editor images owner folder update" ON storage.objects
  USING (
    bucket_id = 'document-uploads'
    AND owner = (SELECT auth.uid())
    AND (pg_catalog.string_to_array(name, '/'))[1] = 'editor'
    AND (pg_catalog.string_to_array(name, '/'))[2] IN (
      SELECT t::TEXT FROM authz.caller_tenant_ids() AS t
    )
    AND (pg_catalog.string_to_array(name, '/'))[3] = ((SELECT auth.uid()))::TEXT
    AND (pg_catalog.string_to_array(name, '/'))[4] <> ''
  )
  WITH CHECK (
    bucket_id = 'document-uploads'
    AND owner = (SELECT auth.uid())
    AND (pg_catalog.string_to_array(name, '/'))[1] = 'editor'
    AND (pg_catalog.string_to_array(name, '/'))[2] IN (
      SELECT t::TEXT FROM authz.caller_tenant_ids() AS t
    )
    AND (pg_catalog.string_to_array(name, '/'))[3] = ((SELECT auth.uid()))::TEXT
    AND (pg_catalog.string_to_array(name, '/'))[4] <> ''
  );

-- Reads and deletes of one's own objects test the same membership (review
-- Q10): a person whose membership in the tenant has ended no longer reads or
-- deletes their images in that tenant's folder through the API.
ALTER POLICY "profiles owner select" ON storage.objects
  USING (
    bucket_id = 'profiles'
    AND owner = (SELECT auth.uid())
    AND (pg_catalog.string_to_array(name, '/'))[1] = ANY (ARRAY['avatars', 'covers'])
    AND (pg_catalog.string_to_array(name, '/'))[2] IN (
      SELECT t::TEXT FROM authz.caller_tenant_ids() AS t
    )
  );
ALTER POLICY "Owner delete profiles" ON storage.objects
  USING (
    bucket_id = 'profiles'
    AND owner = (SELECT auth.uid())
    AND (pg_catalog.string_to_array(name, '/'))[1] = ANY (ARRAY['avatars', 'covers'])
    AND (pg_catalog.string_to_array(name, '/'))[2] IN (
      SELECT t::TEXT FROM authz.caller_tenant_ids() AS t
    )
  );
ALTER POLICY "editor images owner select" ON storage.objects
  USING (
    bucket_id = 'document-uploads'
    AND owner = (SELECT auth.uid())
    AND (pg_catalog.string_to_array(name, '/'))[1] = 'editor'
    AND (pg_catalog.string_to_array(name, '/'))[2] IN (
      SELECT t::TEXT FROM authz.caller_tenant_ids() AS t
    )
  );
ALTER POLICY "Owner delete document-uploads" ON storage.objects
  USING (
    bucket_id = 'document-uploads'
    AND owner = (SELECT auth.uid())
    AND (pg_catalog.string_to_array(name, '/'))[1] = 'editor'
    AND (pg_catalog.string_to_array(name, '/'))[2] IN (
      SELECT t::TEXT FROM authz.caller_tenant_ids() AS t
    )
  );

-- 5. Realtime. No hosted database publishes these tables; a replayed chain
-- does. A subscription would need a read policy that ignores the active
-- tenant (plan 5.2). The one screen that subscribes, the public map's
-- locations collection, stops subscribing in the same release.
DO $$
DECLARE
  v_table TEXT;
BEGIN
  IF EXISTS (SELECT 1 FROM pg_catalog.pg_publication WHERE pubname = 'supabase_realtime') THEN
    FOREACH v_table IN ARRAY ARRAY['funds', 'locations', 'posts', 'post_comments', 'post_fires', 'post_likes', 'post_prayers'] LOOP
      IF EXISTS (
        SELECT 1 FROM pg_catalog.pg_publication_tables
         WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = v_table
      ) THEN
        EXECUTE pg_catalog.format('ALTER PUBLICATION supabase_realtime DROP TABLE public.%I', v_table);
      END IF;
    END LOOP;
  END IF;
END $$;

DO $$
-- post-assert: request tenant policies
DECLARE
  v_problem TEXT;
BEGIN
  -- The repointed helper reads no token claim.
  IF pg_catalog.pg_get_functiondef('authz.current_tenant_id()'::regprocedure) ~* '(jwt|app_metadata)'
     OR pg_catalog.pg_get_functiondef('authz.request_assignment()'::regprocedure) ~* '(auth\.jwt|app_metadata)' THEN
    RAISE EXCEPTION 'AL-2675: the tenant helper still reads the token claim';
  END IF;

  -- No signed-in write grant remains on a governed table.
  SELECT pg_catalog.string_agg(t || ' ' || p, ', ')
    INTO v_problem
    FROM pg_catalog.unnest(ARRAY['audit_logs', 'crm_merge_candidates', 'member_care_activities', 'member_care_goals', 'member_care_private_notes', 'member_care_requirements', 'field_policies', 'notification_queue', 'support_agents', 'support_assignments', 'support_audit_log', 'support_automation_rules', 'support_business_hours', 'support_canned_responses', 'support_conversation_labels', 'support_conversations', 'support_inbox_settings', 'support_inboxes', 'support_labels', 'support_macros', 'support_message_attachments', 'support_messages', 'support_notification_preferences', 'support_saved_views', 'support_signatures', 'support_sla_policies', 'support_teams', 'support_contacts', 'support_tickets', 'pdf_template_artifacts', 'pdf_template_audit_events', 'pdf_template_batch_jobs', 'pdf_template_batches', 'pdf_template_renders', 'pdf_template_versions', 'crm_command_logs', 'stripe_raw_events', 'staged_gifts', 'staged_gift_allocations', 'staged_gift_audit_events', 'donation_crm_links', 'giving_reconciliation_runs']) AS t,
         pg_catalog.unnest(ARRAY['INSERT', 'UPDATE', 'DELETE']) AS p
   WHERE pg_catalog.has_table_privilege('authenticated', ('public.' || t)::regclass, p);
  IF v_problem IS NOT NULL THEN
    RAISE EXCEPTION 'AL-2675: signed-in users still hold %', v_problem;
  END IF;

  -- No signed-in policy on a tenant table calls a membership helper with a
  -- column of the row, or reads the token claim.
  SELECT pg_catalog.string_agg(c.relname || ': ' || p.polname, ', ')
    INTO v_problem
    FROM pg_catalog.pg_policy AS p
    JOIN pg_catalog.pg_class AS c ON c.oid = p.polrelid
    JOIN pg_catalog.pg_namespace AS n ON n.oid = c.relnamespace
   WHERE n.nspname = 'public'
     AND p.polroles && ARRAY[0::OID, 'authenticated'::regrole::OID]
     AND (
       COALESCE(pg_catalog.pg_get_expr(p.polqual, p.polrelid), '') || ' ' ||
       COALESCE(pg_catalog.pg_get_expr(p.polwithcheck, p.polrelid), '')
     ) ~ '(has_(staff_)?membership\(|auth\.jwt\(\)|app_metadata)';
  IF v_problem IS NOT NULL THEN
    RAISE EXCEPTION 'AL-2675: policies still judge the row''s own tenant or the token claim: %', v_problem;
  END IF;

  -- No signed-in INSERT, UPDATE or DELETE policy stands, on any table in
  -- public, where no signed-in role it names holds the privilege its command
  -- needs (Q7, as the coordinator widened it; the catalog gate's
  -- WRITE_POLICY_WITHOUT_GRANT holds the same rule after this release).
  SELECT pg_catalog.string_agg(c.relname || ': ' || p.polname, ', ')
    INTO v_problem
    FROM pg_catalog.pg_policy AS p
    JOIN pg_catalog.pg_class AS c ON c.oid = p.polrelid
   WHERE c.relnamespace = 'public'::regnamespace
     AND p.polcmd IN ('a', 'w', 'd')
     AND p.polroles && ARRAY[0::OID, 'authenticated'::regrole::OID]
     AND NOT EXISTS (
       SELECT 1
         FROM pg_catalog.unnest(
                ARRAY['authenticated'] ||
                CASE WHEN p.polroles @> ARRAY[0::OID] THEN ARRAY['anon'] ELSE ARRAY[]::TEXT[] END
              ) AS g(r)
        WHERE CASE p.polcmd
                WHEN 'a' THEN pg_catalog.has_any_column_privilege(g.r, c.oid, 'INSERT')
                WHEN 'w' THEN pg_catalog.has_any_column_privilege(g.r, c.oid, 'UPDATE')
                ELSE pg_catalog.has_table_privilege(g.r, c.oid, 'DELETE')
              END);
  IF v_problem IS NOT NULL THEN
    RAISE EXCEPTION 'AL-2675: write policies stand where no signed-in write grant does: %', v_problem;
  END IF;

  -- Every policy of the two buckets tests a live membership in the path's
  -- tenant (Q10).
  SELECT pg_catalog.string_agg(p.polname, ', ')
    INTO v_problem
    FROM pg_catalog.pg_policy AS p
   WHERE p.polrelid = 'storage.objects'::regclass
     AND (
       COALESCE(pg_catalog.pg_get_expr(p.polqual, p.polrelid), '') || ' ' ||
       COALESCE(pg_catalog.pg_get_expr(p.polwithcheck, p.polrelid), '')
     ) ~ '''(profiles|document-uploads)'''
     AND NOT (
       COALESCE(pg_catalog.pg_get_expr(p.polqual, p.polrelid), 'authz.caller_tenant_ids()') ~ 'authz\.caller_tenant_ids\(\)'
       AND COALESCE(pg_catalog.pg_get_expr(p.polwithcheck, p.polrelid), 'authz.caller_tenant_ids()') ~ 'authz\.caller_tenant_ids\(\)'
     );
  IF v_problem IS NOT NULL THEN
    RAISE EXCEPTION 'AL-2675: Storage policies without the membership test: %', v_problem;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_catalog.pg_policy
     WHERE polrelid = 'public.profiles'::regclass AND polname = 'profiles staff tenant select'
  ) THEN
    RAISE EXCEPTION 'AL-2675: the staff tenant-select policy on profiles remains';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_catalog.pg_publication_tables
     WHERE pubname = 'supabase_realtime' AND schemaname = 'public'
       AND tablename = ANY (ARRAY['funds', 'locations', 'posts', 'post_comments', 'post_fires', 'post_likes', 'post_prayers'])
  ) THEN
    RAISE EXCEPTION 'AL-2675: a table remains in the supabase_realtime publication';
  END IF;
END $$;

COMMIT;

SELECT pg_notify('pgrst', 'reload schema');
