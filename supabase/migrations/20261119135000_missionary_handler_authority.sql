-- Interim service-key functions for the missionary and staff handlers. WP4b replaces
-- this access with policies and commands on the caller's token. WP5 adds tenant
-- columns to tasks, follower requests and donor activities, and places the remaining
-- donorless tasks by evidence before removing the membership-history check.

BEGIN;

-- Service role only: verify the exact live missionary assignment for the acting profile and tenant.
CREATE FUNCTION authz.selected_missionary(
  p_profile_id uuid,
  p_tenant_id uuid,
  p_assignment_id uuid
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM authz.memberships AS membership
    JOIN public.profiles AS profile
      ON profile.user_id = membership.user_id
    WHERE membership.id = p_assignment_id
      AND membership.tenant_id = p_tenant_id
      AND membership.role = 'missionary'
      AND membership.is_active
      AND membership.revoked_at IS NULL
      AND profile.id = p_profile_id
  );
$$;

-- Service role only: confirm the assignment owner has no membership history outside the selected tenant.
CREATE FUNCTION authz.missionary_task_single_tenant(
  p_assignment_id uuid,
  p_tenant_id uuid
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM authz.memberships AS selected
    WHERE selected.id = p_assignment_id
      AND selected.tenant_id = p_tenant_id
      AND NOT EXISTS (
        SELECT 1
        FROM authz.memberships AS other
        WHERE other.user_id = selected.user_id
          AND other.tenant_id <> selected.tenant_id
      )
  );
$$;

-- Service role only: read this missionary's tasks whose donor or membership history places them in this tenant.
CREATE FUNCTION public.missionary_owned_tasks(
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
    task.sort_key, task.due_date, task.completed_at, task.created_at, task.updated_at
  FROM public.missionary_tasks AS task
  LEFT JOIN public.donors AS donor
    ON donor.id = task.donor_id
   AND donor.tenant_id = p_tenant_id
  WHERE task.missionary_id = p_profile_id
    AND authz.selected_missionary(p_profile_id, p_tenant_id, p_assignment_id)
    AND (
      donor.id IS NOT NULL
      OR (task.donor_id IS NULL AND authz.missionary_task_single_tenant(p_assignment_id, p_tenant_id))
    );
$$;

COMMENT ON FUNCTION public.missionary_owned_tasks IS
  'A live selected missionary may read, create, reassign, update or delete a donorless task only '
  'if every membership of every class, including revoked rows, is in the selected tenant. '
  'A reassigned donor places the task in its tenant, but its donor link is hidden from the former missionary. '
  'WP5 must place the remaining donorless rows by evidence before lifting this condition.';

-- Service role only: create, update, reassign or delete a task without crossing its organization.
CREATE FUNCTION public.missionary_task_write(
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
      missionary_id, donor_id, title, description, task_type,
      status, priority, sort_key, due_date, completed_at
    )
    SELECT
      p_profile_id, patch.donor_id, patch.title, patch.description, patch.task_type,
      COALESCE(patch.status, 'pending'), COALESCE(patch.priority, 'medium'),
      COALESCE(patch.sort_key, 0), patch.due_date, patch.completed_at
    FROM jsonb_populate_record(NULL::public.missionary_tasks, p_patch) AS patch
    LEFT JOIN public.donors AS donor
      ON donor.id = patch.donor_id
     AND donor.tenant_id = p_tenant_id
     AND donor.missionary_id = p_profile_id
    WHERE authz.selected_missionary(p_profile_id, p_tenant_id, p_assignment_id)
      AND (
        donor.id IS NOT NULL
        OR (patch.donor_id IS NULL AND authz.missionary_task_single_tenant(p_assignment_id, p_tenant_id))
      )
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
      AND authz.selected_missionary(p_profile_id, p_tenant_id, p_assignment_id)
      AND (
        (task.donor_id IS NULL AND authz.missionary_task_single_tenant(p_assignment_id, p_tenant_id))
        OR EXISTS (
          SELECT 1
          FROM public.donors AS donor
          WHERE donor.id = task.donor_id
            AND donor.tenant_id = p_tenant_id
        )
      )
      AND (
        NOT (p_patch ? 'donor_id')
        OR (
          (p_patch->>'donor_id') IS NULL
          AND (
            EXISTS (SELECT 1 FROM hidden_donors WHERE id = task.donor_id)
            OR authz.missionary_task_single_tenant(p_assignment_id, p_tenant_id)
          )
        )
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
      task.sort_key, task.due_date, task.completed_at, task.created_at, task.updated_at;

  ELSIF p_operation = 'delete' THEN
    RETURN QUERY
    DELETE FROM public.missionary_tasks AS task
    WHERE task.id = p_id
      AND task.missionary_id = p_profile_id
      AND authz.selected_missionary(p_profile_id, p_tenant_id, p_assignment_id)
      AND (
        (task.donor_id IS NULL AND authz.missionary_task_single_tenant(p_assignment_id, p_tenant_id))
        OR EXISTS (
          SELECT 1
          FROM public.donors AS donor
          WHERE donor.id = task.donor_id
            AND donor.tenant_id = p_tenant_id
        )
      )
    RETURNING task.*;

  ELSE
    RAISE EXCEPTION 'invalid task operation' USING ERRCODE = '22023';
  END IF;
END;
$$;

-- Service role only: list follower requests addressed to this missionary from donors in this tenant.
CREATE FUNCTION public.missionary_follower_requests(
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
    AND authz.selected_missionary(p_profile_id, p_tenant_id, p_assignment_id);
$$;

-- Service role only: resolve or remove a follower request addressed to this missionary in this tenant.
CREATE FUNCTION public.missionary_follower_request_write(
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

-- Service role only: read the missionary's own record in the selected organization.
CREATE FUNCTION public.missionary_own_record(
  p_profile_id uuid,
  p_tenant_id uuid,
  p_assignment_id uuid
)
RETURNS SETOF public.missionaries
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT missionary.*
  FROM public.missionaries AS missionary
  WHERE missionary.profile_id = p_profile_id
    AND missionary.tenant_id = p_tenant_id
    AND authz.selected_missionary(p_profile_id, p_tenant_id, p_assignment_id);
$$;

-- Service role only: update the editable fields of the missionary's own record in this organization.
CREATE FUNCTION public.missionary_own_record_write(
  p_profile_id uuid,
  p_tenant_id uuid,
  p_assignment_id uuid,
  p_patch jsonb
)
RETURNS SETOF public.missionaries
LANGUAGE sql
VOLATILE
SECURITY INVOKER
SET search_path = ''
AS $$
  UPDATE public.missionaries AS missionary
  SET (phone, bio, tagline, mission_field, location, cover_url, social_links) = (
    SELECT patch.phone, patch.bio, patch.tagline, patch.mission_field,
           patch.location, patch.cover_url, patch.social_links
    FROM jsonb_populate_record(missionary, p_patch) AS patch
  ),
  updated_at = now()
  WHERE missionary.profile_id = p_profile_id
    AND missionary.tenant_id = p_tenant_id
    AND authz.selected_missionary(p_profile_id, p_tenant_id, p_assignment_id)
  RETURNING missionary.*;
$$;

-- Service role only: list missionaries in the selected organization for a live missionary member.
CREATE FUNCTION public.missionary_directory(
  p_profile_id uuid,
  p_tenant_id uuid,
  p_assignment_id uuid
)
RETURNS SETOF public.missionaries
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT missionary.*
  FROM public.missionaries AS missionary
  WHERE missionary.tenant_id = p_tenant_id
    AND authz.selected_missionary(p_profile_id, p_tenant_id, p_assignment_id);
$$;

-- Service role only: read activities for this missionary's donors in the selected organization.
CREATE FUNCTION public.missionary_activities(
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
  WHERE donor.tenant_id = p_tenant_id
    AND activity.donor_id = ANY(p_donor_ids)
    AND donor.missionary_id = p_profile_id
    AND authz.selected_missionary(p_profile_id, p_tenant_id, p_assignment_id);
$$;

-- Service role only: record an activity for one of this missionary's donors in the selected organization.
CREATE FUNCTION public.missionary_activity_create(
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
  INSERT INTO public.donor_activities AS activity (donor_id, type, title, description, date)
  SELECT donor.id, p_type, p_title, p_note, p_date
  FROM public.donors AS donor
  WHERE donor.id = p_donor_id
    AND donor.tenant_id = p_tenant_id
    AND donor.missionary_id = p_profile_id
    AND authz.selected_missionary(p_profile_id, p_tenant_id, p_assignment_id)
  RETURNING activity.*;
$$;

REVOKE ALL ON FUNCTION
  authz.selected_missionary(uuid, uuid, uuid),
  authz.missionary_task_single_tenant(uuid, uuid),
  public.missionary_owned_tasks(uuid, uuid, uuid),
  public.missionary_task_write(uuid, uuid, uuid, text, uuid, jsonb),
  public.missionary_follower_requests(uuid, uuid, uuid),
  public.missionary_follower_request_write(uuid, uuid, uuid, text, uuid, text, text),
  public.missionary_own_record(uuid, uuid, uuid),
  public.missionary_own_record_write(uuid, uuid, uuid, jsonb),
  public.missionary_directory(uuid, uuid, uuid),
  public.missionary_activities(uuid, uuid, uuid, uuid[]),
  public.missionary_activity_create(uuid, uuid, uuid, uuid, text, text, text, timestamptz)
FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION
  authz.selected_missionary(uuid, uuid, uuid),
  authz.missionary_task_single_tenant(uuid, uuid),
  public.missionary_owned_tasks(uuid, uuid, uuid),
  public.missionary_task_write(uuid, uuid, uuid, text, uuid, jsonb),
  public.missionary_follower_requests(uuid, uuid, uuid),
  public.missionary_follower_request_write(uuid, uuid, uuid, text, uuid, text, text),
  public.missionary_own_record(uuid, uuid, uuid),
  public.missionary_own_record_write(uuid, uuid, uuid, jsonb),
  public.missionary_directory(uuid, uuid, uuid),
  public.missionary_activities(uuid, uuid, uuid, uuid[]),
  public.missionary_activity_create(uuid, uuid, uuid, uuid, text, text, text, timestamptz)
TO service_role;

NOTIFY pgrst, 'reload schema';
COMMIT;
