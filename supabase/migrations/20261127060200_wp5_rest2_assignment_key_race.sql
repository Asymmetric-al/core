-- AL-2678 (WP5 rest, pull request 2a; issue 2834 items 1 to 3; brief
-- stage5/wp5-rest.md, pull request 2, invariant 1 and section 5). Closes the
-- race in which an assignment key outlives the worker row it named, before
-- any reader that decides access or ownership reads the key, and two smaller
-- defects of 20261126140000.
--
-- 1. private.derive_ministry_assignment_id(), the BEFORE ROW trigger
--    function of donors, posts, follows, follower_requests and
--    missionary_tasks: its text from 20261126140000 with one statement
--    added. Before it reads the sole worker row of (tenant, profile), it
--    takes FOR SHARE, in id order, on the worker rows of that tenant and
--    profile, held to the writer's COMMIT. So a re-link of a worker row
--    (an UPDATE of its tenant, profile or id, which is what
--    private.rederive_ministry_assignment_children re-derives after) and a
--    child written for its old login serialize: a re-link that came first
--    makes the child's write wait and then derive from the committed row;
--    a child that came first makes the re-link wait, and the re-link's
--    re-derivation then sees the child. A child no longer keeps a key whose
--    worker row names another login (issue 2834 item 1; the rebase ruling's
--    Q1 interleaving). What it waits on: a worker row's UPDATE or DELETE
--    in flight, for that transaction's length. What waits on it: an UPDATE
--    of the worker row while the child's transaction is open; no live
--    writer writes a child and then its worker row in one transaction, so
--    two writers of one login cannot wait on each other through it. A
--    child re-parented to a login while that login's worker row is
--    re-linked can meet the re-link in a cycle; PostgreSQL then aborts one
--    (40P01), which propagates as before. The six errors it turned into a
--    NULL key still do; lock waits (55P03) and cancels propagate.
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
--
-- Locks at migration time: object locks on the three replaced functions
-- only; no table lock. lock_timeout stops a run rather than queue it.
--
-- What the running build does: its writers of the five tables and of
-- public.missionaries keep their statements and answers; a child write may
-- wait for an in-flight UPDATE of its worker row and the other way round,
-- for the length of the shorter transaction.
--
-- Recovery. Every statement is CREATE OR REPLACE and runs again unchanged;
-- a second run commits the same text. This file has committed when this
-- read-only check is true (false before, never an error):
--   SELECT pg_catalog.position('FOR SHARE' IN pg_catalog.pg_get_functiondef(
--     'private.derive_ministry_assignment_id()'::regprocedure)) > 0
-- Then follow docs/ops/release-job.md, "If the migration committed but its
-- ledger row is missing", with this check and this file's version,
-- 20261127060200.
--
-- Down (one transaction): re-run, verbatim, the CREATE FUNCTION texts of
-- private.derive_ministry_assignment_id() and
-- private.repair_ministry_assignment_ids() from 20261126140000 as CREATE OR
-- REPLACE, and its CREATE OR REPLACE of public.missionary_task_write.

BEGIN;
SET LOCAL lock_timeout = '5s';

-- 1. The derivation, serialized with a re-link of its worker row.
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
  BEGIN
    PERFORM 1
       FROM public.missionaries AS m
      WHERE m.tenant_id = NEW.tenant_id
        AND m.profile_id = NEW.missionary_id
      ORDER BY m.id
        FOR SHARE;
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
  'BEFORE ROW trigger of the five activity tables: takes FOR SHARE on the worker rows of (tenant_id, missionary_id), so a re-link of one waits for the write or the write for the re-link, then sets ministry_assignment_id to private.assignment_for_profile(tenant_id, missionary_id), NULL when either is NULL or the lookup is missing or not permitted; never raises for a supplied value (AL-2678, Q-r3-4; issue 2834 item 1).';

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

COMMIT;

SELECT pg_notify('pgrst', 'reload schema');
