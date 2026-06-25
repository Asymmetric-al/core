-- CRM table preferences: user-pinned row actions and tenant defaults
-- (ADR-CD-021, issue #271). The server record is the source of truth with
-- schema versioning; preferences are personalization only and are always
-- re-validated against capability/state-filtered inline actions before use.

CREATE TABLE IF NOT EXISTS public.crm_table_user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    table_id TEXT NOT NULL,
    schema_version INTEGER NOT NULL DEFAULT 1,
    pinned_action_id TEXT,
    settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, profile_id, table_id)
);

CREATE TABLE IF NOT EXISTS public.crm_table_tenant_defaults (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    table_id TEXT NOT NULL,
    schema_version INTEGER NOT NULL DEFAULT 1,
    pinned_action_id TEXT,
    settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, table_id)
);

-- Tenant default changes are audited, not approval-gated (ADR-CD-021).
CREATE TABLE IF NOT EXISTS public.crm_table_preference_audit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    actor_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    table_id TEXT NOT NULL,
    scope TEXT NOT NULL DEFAULT 'tenant_default' CHECK (scope IN ('tenant_default')),
    before_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    after_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crm_table_preference_audit_tenant
    ON public.crm_table_preference_audit_events (tenant_id, table_id, created_at DESC);

ALTER TABLE public.crm_table_user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_table_tenant_defaults ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_table_preference_audit_events ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.crm_table_user_preferences FROM anon, authenticated;
REVOKE ALL ON TABLE public.crm_table_tenant_defaults FROM anon, authenticated;
REVOKE ALL ON TABLE public.crm_table_preference_audit_events FROM anon, authenticated;

GRANT ALL ON TABLE public.crm_table_user_preferences TO service_role;
GRANT ALL ON TABLE public.crm_table_tenant_defaults TO service_role;
GRANT ALL ON TABLE public.crm_table_preference_audit_events TO service_role;

CREATE OR REPLACE FUNCTION public.apply_crm_view_settings_patch(
    p_existing JSONB,
    p_patch JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
    v_next JSONB := COALESCE(p_existing, '{}'::jsonb);
    v_patch JSONB := COALESCE(p_patch, '{}'::jsonb);
BEGIN
    IF v_patch ? 'columns' THEN
        IF jsonb_typeof(v_patch -> 'columns') = 'null' THEN
            v_next := v_next - 'columns';
        ELSE
            v_next := jsonb_set(v_next, '{columns}', v_patch -> 'columns', TRUE);
        END IF;
    END IF;

    IF v_patch ? 'filtersSort' THEN
        IF jsonb_typeof(v_patch -> 'filtersSort') = 'null' THEN
            v_next := v_next - 'filtersSort';
        ELSE
            v_next := jsonb_set(
                v_next,
                '{filtersSort}',
                v_patch -> 'filtersSort',
                TRUE
            );
        END IF;
    END IF;

    IF v_patch ? 'delegatedManagerProfileIds' THEN
        IF jsonb_typeof(v_patch -> 'delegatedManagerProfileIds') = 'null' THEN
            v_next := v_next - 'delegatedManagerProfileIds';
        ELSE
            v_next := jsonb_set(
                v_next,
                '{delegatedManagerProfileIds}',
                v_patch -> 'delegatedManagerProfileIds',
                TRUE
            );
        END IF;
    END IF;

    IF v_patch ? 'activeViewId' THEN
        IF jsonb_typeof(v_patch -> 'activeViewId') = 'null' THEN
            v_next := v_next - 'activeViewId';
        ELSE
            v_next := jsonb_set(
                v_next,
                '{activeViewId}',
                v_patch -> 'activeViewId',
                TRUE
            );
        END IF;
    END IF;

    RETURN v_next;
END;
$$;

CREATE OR REPLACE FUNCTION public.save_crm_user_table_preference(
    p_tenant_id UUID,
    p_profile_id UUID,
    p_table_id TEXT,
    p_pinned_action_id TEXT,
    p_pinned_action_id_is_set BOOLEAN,
    p_schema_version INTEGER,
    p_settings_patch JSONB
)
RETURNS public.crm_table_user_preferences
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_row public.crm_table_user_preferences;
BEGIN
    INSERT INTO public.crm_table_user_preferences (
        tenant_id,
        profile_id,
        table_id,
        pinned_action_id,
        schema_version,
        settings,
        updated_at
    )
    VALUES (
        p_tenant_id,
        p_profile_id,
        p_table_id,
        CASE
            WHEN p_pinned_action_id_is_set THEN p_pinned_action_id
            ELSE NULL
        END,
        COALESCE(p_schema_version, 1),
        public.apply_crm_view_settings_patch(
            '{}'::jsonb,
            COALESCE(p_settings_patch, '{}'::jsonb)
        ),
        NOW()
    )
    ON CONFLICT (tenant_id, profile_id, table_id)
    DO UPDATE
    SET pinned_action_id = CASE
            WHEN p_pinned_action_id_is_set THEN EXCLUDED.pinned_action_id
            ELSE public.crm_table_user_preferences.pinned_action_id
        END,
        schema_version = EXCLUDED.schema_version,
        settings = public.apply_crm_view_settings_patch(
            public.crm_table_user_preferences.settings,
            COALESCE(p_settings_patch, '{}'::jsonb)
        ),
        updated_at = NOW()
    RETURNING * INTO v_row;

    RETURN v_row;
END;
$$;

CREATE OR REPLACE FUNCTION public.save_crm_tenant_table_default(
    p_tenant_id UUID,
    p_table_id TEXT,
    p_pinned_action_id TEXT,
    p_pinned_action_id_is_set BOOLEAN,
    p_schema_version INTEGER,
    p_settings_patch JSONB,
    p_actor_profile_id UUID,
    p_actor_can_manage_defaults BOOLEAN
)
RETURNS public.crm_table_tenant_defaults
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_before public.crm_table_tenant_defaults;
    v_found BOOLEAN := FALSE;
    v_pinned_action_id TEXT;
    v_settings JSONB;
    v_row public.crm_table_tenant_defaults;
    v_delegated_manager_profile_ids JSONB;
BEGIN
    PERFORM pg_advisory_xact_lock(
        hashtext('crm_table_tenant_defaults'),
        hashtext(p_tenant_id::TEXT || ':' || p_table_id)
    );

    SELECT *
    INTO v_before
    FROM public.crm_table_tenant_defaults
    WHERE tenant_id = p_tenant_id
      AND table_id = p_table_id
    FOR UPDATE;
    v_found := FOUND;
    v_delegated_manager_profile_ids := CASE
        WHEN v_found THEN COALESCE(
            v_before.settings -> 'delegatedManagerProfileIds',
            '[]'::jsonb
        )
        ELSE '[]'::jsonb
    END;

    IF NOT COALESCE(p_actor_can_manage_defaults, FALSE) THEN
        IF COALESCE(p_settings_patch, '{}'::jsonb) ? 'delegatedManagerProfileIds' THEN
            RAISE EXCEPTION 'Forbidden: only super admins can change delegated default managers.'
                USING ERRCODE = '42501';
        END IF;

        IF p_actor_profile_id IS NULL
           OR jsonb_typeof(v_delegated_manager_profile_ids) <> 'array'
           OR NOT (v_delegated_manager_profile_ids ? p_actor_profile_id::TEXT) THEN
            RAISE EXCEPTION 'Forbidden: requires crm.gift_history.manage_view_defaults'
                USING ERRCODE = '42501';
        END IF;
    END IF;

    v_pinned_action_id := CASE
        WHEN p_pinned_action_id_is_set THEN p_pinned_action_id
        WHEN v_found THEN v_before.pinned_action_id
        ELSE NULL
    END;
    v_settings := public.apply_crm_view_settings_patch(
        CASE WHEN v_found THEN v_before.settings ELSE '{}'::jsonb END,
        COALESCE(p_settings_patch, '{}'::jsonb)
    );

    IF v_found THEN
        UPDATE public.crm_table_tenant_defaults
        SET pinned_action_id = v_pinned_action_id,
            schema_version = COALESCE(p_schema_version, 1),
            settings = v_settings,
            updated_by = p_actor_profile_id,
            updated_at = NOW()
        WHERE id = v_before.id
        RETURNING * INTO v_row;
    ELSE
        INSERT INTO public.crm_table_tenant_defaults (
            tenant_id,
            table_id,
            pinned_action_id,
            schema_version,
            settings,
            updated_by,
            updated_at
        )
        VALUES (
            p_tenant_id,
            p_table_id,
            v_pinned_action_id,
            COALESCE(p_schema_version, 1),
            v_settings,
            p_actor_profile_id,
            NOW()
        )
        RETURNING * INTO v_row;
    END IF;

    INSERT INTO public.crm_table_preference_audit_events (
        tenant_id,
        actor_profile_id,
        table_id,
        scope,
        before_snapshot,
        after_snapshot
    )
    VALUES (
        p_tenant_id,
        p_actor_profile_id,
        p_table_id,
        'tenant_default',
        jsonb_build_object(
            'pinnedActionId',
            CASE WHEN v_found THEN v_before.pinned_action_id ELSE NULL END,
            'settings',
            CASE WHEN v_found THEN v_before.settings ELSE NULL END
        ),
        jsonb_build_object(
            'pinnedActionId',
            v_pinned_action_id,
            'settings',
            v_settings
        )
    );

    RETURN v_row;
END;
$$;

REVOKE ALL ON FUNCTION public.apply_crm_view_settings_patch(JSONB, JSONB)
    FROM PUBLIC;
REVOKE ALL ON FUNCTION public.save_crm_user_table_preference(
    UUID,
    UUID,
    TEXT,
    TEXT,
    BOOLEAN,
    INTEGER,
    JSONB
) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.save_crm_tenant_table_default(
    UUID,
    TEXT,
    TEXT,
    BOOLEAN,
    INTEGER,
    JSONB,
    UUID,
    BOOLEAN
) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.apply_crm_view_settings_patch(JSONB, JSONB)
    TO service_role;
GRANT EXECUTE ON FUNCTION public.save_crm_user_table_preference(
    UUID,
    UUID,
    TEXT,
    TEXT,
    BOOLEAN,
    INTEGER,
    JSONB
) TO service_role;
GRANT EXECUTE ON FUNCTION public.save_crm_tenant_table_default(
    UUID,
    TEXT,
    TEXT,
    BOOLEAN,
    INTEGER,
    JSONB,
    UUID,
    BOOLEAN
) TO service_role;
