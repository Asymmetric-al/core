-- AL-2675 (WP2c, part 1; plan 5.1 and 12 WP2c; record section 9; the WP2a
-- decision table, section 7): the assistant runtime's SQL checks of an actor
-- that still read `profiles.role` move to the operator list or to membership.
--
-- WP2a (20261118093000_eve_actor_checks_read_membership.sql) moved five
-- checks to membership and left four things for WP2c:
--
-- 1. The `super_admin` actor of `public.assert_eve_launch_profile` (from the
--    launch review, activation, canary close and launch-permission grant,
--    which pass `super_admin`, and from emergency off and the launch manifest
--    when the application sends it) and of `public.assert_eve_retention_actor`
--    (retention holds and replay artifacts). It was the profile's role and
--    tenant. It is now a platform operator: the profile's login is on the
--    operator list (`private.is_platform_operator`) and holds a live row in the
--    tenant, since an operator acts in a tenant only through a membership
--    there until WP10's support grant (plan 12 WP2c). The profile no longer
--    decides. The application sends that actor role only after the shared
--    operator and second-factor check has passed on the operator's own token
--    (`withOperation`'s `platformOperator`), which this function, called with
--    the service key, cannot see.
-- 2. The `super_admin` branch of `public.assert_eve_policy_actor_tenant`: a
--    profile with that role and no tenant passed for every tenant. It is
--    removed, not moved to the operator list: an operator acts in a tenant
--    only through a live row there, which the membership test already admits.
-- 3. `public.validate_eve_notification_recipient`, the trigger on
--    `eve_notification_recipient_configs`, admitted only a `super_admin`
--    profile of the tenant with an email. Its one writer, the recipient
--    PATCH, opens in this release to platform operators (its gate moves from
--    the `super_admin` role name to the operator check), so the rule moves in
--    the same release, as the decision table asks: a recipient is a live
--    administrator of the tenant (a live staff row with the flag) whose
--    profile has an email, the rule the application's recipient store already
--    applies. An operator who is not one is not a recipient.
-- 4. `public.enforce_eve_ai_settings_grant_tenant` and
--    `public.enforce_eve_policy_permission_tenant`, the triggers on the two
--    Eve grant tables, tested the grantee's (and the granter's) profile tenant.
--    They test a live row in the tenant. As WP2a's contribution triggers do
--    (NR-49), a reference an update leaves unchanged, in an unchanged tenant,
--    is not judged again, so a grant of a person revoked since can still be
--    switched off.
--
-- Each function keeps its signature, security mode, search path, owner,
-- grants and error names; only the test changes. The error names stay as the
-- application and the incident guide know them, though
-- `eve_notification_platform_owner_required` now means "not a live
-- administrator of the tenant with an email".
--
-- Down (run by hand, in one transaction): restore the three assert functions
-- from 20261118093000_eve_actor_checks_read_membership.sql, and the three
-- trigger functions from 20260718093000_eve_email_discord_notifications.sql,
-- 20260718005737_eve_model_policy_tracer.sql and
-- 20260718015747_eve_approval_budget_policy.sql, with CREATE OR REPLACE.

BEGIN;

-- 1. The launch and release-safety actor.
CREATE OR REPLACE FUNCTION public.assert_eve_launch_profile(
  p_tenant_id UUID,
  p_profile_id UUID,
  p_required_role TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF p_required_role = 'super_admin' THEN
    -- A platform operator with a live row in the tenant (WP2c).
    IF NOT EXISTS (
      SELECT 1
        FROM public.profiles AS p
        JOIN authz.memberships AS m ON m.user_id = p.user_id
       WHERE p.id = p_profile_id
         AND m.tenant_id = p_tenant_id
         AND m.is_active
         AND m.revoked_at IS NULL
         AND private.is_platform_operator(p.user_id)
    ) THEN
      RAISE EXCEPTION 'eve_launch_profile_tenant_mismatch';
    END IF;
    RETURN;
  END IF;

  IF NOT EXISTS (
    SELECT 1
      FROM public.profiles AS p
      JOIN authz.memberships AS m ON m.user_id = p.user_id
     WHERE p.id = p_profile_id
       AND m.tenant_id = p_tenant_id
       AND m.is_active
       AND m.revoked_at IS NULL
       AND (
         p_required_role IS NULL
         OR (p_required_role = 'admin'
             AND m.role = 'staff'::authz.membership_role
             AND m.is_tenant_admin)
         OR (p_required_role IN ('staff', 'donor', 'missionary')
             AND m.role::TEXT = p_required_role)
       )
  ) THEN
    RAISE EXCEPTION 'eve_launch_profile_tenant_mismatch';
  END IF;
END;
$$;

-- 2. The retention actor.
CREATE OR REPLACE FUNCTION public.assert_eve_retention_actor(
  p_tenant_id UUID,
  p_actor_profile_id UUID,
  p_actor_role TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF p_actor_role = 'super_admin' THEN
    -- A platform operator with a live row in the tenant (WP2c).
    IF NOT EXISTS (
      SELECT 1
        FROM public.profiles AS p
        JOIN authz.memberships AS m ON m.user_id = p.user_id
       WHERE p.id = p_actor_profile_id
         AND m.tenant_id = p_tenant_id
         AND m.is_active
         AND m.revoked_at IS NULL
         AND private.is_platform_operator(p.user_id)
    ) THEN
      RAISE EXCEPTION 'eve_retention_actor_tenant_mismatch';
    END IF;
    RETURN;
  END IF;

  IF p_actor_role IS DISTINCT FROM 'admin' OR NOT EXISTS (
    SELECT 1
      FROM public.profiles AS p
      JOIN authz.memberships AS m ON m.user_id = p.user_id
     WHERE p.id = p_actor_profile_id
       AND m.tenant_id = p_tenant_id
       AND m.role = 'staff'::authz.membership_role
       AND m.is_tenant_admin
       AND m.is_active
       AND m.revoked_at IS NULL
  ) THEN
    RAISE EXCEPTION 'eve_retention_actor_tenant_mismatch';
  END IF;
END;
$$;

-- 3. The Eve policy actor's tenant: a live row there, and nothing else.
CREATE OR REPLACE FUNCTION public.assert_eve_policy_actor_tenant(
  p_tenant_id UUID,
  p_actor_profile_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
      FROM public.profiles AS p
      JOIN authz.memberships AS m ON m.user_id = p.user_id
     WHERE p.id = p_actor_profile_id
       AND m.tenant_id = p_tenant_id
       AND m.is_active
       AND m.revoked_at IS NULL
  ) THEN
    RAISE EXCEPTION 'eve_policy_actor_tenant_mismatch';
  END IF;
END;
$$;

-- 4. A notification recipient: a live administrator of the tenant with an email.
CREATE OR REPLACE FUNCTION public.validate_eve_notification_recipient()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'UPDATE'
     AND NEW.tenant_id = OLD.tenant_id
     AND NEW.profile_id = OLD.profile_id THEN
    RETURN NEW;
  END IF;

  IF NOT EXISTS (
    SELECT 1
      FROM public.profiles AS p
      JOIN authz.memberships AS m ON m.user_id = p.user_id
     WHERE p.id = NEW.profile_id
       AND p.email IS NOT NULL
       AND m.tenant_id = NEW.tenant_id
       AND m.role = 'staff'::authz.membership_role
       AND m.is_tenant_admin
       AND m.is_active
       AND m.revoked_at IS NULL
  ) THEN
    RAISE EXCEPTION 'eve_notification_platform_owner_required';
  END IF;
  RETURN NEW;
END;
$$;

-- 5. The two grant tables: a live row in the tenant.
CREATE OR REPLACE FUNCTION public.enforce_eve_ai_settings_grant_tenant()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
    IF (TG_OP = 'INSERT'
        OR NEW.tenant_id IS DISTINCT FROM OLD.tenant_id
        OR NEW.profile_id IS DISTINCT FROM OLD.profile_id)
       AND NOT EXISTS (
        SELECT 1
          FROM public.profiles AS p
          JOIN authz.memberships AS m ON m.user_id = p.user_id
         WHERE p.id = NEW.profile_id
           AND m.tenant_id = NEW.tenant_id
           AND m.is_active
           AND m.revoked_at IS NULL
    ) THEN
        RAISE EXCEPTION 'eve_ai_settings_grant_profile_tenant_mismatch';
    END IF;

    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.enforce_eve_policy_permission_tenant()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
    IF ((TG_OP = 'INSERT'
         OR NEW.tenant_id IS DISTINCT FROM OLD.tenant_id
         OR NEW.profile_id IS DISTINCT FROM OLD.profile_id)
        AND NOT EXISTS (
          SELECT 1
            FROM public.profiles AS p
            JOIN authz.memberships AS m ON m.user_id = p.user_id
           WHERE p.id = NEW.profile_id
             AND m.tenant_id = NEW.tenant_id
             AND m.is_active
             AND m.revoked_at IS NULL
        ))
       OR ((TG_OP = 'INSERT'
            OR NEW.tenant_id IS DISTINCT FROM OLD.tenant_id
            OR NEW.granted_by_profile_id IS DISTINCT FROM OLD.granted_by_profile_id)
           AND NOT EXISTS (
             SELECT 1
               FROM public.profiles AS p
               JOIN authz.memberships AS m ON m.user_id = p.user_id
              WHERE p.id = NEW.granted_by_profile_id
                AND m.tenant_id = NEW.tenant_id
                AND m.is_active
                AND m.revoked_at IS NULL
           )) THEN
        RAISE EXCEPTION 'eve_policy_permission_profile_tenant_mismatch';
    END IF;
    RETURN NEW;
END;
$$;

COMMIT;

SELECT pg_notify('pgrst', 'reload schema');
