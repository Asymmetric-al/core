-- Eve private-admin memory tracer (issue #422, ADR-0023).
--
-- Live writes are owner-bound private admin memory only. The scope column can
-- represent future tenant operational memory, but every mutation function
-- rejects that scope. Browser roles have no table or RPC access.

CREATE TABLE public.eve_admin_memory_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    owner_profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    scope_type TEXT NOT NULL DEFAULT 'admin_private'
        CHECK (scope_type IN ('admin_private', 'tenant_operational')),
    category TEXT NOT NULL
        CHECK (category IN ('preference', 'project_context', 'decision')),
    title TEXT NOT NULL CHECK (char_length(btrim(title)) BETWEEN 1 AND 120),
    content TEXT NOT NULL CHECK (char_length(btrim(content)) BETWEEN 1 AND 4000),
    source TEXT NOT NULL DEFAULT 'manual'
        CHECK (source IN ('manual', 'auto_save')),
    version BIGINT NOT NULL DEFAULT 1 CHECK (version > 0),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    search_vector TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('simple', COALESCE(title, '') || ' ' || COALESCE(content, ''))
    ) STORED,
    CHECK (
        (scope_type = 'admin_private' AND owner_profile_id IS NOT NULL)
        OR (scope_type = 'tenant_operational' AND owner_profile_id IS NULL)
    ),
    CHECK ((is_deleted AND deleted_at IS NOT NULL) OR (NOT is_deleted AND deleted_at IS NULL)),
    UNIQUE (id, tenant_id, owner_profile_id)
);

CREATE INDEX eve_admin_memory_owner_updated_idx
    ON public.eve_admin_memory_entries (tenant_id, owner_profile_id, updated_at DESC);
CREATE INDEX eve_admin_memory_search_idx
    ON public.eve_admin_memory_entries USING GIN (search_vector);

CREATE TABLE public.eve_admin_memory_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entry_id UUID NOT NULL,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    owner_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    version BIGINT NOT NULL CHECK (version > 0),
    action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'deleted')),
    category TEXT NOT NULL
        CHECK (category IN ('preference', 'project_context', 'decision')),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    source TEXT NOT NULL CHECK (source IN ('manual', 'auto_save')),
    changed_by_profile_id UUID NOT NULL REFERENCES public.profiles(id),
    changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (entry_id, version),
    FOREIGN KEY (entry_id, tenant_id, owner_profile_id)
        REFERENCES public.eve_admin_memory_entries(id, tenant_id, owner_profile_id)
        ON DELETE CASCADE
);

CREATE INDEX eve_admin_memory_history_owner_idx
    ON public.eve_admin_memory_history (tenant_id, owner_profile_id, changed_at DESC);

CREATE TABLE public.eve_admin_memory_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    owner_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category TEXT NOT NULL
        CHECK (category IN ('preference', 'project_context', 'decision')),
    auto_save_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    memory_history_retention_days INTEGER NOT NULL DEFAULT 365
        CHECK (memory_history_retention_days BETWEEN 1 AND 3650),
    deleted_memory_retention_days INTEGER NOT NULL DEFAULT 30
        CHECK (deleted_memory_retention_days BETWEEN 1 AND 3650),
    updated_by_profile_id UUID NOT NULL REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, owner_profile_id, category)
);

ALTER TABLE public.eve_admin_memory_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eve_admin_memory_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eve_admin_memory_settings ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.eve_admin_memory_entries FROM anon, authenticated;
REVOKE ALL ON TABLE public.eve_admin_memory_history FROM anon, authenticated;
REVOKE ALL ON TABLE public.eve_admin_memory_settings FROM anon, authenticated;

GRANT SELECT ON TABLE public.eve_admin_memory_entries TO service_role;
GRANT SELECT ON TABLE public.eve_admin_memory_history TO service_role;
GRANT SELECT ON TABLE public.eve_admin_memory_settings TO service_role;

CREATE OR REPLACE FUNCTION public.assert_eve_admin_memory_owner(
    p_tenant_id UUID,
    p_owner_profile_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = p_owner_profile_id AND tenant_id = p_tenant_id
    ) THEN
        RAISE EXCEPTION 'eve_admin_memory_owner_tenant_mismatch';
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.contains_eve_admin_memory_exclusion(
    p_value TEXT
)
RETURNS BOOLEAN
LANGUAGE sql
IMMUTABLE
SET search_path = public, pg_temp
AS $$
    SELECT COALESCE(p_value, '') ~* '-----BEGIN (RSA |EC |OPENSSH |PGP )?PRIVATE KEY-----'
        OR COALESCE(p_value, '') ~* '(api[_ -]?key|client[_ -]?secret|password|passwd|credential|access[_ -]?token|refresh[_ -]?token)[[:space:]]*[:=][[:space:]]*[^[:space:]]+'
        OR COALESCE(p_value, '') ~* '(bearer[[:space:]]+[a-z0-9._~+/-]{12,}|(sk|ghp|github_pat|sb_secret)_[a-z0-9_-]{12,})'
        OR COALESCE(p_value, '') ~* '(otp|one[- ]time (code|password)|verification code|2fa code|mfa code)[[:space:]]*(:|is)?[[:space:]]*[0-9]{4,10}'
        OR COALESCE(p_value, '') ~* '(cvv|cvc|routing number|bank account|card number)[[:space:]]*(:|is)?[[:space:]]*[0-9 -]{3,24}'
        OR COALESCE(p_value, '') ~* '([0-9][ -]?){13,19}'
        OR COALESCE(p_value, '') ~* '[A-Z0-9._%+-]+@[A-Z0-9.-]+[.][A-Z]{2,}'
        OR COALESCE(p_value, '') ~* '(ssn|social security)[[:space:]]*(:|is)?[[:space:]]*[0-9]{3}-?[0-9]{2}-?[0-9]{4}'
        OR COALESCE(p_value, '') ~* '(^|[^[:alnum:]])[0-9]{3}-[0-9]{2}-[0-9]{4}([^[:alnum:]]|$)'
        OR COALESCE(p_value, '') ~* '(^|[^[:alnum:]])([+]1[ .-]?|1[ .-])?([(][2-9][0-9]{2}[)]|[2-9][0-9]{2})[ .-][2-9][0-9]{2}[ .-][0-9]{4}([^[:alnum:]]|$)'
        OR COALESCE(p_value, '') ~* '(^|[^[:alnum:]])[0-9]{1,6}[[:space:]]+(([[:alpha:]][[:alpha:].''-]*|[0-9]+(st|nd|rd|th))[[:space:]]+){1,5}(street|st|avenue|ave|road|rd|boulevard|blvd|lane|ln|drive|dr|court|ct|circle|cir|parkway|pkwy|highway|hwy|way|terrace|ter|place|pl)([[:space:]]+(apt|apartment|suite|unit|#)[[:space:]]*[[:alnum:]-]+)?([^[:alnum:]]|$)'
        OR COALESCE(p_value, '') ~* '(phone|mobile|telephone|street address|mailing address)[[:space:]]*(:|is)[[:space:]]*[^[:space:]]+'
        OR COALESCE(p_value, '') ~* '(donor|customer|tenant)[[:space:]]+(name|email|phone|address|account|balance|gift|giving|payment|identifier)[[:space:]]*(:|is)[[:space:]]*[^[:space:]]+';
$$;

CREATE OR REPLACE FUNCTION public.append_eve_admin_memory_audit(
    p_audit_id UUID,
    p_tenant_id UUID,
    p_actor_id TEXT,
    p_actor_profile_id UUID,
    p_actor_role TEXT,
    p_initiator_type TEXT,
    p_initiator_id TEXT,
    p_action TEXT,
    p_target TEXT,
    p_result TEXT,
    p_evidence JSONB,
    p_change JSONB,
    p_rationale TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    INSERT INTO public.eve_audit_events (
        id, tenant_id, actor_id, actor_profile_id, actor_role, identity_mode,
        initiator_type, initiator_id, policy_id, policy_status, action, target,
        result, model_role, evidence_summary, change_summary, decision_summary,
        debug_metadata, redaction_version
    ) VALUES (
        p_audit_id, p_tenant_id, p_actor_id, p_actor_profile_id, p_actor_role,
        'admin', p_initiator_type, p_initiator_id, 'eve-admin-memory',
        'advisory_only', p_action, p_target, p_result, 'not_used',
        p_evidence::TEXT, p_change::TEXT,
        format('%s %s. Rationale: %s. Policy: eve-admin-memory (advisory_only).', p_action, p_result, p_rationale),
        jsonb_build_object('source', 'eve_admin_memory_rpc'), 'eve-audit-v1'
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.create_eve_admin_memory(
    p_scope_type TEXT,
    p_category TEXT,
    p_title TEXT,
    p_content TEXT,
    p_source TEXT,
    p_audit_id UUID,
    p_actor_id TEXT,
    p_actor_profile_id UUID,
    p_actor_role TEXT,
    p_tenant_id UUID,
    p_initiator_type TEXT,
    p_initiator_id TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    new_id UUID := gen_random_uuid();
    governance public.eve_governance_state%ROWTYPE;
    auto_save_enabled BOOLEAN;
BEGIN
    PERFORM public.assert_eve_admin_memory_owner(p_tenant_id, p_actor_profile_id);
    IF p_scope_type <> 'admin_private' THEN
        RAISE EXCEPTION 'eve_tenant_operational_memory_disabled';
    END IF;
    IF p_category NOT IN ('preference', 'project_context', 'decision')
        OR p_source NOT IN ('manual', 'auto_save')
        OR char_length(btrim(p_title)) NOT BETWEEN 1 AND 120
        OR char_length(btrim(p_content)) NOT BETWEEN 1 AND 4000
    THEN
        RAISE EXCEPTION 'invalid_eve_admin_memory';
    END IF;
    IF public.contains_eve_admin_memory_exclusion(p_title || E'\n' || p_content) THEN
        RAISE EXCEPTION 'eve_admin_memory_excluded';
    END IF;

    IF p_source = 'auto_save' THEN
        SELECT * INTO governance FROM public.eve_governance_state
        WHERE id = 'global' FOR SHARE;
        IF NOT FOUND
            OR NOT governance.release_enabled
            OR governance.emergency_off
            OR (governance.kill_switch_state ->> 'all_automation')::BOOLEAN
        THEN
            RAISE EXCEPTION 'eve_admin_memory_auto_save_governance_blocked';
        END IF;
        SELECT COALESCE((
            SELECT settings.auto_save_enabled
            FROM public.eve_admin_memory_settings settings
            WHERE settings.tenant_id = p_tenant_id
              AND settings.owner_profile_id = p_actor_profile_id
              AND settings.category = p_category
        ), TRUE) INTO auto_save_enabled;
        IF NOT auto_save_enabled THEN
            RAISE EXCEPTION 'eve_admin_memory_auto_save_disabled';
        END IF;
    END IF;

    INSERT INTO public.eve_admin_memory_entries (
        id, tenant_id, owner_profile_id, scope_type, category, title, content,
        source
    ) VALUES (
        new_id, p_tenant_id, p_actor_profile_id, 'admin_private', p_category,
        btrim(p_title), btrim(p_content), p_source
    );

    INSERT INTO public.eve_admin_memory_history (
        entry_id, tenant_id, owner_profile_id, version, action, category,
        title, content, source, changed_by_profile_id
    ) VALUES (
        new_id, p_tenant_id, p_actor_profile_id, 1, 'created', p_category,
        btrim(p_title), btrim(p_content), p_source, p_actor_profile_id
    );

    PERFORM public.append_eve_admin_memory_audit(
        p_audit_id, p_tenant_id, p_actor_id, p_actor_profile_id, p_actor_role,
        p_initiator_type, p_initiator_id, 'memory.create',
        'admin_memory:' || new_id, 'succeeded',
        jsonb_build_object('category', p_category, 'source', p_source, 'scope', 'admin_private'),
        jsonb_build_object('created', TRUE, 'version', 1),
        'Allowed private admin memory passed the write-time exclusion boundary'
    );
    RETURN new_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_eve_admin_memory(
    p_entry_id UUID,
    p_expected_version BIGINT,
    p_category TEXT,
    p_title TEXT,
    p_content TEXT,
    p_audit_id UUID,
    p_actor_id TEXT,
    p_actor_profile_id UUID,
    p_actor_role TEXT,
    p_tenant_id UUID,
    p_initiator_type TEXT,
    p_initiator_id TEXT
)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    entry public.eve_admin_memory_entries%ROWTYPE;
    next_version BIGINT;
BEGIN
    PERFORM public.assert_eve_admin_memory_owner(p_tenant_id, p_actor_profile_id);
    SELECT * INTO entry FROM public.eve_admin_memory_entries
    WHERE id = p_entry_id AND tenant_id = p_tenant_id
      AND owner_profile_id = p_actor_profile_id AND scope_type = 'admin_private'
    FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'missing_eve_admin_memory'; END IF;
    IF entry.is_deleted THEN RAISE EXCEPTION 'deleted_eve_admin_memory'; END IF;
    IF entry.version <> p_expected_version THEN RAISE EXCEPTION 'stale_eve_admin_memory'; END IF;
    IF p_category NOT IN ('preference', 'project_context', 'decision')
        OR char_length(btrim(p_title)) NOT BETWEEN 1 AND 120
        OR char_length(btrim(p_content)) NOT BETWEEN 1 AND 4000
    THEN RAISE EXCEPTION 'invalid_eve_admin_memory'; END IF;
    IF public.contains_eve_admin_memory_exclusion(p_title || E'\n' || p_content) THEN
        RAISE EXCEPTION 'eve_admin_memory_excluded';
    END IF;
    next_version := entry.version + 1;
    UPDATE public.eve_admin_memory_entries SET
        category = p_category, title = btrim(p_title), content = btrim(p_content),
        version = next_version, source = 'manual', updated_at = NOW()
    WHERE id = p_entry_id;
    INSERT INTO public.eve_admin_memory_history (
        entry_id, tenant_id, owner_profile_id, version, action, category,
        title, content, source, changed_by_profile_id
    ) VALUES (
        p_entry_id, p_tenant_id, p_actor_profile_id, next_version, 'updated',
        p_category, btrim(p_title), btrim(p_content), 'manual', p_actor_profile_id
    );
    PERFORM public.append_eve_admin_memory_audit(
        p_audit_id, p_tenant_id, p_actor_id, p_actor_profile_id, p_actor_role,
        p_initiator_type, p_initiator_id, 'memory.update',
        'admin_memory:' || p_entry_id, 'succeeded',
        jsonb_build_object('category', p_category, 'scope', 'admin_private'),
        jsonb_build_object('updated', TRUE, 'version', next_version),
        'The owning admin deliberately updated allowed advisory memory'
    );
    RETURN next_version;
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_eve_admin_memory(
    p_entry_id UUID,
    p_expected_version BIGINT,
    p_audit_id UUID,
    p_actor_id TEXT,
    p_actor_profile_id UUID,
    p_actor_role TEXT,
    p_tenant_id UUID,
    p_initiator_type TEXT,
    p_initiator_id TEXT
)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    entry public.eve_admin_memory_entries%ROWTYPE;
    next_version BIGINT;
BEGIN
    PERFORM public.assert_eve_admin_memory_owner(p_tenant_id, p_actor_profile_id);
    SELECT * INTO entry FROM public.eve_admin_memory_entries
    WHERE id = p_entry_id AND tenant_id = p_tenant_id
      AND owner_profile_id = p_actor_profile_id AND scope_type = 'admin_private'
    FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'missing_eve_admin_memory'; END IF;
    IF entry.is_deleted THEN RAISE EXCEPTION 'deleted_eve_admin_memory'; END IF;
    IF entry.version <> p_expected_version THEN RAISE EXCEPTION 'stale_eve_admin_memory'; END IF;
    next_version := entry.version + 1;
    UPDATE public.eve_admin_memory_entries SET
        version = next_version, is_deleted = TRUE, deleted_at = NOW(),
        updated_at = NOW()
    WHERE id = p_entry_id;
    INSERT INTO public.eve_admin_memory_history (
        entry_id, tenant_id, owner_profile_id, version, action, category,
        title, content, source, changed_by_profile_id
    ) VALUES (
        p_entry_id, p_tenant_id, p_actor_profile_id, next_version, 'deleted',
        entry.category, entry.title, entry.content, 'manual', p_actor_profile_id
    );
    PERFORM public.append_eve_admin_memory_audit(
        p_audit_id, p_tenant_id, p_actor_id, p_actor_profile_id, p_actor_role,
        p_initiator_type, p_initiator_id, 'memory.delete',
        'admin_memory:' || p_entry_id, 'succeeded',
        jsonb_build_object('category', entry.category, 'scope', 'admin_private'),
        jsonb_build_object('deleted', TRUE, 'version', next_version),
        'The owning admin deliberately deleted the current memory entry'
    );
    RETURN next_version;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_eve_admin_memory_auto_save(
    p_category TEXT,
    p_enabled BOOLEAN,
    p_audit_id UUID,
    p_actor_id TEXT,
    p_actor_profile_id UUID,
    p_actor_role TEXT,
    p_tenant_id UUID,
    p_initiator_type TEXT,
    p_initiator_id TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    PERFORM public.assert_eve_admin_memory_owner(p_tenant_id, p_actor_profile_id);
    IF p_category NOT IN ('preference', 'project_context', 'decision') OR p_enabled IS NULL THEN
        RAISE EXCEPTION 'invalid_eve_admin_memory_setting';
    END IF;
    INSERT INTO public.eve_admin_memory_settings (
        tenant_id, owner_profile_id, category, auto_save_enabled,
        updated_by_profile_id
    ) VALUES (
        p_tenant_id, p_actor_profile_id, p_category, p_enabled,
        p_actor_profile_id
    ) ON CONFLICT (tenant_id, owner_profile_id, category) DO UPDATE SET
        auto_save_enabled = EXCLUDED.auto_save_enabled,
        updated_by_profile_id = EXCLUDED.updated_by_profile_id,
        updated_at = NOW();
    PERFORM public.append_eve_admin_memory_audit(
        p_audit_id, p_tenant_id, p_actor_id, p_actor_profile_id, p_actor_role,
        p_initiator_type, p_initiator_id, 'memory.auto_save_setting',
        'admin_memory_category:' || p_category, 'succeeded',
        jsonb_build_object('category', p_category, 'scope', 'admin_private'),
        jsonb_build_object('autoSaveEnabled', p_enabled),
        'The owning admin deliberately changed category auto-save behavior'
    );
END;
$$;

REVOKE ALL ON FUNCTION public.assert_eve_admin_memory_owner(UUID, UUID) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.contains_eve_admin_memory_exclusion(TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.append_eve_admin_memory_audit(UUID, UUID, TEXT, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, JSONB, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.create_eve_admin_memory(TEXT, TEXT, TEXT, TEXT, TEXT, UUID, TEXT, UUID, TEXT, UUID, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_eve_admin_memory(UUID, BIGINT, TEXT, TEXT, TEXT, UUID, TEXT, UUID, TEXT, UUID, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.delete_eve_admin_memory(UUID, BIGINT, UUID, TEXT, UUID, TEXT, UUID, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_eve_admin_memory_auto_save(TEXT, BOOLEAN, UUID, TEXT, UUID, TEXT, UUID, TEXT, TEXT) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.create_eve_admin_memory(TEXT, TEXT, TEXT, TEXT, TEXT, UUID, TEXT, UUID, TEXT, UUID, TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.update_eve_admin_memory(UUID, BIGINT, TEXT, TEXT, TEXT, UUID, TEXT, UUID, TEXT, UUID, TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.delete_eve_admin_memory(UUID, BIGINT, UUID, TEXT, UUID, TEXT, UUID, TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.set_eve_admin_memory_auto_save(TEXT, BOOLEAN, UUID, TEXT, UUID, TEXT, UUID, TEXT, TEXT) TO service_role;

COMMENT ON TABLE public.eve_admin_memory_entries IS
    'Private advisory admin memory. tenant_operational is schema-reserved and rejected by all live mutation paths.';
COMMENT ON TABLE public.eve_admin_memory_history IS
    'Immutable private-admin memory change history with retention controlled separately from run logs.';
