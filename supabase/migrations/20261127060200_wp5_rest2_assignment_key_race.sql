-- AL-2678 (WP5 rest, pull request 2a; issue 2834 items 1 to 3; fix round F3
-- of pull request 2859; brief stage5/wp5-rest.md, pull request 2, invariant
-- 1 and section 5). Whichever of a child's write and a worker row's write
-- commits last, no child row is left with a key that is not the sole worker
-- row of its organization and login, and none without a key while one
-- exists; closed before any reader that decides access or ownership reads
-- the key. Also two smaller defects of 20261126140000.
--
-- 1. private.derive_ministry_assignment_id(), the BEFORE ROW trigger
--    function of donors, posts, follows, follower_requests and
--    missionary_tasks: its text from 20261126140000 with one statement
--    added. Before it reads the sole worker row it takes the lock below for
--    the row's (tenant_id, missionary_id).
-- 2. public.missionary_task_write: its text from 20261126140000 with the
--    patch's ministry_assignment_id removed before both of its conversions
--    (jsonb_populate_record), so a malformed value in a patch is ignored as
--    it was before r3 instead of raising 22P02 (issue 2834 item 2). The key
--    is still always derived by the trigger. Arguments, owner, grants and
--    answers are unchanged.
-- 3. private.repair_ministry_assignment_ids(): its text from 20261126140000
--    with FOR UPDATE on the rows each table's selecting CTE reads, so the
--    old key it reports is the key its UPDATE replaced, even when another
--    session changed the key and committed while the repair waited (issue
--    2834 item 3). Owner, grants and answers are unchanged.
-- 4. private.rederive_ministry_assignment_children(), the AFTER ROW trigger
--    function of public.missionaries (an INSERT with a login; an UPDATE of
--    its id, tenant or login; a DELETE): its text from 20261126140000 with
--    one loop added. Before it re-derives it takes the lock below for the
--    row's old and new (tenant_id, profile_id), the distinct non-null ones,
--    in ascending order of the lock's second key.
--
-- The lock: the transaction-level advisory lock ('ministry_assignment_key',
-- organization:login), pg_advisory_xact_lock(hashtext(
-- 'ministry_assignment_key'), hashtext(tenant_id::text || ':' ||
-- profile_id::text)), held to COMMIT. So a child written for a login and a
-- worker row of that login inserted, re-linked or deleted serialize. A
-- child that came first makes the worker write wait; its re-derivation
-- then reads under a snapshot taken after the child committed and corrects
-- the child: no key when the login now has two workers or none, the sole
-- worker's when it has one. A worker write that came first makes the child
-- wait, and the child derives from the committed worker rows. This holds
-- under READ COMMITTED, the isolation every writer of these tables uses.
--
-- Lock order. A worker write holds its row's lock, then the advisory locks
-- in the order above. A child write takes the advisory lock and no lock on
-- a worker row (the FOR SHARE that this file's first cut took on the
-- worker rows is gone), so the two never wait on each other in a cycle. A
-- transaction that writes children of two logins and a worker row of each,
-- in the opposite order of another, can still meet it in one; PostgreSQL
-- then aborts one (40P01). Lock waits (55P03) and cancels propagate; the
-- six errors the derivation turned into a NULL key still do.
--
-- Locks at migration time: object locks on the four replaced functions
-- only; no table lock. lock_timeout stops a run rather than queue it.
--
-- What the running build does: its writers of the five tables and of
-- public.missionaries keep their statements and answers; a child write for
-- a login may wait for an in-flight write of a worker row of that login,
-- and the other way round, for the length of the first transaction.
--
-- Recovery. Every statement is CREATE OR REPLACE or COMMENT and runs again
-- unchanged; a second run commits the same text. This file has committed
-- when this read-only check returns true (false before it, never an error):
-- Check begins
--   SELECT pg_catalog.strpos(pg_catalog.pg_get_functiondef('private.rederive_ministry_assignment_children()'::pg_catalog.regprocedure), 'ministry_assignment_key') > 0 AS committed;
-- Check ends
-- Then follow docs/ops/release-job.md, "If the migration committed but its
-- ledger row is missing", with this check and this file's version,
-- 20261127060200.
--
-- Down (one transaction): the four functions' texts and the three comments
-- of 20261126140000; the task writer's comment is not changed by this file.
-- Down begins
--   BEGIN;
--   SET LOCAL lock_timeout = '5s';
--   CREATE OR REPLACE FUNCTION private.derive_ministry_assignment_id()
--   \lines 353-374 of 20261126140000_wp5_2r3_assignment_keys.sql
--   CREATE OR REPLACE FUNCTION private.rederive_ministry_assignment_children()
--   \lines 383-441 of 20261126140000_wp5_2r3_assignment_keys.sql
--   CREATE OR REPLACE FUNCTION private.repair_ministry_assignment_ids()
--   \lines 454-552 of 20261126140000_wp5_2r3_assignment_keys.sql
--   \lines 220-314 of 20261126140000_wp5_2r3_assignment_keys.sql
--   COMMIT;
--   SELECT pg_notify('pgrst', 'reload schema');
-- Down ends

BEGIN;
SET LOCAL lock_timeout = '5s';

-- 1. The derivation takes the lock for its organization and login.
CREATE OR REPLACE FUNCTION private.derive_ministry_assignment_id()
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
  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtext('ministry_assignment_key'),
    pg_catalog.hashtext(NEW.tenant_id::text || ':' || NEW.missionary_id::text)
  );
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
  'BEFORE ROW trigger of the five activity tables: takes the advisory lock (ministry_assignment_key, tenant_id:missionary_id), which a write of a worker row of that login also takes, then sets ministry_assignment_id to private.assignment_for_profile(tenant_id, missionary_id), NULL when either is NULL or the lookup is missing or not permitted; never raises for a supplied value (AL-2678, Q-r3-4; issue 2834 item 1; fix round F3 of pull request 2859).';

-- 2. The task writer ignores the key in a patch.
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
    FROM jsonb_populate_record(NULL::public.missionary_tasks, p_patch - 'ministry_assignment_id') AS patch
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
      FROM jsonb_populate_record(task, p_patch - 'ministry_assignment_id') AS patch
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

-- 3. The repair locks what it reads.
CREATE OR REPLACE FUNCTION private.repair_ministry_assignment_ids()
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
       FOR UPDATE
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
       FOR UPDATE
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
       FOR UPDATE
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
       FOR UPDATE
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
       FOR UPDATE
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
  'Sets every ministry_assignment_id that differs from private.assignment_for_profile(tenant_id, missionary_id) to it and returns one row per key that changed, with the key it replaced (read under FOR UPDATE) and the key the row holds after the update and its triggers. Owner only; refuses a caller without superuser or BYPASSRLS (AL-2678, Q1 condition 2; issue 2834 item 3).';

-- 4. The worker rows' re-derivation takes the lock for their old and new
-- organization and login.
CREATE OR REPLACE FUNCTION private.rederive_ministry_assignment_children()
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
  v_key integer;
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

  FOR v_key IN
    SELECT DISTINCT pg_catalog.hashtext(k.tenant_id::text || ':' || k.profile_id::text)
      FROM (VALUES (v_old_tenant, v_old_profile), (v_new_tenant, v_new_profile)) AS k (tenant_id, profile_id)
     WHERE k.tenant_id IS NOT NULL AND k.profile_id IS NOT NULL
     ORDER BY 1
  LOOP
    PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext('ministry_assignment_key'), v_key);
  END LOOP;

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
  'AFTER ROW trigger of public.missionaries: takes the advisory lock (ministry_assignment_key, tenant:profile) for the row''s old and new tenant and profile, in ascending order of the key, which a write of their children also takes, then re-derives ministry_assignment_id on the children of the row''s old and new (tenant, profile) and of its old and new id in that tenant, where it differs (AL-2678; fix round F3 of pull request 2859).';

COMMIT;

SELECT pg_notify('pgrst', 'reload schema');
