-- Named personal CRM gift-history views (ADR-CD-021, issue #273).
-- Personal-only snapshots of view settings; one default per user/table.
-- No sharing, publishing, or team views.

CREATE TABLE IF NOT EXISTS public.crm_table_named_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    table_id TEXT NOT NULL,
    name TEXT NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    schema_version INTEGER NOT NULL DEFAULT 1,
    pinned_action_id TEXT,
    settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, profile_id, table_id, name)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_crm_table_named_views_default
    ON public.crm_table_named_views (tenant_id, profile_id, table_id)
    WHERE is_default;

ALTER TABLE public.crm_table_named_views ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.crm_table_named_views FROM anon, authenticated;

GRANT ALL ON TABLE public.crm_table_named_views TO service_role;

-- Once named views exist, user preferences can safely validate activeViewId
-- inside the same RPC transaction that persists the setting.
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
    v_active_view_id TEXT;
    v_row public.crm_table_user_preferences;
    v_settings_patch JSONB;
BEGIN
    v_settings_patch := COALESCE(p_settings_patch, '{}'::jsonb);

    IF v_settings_patch ? 'activeViewId'
       AND jsonb_typeof(v_settings_patch -> 'activeViewId') <> 'null' THEN
        IF jsonb_typeof(v_settings_patch -> 'activeViewId') <> 'string' THEN
            RAISE EXCEPTION 'Active named view id must be a string.'
                USING ERRCODE = '22023';
        END IF;

        v_active_view_id := v_settings_patch ->> 'activeViewId';
        IF v_active_view_id !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' THEN
            RAISE EXCEPTION 'Active named view id must be a UUID.'
                USING ERRCODE = '22023';
        END IF;

        PERFORM 1
        FROM public.crm_table_named_views
        WHERE tenant_id = p_tenant_id
          AND profile_id = p_profile_id
          AND table_id = p_table_id
          AND id = v_active_view_id::UUID
        FOR KEY SHARE;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Active named view not found.'
                USING ERRCODE = 'P0002';
        END IF;
    END IF;

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
        public.apply_crm_view_settings_patch('{}'::jsonb, v_settings_patch),
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
            v_settings_patch
        ),
        updated_at = NOW()
    RETURNING * INTO v_row;

    RETURN v_row;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_crm_table_named_view(
    p_tenant_id UUID,
    p_profile_id UUID,
    p_table_id TEXT,
    p_name TEXT,
    p_is_default BOOLEAN,
    p_schema_version INTEGER,
    p_pinned_action_id TEXT,
    p_settings JSONB
)
RETURNS public.crm_table_named_views
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_view public.crm_table_named_views;
BEGIN
    IF COALESCE(p_is_default, FALSE) THEN
        UPDATE public.crm_table_named_views
        SET is_default = FALSE,
            updated_at = NOW()
        WHERE tenant_id = p_tenant_id
          AND profile_id = p_profile_id
          AND table_id = p_table_id
          AND is_default;
    END IF;

    INSERT INTO public.crm_table_named_views (
        tenant_id,
        profile_id,
        table_id,
        name,
        is_default,
        schema_version,
        pinned_action_id,
        settings
    )
    VALUES (
        p_tenant_id,
        p_profile_id,
        p_table_id,
        p_name,
        COALESCE(p_is_default, FALSE),
        COALESCE(p_schema_version, 1),
        p_pinned_action_id,
        COALESCE(p_settings, '{}'::jsonb)
    )
    RETURNING * INTO v_view;

    RETURN v_view;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_crm_table_named_view(
    p_tenant_id UUID,
    p_profile_id UUID,
    p_table_id TEXT,
    p_view_id TEXT,
    p_name TEXT,
    p_name_is_set BOOLEAN,
    p_is_default BOOLEAN,
    p_is_default_is_set BOOLEAN,
    p_schema_version INTEGER,
    p_pinned_action_id TEXT,
    p_pinned_action_id_is_set BOOLEAN,
    p_settings JSONB,
    p_settings_is_set BOOLEAN
)
RETURNS public.crm_table_named_views
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_view public.crm_table_named_views;
BEGIN
    SELECT *
    INTO v_view
    FROM public.crm_table_named_views
    WHERE tenant_id = p_tenant_id
      AND profile_id = p_profile_id
      AND table_id = p_table_id
      AND id::TEXT = p_view_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN NULL;
    END IF;

    IF COALESCE(p_is_default_is_set, FALSE)
       AND COALESCE(p_is_default, FALSE) THEN
        UPDATE public.crm_table_named_views
        SET is_default = FALSE,
            updated_at = NOW()
        WHERE tenant_id = p_tenant_id
          AND profile_id = p_profile_id
          AND table_id = p_table_id
          AND id <> v_view.id
          AND is_default;
    END IF;

    UPDATE public.crm_table_named_views
    SET name = CASE WHEN p_name_is_set THEN p_name ELSE name END,
        is_default = CASE
            WHEN p_is_default_is_set THEN COALESCE(p_is_default, FALSE)
            ELSE is_default
        END,
        schema_version = CASE
            WHEN p_pinned_action_id_is_set THEN COALESCE(p_schema_version, 1)
            ELSE schema_version
        END,
        pinned_action_id = CASE
            WHEN p_pinned_action_id_is_set THEN p_pinned_action_id
            ELSE pinned_action_id
        END,
        settings = CASE
            WHEN p_settings_is_set THEN public.apply_crm_view_settings_patch(
                settings,
                COALESCE(p_settings, '{}'::jsonb)
            )
            ELSE settings
        END,
        updated_at = NOW()
    WHERE id = v_view.id
    RETURNING * INTO v_view;

    RETURN v_view;
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_crm_table_named_view(
    p_tenant_id UUID,
    p_profile_id UUID,
    p_table_id TEXT,
    p_view_id TEXT,
    p_next_default_view_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_deleted public.crm_table_named_views;
    v_next_default public.crm_table_named_views;
BEGIN
    SELECT *
    INTO v_deleted
    FROM public.crm_table_named_views
    WHERE tenant_id = p_tenant_id
      AND profile_id = p_profile_id
      AND table_id = p_table_id
      AND id::TEXT = p_view_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('deleted', FALSE, 'reason', 'view_not_found');
    END IF;

    IF p_next_default_view_id IS NOT NULL THEN
        IF p_next_default_view_id = p_view_id THEN
            RETURN jsonb_build_object(
                'deleted',
                FALSE,
                'reason',
                'next_default_not_found'
            );
        END IF;

        SELECT *
        INTO v_next_default
        FROM public.crm_table_named_views
        WHERE tenant_id = p_tenant_id
          AND profile_id = p_profile_id
          AND table_id = p_table_id
          AND id::TEXT = p_next_default_view_id
        FOR UPDATE;

        IF NOT FOUND THEN
            RETURN jsonb_build_object(
                'deleted',
                FALSE,
                'reason',
                'next_default_not_found'
            );
        END IF;
    END IF;

    DELETE FROM public.crm_table_named_views
    WHERE id = v_deleted.id;

    UPDATE public.crm_table_user_preferences
    SET settings = public.apply_crm_view_settings_patch(
            settings,
            jsonb_build_object('activeViewId', p_next_default_view_id)
        ),
        updated_at = NOW()
    WHERE tenant_id = p_tenant_id
      AND profile_id = p_profile_id
      AND table_id = p_table_id
      AND settings ->> 'activeViewId' = p_view_id;

    IF p_next_default_view_id IS NOT NULL
       AND v_deleted.is_default THEN
        UPDATE public.crm_table_named_views
        SET is_default = FALSE,
            updated_at = NOW()
        WHERE tenant_id = p_tenant_id
          AND profile_id = p_profile_id
          AND table_id = p_table_id
          AND id <> v_next_default.id
          AND is_default;

        UPDATE public.crm_table_named_views
        SET is_default = TRUE,
            updated_at = NOW()
        WHERE id = v_next_default.id;
    END IF;

    RETURN jsonb_build_object(
        'deleted',
        TRUE,
        'promoted',
        p_next_default_view_id IS NOT NULL
        AND v_deleted.is_default
    );
END;
$$;

REVOKE ALL ON FUNCTION public.create_crm_table_named_view(
    UUID,
    UUID,
    TEXT,
    TEXT,
    BOOLEAN,
    INTEGER,
    TEXT,
    JSONB
) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.update_crm_table_named_view(
    UUID,
    UUID,
    TEXT,
    TEXT,
    TEXT,
    BOOLEAN,
    BOOLEAN,
    BOOLEAN,
    INTEGER,
    TEXT,
    BOOLEAN,
    JSONB,
    BOOLEAN
) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.delete_crm_table_named_view(
    UUID,
    UUID,
    TEXT,
    TEXT,
    TEXT
) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.create_crm_table_named_view(
    UUID,
    UUID,
    TEXT,
    TEXT,
    BOOLEAN,
    INTEGER,
    TEXT,
    JSONB
) TO service_role;
GRANT EXECUTE ON FUNCTION public.update_crm_table_named_view(
    UUID,
    UUID,
    TEXT,
    TEXT,
    TEXT,
    BOOLEAN,
    BOOLEAN,
    BOOLEAN,
    INTEGER,
    TEXT,
    BOOLEAN,
    JSONB,
    BOOLEAN
) TO service_role;
GRANT EXECUTE ON FUNCTION public.delete_crm_table_named_view(
    UUID,
    UUID,
    TEXT,
    TEXT,
    TEXT
) TO service_role;
