-- AL-2675 (WP2a, the membership core; plan 5.1, WP2a and WP2 "Interim rules";
-- audit NR-49, NR-55, A09): the SQL readers of the profile's tenant and role
-- that the core owns move to membership, the member directory, and the
-- sign-up rule for this release.
--
-- 1. `authz.caller_assignment(tenant, class)`: the caller's selected live row
--    of one class in a tenant, as plan 5.1 states it for a request: the row
--    the assignment header (`x-asym-assignment`) names, which must be the
--    caller's, live, in that tenant and of that class; or, with no header, the
--    caller's one live row of that class there. Several rows of the class and
--    no header give NULL, as the resolver refuses today. Invoker rights,
--    executable by postgres only; the definer functions below call it.
-- 2. `private.profile_in_tenant(profile, tenant)`: true when the profile does
--    not exist (the foreign key decides) or its login holds a live membership
--    in the tenant.
-- 3. The two trigger functions that refused a contribution correction,
--    request, setting, preference, notification or audit row when the actor's
--    `profiles.tenant_id` differed from the row's tenant (NR-49) test
--    membership instead, so a person who works in a second organization can
--    write there. A reference an update leaves unchanged is not judged again.
--    Every other check in their bodies is unchanged.
-- 4. `private.crm_table_preference_actor` (NR-55), the helper behind saved CRM
--    views and table preferences, no longer reads `profiles.tenant_id`,
--    `profiles.role` or `super_admin`. It requires the caller's selected live
--    staff row in the tenant it is given (1), and answers whether that row
--    holds `crm.gift_history.manage_view_defaults`, which decides tenant
--    defaults outright. Its second result column is renamed from
--    `actor_is_super_admin` to `actor_can_manage_defaults`, and the
--    tenant-default wrapper reads the new name. A delegated manager is still
--    decided by the original body.
-- 5. `public.tenant_member_directory(tenant)`: display name and role of every
--    live member of the tenant, for a caller whose selected live staff row is
--    in that tenant (1). Staff screens and tenant administrators use it.
--    Definer, postgres-owned, executable by signed-in users only.
-- 6. Sign-up (`public.handle_new_user`): it keeps assigning the demo tenant,
--    or the tenant in the login's app metadata as before, as a donor
--    membership and no longer as the profile's tenant, until WP5 replaces it.
--    The trigger sees no request, so it cannot use the host.
--
-- Down (run by hand, in one transaction): restore handle_new_user from
-- 20260227060000_auth_role_hardening.sql; DROP FUNCTION
-- public.tenant_member_directory(UUID); restore
-- private.crm_table_preference_actor and public.save_crm_tenant_table_default
-- from 20261025125700_crm_table_preference_session_identity.sql (DROP the
-- actor first); restore the two trigger functions from
-- 20260611150000_contribution_approval_notifications.sql and
-- 20260611151000_contribution_correction_notifications.sql; DROP FUNCTION
-- private.profile_in_tenant(UUID, UUID); DROP FUNCTION
-- authz.caller_assignment(UUID, authz.membership_role).

BEGIN;

-- 1. The caller's selected live row of one class in a tenant.
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
  v_named UUID := tenant_guard.request_assignment_id();
  v_rows UUID[];
BEGIN
  IF v_user IS NULL OR p_tenant_id IS NULL OR p_role IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT pg_catalog.array_agg(m.id)
    INTO v_rows
    FROM authz.memberships AS m
   WHERE m.user_id = v_user
     AND m.tenant_id = p_tenant_id
     AND m.role = p_role
     AND m.is_active
     AND m.revoked_at IS NULL
     AND (v_named IS NULL OR m.id = v_named);

  IF pg_catalog.cardinality(v_rows) = 1 THEN
    RETURN v_rows[1];
  END IF;
  RETURN NULL;
END;
$$;

COMMENT ON FUNCTION authz.caller_assignment(UUID, authz.membership_role) IS
  'The caller''s selected live membership row of one class in a tenant: the row '
  'x-asym-assignment names, or the one live row of that class (AL-2675).';

ALTER FUNCTION authz.caller_assignment(UUID, authz.membership_role) OWNER TO postgres;
REVOKE ALL ON FUNCTION authz.caller_assignment(UUID, authz.membership_role) FROM PUBLIC, anon, authenticated, service_role;

-- 2. Whether a profile reference belongs to a tenant.
CREATE OR REPLACE FUNCTION private.profile_in_tenant(
  p_profile_id UUID,
  p_tenant_id UUID
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT NOT EXISTS (
           SELECT 1 FROM public.profiles AS p WHERE p.id = p_profile_id
         )
      OR EXISTS (
           SELECT 1
             FROM public.profiles AS p
             JOIN authz.memberships AS m ON m.user_id = p.user_id
            WHERE p.id = p_profile_id
              AND m.tenant_id = p_tenant_id
              AND m.is_active
         );
$$;

ALTER FUNCTION private.profile_in_tenant(UUID, UUID) OWNER TO postgres;
REVOKE ALL ON FUNCTION private.profile_in_tenant(UUID, UUID) FROM PUBLIC, anon, authenticated, service_role;

-- 3. The contribution trigger functions (NR-49). Bodies as in
-- 20260611150000 and 20260611151000 except the profile-reference checks.
CREATE OR REPLACE FUNCTION public.enforce_contribution_operation_tenant_refs()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    row_data JSONB;
    row_tenant_id UUID;
    row_donation_id UUID;
    row_staged_gift_id UUID;
    ref_id UUID;
    ref_tenant_id UUID;
    ref_donation_id UUID;
    ref_staged_gift_id UUID;
    old_data JSONB;
    profile_ref TEXT[];
BEGIN
    row_data := to_jsonb(NEW);
    row_tenant_id := (row_data ->> 'tenant_id')::uuid;

    -- AL-2675 (NR-49): a profile reference belongs to the row's tenant when the
    -- profile's login holds a live membership there (private.profile_in_tenant).
    -- A reference an update leaves unchanged, in an unchanged tenant, is not
    -- judged again, so a later revocation does not freeze the row.
    old_data := CASE WHEN TG_OP = 'UPDATE' THEN to_jsonb(OLD) END;
    FOREACH profile_ref SLICE 1 IN ARRAY ARRAY[
            ['profile_id', 'contribution operation profile tenant mismatch'],
            ['recipient_profile_id', 'contribution operation recipient profile tenant mismatch'],
            ['updated_by', 'contribution operation updater profile tenant mismatch'],
            ['requested_by_profile_id', 'contribution operation requester profile tenant mismatch'],
            ['decided_by_profile_id', 'contribution operation decider profile tenant mismatch']
    ] LOOP
        IF
            (row_data ->> profile_ref[1]) IS NOT NULL
            AND NOT (
                old_data IS NOT NULL
                AND (old_data ->> 'tenant_id') IS NOT DISTINCT FROM (row_data ->> 'tenant_id')
                AND (old_data ->> profile_ref[1]) IS NOT DISTINCT FROM (row_data ->> profile_ref[1])
            )
            AND NOT private.profile_in_tenant((row_data ->> profile_ref[1])::uuid, row_tenant_id)
        THEN
            RAISE EXCEPTION '%', profile_ref[2]
                USING ERRCODE = '23514';
        END IF;
    END LOOP;

    IF row_data ? 'donation_id' AND (row_data ->> 'donation_id') IS NOT NULL THEN
        row_donation_id := (row_data ->> 'donation_id')::uuid;
        SELECT d.tenant_id
        INTO ref_tenant_id
        FROM public.donations AS d
        WHERE d.id = row_donation_id;

        IF FOUND AND ref_tenant_id IS DISTINCT FROM row_tenant_id THEN
            RAISE EXCEPTION 'contribution operation donation tenant mismatch'
                USING ERRCODE = '23514';
        END IF;
    END IF;

    IF
        row_data ? 'staged_gift_id'
        AND (row_data ->> 'staged_gift_id') IS NOT NULL
    THEN
        row_staged_gift_id := (row_data ->> 'staged_gift_id')::uuid;
        ref_id := row_staged_gift_id;
        SELECT sg.tenant_id, sg.donation_id
        INTO ref_tenant_id, ref_donation_id
        FROM public.staged_gifts AS sg
        WHERE sg.id = ref_id;

        IF FOUND AND ref_tenant_id IS DISTINCT FROM row_tenant_id THEN
            RAISE EXCEPTION 'contribution operation staged gift tenant mismatch'
                USING ERRCODE = '23514';
        END IF;

        IF
            FOUND
            AND row_donation_id IS NOT NULL
            AND ref_donation_id IS DISTINCT FROM row_donation_id
        THEN
            RAISE EXCEPTION 'contribution operation staged gift donation mismatch'
                USING ERRCODE = '23514';
        END IF;
    END IF;

    IF row_data ? 'correction_id' AND (row_data ->> 'correction_id') IS NOT NULL THEN
        ref_id := (row_data ->> 'correction_id')::uuid;
        SELECT cc.tenant_id, cc.donation_id, cc.staged_gift_id
        INTO ref_tenant_id, ref_donation_id, ref_staged_gift_id
        FROM public.contribution_corrections AS cc
        WHERE cc.id = ref_id;

        IF FOUND AND ref_tenant_id IS DISTINCT FROM row_tenant_id THEN
            RAISE EXCEPTION 'contribution operation correction tenant mismatch'
                USING ERRCODE = '23514';
        END IF;

        IF
            FOUND
            AND row_donation_id IS NOT NULL
            AND ref_donation_id IS NOT NULL
            AND ref_donation_id IS DISTINCT FROM row_donation_id
        THEN
            RAISE EXCEPTION 'contribution operation correction donation mismatch'
                USING ERRCODE = '23514';
        END IF;

        IF
            FOUND
            AND row_staged_gift_id IS NOT NULL
            AND ref_staged_gift_id IS NOT NULL
            AND ref_staged_gift_id IS DISTINCT FROM row_staged_gift_id
        THEN
            RAISE EXCEPTION 'contribution operation correction staged gift mismatch'
                USING ERRCODE = '23514';
        END IF;
    END IF;

    IF
        row_data ? 'applied_adjustment_id'
        AND (row_data ->> 'applied_adjustment_id') IS NOT NULL
    THEN
        ref_id := (row_data ->> 'applied_adjustment_id')::uuid;
        SELECT ca.tenant_id, ca.donation_id
        INTO ref_tenant_id, ref_donation_id
        FROM public.contribution_adjustments AS ca
        WHERE ca.id = ref_id;

        IF FOUND AND ref_tenant_id IS DISTINCT FROM row_tenant_id THEN
            RAISE EXCEPTION 'contribution operation applied adjustment tenant mismatch'
                USING ERRCODE = '23514';
        END IF;

        IF
            FOUND
            AND row_donation_id IS NOT NULL
            AND ref_donation_id IS NOT NULL
            AND ref_donation_id IS DISTINCT FROM row_donation_id
        THEN
            RAISE EXCEPTION 'contribution operation applied adjustment donation mismatch'
                USING ERRCODE = '23514';
        END IF;
    END IF;

    IF
        row_data ? 'correction_request_id'
        AND (row_data ->> 'correction_request_id') IS NOT NULL
    THEN
        ref_id := (row_data ->> 'correction_request_id')::uuid;
        SELECT cr.tenant_id
        INTO ref_tenant_id
        FROM public.contribution_correction_requests AS cr
        WHERE cr.id = ref_id;

        IF FOUND AND ref_tenant_id IS DISTINCT FROM row_tenant_id THEN
            RAISE EXCEPTION 'contribution operation correction request tenant mismatch'
                USING ERRCODE = '23514';
        END IF;
    END IF;

    IF
        row_data ? 'approval_task_id'
        AND (row_data ->> 'approval_task_id') IS NOT NULL
    THEN
        ref_id := (row_data ->> 'approval_task_id')::uuid;
        SELECT mct.tenant_id
        INTO ref_tenant_id
        FROM public.mission_control_tasks AS mct
        WHERE mct.id = ref_id;

        IF FOUND AND ref_tenant_id IS DISTINCT FROM row_tenant_id THEN
            RAISE EXCEPTION 'contribution operation approval task tenant mismatch'
                USING ERRCODE = '23514';
        END IF;
    END IF;

    IF
        row_data ? 'follow_up_task_id'
        AND (row_data ->> 'follow_up_task_id') IS NOT NULL
    THEN
        ref_id := (row_data ->> 'follow_up_task_id')::uuid;
        SELECT mct.tenant_id
        INTO ref_tenant_id
        FROM public.mission_control_tasks AS mct
        WHERE mct.id = ref_id;

        IF FOUND AND ref_tenant_id IS DISTINCT FROM row_tenant_id THEN
            RAISE EXCEPTION 'contribution operation follow-up task tenant mismatch'
                USING ERRCODE = '23514';
        END IF;
    END IF;

    IF
        row_data ? 'audit_event_id'
        AND (row_data ->> 'audit_event_id') IS NOT NULL
    THEN
        ref_id := (row_data ->> 'audit_event_id')::uuid;
        SELECT ae.tenant_id, ae.donation_id, ae.staged_gift_id
        INTO ref_tenant_id, ref_donation_id, ref_staged_gift_id
        FROM public.contribution_operation_audit_events AS ae
        WHERE ae.id = ref_id;

        IF FOUND AND ref_tenant_id IS DISTINCT FROM row_tenant_id THEN
            RAISE EXCEPTION 'contribution operation audit event tenant mismatch'
                USING ERRCODE = '23514';
        END IF;

        IF
            FOUND
            AND row_donation_id IS NOT NULL
            AND ref_donation_id IS NOT NULL
            AND ref_donation_id IS DISTINCT FROM row_donation_id
        THEN
            RAISE EXCEPTION 'contribution operation audit event donation mismatch'
                USING ERRCODE = '23514';
        END IF;

        IF
            FOUND
            AND row_staged_gift_id IS NOT NULL
            AND ref_staged_gift_id IS NOT NULL
            AND ref_staged_gift_id IS DISTINCT FROM row_staged_gift_id
        THEN
            RAISE EXCEPTION 'contribution operation audit event staged gift mismatch'
                USING ERRCODE = '23514';
        END IF;
    END IF;

    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.enforce_contribution_notification_tenant_refs()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    row_data JSONB;
    row_tenant_id UUID;
    ref_id UUID;
    ref_tenant_id UUID;
    old_data JSONB;
    profile_ref TEXT[];
BEGIN
    row_data := to_jsonb(NEW);
    row_tenant_id := (row_data ->> 'tenant_id')::uuid;

    IF row_tenant_id IS NULL THEN
        RAISE EXCEPTION 'contribution notification tenant is required'
            USING ERRCODE = '23502';
    END IF;

    -- AL-2675 (NR-49): a profile reference belongs to the row's tenant when the
    -- profile's login holds a live membership there (private.profile_in_tenant).
    -- A reference an update leaves unchanged, in an unchanged tenant, is not
    -- judged again, so a later revocation does not freeze the row.
    old_data := CASE WHEN TG_OP = 'UPDATE' THEN to_jsonb(OLD) END;
    FOREACH profile_ref SLICE 1 IN ARRAY ARRAY[
            ['updated_by', 'contribution notification updater profile tenant mismatch']
    ] LOOP
        IF
            (row_data ->> profile_ref[1]) IS NOT NULL
            AND NOT (
                old_data IS NOT NULL
                AND (old_data ->> 'tenant_id') IS NOT DISTINCT FROM (row_data ->> 'tenant_id')
                AND (old_data ->> profile_ref[1]) IS NOT DISTINCT FROM (row_data ->> profile_ref[1])
            )
            AND NOT private.profile_in_tenant((row_data ->> profile_ref[1])::uuid, row_tenant_id)
        THEN
            RAISE EXCEPTION '%', profile_ref[2]
                USING ERRCODE = '23514';
        END IF;
    END LOOP;

    IF
        row_data ? 'template_id'
        AND (row_data ->> 'template_id') IS NOT NULL
    THEN
        ref_id := (row_data ->> 'template_id')::uuid;
        SELECT et.tenant_id
        INTO ref_tenant_id
        FROM public.email_templates AS et
        WHERE et.id = ref_id;

        IF FOUND AND ref_tenant_id IS DISTINCT FROM row_tenant_id THEN
            RAISE EXCEPTION 'contribution notification template tenant mismatch'
                USING ERRCODE = '23514';
        END IF;
    END IF;

    IF
        row_data ? 'operation_audit_event_id'
        AND (row_data ->> 'operation_audit_event_id') IS NOT NULL
    THEN
        ref_id := (row_data ->> 'operation_audit_event_id')::uuid;
        SELECT ae.tenant_id
        INTO ref_tenant_id
        FROM public.contribution_operation_audit_events AS ae
        WHERE ae.id = ref_id;

        IF FOUND AND ref_tenant_id IS DISTINCT FROM row_tenant_id THEN
            RAISE EXCEPTION 'contribution notification audit event tenant mismatch'
                USING ERRCODE = '23514';
        END IF;
    END IF;

    IF
        row_data ? 'correction_id'
        AND (row_data ->> 'correction_id') IS NOT NULL
    THEN
        ref_id := (row_data ->> 'correction_id')::uuid;
        SELECT cc.tenant_id
        INTO ref_tenant_id
        FROM public.contribution_corrections AS cc
        WHERE cc.id = ref_id;

        IF FOUND AND ref_tenant_id IS DISTINCT FROM row_tenant_id THEN
            RAISE EXCEPTION 'contribution notification correction tenant mismatch'
                USING ERRCODE = '23514';
        END IF;
    END IF;

    IF
        row_data ? 'template_version_id'
        AND (row_data ->> 'template_version_id') IS NOT NULL
    THEN
        ref_id := (row_data ->> 'template_version_id')::uuid;
        SELECT etv.tenant_id
        INTO ref_tenant_id
        FROM public.email_template_versions AS etv
        WHERE etv.id = ref_id;

        IF FOUND AND ref_tenant_id IS DISTINCT FROM row_tenant_id THEN
            RAISE EXCEPTION 'contribution notification template version tenant mismatch'
                USING ERRCODE = '23514';
        END IF;
    END IF;

    IF
        row_data ? 'recipient_donor_id'
        AND (row_data ->> 'recipient_donor_id') IS NOT NULL
    THEN
        ref_id := (row_data ->> 'recipient_donor_id')::uuid;
        SELECT d.tenant_id
        INTO ref_tenant_id
        FROM public.donors AS d
        WHERE d.id = ref_id;

        IF FOUND AND ref_tenant_id IS DISTINCT FROM row_tenant_id THEN
            RAISE EXCEPTION 'contribution notification donor tenant mismatch'
                USING ERRCODE = '23514';
        END IF;
    END IF;

    RETURN NEW;
END;
$function$;


-- 4. The helper behind saved CRM views and table preferences (NR-55).
DROP FUNCTION IF EXISTS private.crm_table_preference_actor(UUID, TEXT);
CREATE FUNCTION private.crm_table_preference_actor(
    p_tenant_id UUID,
    p_table_id TEXT,
    OUT actor_profile_id UUID,
    OUT actor_can_manage_defaults BOOLEAN
)
LANGUAGE plpgsql
STABLE
SET search_path = ''
AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_assignment_id UUID;
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Forbidden: CRM table preferences require a signed-in user.'
            USING ERRCODE = '42501';
    END IF;

    SELECT p.id
    INTO actor_profile_id
    FROM public.profiles AS p
    WHERE p.user_id = v_user_id;

    IF actor_profile_id IS NULL THEN
        RAISE EXCEPTION 'Forbidden: CRM table preferences require a profile.'
            USING ERRCODE = '42501';
    END IF;

    v_assignment_id := authz.caller_assignment(p_tenant_id, 'staff');
    IF v_assignment_id IS NULL THEN
        RAISE EXCEPTION 'Forbidden: CRM table preferences require a CRM role in this tenant.'
            USING ERRCODE = '42501';
    END IF;

    actor_can_manage_defaults :=
        'crm.gift_history.manage_view_defaults' = ANY (authz.assignment_capabilities(v_assignment_id));

    IF p_table_id IS DISTINCT FROM 'crm.giftHistory' THEN
        RAISE EXCEPTION 'Unknown CRM table id.'
            USING ERRCODE = '22023';
    END IF;
END;
$$;

ALTER FUNCTION private.crm_table_preference_actor(UUID, TEXT) OWNER TO postgres;
REVOKE ALL ON FUNCTION private.crm_table_preference_actor(UUID, TEXT) FROM PUBLIC, anon, authenticated, service_role;

-- The holder of the view-defaults capability manages tenant defaults; for
-- anyone else the body allows only a profile listed in
-- delegatedManagerProfileIds, and never lets it change that list.
CREATE OR REPLACE FUNCTION public.save_crm_tenant_table_default(
    p_tenant_id UUID,
    p_table_id TEXT,
    p_pinned_action_id TEXT,
    p_pinned_action_id_is_set BOOLEAN,
    p_schema_version INTEGER,
    p_settings_patch JSONB
)
RETURNS public.crm_table_tenant_defaults
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_actor_profile_id UUID;
    v_actor_can_manage_defaults BOOLEAN;
BEGIN
    SELECT a.actor_profile_id, a.actor_can_manage_defaults
    INTO v_actor_profile_id, v_actor_can_manage_defaults
    FROM private.crm_table_preference_actor(p_tenant_id, p_table_id) AS a;

    RETURN private.save_crm_tenant_table_default(
        p_tenant_id,
        p_table_id,
        p_pinned_action_id,
        p_pinned_action_id_is_set,
        p_schema_version,
        p_settings_patch,
        v_actor_profile_id,
        v_actor_can_manage_defaults
    );
END;
$$;

-- 5. The member directory.
CREATE OR REPLACE FUNCTION public.tenant_member_directory(p_tenant_id UUID)
RETURNS TABLE (
  membership_id UUID,
  user_id UUID,
  profile_id UUID,
  display_name TEXT,
  role TEXT,
  staff_role TEXT,
  is_tenant_admin BOOLEAN
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF authz.caller_assignment(p_tenant_id, 'staff') IS NULL THEN
    RAISE EXCEPTION 'Forbidden: the member directory requires a live staff membership in this tenant.'
      USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
    SELECT
      m.id,
      m.user_id,
      p.id,
      COALESCE(
        NULLIF(pg_catalog.btrim(p.display_name), ''),
        NULLIF(pg_catalog.btrim(p.full_name), ''),
        NULLIF(pg_catalog.btrim(pg_catalog.concat_ws(' ', p.first_name, p.last_name)), '')
      ),
      m.role::TEXT,
      m.staff_role::TEXT,
      m.is_tenant_admin
    FROM authz.memberships AS m
    LEFT JOIN public.profiles AS p ON p.user_id = m.user_id
    WHERE m.tenant_id = p_tenant_id
      AND m.is_active
      AND m.revoked_at IS NULL
    ORDER BY 4 NULLS LAST, m.id;
END;
$$;

COMMENT ON FUNCTION public.tenant_member_directory(UUID) IS
  'Display name and role of every live member of a tenant, for a caller whose '
  'selected live staff row is in that tenant (plan 5.1, AL-2675).';

ALTER FUNCTION public.tenant_member_directory(UUID) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.tenant_member_directory(UUID) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.tenant_member_directory(UUID) TO authenticated;

-- 6. Sign-up, for this release (WP2 "Interim rules").
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  INSERT INTO public.profiles (id, user_id, email, first_name, last_name, full_name, avatar_url, role, tenant_id)
  VALUES (
    new.id,
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    COALESCE(
      new.raw_user_meta_data->>'full_name',
      TRIM(CONCAT(new.raw_user_meta_data->>'first_name', ' ', new.raw_user_meta_data->>'last_name'))
    ),
    new.raw_user_meta_data->>'avatar_url',
    'donor',
    NULL
  );

  INSERT INTO authz.memberships (user_id, tenant_id, role)
  VALUES (
    new.id,
    COALESCE((new.raw_app_meta_data->>'tenant_id')::uuid, '00000000-0000-0000-0000-000000000001'::uuid),
    'donor'
  )
  ON CONFLICT DO NOTHING;

  RETURN new;
END;
$function$;

COMMIT;

SELECT pg_notify('pgrst', 'reload schema');
