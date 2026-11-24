-- AL-2678 (WP5 part 1; plan section 12 WP5, "tenant_id, same-tenant keys and
-- forced row security on three tables"; audit NR-12; record section 9, lines
-- 593 and 594, D-73). donor_activities, follower_requests and missionary_tasks
-- gain a tenant column, filled from evidence, a key to tenants that restricts
-- deletion, a same-tenant key to donors, and forced row security.
--
-- 1. Preflight. A row whose tenant the evidence cannot name is refused, with
--    counts only, and nothing is rewritten: an activity that names no donor
--    with a tenant, a follower request that names neither such a donor nor a
--    missionary profile with missionary rows in exactly one tenant, and a task
--    that names a donor without a tenant.
-- 2. A task that names no donor takes the one tenant that every membership row
--    of its missionary, live or revoked, of every class, and every missionary
--    row of that profile name. A donorless task with no such tenant moves to
--    private.missionary_tasks_unresolved_tenant (row security forced, no grant
--    to anon or authenticated); the migration reports the count.
-- 3. donor_activities_donor_id_fkey becomes the composite key
--    (tenant_id, donor_id) -> donors(tenant_id, id).
--    missionary_tasks_donor_id_fkey is replaced by a composite key under the
--    same name, because the running build embeds donors through that name
--    (packages/api/src/missionary-portal/service.ts:106), which PostgREST
--    resolves over the composite key. follower_requests_donor_id_fkey stays
--    single-column here: the running build embeds donors from follower
--    requests by a column hint on donor_id
--    (packages/api/src/follower-requests/index.ts:68, request.ts:51), which
--    cannot select a composite key, and a second key into donors would make
--    other embeds ambiguous. Part 2 swaps it with those two handlers.
-- 4. missionary_tasks.sort_key becomes double precision, so a key between two
--    others keeps its midpoint (record line 594).
-- 5. The six handler functions keep their signatures and filter on the new
--    column; the create functions write it. authz.missionary_task_single_tenant
--    is dropped: tenant keys now place every donorless task (record line 593).
-- 6. follower_requests and missionary_tasks have no signed-in grant and no
--    caller-token reader; each gets one plain deny policy for authenticated,
--    so the catalog gate's tenant-table rule sees that no signed-in read is
--    admitted. donor_activities' policy carries the request's tenant directly.
--
-- The running build at the base calls only the six functions on these tables
-- (service key), all replaced here in the same transaction.
--
-- Preflight, also: a profile whose user_id names another login than its id
-- is refused here, before anything is written, because the task evidence of
-- step 2 joins memberships to profiles by login; a profile whose user_id is
-- still NULL (filled by the next migration) counts by its id.
--
-- Locks. ACCESS EXCLUSIVE on donor_activities, follower_requests and
-- missionary_tasks (the sort_key retype rewrites missionary_tasks), SHARE ROW
-- EXCLUSIVE on tenants for the new tenant keys, all held to COMMIT. The two
-- statements that change the keys into donors come last, so the lock they
-- take on donors (ACCESS EXCLUSIVE while the single-column keys are dropped)
-- is held only from there to COMMIT. lock_timeout stops a run rather than
-- queue it behind live traffic.
--
-- Recovery. Nothing here is written to run twice: a run lost between its
-- COMMIT and its ledger row stops on the next run at its first CREATE (the
-- set-aside table, 42P07), and docs/ops/release-job.md, "If the migration
-- committed but its ledger row is missing", applies.

BEGIN;
SET LOCAL lock_timeout = '5s';

DO $$
-- preflight: activity-tenants
DECLARE
  v_divergent BIGINT;
  v_activities BIGINT;
  v_requests BIGINT;
  v_tasks BIGINT;
BEGIN
  SELECT pg_catalog.count(*) INTO v_divergent
    FROM public.profiles AS p
   WHERE p.user_id IS NOT NULL
     AND p.user_id <> p.id;
  IF v_divergent > 0 THEN
    RAISE EXCEPTION 'preflight failed: % profiles name another login in user_id than their id; nothing was changed', v_divergent
      USING ERRCODE = '23514';
  END IF;

  SELECT pg_catalog.count(*) INTO v_activities
    FROM public.donor_activities AS a
    LEFT JOIN public.donors AS d ON d.id = a.donor_id
   WHERE d.tenant_id IS NULL;

  SELECT pg_catalog.count(*) INTO v_requests
    FROM public.follower_requests AS r
    LEFT JOIN public.donors AS d ON d.id = r.donor_id
   WHERE CASE
           WHEN r.donor_id IS NOT NULL THEN d.tenant_id IS NULL
           ELSE (
             SELECT pg_catalog.count(DISTINCT m.tenant_id)
               FROM public.missionaries AS m
              WHERE m.profile_id = r.missionary_id
           ) <> 1
         END;

  SELECT pg_catalog.count(*) INTO v_tasks
    FROM public.missionary_tasks AS t
    LEFT JOIN public.donors AS d ON d.id = t.donor_id
   WHERE t.donor_id IS NOT NULL
     AND d.tenant_id IS NULL;

  IF v_activities > 0 OR v_requests > 0 OR v_tasks > 0 THEN
    RAISE EXCEPTION 'preflight failed: % donor activities, % follower requests and % tasks name no tenant by evidence; nothing was changed',
      v_activities, v_requests, v_tasks
      USING ERRCODE = '23502';
  END IF;
END
$$;

CREATE TABLE private.missionary_tasks_unresolved_tenant (
  LIKE public.missionary_tasks,
  set_aside_reason TEXT NOT NULL,
  set_aside_at TIMESTAMPTZ NOT NULL DEFAULT pg_catalog.now(),
  CONSTRAINT missionary_tasks_unresolved_tenant_pkey PRIMARY KEY (id)
);
COMMENT ON TABLE private.missionary_tasks_unresolved_tenant IS
  'Donorless tasks whose organization no evidence names (AL-2678, record line 593). Kept, not deleted; no signed-in or anonymous access.';
ALTER TABLE private.missionary_tasks_unresolved_tenant ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.missionary_tasks_unresolved_tenant FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE private.missionary_tasks_unresolved_tenant FROM PUBLIC, anon, authenticated, service_role, tenant_guard;

ALTER TABLE public.donor_activities ADD COLUMN tenant_id UUID;
ALTER TABLE public.follower_requests ADD COLUMN tenant_id UUID;
ALTER TABLE public.missionary_tasks ADD COLUMN tenant_id UUID;

UPDATE public.donor_activities AS a
   SET tenant_id = d.tenant_id
  FROM public.donors AS d
 WHERE d.id = a.donor_id;

UPDATE public.follower_requests AS r
   SET tenant_id = d.tenant_id
  FROM public.donors AS d
 WHERE d.id = r.donor_id;

UPDATE public.follower_requests AS r
   SET tenant_id = (
     SELECT pg_catalog.min(m.tenant_id::TEXT)::UUID
       FROM public.missionaries AS m
      WHERE m.profile_id = r.missionary_id
   )
 WHERE r.donor_id IS NULL;

UPDATE public.missionary_tasks AS t
   SET tenant_id = d.tenant_id
  FROM public.donors AS d
 WHERE d.id = t.donor_id;

WITH evidence AS (
  SELECT t.id,
         (
           SELECT pg_catalog.array_agg(DISTINCT e.tenant_id)
             FROM (
               SELECT m.tenant_id
                 FROM authz.memberships AS m
                 JOIN public.profiles AS p ON COALESCE(p.user_id, p.id) = m.user_id
                WHERE p.id = t.missionary_id
               UNION
               SELECT mi.tenant_id
                 FROM public.missionaries AS mi
                WHERE mi.profile_id = t.missionary_id
             ) AS e
         ) AS tenants
    FROM public.missionary_tasks AS t
   WHERE t.donor_id IS NULL
)
UPDATE public.missionary_tasks AS t
   SET tenant_id = evidence.tenants[1]
  FROM evidence
 WHERE evidence.id = t.id
   AND pg_catalog.cardinality(evidence.tenants) = 1;

WITH moved AS (
  DELETE FROM public.missionary_tasks AS t
   WHERE t.tenant_id IS NULL
  RETURNING t.*
)
INSERT INTO private.missionary_tasks_unresolved_tenant (
  id, missionary_id, donor_id, title, description, task_type, status, priority,
  sort_key, due_date, completed_at, created_at, updated_at, set_aside_reason
)
SELECT id, missionary_id, donor_id, title, description, task_type, status, priority,
       sort_key, due_date, completed_at, created_at, updated_at,
       'no single organization by membership or missionary evidence'
  FROM moved;

DO $$
DECLARE
  v_set_aside BIGINT;
BEGIN
  SELECT pg_catalog.count(*) INTO v_set_aside FROM private.missionary_tasks_unresolved_tenant;
  RAISE NOTICE 'AL-2678: % donorless tasks set aside in private.missionary_tasks_unresolved_tenant', v_set_aside;
END
$$;

-- Tenant keys and the sort_key rewrite, in one transaction with the
-- backfill; the keys into donors come last (see "Locks" above).
ALTER TABLE public.donor_activities
  ALTER COLUMN tenant_id SET NOT NULL,
  ADD CONSTRAINT donor_activities_tenant_id_fkey
    FOREIGN KEY (tenant_id) REFERENCES public.tenants (id) ON DELETE RESTRICT;

ALTER TABLE public.follower_requests
  ALTER COLUMN tenant_id SET NOT NULL,
  ADD CONSTRAINT follower_requests_tenant_id_fkey
    FOREIGN KEY (tenant_id) REFERENCES public.tenants (id) ON DELETE RESTRICT;

ALTER TABLE public.missionary_tasks
  ALTER COLUMN tenant_id SET NOT NULL,
  ADD CONSTRAINT missionary_tasks_tenant_id_fkey
    FOREIGN KEY (tenant_id) REFERENCES public.tenants (id) ON DELETE RESTRICT,
  ALTER COLUMN sort_key TYPE DOUBLE PRECISION USING sort_key::DOUBLE PRECISION;

CREATE INDEX donor_activities_tenant_donor_date_idx
  ON public.donor_activities (tenant_id, donor_id, date DESC);
CREATE INDEX follower_requests_tenant_missionary_idx
  ON public.follower_requests (tenant_id, missionary_id);
CREATE INDEX missionary_tasks_tenant_missionary_idx
  ON public.missionary_tasks (tenant_id, missionary_id);

ALTER TABLE public.donor_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donor_activities FORCE ROW LEVEL SECURITY;
ALTER TABLE public.follower_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follower_requests FORCE ROW LEVEL SECURITY;
ALTER TABLE public.missionary_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missionary_tasks FORCE ROW LEVEL SECURITY;

ALTER POLICY "donor activities owner or staff select" ON public.donor_activities
  USING (
    (SELECT authz.is_super_admin())
    OR (
      tenant_id = (SELECT authz.current_tenant_id())
      AND (
        (SELECT authz.assignment_is('staff'))
        OR ((SELECT authz.assignment_is('donor')) AND donor_id IN (SELECT d.id FROM public.donors AS d WHERE d.tenant_id = (SELECT authz.current_tenant_id()) AND d.profile_id IN (SELECT authz.caller_profile_ids())))
      )
    )
  );

CREATE POLICY "follower requests no signed-in read" ON public.follower_requests
  FOR SELECT TO authenticated
  USING (false);
CREATE POLICY "missionary tasks no signed-in read" ON public.missionary_tasks
  FOR SELECT TO authenticated
  USING (false);

-- The six handler functions, signatures unchanged.
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
    task.tenant_id
  FROM public.missionary_tasks AS task
  LEFT JOIN public.donors AS donor
    ON donor.id = task.donor_id
   AND donor.tenant_id = task.tenant_id
  WHERE task.missionary_id = p_profile_id
    AND task.tenant_id = p_tenant_id
    AND authz.selected_missionary(p_profile_id, p_tenant_id, p_assignment_id);
$$;

COMMENT ON FUNCTION public.missionary_owned_tasks IS
  'A live selected missionary reads their tasks in the selected tenant, donorless ones included. '
  'A reassigned donor stays on the task, but its donor link is hidden from the former missionary (AL-2678).';

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
      task.tenant_id;

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

CREATE OR REPLACE FUNCTION public.missionary_follower_requests(
  p_profile_id uuid,
  p_tenant_id uuid,
  p_assignment_id uuid
)
RETURNS SETOF public.follower_requests
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT request.*
  FROM public.follower_requests AS request
  JOIN public.donors AS donor
    ON donor.id = request.donor_id
   AND donor.tenant_id = p_tenant_id
  WHERE request.missionary_id = p_profile_id
    AND request.tenant_id = p_tenant_id
    AND authz.selected_missionary(p_profile_id, p_tenant_id, p_assignment_id);
$$;

CREATE OR REPLACE FUNCTION public.missionary_follower_request_write(
  p_profile_id uuid,
  p_tenant_id uuid,
  p_assignment_id uuid,
  p_operation text,
  p_id uuid,
  p_status text,
  p_access_level text
)
RETURNS SETOF public.follower_requests
LANGUAGE plpgsql
VOLATILE
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  IF p_operation = 'update' AND p_status IN ('approved', 'rejected') THEN
    RETURN QUERY
    UPDATE public.follower_requests AS request
    SET status = p_status,
        resolved_at = now(),
        updated_at = now(),
        access_level = CASE
          WHEN p_access_level IN ('view', 'comment') THEN p_access_level
          ELSE request.access_level
        END
    WHERE request.id = p_id
      AND request.missionary_id = p_profile_id
      AND request.tenant_id = p_tenant_id
      AND authz.selected_missionary(p_profile_id, p_tenant_id, p_assignment_id)
      AND EXISTS (
        SELECT 1
        FROM public.donors AS donor
        WHERE donor.id = request.donor_id
          AND donor.tenant_id = p_tenant_id
      )
    RETURNING request.*;

  ELSIF p_operation = 'delete' THEN
    RETURN QUERY
    DELETE FROM public.follower_requests AS request
    WHERE request.id = p_id
      AND request.missionary_id = p_profile_id
      AND request.tenant_id = p_tenant_id
      AND authz.selected_missionary(p_profile_id, p_tenant_id, p_assignment_id)
      AND EXISTS (
        SELECT 1
        FROM public.donors AS donor
        WHERE donor.id = request.donor_id
          AND donor.tenant_id = p_tenant_id
      )
    RETURNING request.*;

  ELSE
    RAISE EXCEPTION 'invalid follower request operation' USING ERRCODE = '22023';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.missionary_activities(
  p_profile_id uuid,
  p_tenant_id uuid,
  p_assignment_id uuid,
  p_donor_ids uuid[]
)
RETURNS SETOF public.donor_activities
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT activity.*
  FROM public.donor_activities AS activity
  JOIN public.donors AS donor
    ON donor.id = activity.donor_id
   AND donor.tenant_id = activity.tenant_id
  WHERE activity.tenant_id = p_tenant_id
    AND activity.donor_id = ANY(p_donor_ids)
    AND donor.missionary_id = p_profile_id
    AND authz.selected_missionary(p_profile_id, p_tenant_id, p_assignment_id);
$$;

CREATE OR REPLACE FUNCTION public.missionary_activity_create(
  p_profile_id uuid,
  p_tenant_id uuid,
  p_assignment_id uuid,
  p_donor_id uuid,
  p_type text,
  p_title text,
  p_note text,
  p_date timestamptz
)
RETURNS SETOF public.donor_activities
LANGUAGE sql
VOLATILE
SECURITY INVOKER
SET search_path = ''
AS $$
  INSERT INTO public.donor_activities AS activity (tenant_id, donor_id, type, title, description, date)
  SELECT p_tenant_id, donor.id, p_type, p_title, p_note, p_date
  FROM public.donors AS donor
  WHERE donor.id = p_donor_id
    AND donor.tenant_id = p_tenant_id
    AND donor.missionary_id = p_profile_id
    AND authz.selected_missionary(p_profile_id, p_tenant_id, p_assignment_id)
  RETURNING activity.*;
$$;

DROP FUNCTION authz.missionary_task_single_tenant(uuid, uuid);

REVOKE ALL ON FUNCTION
  public.missionary_owned_tasks(uuid, uuid, uuid),
  public.missionary_task_write(uuid, uuid, uuid, text, uuid, jsonb),
  public.missionary_follower_requests(uuid, uuid, uuid),
  public.missionary_follower_request_write(uuid, uuid, uuid, text, uuid, text, text),
  public.missionary_activities(uuid, uuid, uuid, uuid[]),
  public.missionary_activity_create(uuid, uuid, uuid, uuid, text, text, text, timestamptz)
FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION
  public.missionary_owned_tasks(uuid, uuid, uuid),
  public.missionary_task_write(uuid, uuid, uuid, text, uuid, jsonb),
  public.missionary_follower_requests(uuid, uuid, uuid),
  public.missionary_follower_request_write(uuid, uuid, uuid, text, uuid, text, text),
  public.missionary_activities(uuid, uuid, uuid, uuid[]),
  public.missionary_activity_create(uuid, uuid, uuid, uuid, text, text, text, timestamptz)
TO service_role;

-- Last: the keys into donors. Dropping the single-column keys takes
-- ACCESS EXCLUSIVE on donors, held from here to COMMIT only.
ALTER TABLE public.donor_activities
  DROP CONSTRAINT donor_activities_donor_id_fkey,
  ADD CONSTRAINT donor_activities_donor_same_tenant_fk
    FOREIGN KEY (tenant_id, donor_id) REFERENCES public.donors (tenant_id, id);

ALTER TABLE public.missionary_tasks
  DROP CONSTRAINT missionary_tasks_donor_id_fkey,
  ADD CONSTRAINT missionary_tasks_donor_id_fkey
    FOREIGN KEY (tenant_id, donor_id) REFERENCES public.donors (tenant_id, id);

COMMIT;

SELECT pg_notify('pgrst', 'reload schema');
