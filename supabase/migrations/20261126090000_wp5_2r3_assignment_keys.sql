-- AL-2678 (WP5 part 2-r3; plan section 12 WP5, line 997; ruling Q1
-- conditions 1-2 and Q3's no-raise condition on the rebase; R22, R26, R29,
-- R35; rulings Q-r3-1 to Q-r3-4). donors, posts, follows, follower_requests
-- and missionary_tasks name a worker by login profile (missionary_id, a key to
-- public.profiles). A person who works in two organizations has two
-- public.missionaries rows, so a profile does not name the assignment. This
-- file adds the assignment key beside the profile pointer and keeps it
-- derived; the CRM names a record's owner by it.
--
-- Adds:
-- 1. ministry_assignment_id uuid on the five tables: nullable, no default (no
--    rewrite), no foreign key and no unique index (R26; Q1; Q-r3-1), either
--    of which would let a derive-only write fail with 23503 or 23505. It is
--    always the id of the sole public.missionaries row of (tenant_id,
--    missionary_id), else NULL: private.assignment_for_profile
--    (20261126010000_wp5_2r1_worker_names.sql, lines 176-191).
-- 2. private.derive_ministry_assignment_id(), a definer owned by postgres,
--    and the triggers zz_wp5_assignment_key_insert (BEFORE INSERT) and
--    zz_wp5_assignment_key_update (BEFORE UPDATE, WHEN T, P or A is distinct)
--    on each of the five tables. It always derives A and overwrites any
--    supplied value without an error (Q-r3-4). The names sort last, so they
--    run after any other BEFORE ROW trigger of the same event.
-- 3. private.rederive_ministry_assignment_children(), a definer owned by
--    postgres, and the AFTER INSERT (WHEN NEW.profile_id IS NOT NULL), AFTER
--    UPDATE (WHEN id, tenant_id or profile_id is distinct) and AFTER DELETE
--    triggers wp5_assignment_children_after_* on public.missionaries.
-- 4. private.repair_ministry_assignment_ids() and
--    private.ministry_assignment_key_report(), invokers owned by postgres and
--    executable by nobody else. The repair reports each stored key that
--    changed, with the key its UPDATE stored after the triggers; the count
--    shows a row left NULL where a key can be derived as pending. Each
--    refuses (42501) a caller with neither superuser nor BYPASSRLS,
--    because all six tables force row security
--    (20261025070000_force_rls_tenant_tables.sql, lines 95-115) and such a
--    caller would change or count nothing, silently.
-- 5. Indexes (tenant_id, ministry_assignment_id) on the five tables and
--    (tenant_id, missionary_id) on donors, posts and follows.
-- 6. The five public.field_policies rows of donors.ministry_assignment_id
--    (internal, visible in Mission Control only), as for donors.party_id.
--
-- Replaces:
-- 1. public.missionary_owned_tasks and the update branch of
--    public.missionary_task_write (20261125050000_tenant_keys_on_activity_
--    tables.sql, lines 260-283 and 289-383): each returns SETOF
--    public.missionary_tasks through an explicit list, which gains
--    task.ministry_assignment_id last; nothing else changes, and CREATE OR
--    REPLACE keeps their owner, comment and grants. Without it the update
--    branch raises 42804 at its first call and the SQL function cannot be
--    created against the wider row type (42P13).
-- 2. public.search_crm_donors(uuid, text) (20261121020003_crm_donor_search.
--    sql, lines 10-35): dropped and created with the same arguments,
--    attributes and body, ministry_assignment_id uuid last in its result and
--    its select, and its grants re-applied as before. A call that parsed the
--    old function while this file held donors can fail once after COMMIT on
--    the dropped function; on demo data that is accepted (working rule 1).
--
-- Errors (Q3's condition). The derivation turns exactly six errors into a
-- NULL key: 42501, 42883, 42P01, 42703, 42704 and 3F000, which a later DROP,
-- rename or grant change of what it reads would raise, since a plpgsql body
-- records no dependency. Never WHEN OTHERS: cancels and timeouts (57014), lock
-- waits (55P03), deadlocks (40P01), serialization failures (40001), resource
-- and internal errors all propagate. The block is entered only when T and P
-- are both set. For any argument the lookup raises nothing; it takes no row
-- or advisory lock, only ACCESS SHARE on public.missionaries and its index,
-- which conflicts with ACCESS EXCLUSIVE alone, so its one new wait is behind
-- a migration holding public.missionaries in that mode, for as long as that
-- migration holds it or the writer's own timeout allows (lock_timeout bounds
-- acquiring, not that wait).
--
-- The parent's triggers re-derive, in the lock order below, the children of
-- the worker row's old and new (tenant, profile) and those in its old or new
-- tenant whose key is its old or new id, only where the key differs from the
-- derived one; the child's own trigger then derives the same value (depth
-- one: it runs no DML). A key in another tenant cannot be derived from this
-- row, so it is the count's and the repair's to find. No live statement
-- fires them: no live write of public.missionaries changes id, tenant_id or
-- profile_id, and nothing live inserts or deletes a worker row. A child
-- written in a transaction the parent's change cannot see keeps its key; the
-- count shows it and the repair fixes it.
--
-- Only the database owner runs the repair and the count. This file runs the
-- repair once as the backfill and writes its counts per table to the
-- release job's log (no ids or names). Later the repair runs only in a
-- migration the release job applies; the coordinator runs the count
-- read-only on each hosted database after the release.
--
-- Locks, observed in pg_locks inside the open transaction just before COMMIT
-- (PostgreSQL 17.11, on 20261126060000's chain and the seed): ACCESS
-- EXCLUSIVE on donors, posts, follows, follower_requests and
-- missionary_tasks, taken by the LOCK below in that order after SHARE ROW
-- EXCLUSIVE on public.missionaries (the weaker modes the later statements
-- take on them, from ROW EXCLUSIVE to SHARE ROW EXCLUSIVE, are held as well).
-- On public.missionaries nothing stronger than SHARE ROW EXCLUSIVE, and
-- ACCESS SHARE on it and its indexes: readers pass, writers wait. ROW
-- EXCLUSIVE on public.field_policies and pg_description; ACCESS SHARE on
-- pg_authid for the caller check. Object locks: ACCESS EXCLUSIVE and SHARE
-- UPDATE EXCLUSIVE on the four new functions and ACCESS EXCLUSIVE on the
-- dropped search_crm_donors, which no other session sees before COMMIT;
-- ACCESS SHARE on the schemas public and private, the role authenticated,
-- the row type missionary_tasks, the language plpgsql, and the
-- authz.current_tenant_id, authz.assignment_is and authz.membership_role
-- that search_crm_donors' body names.
-- Elapsed on that database: 0.33 to 0.56 s for the whole file, psql's start
-- included (eight runs on a shared laptop).
--
-- Backfill on that database: keys set on 15 donors, 36 posts, 12 follows,
-- 10 follower requests and 18 tasks; the count after it is valid for each
-- of those, unowned for the one donor with no worker, and 0 in every other
-- column, invalid included; 9 worker rows, none sharing a tenant and
-- profile.
--
-- Recovery. A second run stops at its first ADD COLUMN (42701, the column
-- exists on donors) and rolls back. This file has committed when this
-- read-only check is true, and it is false, never an error, before: SELECT
-- to_regprocedure('private.repair_ministry_assignment_ids()') IS NOT NULL.
-- Then follow docs/ops/release-job.md, "If the migration committed but its
-- ledger row is missing", with this check and this file's version,
-- 20261126090000, in place of the section's own.
--
-- Down, only after the build that reads ministry_assignment_id is rolled back,
-- in one transaction and this order. Each line is SQL except the two
-- \lines lines, which stand for those lines of that file, verbatim:
-- Down begins
--   BEGIN;
--   SET LOCAL lock_timeout = '5s';
--   LOCK TABLE public.missionaries IN SHARE ROW EXCLUSIVE MODE;
--   LOCK TABLE public.donors, public.posts, public.follows, public.follower_requests, public.missionary_tasks IN ACCESS EXCLUSIVE MODE;
--   DROP TRIGGER zz_wp5_assignment_key_insert ON public.donors;
--   DROP TRIGGER zz_wp5_assignment_key_update ON public.donors;
--   DROP TRIGGER zz_wp5_assignment_key_insert ON public.posts;
--   DROP TRIGGER zz_wp5_assignment_key_update ON public.posts;
--   DROP TRIGGER zz_wp5_assignment_key_insert ON public.follows;
--   DROP TRIGGER zz_wp5_assignment_key_update ON public.follows;
--   DROP TRIGGER zz_wp5_assignment_key_insert ON public.follower_requests;
--   DROP TRIGGER zz_wp5_assignment_key_update ON public.follower_requests;
--   DROP TRIGGER zz_wp5_assignment_key_insert ON public.missionary_tasks;
--   DROP TRIGGER zz_wp5_assignment_key_update ON public.missionary_tasks;
--   DROP TRIGGER wp5_assignment_children_after_insert ON public.missionaries;
--   DROP TRIGGER wp5_assignment_children_after_update ON public.missionaries;
--   DROP TRIGGER wp5_assignment_children_after_delete ON public.missionaries;
--   DROP FUNCTION private.derive_ministry_assignment_id();
--   DROP FUNCTION private.rederive_ministry_assignment_children();
--   DROP FUNCTION private.repair_ministry_assignment_ids();
--   DROP FUNCTION private.ministry_assignment_key_report();
--   DROP FUNCTION public.search_crm_donors(uuid, text);
--   DELETE FROM public.field_policies WHERE record_type = 'donors' AND field_key = 'ministry_assignment_id';
--   DROP INDEX public.donors_tenant_assignment_idx, public.posts_tenant_assignment_idx, public.follows_tenant_assignment_idx, public.follower_requests_tenant_assignment_idx, public.missionary_tasks_tenant_assignment_idx, public.donors_tenant_missionary_idx, public.posts_tenant_missionary_idx, public.follows_tenant_missionary_idx;
--   ALTER TABLE public.donors DROP COLUMN ministry_assignment_id;
--   ALTER TABLE public.posts DROP COLUMN ministry_assignment_id;
--   ALTER TABLE public.follows DROP COLUMN ministry_assignment_id;
--   ALTER TABLE public.follower_requests DROP COLUMN ministry_assignment_id;
--   ALTER TABLE public.missionary_tasks DROP COLUMN ministry_assignment_id;
--   \lines 260-383 of 20261125050000_tenant_keys_on_activity_tables.sql
--   \lines 10-35 of 20261121020003_crm_donor_search.sql
--   COMMIT;
--   SELECT pg_notify('pgrst', 'reload schema');
-- Down ends
-- search_crm_donors is dropped before the column, because its BEGIN ATOMIC
-- body depends on donors.ministry_assignment_id; the columns are dropped
-- before the task functions are restored, because a SQL function's select
-- list must match its row type exactly when it is created. The manifest
-- entry in docs/security/field-policies/manifest.json is reverted with the
-- code.

BEGIN;
SET LOCAL lock_timeout = '5s';

-- The order a gift takes them (20261126050000's header): the parent, then
-- the five children. The parent's mode lets readers through and stops
-- writes, so no worker row changes while the keys are first derived.
LOCK TABLE public.missionaries IN SHARE ROW EXCLUSIVE MODE;
LOCK TABLE public.donors, public.posts, public.follows, public.follower_requests, public.missionary_tasks IN ACCESS EXCLUSIVE MODE;

-- 1. The key. NULL until the backfill below; no default, so no rewrite.
ALTER TABLE public.donors ADD COLUMN ministry_assignment_id uuid;
ALTER TABLE public.posts ADD COLUMN ministry_assignment_id uuid;
ALTER TABLE public.follows ADD COLUMN ministry_assignment_id uuid;
ALTER TABLE public.follower_requests ADD COLUMN ministry_assignment_id uuid;
ALTER TABLE public.missionary_tasks ADD COLUMN ministry_assignment_id uuid;

COMMENT ON COLUMN public.donors.ministry_assignment_id IS
  'The public.missionaries row of (tenant_id, missionary_id) when it is the only one, else NULL; always derived by a trigger, never written (AL-2678).';
COMMENT ON COLUMN public.posts.ministry_assignment_id IS
  'The public.missionaries row of (tenant_id, missionary_id) when it is the only one, else NULL; always derived by a trigger, never written (AL-2678).';
COMMENT ON COLUMN public.follows.ministry_assignment_id IS
  'The public.missionaries row of (tenant_id, missionary_id) when it is the only one, else NULL; always derived by a trigger, never written (AL-2678).';
COMMENT ON COLUMN public.follower_requests.ministry_assignment_id IS
  'The public.missionaries row of (tenant_id, missionary_id) when it is the only one, else NULL; always derived by a trigger, never written (AL-2678).';
COMMENT ON COLUMN public.missionary_tasks.ministry_assignment_id IS
  'The public.missionaries row of (tenant_id, missionary_id) when it is the only one, else NULL; always derived by a trigger, never written (AL-2678).';

-- 2. The two task functions that return the row type through an explicit
-- list, widened by the new last column so the running build's task list and
-- task update keep working.
CREATE OR REPLACE FUNCTION public.missionary_owned_tasks(
  p_profile_id uuid,
  p_tenant_id uuid,
  p_assignment_id uuid
)
RETURNS SETOF public.missionary_tasks
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT task.id, task.missionary_id,
    CASE WHEN donor.missionary_id = p_profile_id THEN donor.id END AS donor_id,
    task.title, task.description, task.task_type, task.status, task.priority,
    task.sort_key, task.due_date, task.completed_at, task.created_at, task.updated_at,
    task.tenant_id, task.ministry_assignment_id
  FROM public.missionary_tasks AS task
  LEFT JOIN public.donors AS donor
    ON donor.id = task.donor_id
   AND donor.tenant_id = task.tenant_id
  WHERE task.missionary_id = p_profile_id
    AND task.tenant_id = p_tenant_id
    AND authz.selected_missionary(p_profile_id, p_tenant_id, p_assignment_id);
$$;

CREATE OR REPLACE FUNCTION public.missionary_task_write(
  p_profile_id uuid,
  p_tenant_id uuid,
  p_assignment_id uuid,
  p_operation text,
  p_id uuid,
  p_patch jsonb
)
RETURNS SETOF public.missionary_tasks
LANGUAGE plpgsql
VOLATILE
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  IF p_operation = 'create' THEN
    RETURN QUERY
    INSERT INTO public.missionary_tasks AS task (
      tenant_id, missionary_id, donor_id, title, description, task_type,
      status, priority, sort_key, due_date, completed_at
    )
    SELECT
      p_tenant_id, p_profile_id, patch.donor_id, patch.title, patch.description, patch.task_type,
      COALESCE(patch.status, 'pending'), COALESCE(patch.priority, 'medium'),
      COALESCE(patch.sort_key, 0), patch.due_date, patch.completed_at
    FROM jsonb_populate_record(NULL::public.missionary_tasks, p_patch) AS patch
    LEFT JOIN public.donors AS donor
      ON donor.id = patch.donor_id
     AND donor.tenant_id = p_tenant_id
     AND donor.missionary_id = p_profile_id
    WHERE authz.selected_missionary(p_profile_id, p_tenant_id, p_assignment_id)
      AND (donor.id IS NOT NULL OR patch.donor_id IS NULL)
    RETURNING task.*;

  ELSIF p_operation = 'update' THEN
    RETURN QUERY
    WITH hidden_donors AS NOT MATERIALIZED (
      SELECT donor.id
      FROM public.donors AS donor
      WHERE donor.tenant_id = p_tenant_id
        AND donor.missionary_id IS DISTINCT FROM p_profile_id
    )
    UPDATE public.missionary_tasks AS task
    SET (
      donor_id, title, description, task_type, status,
      priority, sort_key, due_date, completed_at
    ) = (
      SELECT
        COALESCE(patch.donor_id, (SELECT id FROM hidden_donors WHERE id = task.donor_id)),
        patch.title, patch.description, patch.task_type, patch.status,
        patch.priority, patch.sort_key, patch.due_date, patch.completed_at
      FROM jsonb_populate_record(task, p_patch) AS patch
    ),
    updated_at = now()
    WHERE task.id = p_id
      AND task.missionary_id = p_profile_id
      AND task.tenant_id = p_tenant_id
      AND authz.selected_missionary(p_profile_id, p_tenant_id, p_assignment_id)
      AND (
        NOT (p_patch ? 'donor_id')
        OR (p_patch->>'donor_id') IS NULL
        OR EXISTS (
          SELECT 1
          FROM public.donors AS donor
          WHERE donor.id = (p_patch->>'donor_id')::uuid
            AND donor.tenant_id = p_tenant_id
            AND donor.missionary_id = p_profile_id
        )
      )
    RETURNING task.id, task.missionary_id,
      (
        SELECT donor.id
        FROM public.donors AS donor
        WHERE donor.id = task.donor_id
          AND donor.tenant_id = p_tenant_id
          AND donor.missionary_id = p_profile_id
      ) AS donor_id,
      task.title, task.description, task.task_type, task.status, task.priority,
      task.sort_key, task.due_date, task.completed_at, task.created_at, task.updated_at,
      task.tenant_id, task.ministry_assignment_id;

  ELSIF p_operation = 'delete' THEN
    RETURN QUERY
    DELETE FROM public.missionary_tasks AS task
    WHERE task.id = p_id
      AND task.missionary_id = p_profile_id
      AND task.tenant_id = p_tenant_id
      AND authz.selected_missionary(p_profile_id, p_tenant_id, p_assignment_id)
    RETURNING task.*;

  ELSE
    RAISE EXCEPTION 'invalid task operation' USING ERRCODE = '22023';
  END IF;
END;
$$;

-- 3. The CRM's donor search returns the key last; its arguments, attributes
-- and body are otherwise those of 20261121020003, and so are its grants.
DROP FUNCTION public.search_crm_donors(uuid, text);
CREATE FUNCTION public.search_crm_donors(p_tenant_id uuid, p_term text)
RETURNS TABLE (
  tenant_id uuid, id uuid, profile_id uuid, missionary_id uuid,
  name text, email text, phone text, avatar_url text,
  location text, type text, status text, total_given bigint,
  last_gift_date timestamptz, tags text[], organization text, title text,
  notes text, created_at timestamptz, updated_at timestamptz,
  ministry_assignment_id uuid
)
LANGUAGE sql STABLE PARALLEL SAFE SECURITY INVOKER
BEGIN ATOMIC
  SELECT d.tenant_id, d.id, d.profile_id, d.missionary_id, d.name,
         d.email, d.phone, d.avatar_url, d.location, d.type,
         d.status, d.total_given, d.last_gift_date, d.tags, d.organization,
         d.title, d.notes, d.created_at, d.updated_at, d.ministry_assignment_id
    FROM public.donors d
   WHERE d.tenant_id = p_tenant_id
     AND d.tenant_id = (SELECT authz.current_tenant_id())
     AND (SELECT authz.assignment_is('staff'))
     AND (pg_catalog.lower(d.name) LIKE '%' || pg_catalog.lower(p_term) || '%'
       OR pg_catalog.lower(d.email) LIKE '%' || pg_catalog.lower(p_term) || '%'
       OR pg_catalog.lower(d.organization) LIKE '%' || pg_catalog.lower(p_term) || '%'
       OR pg_catalog.lower(d.phone) LIKE '%' || pg_catalog.lower(p_term) || '%');
END;
REVOKE ALL ON FUNCTION public.search_crm_donors(uuid,text) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.search_crm_donors(uuid,text) TO authenticated;

-- 4. The derivation. A definer, so no writer's role needs the private schema;
-- postgres has BYPASSRLS, so it sees every worker row although
-- public.missionaries forces row security. A supplied key is overwritten,
-- never refused (Q-r3-4). Only the six errors a later DROP, rename or grant
-- change of what it reads would raise become NULL; everything else, cancels
-- and timeouts first, propagates.
CREATE FUNCTION private.derive_ministry_assignment_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.tenant_id IS NULL OR NEW.missionary_id IS NULL THEN
    NEW.ministry_assignment_id := NULL;
    RETURN NEW;
  END IF;
  BEGIN
    NEW.ministry_assignment_id := private.assignment_for_profile(NEW.tenant_id, NEW.missionary_id);
  EXCEPTION
    WHEN insufficient_privilege OR undefined_function OR undefined_table
      OR undefined_column OR undefined_object OR invalid_schema_name THEN
      NEW.ministry_assignment_id := NULL;
  END;
  RETURN NEW;
END;
$$;
COMMENT ON FUNCTION private.derive_ministry_assignment_id() IS
  'BEFORE ROW trigger of the five activity tables: sets ministry_assignment_id to private.assignment_for_profile(tenant_id, missionary_id), NULL when either is NULL or the lookup is missing or not permitted; never raises for a supplied value (AL-2678, Q-r3-4).';
ALTER FUNCTION private.derive_ministry_assignment_id() OWNER TO postgres;
REVOKE ALL ON FUNCTION private.derive_ministry_assignment_id() FROM PUBLIC, anon, authenticated, service_role;

-- 5. A change of a worker row re-derives the children it can affect, in the
-- lock order above. OLD is read only on UPDATE and DELETE, NEW only on
-- INSERT and UPDATE. Each predicate is a (tenant, profile) or (tenant, key)
-- pair, so the indexes below find the rows.
CREATE FUNCTION private.rederive_ministry_assignment_children()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_old_tenant uuid;
  v_old_profile uuid;
  v_old_id uuid;
  v_new_tenant uuid;
  v_new_profile uuid;
  v_new_id uuid;
BEGIN
  IF TG_OP IN ('UPDATE', 'DELETE') THEN
    v_old_tenant := OLD.tenant_id;
    v_old_profile := OLD.profile_id;
    v_old_id := OLD.id;
  END IF;
  IF TG_OP IN ('INSERT', 'UPDATE') THEN
    v_new_tenant := NEW.tenant_id;
    v_new_profile := NEW.profile_id;
    v_new_id := NEW.id;
  END IF;

  UPDATE public.donors AS c
     SET ministry_assignment_id = private.assignment_for_profile(c.tenant_id, c.missionary_id)
   WHERE ((c.tenant_id = v_old_tenant AND (c.missionary_id = v_old_profile OR c.ministry_assignment_id = v_old_id))
       OR (c.tenant_id = v_new_tenant AND (c.missionary_id = v_new_profile OR c.ministry_assignment_id = v_new_id)))
     AND c.ministry_assignment_id IS DISTINCT FROM private.assignment_for_profile(c.tenant_id, c.missionary_id);

  UPDATE public.posts AS c
     SET ministry_assignment_id = private.assignment_for_profile(c.tenant_id, c.missionary_id)
   WHERE ((c.tenant_id = v_old_tenant AND (c.missionary_id = v_old_profile OR c.ministry_assignment_id = v_old_id))
       OR (c.tenant_id = v_new_tenant AND (c.missionary_id = v_new_profile OR c.ministry_assignment_id = v_new_id)))
     AND c.ministry_assignment_id IS DISTINCT FROM private.assignment_for_profile(c.tenant_id, c.missionary_id);

  UPDATE public.follows AS c
     SET ministry_assignment_id = private.assignment_for_profile(c.tenant_id, c.missionary_id)
   WHERE ((c.tenant_id = v_old_tenant AND (c.missionary_id = v_old_profile OR c.ministry_assignment_id = v_old_id))
       OR (c.tenant_id = v_new_tenant AND (c.missionary_id = v_new_profile OR c.ministry_assignment_id = v_new_id)))
     AND c.ministry_assignment_id IS DISTINCT FROM private.assignment_for_profile(c.tenant_id, c.missionary_id);

  UPDATE public.follower_requests AS c
     SET ministry_assignment_id = private.assignment_for_profile(c.tenant_id, c.missionary_id)
   WHERE ((c.tenant_id = v_old_tenant AND (c.missionary_id = v_old_profile OR c.ministry_assignment_id = v_old_id))
       OR (c.tenant_id = v_new_tenant AND (c.missionary_id = v_new_profile OR c.ministry_assignment_id = v_new_id)))
     AND c.ministry_assignment_id IS DISTINCT FROM private.assignment_for_profile(c.tenant_id, c.missionary_id);

  UPDATE public.missionary_tasks AS c
     SET ministry_assignment_id = private.assignment_for_profile(c.tenant_id, c.missionary_id)
   WHERE ((c.tenant_id = v_old_tenant AND (c.missionary_id = v_old_profile OR c.ministry_assignment_id = v_old_id))
       OR (c.tenant_id = v_new_tenant AND (c.missionary_id = v_new_profile OR c.ministry_assignment_id = v_new_id)))
     AND c.ministry_assignment_id IS DISTINCT FROM private.assignment_for_profile(c.tenant_id, c.missionary_id);

  RETURN NULL;
END;
$$;
COMMENT ON FUNCTION private.rederive_ministry_assignment_children() IS
  'AFTER ROW trigger of public.missionaries: re-derives ministry_assignment_id on the children of the row''s old and new (tenant, profile) and of its old and new id in that tenant, where it differs (AL-2678).';
ALTER FUNCTION private.rederive_ministry_assignment_children() OWNER TO postgres;
REVOKE ALL ON FUNCTION private.rederive_ministry_assignment_children() FROM PUBLIC, anon, authenticated, service_role;

-- 6. The repair (Q1 condition 2): every key that differs from the derived
-- one, a wrong non-NULL key included, is set to it; one row per change,
-- whose new key is the one the UPDATE stored after the child's own trigger
-- ran (RETURNING), so the report never claims a value the table lacks, and
-- only where that stored key differs from the key before it, so an UPDATE
-- the trigger turns back into the same key (NULL where the derivation
-- cannot read) is not reported; T and P never change; a second run returns
-- nothing.
CREATE FUNCTION private.repair_ministry_assignment_ids()
RETURNS TABLE (
  table_name text,
  row_id uuid,
  tenant_id uuid,
  old_assignment_id uuid,
  new_assignment_id uuid
)
LANGUAGE plpgsql
VOLATILE
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_roles AS r
     WHERE r.rolname = current_user AND (r.rolsuper OR r.rolbypassrls)
  ) THEN
    RAISE EXCEPTION 'repair_ministry_assignment_ids needs a superuser or a role with BYPASSRLS: every table it reads forces row security, so any other caller would change nothing'
      USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  WITH wrong AS MATERIALIZED (
    SELECT c.id AS row_id, c.tenant_id AS tenant_id, c.ministry_assignment_id AS old_id,
           private.assignment_for_profile(c.tenant_id, c.missionary_id) AS new_id
      FROM public.donors AS c
     WHERE c.ministry_assignment_id IS DISTINCT FROM private.assignment_for_profile(c.tenant_id, c.missionary_id)
  ), fixed AS (
    UPDATE public.donors AS c SET ministry_assignment_id = w.new_id
      FROM wrong AS w WHERE c.id = w.row_id
    RETURNING c.id, c.ministry_assignment_id AS stored_id
  )
  SELECT 'donors'::text, w.row_id, w.tenant_id, w.old_id, f.stored_id
    FROM wrong AS w JOIN fixed AS f ON f.id = w.row_id
   WHERE w.old_id IS DISTINCT FROM f.stored_id;

  RETURN QUERY
  WITH wrong AS MATERIALIZED (
    SELECT c.id AS row_id, c.tenant_id AS tenant_id, c.ministry_assignment_id AS old_id,
           private.assignment_for_profile(c.tenant_id, c.missionary_id) AS new_id
      FROM public.posts AS c
     WHERE c.ministry_assignment_id IS DISTINCT FROM private.assignment_for_profile(c.tenant_id, c.missionary_id)
  ), fixed AS (
    UPDATE public.posts AS c SET ministry_assignment_id = w.new_id
      FROM wrong AS w WHERE c.id = w.row_id
    RETURNING c.id, c.ministry_assignment_id AS stored_id
  )
  SELECT 'posts'::text, w.row_id, w.tenant_id, w.old_id, f.stored_id
    FROM wrong AS w JOIN fixed AS f ON f.id = w.row_id
   WHERE w.old_id IS DISTINCT FROM f.stored_id;

  RETURN QUERY
  WITH wrong AS MATERIALIZED (
    SELECT c.id AS row_id, c.tenant_id AS tenant_id, c.ministry_assignment_id AS old_id,
           private.assignment_for_profile(c.tenant_id, c.missionary_id) AS new_id
      FROM public.follows AS c
     WHERE c.ministry_assignment_id IS DISTINCT FROM private.assignment_for_profile(c.tenant_id, c.missionary_id)
  ), fixed AS (
    UPDATE public.follows AS c SET ministry_assignment_id = w.new_id
      FROM wrong AS w WHERE c.id = w.row_id
    RETURNING c.id, c.ministry_assignment_id AS stored_id
  )
  SELECT 'follows'::text, w.row_id, w.tenant_id, w.old_id, f.stored_id
    FROM wrong AS w JOIN fixed AS f ON f.id = w.row_id
   WHERE w.old_id IS DISTINCT FROM f.stored_id;

  RETURN QUERY
  WITH wrong AS MATERIALIZED (
    SELECT c.id AS row_id, c.tenant_id AS tenant_id, c.ministry_assignment_id AS old_id,
           private.assignment_for_profile(c.tenant_id, c.missionary_id) AS new_id
      FROM public.follower_requests AS c
     WHERE c.ministry_assignment_id IS DISTINCT FROM private.assignment_for_profile(c.tenant_id, c.missionary_id)
  ), fixed AS (
    UPDATE public.follower_requests AS c SET ministry_assignment_id = w.new_id
      FROM wrong AS w WHERE c.id = w.row_id
    RETURNING c.id, c.ministry_assignment_id AS stored_id
  )
  SELECT 'follower_requests'::text, w.row_id, w.tenant_id, w.old_id, f.stored_id
    FROM wrong AS w JOIN fixed AS f ON f.id = w.row_id
   WHERE w.old_id IS DISTINCT FROM f.stored_id;

  RETURN QUERY
  WITH wrong AS MATERIALIZED (
    SELECT c.id AS row_id, c.tenant_id AS tenant_id, c.ministry_assignment_id AS old_id,
           private.assignment_for_profile(c.tenant_id, c.missionary_id) AS new_id
      FROM public.missionary_tasks AS c
     WHERE c.ministry_assignment_id IS DISTINCT FROM private.assignment_for_profile(c.tenant_id, c.missionary_id)
  ), fixed AS (
    UPDATE public.missionary_tasks AS c SET ministry_assignment_id = w.new_id
      FROM wrong AS w WHERE c.id = w.row_id
    RETURNING c.id, c.ministry_assignment_id AS stored_id
  )
  SELECT 'missionary_tasks'::text, w.row_id, w.tenant_id, w.old_id, f.stored_id
    FROM wrong AS w JOIN fixed AS f ON f.id = w.row_id
   WHERE w.old_id IS DISTINCT FROM f.stored_id;
END;
$$;
COMMENT ON FUNCTION private.repair_ministry_assignment_ids() IS
  'Sets every ministry_assignment_id that differs from private.assignment_for_profile(tenant_id, missionary_id) to it and returns one row per key that changed, with the key the row holds after the update and its triggers. Owner only; refuses a caller without superuser or BYPASSRLS (AL-2678, Q1 condition 2).';
ALTER FUNCTION private.repair_ministry_assignment_ids() OWNER TO postgres;
REVOKE ALL ON FUNCTION private.repair_ministry_assignment_ids() FROM PUBLIC, anon, authenticated, service_role;

-- 7. The count (Q1 condition 1). With no key: unowned (no profile), null
-- tenant, absent (no worker row), ambiguous (two or more), pending (one).
-- With a key: valid when the row of that id has the child's tenant and
-- profile and is the only row of that pair; otherwise invalid, and
-- asymmetric (a key without a profile; quoted, a reserved word) is a part
-- of invalid. The seven
-- columns partition total. The missionaries row counts in ambiguous the
-- worker rows that share a tenant and profile with another; its other
-- columns are zero.
CREATE FUNCTION private.ministry_assignment_key_report()
RETURNS TABLE (
  table_name text,
  total bigint,
  unowned bigint,
  null_tenant bigint,
  absent bigint,
  ambiguous bigint,
  pending bigint,
  valid bigint,
  invalid bigint,
  "asymmetric" bigint
)
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_roles AS r
     WHERE r.rolname = current_user AND (r.rolsuper OR r.rolbypassrls)
  ) THEN
    RAISE EXCEPTION 'ministry_assignment_key_report needs a superuser or a role with BYPASSRLS: every table it reads forces row security, so any other caller would count nothing'
      USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  WITH parents AS (
    SELECT m.tenant_id AS t, m.profile_id AS p, pg_catalog.count(*) AS n,
           CASE WHEN pg_catalog.count(*) = 1 THEN (pg_catalog.array_agg(m.id))[1] END AS sole
      FROM public.missionaries AS m
     WHERE m.profile_id IS NOT NULL
     GROUP BY m.tenant_id, m.profile_id
  ), children (name, t, p, a) AS (
    SELECT 'donors'::text, c.tenant_id, c.missionary_id, c.ministry_assignment_id FROM public.donors AS c
    UNION ALL SELECT 'posts', c.tenant_id, c.missionary_id, c.ministry_assignment_id FROM public.posts AS c
    UNION ALL SELECT 'follows', c.tenant_id, c.missionary_id, c.ministry_assignment_id FROM public.follows AS c
    UNION ALL SELECT 'follower_requests', c.tenant_id, c.missionary_id, c.ministry_assignment_id FROM public.follower_requests AS c
    UNION ALL SELECT 'missionary_tasks', c.tenant_id, c.missionary_id, c.ministry_assignment_id FROM public.missionary_tasks AS c
  ), tables (name, position) AS (
    VALUES ('donors'::text, 1), ('posts', 2), ('follows', 3), ('follower_requests', 4), ('missionary_tasks', 5)
  ), counted AS (
    SELECT tb.position,
           tb.name,
           pg_catalog.count(c.name) AS total,
           pg_catalog.count(*) FILTER (WHERE c.name IS NOT NULL AND c.a IS NULL AND c.p IS NULL) AS unowned,
           pg_catalog.count(*) FILTER (WHERE c.a IS NULL AND c.p IS NOT NULL AND c.t IS NULL) AS null_tenant,
           pg_catalog.count(*) FILTER (WHERE c.a IS NULL AND c.p IS NOT NULL AND c.t IS NOT NULL AND m.n IS NULL) AS absent,
           pg_catalog.count(*) FILTER (WHERE c.a IS NULL AND m.n > 1) AS ambiguous,
           pg_catalog.count(*) FILTER (WHERE c.a IS NULL AND m.n = 1) AS pending,
           pg_catalog.count(*) FILTER (WHERE c.a IS NOT NULL AND c.a = m.sole) AS valid,
           pg_catalog.count(*) FILTER (WHERE c.a IS NOT NULL AND c.a IS DISTINCT FROM m.sole) AS invalid,
           pg_catalog.count(*) FILTER (WHERE c.a IS NOT NULL AND c.p IS NULL) AS "asymmetric"
      FROM tables AS tb
      LEFT JOIN children AS c ON c.name = tb.name
      LEFT JOIN parents AS m ON m.t = c.t AND m.p = c.p
     GROUP BY tb.position, tb.name
    UNION ALL
    SELECT 6, 'missionaries', pg_catalog.count(*), 0, 0, 0,
           pg_catalog.count(*) FILTER (WHERE s.shared), 0, 0, 0, 0
      FROM (
        SELECT m.profile_id IS NOT NULL
               AND pg_catalog.count(*) OVER (PARTITION BY m.tenant_id, m.profile_id) > 1 AS shared
          FROM public.missionaries AS m
      ) AS s
  )
  SELECT k.name, k.total, k.unowned, k.null_tenant, k.absent, k.ambiguous,
         k.pending, k.valid, k.invalid, k."asymmetric"
    FROM counted AS k
   ORDER BY k.position;
END;
$$;
COMMENT ON FUNCTION private.ministry_assignment_key_report() IS
  'Counts, per activity table, the rows without a key (unowned, null tenant, absent, ambiguous, pending) and with one (valid, invalid; asymmetric within invalid), and the worker rows that share a tenant and profile. Owner only; read-only; refuses a caller without superuser or BYPASSRLS (AL-2678, Q1 condition 1).';
ALTER FUNCTION private.ministry_assignment_key_report() OWNER TO postgres;
REVOKE ALL ON FUNCTION private.ministry_assignment_key_report() FROM PUBLIC, anon, authenticated, service_role;

-- 8. The triggers. Within one event, row triggers fire in name order, so
-- zz_ runs after any other BEFORE ROW trigger and sees its NEW. WHEN, not
-- UPDATE OF, so a statement that only names T, P or A without changing them
-- does not fire it.
CREATE TRIGGER zz_wp5_assignment_key_insert
  BEFORE INSERT ON public.donors
  FOR EACH ROW EXECUTE FUNCTION private.derive_ministry_assignment_id();
CREATE TRIGGER zz_wp5_assignment_key_update
  BEFORE UPDATE ON public.donors
  FOR EACH ROW
  WHEN (OLD.tenant_id IS DISTINCT FROM NEW.tenant_id OR OLD.missionary_id IS DISTINCT FROM NEW.missionary_id OR OLD.ministry_assignment_id IS DISTINCT FROM NEW.ministry_assignment_id)
  EXECUTE FUNCTION private.derive_ministry_assignment_id();

CREATE TRIGGER zz_wp5_assignment_key_insert
  BEFORE INSERT ON public.posts
  FOR EACH ROW EXECUTE FUNCTION private.derive_ministry_assignment_id();
CREATE TRIGGER zz_wp5_assignment_key_update
  BEFORE UPDATE ON public.posts
  FOR EACH ROW
  WHEN (OLD.tenant_id IS DISTINCT FROM NEW.tenant_id OR OLD.missionary_id IS DISTINCT FROM NEW.missionary_id OR OLD.ministry_assignment_id IS DISTINCT FROM NEW.ministry_assignment_id)
  EXECUTE FUNCTION private.derive_ministry_assignment_id();

CREATE TRIGGER zz_wp5_assignment_key_insert
  BEFORE INSERT ON public.follows
  FOR EACH ROW EXECUTE FUNCTION private.derive_ministry_assignment_id();
CREATE TRIGGER zz_wp5_assignment_key_update
  BEFORE UPDATE ON public.follows
  FOR EACH ROW
  WHEN (OLD.tenant_id IS DISTINCT FROM NEW.tenant_id OR OLD.missionary_id IS DISTINCT FROM NEW.missionary_id OR OLD.ministry_assignment_id IS DISTINCT FROM NEW.ministry_assignment_id)
  EXECUTE FUNCTION private.derive_ministry_assignment_id();

CREATE TRIGGER zz_wp5_assignment_key_insert
  BEFORE INSERT ON public.follower_requests
  FOR EACH ROW EXECUTE FUNCTION private.derive_ministry_assignment_id();
CREATE TRIGGER zz_wp5_assignment_key_update
  BEFORE UPDATE ON public.follower_requests
  FOR EACH ROW
  WHEN (OLD.tenant_id IS DISTINCT FROM NEW.tenant_id OR OLD.missionary_id IS DISTINCT FROM NEW.missionary_id OR OLD.ministry_assignment_id IS DISTINCT FROM NEW.ministry_assignment_id)
  EXECUTE FUNCTION private.derive_ministry_assignment_id();

CREATE TRIGGER zz_wp5_assignment_key_insert
  BEFORE INSERT ON public.missionary_tasks
  FOR EACH ROW EXECUTE FUNCTION private.derive_ministry_assignment_id();
CREATE TRIGGER zz_wp5_assignment_key_update
  BEFORE UPDATE ON public.missionary_tasks
  FOR EACH ROW
  WHEN (OLD.tenant_id IS DISTINCT FROM NEW.tenant_id OR OLD.missionary_id IS DISTINCT FROM NEW.missionary_id OR OLD.ministry_assignment_id IS DISTINCT FROM NEW.ministry_assignment_id)
  EXECUTE FUNCTION private.derive_ministry_assignment_id();

CREATE TRIGGER wp5_assignment_children_after_insert
  AFTER INSERT ON public.missionaries
  FOR EACH ROW
  WHEN (NEW.profile_id IS NOT NULL)
  EXECUTE FUNCTION private.rederive_ministry_assignment_children();
CREATE TRIGGER wp5_assignment_children_after_update
  AFTER UPDATE ON public.missionaries
  FOR EACH ROW
  WHEN (OLD.id IS DISTINCT FROM NEW.id OR OLD.tenant_id IS DISTINCT FROM NEW.tenant_id OR OLD.profile_id IS DISTINCT FROM NEW.profile_id)
  EXECUTE FUNCTION private.rederive_ministry_assignment_children();
CREATE TRIGGER wp5_assignment_children_after_delete
  AFTER DELETE ON public.missionaries
  FOR EACH ROW
  EXECUTE FUNCTION private.rederive_ministry_assignment_children();

-- 9. Indexes for the parent's re-derivation and for readers by key. Plain
-- builds: the tables are already held in ACCESS EXCLUSIVE.
CREATE INDEX donors_tenant_assignment_idx ON public.donors (tenant_id, ministry_assignment_id);
CREATE INDEX posts_tenant_assignment_idx ON public.posts (tenant_id, ministry_assignment_id);
CREATE INDEX follows_tenant_assignment_idx ON public.follows (tenant_id, ministry_assignment_id);
CREATE INDEX follower_requests_tenant_assignment_idx ON public.follower_requests (tenant_id, ministry_assignment_id);
CREATE INDEX missionary_tasks_tenant_assignment_idx ON public.missionary_tasks (tenant_id, ministry_assignment_id);
CREATE INDEX donors_tenant_missionary_idx ON public.donors (tenant_id, missionary_id);
CREATE INDEX posts_tenant_missionary_idx ON public.posts (tenant_id, missionary_id);
CREATE INDEX follows_tenant_missionary_idx ON public.follows (tenant_id, missionary_id);

-- 10. The backfill: the repair, once, and the count after it, into the
-- release job's log as numbers only.
DO $$
DECLARE
  v_row record;
BEGIN
  FOR v_row IN
    WITH changed AS MATERIALIZED (
      SELECT r.table_name FROM private.repair_ministry_assignment_ids() AS r
    )
    SELECT t.name, (SELECT pg_catalog.count(*) FROM changed AS c WHERE c.table_name = t.name) AS n
      FROM (VALUES (1, 'donors'), (2, 'posts'), (3, 'follows'), (4, 'follower_requests'), (5, 'missionary_tasks')) AS t (position, name)
     ORDER BY t.position
  LOOP
    RAISE NOTICE 'AL-2678 r3 backfill: % keys set on %', v_row.n, v_row.name;
  END LOOP;
  FOR v_row IN SELECT * FROM private.ministry_assignment_key_report() LOOP
    RAISE NOTICE 'AL-2678 r3 count: % total %, valid %, pending %, absent %, ambiguous %, null tenant %, unowned %, invalid %',
      v_row.table_name, v_row.total, v_row.valid, v_row.pending, v_row.absent,
      v_row.ambiguous, v_row.null_tenant, v_row.unowned, v_row.invalid;
  END LOOP;
END
$$;

-- 11. Field policies (plan 7.1): the key is internal, visible in Mission
-- Control only, as donors.party_id.
INSERT INTO public.field_policies
  (record_type, field_key, surface, tenant_id, visible, editable, exportable, sensitivity_category)
SELECT f.record_type, f.field_key, s.surface, NULL, s.surface = 'mission_control', false, false, f.category::public.field_sensitivity_category
  FROM (VALUES
    ('donors', 'ministry_assignment_id', 'internal')
  ) AS f (record_type, field_key, category)
  CROSS JOIN (VALUES ('mission_control'), ('donor'), ('missionary'), ('public'), ('export')) AS s (surface)
ON CONFLICT ON CONSTRAINT field_policies_lookup_key DO NOTHING;

COMMIT;

SELECT pg_notify('pgrst', 'reload schema');
