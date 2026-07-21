-- Eve retention and replay artifact tracer (issue #424, ADR-0025).
--
-- Postgres stores queryable, redacted metadata only. Private artifact bodies
-- live in Supabase Storage and are reached only through short-lived signed URLs
-- issued by the authenticated server boundary after tenant + owner checks.

CREATE TABLE public.eve_retention_categories (
    category TEXT PRIMARY KEY CHECK (category ~ '^[a-z0-9_]{1,60}$'),
    retention_days INTEGER NOT NULL CHECK (retention_days BETWEEN 1 AND 3650),
    metadata_only BOOLEAN NOT NULL DEFAULT FALSE,
    description TEXT NOT NULL,
    updated_by_profile_id UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.eve_retention_categories (
    category, retention_days, metadata_only, description
) VALUES
    ('audit_record', 180, FALSE, 'Redacted Eve action audit records.'),
    ('run_summary', 180, FALSE, 'Redacted Eve run summaries.'),
    ('replay_artifact', 180, FALSE, 'Redacted replay and debug artifact metadata.'),
    ('gateway_telemetry', 30, TRUE, 'Metadata-only model gateway telemetry; prompt and response bodies are forbidden.');

ALTER TABLE public.eve_audit_events
    ADD COLUMN retention_category TEXT NOT NULL DEFAULT 'audit_record'
        REFERENCES public.eve_retention_categories(category),
    ADD COLUMN expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '180 days');

ALTER TABLE public.eve_run_summaries
    ADD COLUMN retention_category TEXT NOT NULL DEFAULT 'run_summary'
        REFERENCES public.eve_retention_categories(category),
    ADD COLUMN expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '180 days');

CREATE TABLE public.eve_replay_artifacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    owner_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    run_id UUID REFERENCES public.eve_run_summaries(id) ON DELETE SET NULL,
    category TEXT NOT NULL DEFAULT 'replay_artifact'
        REFERENCES public.eve_retention_categories(category),
    artifact_kind TEXT NOT NULL CHECK (artifact_kind IN ('replay', 'debug', 'gateway_telemetry')),
    storage_bucket TEXT NOT NULL DEFAULT 'eve-replay-artifacts'
        CHECK (storage_bucket = 'eve-replay-artifacts'),
    storage_path TEXT NOT NULL CHECK (
        storage_path ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}/[0-9a-f-]{36}\.(json|jsonl|txt|zip)$'
    ),
    redacted_summary TEXT NOT NULL CHECK (
        char_length(redacted_summary) BETWEEN 1 AND 2000
        AND redacted_summary !~* '(bearer[[:space:]]+[a-z0-9._~+/=-]+|[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}|sk_(live|test)_[a-z0-9_-]+)'
    ),
    redaction_version TEXT NOT NULL DEFAULT 'eve-audit-v1'
        CHECK (redaction_version = 'eve-audit-v1'),
    content_type TEXT CHECK (content_type IN ('application/json', 'text/plain')),
    byte_size BIGINT CHECK (byte_size BETWEEN 1 AND 5000000),
    sha256 TEXT CHECK (sha256 ~ '^[a-f0-9]{64}$'),
    status TEXT NOT NULL DEFAULT 'upload_pending'
        CHECK (status IN ('upload_pending', 'available', 'delete_pending', 'expired')),
    expires_at TIMESTAMPTZ NOT NULL,
    uploaded_at TIMESTAMPTZ,
    deletion_started_at TIMESTAMPTZ,
    storage_deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (storage_bucket, storage_path),
    CHECK ((status = 'upload_pending' AND uploaded_at IS NULL)
        OR (status = 'available' AND uploaded_at IS NOT NULL)
        OR status IN ('delete_pending', 'expired')),
    CHECK (deletion_started_at IS NULL OR status = 'delete_pending')
);

CREATE INDEX eve_replay_artifacts_tenant_created_idx
    ON public.eve_replay_artifacts (tenant_id, created_at DESC);
CREATE INDEX eve_replay_artifacts_owner_created_idx
    ON public.eve_replay_artifacts (tenant_id, owner_profile_id, created_at DESC);
CREATE INDEX eve_replay_artifacts_expiry_idx
    ON public.eve_replay_artifacts (expires_at, status)
    WHERE status IN ('upload_pending', 'available');

CREATE TABLE public.eve_retention_holds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    hold_type TEXT NOT NULL CHECK (hold_type IN ('incident', 'legal')),
    scope_type TEXT NOT NULL CHECK (scope_type IN ('artifact', 'category', 'audit_event', 'run_summary')),
    target_id TEXT NOT NULL CHECK (target_id ~ '^[a-z0-9_-]{1,60}$' OR target_id ~ '^[0-9a-f-]{36}$'),
    reason TEXT NOT NULL CHECK (char_length(reason) BETWEEN 1 AND 500),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cleared')),
    set_by_profile_id UUID NOT NULL REFERENCES public.profiles(id),
    cleared_by_profile_id UUID REFERENCES public.profiles(id),
    cleared_reason TEXT CHECK (cleared_reason IS NULL OR char_length(cleared_reason) BETWEEN 1 AND 500),
    cleared_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK ((status = 'active' AND cleared_at IS NULL AND cleared_by_profile_id IS NULL)
        OR (status = 'cleared' AND cleared_at IS NOT NULL AND cleared_by_profile_id IS NOT NULL))
);

CREATE UNIQUE INDEX eve_retention_holds_active_target_idx
    ON public.eve_retention_holds (tenant_id, hold_type, scope_type, target_id)
    WHERE status = 'active';

CREATE TABLE public.eve_retention_lifecycle_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL,
    actor_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL CHECK (action IN (
        'artifact.registered', 'artifact.uploaded', 'artifact.expiry_claimed',
        'artifact.expired', 'hold.set', 'hold.cleared', 'records.expired',
        'category.updated'
    )),
    target_type TEXT NOT NULL,
    target_id TEXT NOT NULL,
    detail JSONB NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(detail) = 'object'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX eve_retention_lifecycle_tenant_created_idx
    ON public.eve_retention_lifecycle_events (tenant_id, created_at DESC);

INSERT INTO storage.buckets (id, name, public)
VALUES ('eve-replay-artifacts', 'eve-replay-artifacts', FALSE)
ON CONFLICT (id) DO UPDATE SET
    public = FALSE;

ALTER TABLE public.eve_retention_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eve_replay_artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eve_retention_holds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eve_retention_lifecycle_events ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.eve_retention_categories, public.eve_replay_artifacts,
    public.eve_retention_holds, public.eve_retention_lifecycle_events
    FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.eve_retention_categories,
    public.eve_replay_artifacts, public.eve_retention_holds,
    public.eve_retention_lifecycle_events TO service_role;

CREATE OR REPLACE FUNCTION public.assert_eve_retention_actor(
    p_tenant_id UUID,
    p_actor_profile_id UUID,
    p_actor_role TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF p_actor_role NOT IN ('admin', 'super_admin') OR NOT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = p_actor_profile_id AND tenant_id = p_tenant_id
    ) THEN
        RAISE EXCEPTION 'eve_retention_actor_tenant_mismatch';
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.prepare_eve_replay_artifact(
    p_id UUID,
    p_tenant_id UUID,
    p_actor_profile_id UUID,
    p_actor_role TEXT,
    p_run_id UUID,
    p_artifact_kind TEXT,
    p_storage_path TEXT,
    p_redacted_summary TEXT
)
RETURNS TIMESTAMPTZ
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    selected_category TEXT;
    category_row public.eve_retention_categories%ROWTYPE;
    expiry TIMESTAMPTZ;
BEGIN
    PERFORM public.assert_eve_retention_actor(p_tenant_id, p_actor_profile_id, p_actor_role);
    IF p_run_id IS NOT NULL THEN
        PERFORM 1 FROM public.eve_run_summaries run_summary
        WHERE run_summary.id = p_run_id
          AND run_summary.initiated_by_profile_id = p_actor_profile_id
        FOR SHARE;
        IF NOT FOUND THEN RAISE EXCEPTION 'eve_replay_run_owner_mismatch'; END IF;
    END IF;
    selected_category := CASE WHEN p_artifact_kind = 'gateway_telemetry'
        THEN 'gateway_telemetry' ELSE 'replay_artifact' END;
    SELECT * INTO STRICT category_row FROM public.eve_retention_categories
    WHERE category = selected_category;
    IF category_row.metadata_only AND p_artifact_kind <> 'gateway_telemetry' THEN
        RAISE EXCEPTION 'eve_retention_metadata_only_category_mismatch';
    END IF;
    IF p_storage_path <> (
        p_tenant_id::TEXT || '/' || p_actor_profile_id::TEXT || '/' || p_id::TEXT ||
        CASE WHEN p_artifact_kind = 'debug' THEN '.txt' ELSE '.json' END
    )
    THEN
        RAISE EXCEPTION 'invalid_eve_replay_storage_path';
    END IF;
    expiry := NOW() + make_interval(days => category_row.retention_days);
    INSERT INTO public.eve_replay_artifacts (
        id, tenant_id, owner_profile_id, run_id, category, artifact_kind,
        storage_path, redacted_summary, expires_at
    ) VALUES (
        p_id, p_tenant_id, p_actor_profile_id, p_run_id, selected_category,
        p_artifact_kind, p_storage_path, p_redacted_summary, expiry
    );
    INSERT INTO public.eve_retention_lifecycle_events (
        tenant_id, actor_profile_id, action, target_type, target_id, detail
    ) VALUES (
        p_tenant_id, p_actor_profile_id, 'artifact.registered', 'artifact',
        p_id::TEXT, jsonb_build_object('category', selected_category, 'expiresAt', expiry)
    );
    RETURN expiry;
END;
$$;

CREATE OR REPLACE FUNCTION public.complete_eve_replay_artifact(
    p_id UUID,
    p_tenant_id UUID,
    p_actor_profile_id UUID,
    p_actor_role TEXT,
    p_content_type TEXT,
    p_byte_size BIGINT,
    p_sha256 TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    PERFORM public.assert_eve_retention_actor(p_tenant_id, p_actor_profile_id, p_actor_role);
    UPDATE public.eve_replay_artifacts SET
        content_type = p_content_type, byte_size = p_byte_size,
        sha256 = lower(p_sha256), status = 'available', uploaded_at = NOW(),
        updated_at = NOW()
    WHERE id = p_id AND tenant_id = p_tenant_id
      AND owner_profile_id = p_actor_profile_id AND status = 'upload_pending';
    IF NOT FOUND THEN RAISE EXCEPTION 'missing_eve_replay_artifact'; END IF;
    INSERT INTO public.eve_retention_lifecycle_events (
        tenant_id, actor_profile_id, action, target_type, target_id,
        detail
    ) VALUES (
        p_tenant_id, p_actor_profile_id, 'artifact.uploaded', 'artifact',
        p_id::TEXT, jsonb_build_object('byteSize', p_byte_size, 'contentType', p_content_type)
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.set_eve_retention_hold(
    p_tenant_id UUID,
    p_actor_profile_id UUID,
    p_actor_role TEXT,
    p_hold_type TEXT,
    p_scope_type TEXT,
    p_target_id TEXT,
    p_reason TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE hold_id UUID := gen_random_uuid();
BEGIN
    PERFORM public.assert_eve_retention_actor(p_tenant_id, p_actor_profile_id, p_actor_role);
    IF p_scope_type = 'artifact' THEN
        PERFORM 1 FROM public.eve_replay_artifacts artifact
        WHERE artifact.id::TEXT = p_target_id AND artifact.tenant_id = p_tenant_id
        FOR UPDATE;
        IF NOT FOUND THEN RAISE EXCEPTION 'missing_eve_replay_artifact'; END IF;
        IF EXISTS (
            SELECT 1 FROM public.eve_replay_artifacts artifact
            WHERE artifact.id::TEXT = p_target_id AND artifact.tenant_id = p_tenant_id
              AND artifact.deletion_started_at > NOW() - INTERVAL '15 minutes'
        ) THEN
            RAISE EXCEPTION 'eve_replay_artifact_deletion_in_progress';
        END IF;
        UPDATE public.eve_replay_artifacts SET
            deletion_started_at = NULL, updated_at = NOW()
        WHERE id::TEXT = p_target_id AND tenant_id = p_tenant_id
          AND deletion_started_at <= NOW() - INTERVAL '15 minutes';
    ELSIF p_scope_type = 'category' THEN
        PERFORM 1 FROM public.eve_retention_categories category
        WHERE category.category = p_target_id;
        IF NOT FOUND THEN RAISE EXCEPTION 'missing_eve_retention_category'; END IF;
        PERFORM 1 FROM public.eve_replay_artifacts artifact
        WHERE artifact.tenant_id = p_tenant_id AND artifact.category = p_target_id
          AND artifact.status <> 'expired'
        ORDER BY artifact.id
        FOR UPDATE;
        IF EXISTS (
            SELECT 1 FROM public.eve_replay_artifacts artifact
            WHERE artifact.tenant_id = p_tenant_id AND artifact.category = p_target_id
              AND artifact.deletion_started_at > NOW() - INTERVAL '15 minutes'
        ) THEN
            RAISE EXCEPTION 'eve_replay_artifact_deletion_in_progress';
        END IF;
        UPDATE public.eve_replay_artifacts SET
            deletion_started_at = NULL, updated_at = NOW()
        WHERE tenant_id = p_tenant_id AND category = p_target_id
          AND deletion_started_at <= NOW() - INTERVAL '15 minutes';
    ELSIF p_scope_type = 'audit_event' THEN
        PERFORM 1 FROM public.eve_audit_events audit_event
        WHERE audit_event.id::TEXT = p_target_id
          AND audit_event.tenant_id = p_tenant_id
        FOR UPDATE;
        IF NOT FOUND THEN RAISE EXCEPTION 'missing_eve_audit_event'; END IF;
    ELSIF p_scope_type = 'run_summary' THEN
        PERFORM 1
        FROM public.eve_run_summaries run_summary
        JOIN public.profiles initiator
          ON initiator.id = run_summary.initiated_by_profile_id
        WHERE run_summary.id::TEXT = p_target_id
          AND initiator.tenant_id = p_tenant_id
        FOR UPDATE OF run_summary;
        IF NOT FOUND THEN RAISE EXCEPTION 'missing_eve_run_summary'; END IF;
    END IF;
    INSERT INTO public.eve_retention_holds (
        id, tenant_id, hold_type, scope_type, target_id, reason, set_by_profile_id
    ) VALUES (
        hold_id, p_tenant_id, p_hold_type, p_scope_type, p_target_id,
        btrim(p_reason), p_actor_profile_id
    );
    INSERT INTO public.eve_retention_lifecycle_events (
        tenant_id, actor_profile_id, action, target_type, target_id, detail
    ) VALUES (
        p_tenant_id, p_actor_profile_id, 'hold.set', p_scope_type, p_target_id,
        jsonb_build_object('holdId', hold_id, 'holdType', p_hold_type)
    );
    RETURN hold_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.clear_eve_retention_hold(
    p_hold_id UUID,
    p_tenant_id UUID,
    p_actor_profile_id UUID,
    p_actor_role TEXT,
    p_reason TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE hold_row public.eve_retention_holds%ROWTYPE;
BEGIN
    PERFORM public.assert_eve_retention_actor(p_tenant_id, p_actor_profile_id, p_actor_role);
    SELECT * INTO hold_row FROM public.eve_retention_holds
    WHERE id = p_hold_id AND tenant_id = p_tenant_id AND status = 'active'
    FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'missing_eve_retention_hold'; END IF;
    UPDATE public.eve_retention_holds SET
        status = 'cleared', cleared_by_profile_id = p_actor_profile_id,
        cleared_reason = btrim(p_reason), cleared_at = NOW(), updated_at = NOW()
    WHERE id = p_hold_id;
    INSERT INTO public.eve_retention_lifecycle_events (
        tenant_id, actor_profile_id, action, target_type, target_id, detail
    ) VALUES (
        p_tenant_id, p_actor_profile_id, 'hold.cleared', hold_row.scope_type,
        hold_row.target_id, jsonb_build_object('holdId', p_hold_id)
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.claim_eve_replay_artifact_expiry(p_limit INTEGER DEFAULT 100)
RETURNS TABLE (id UUID, storage_bucket TEXT, storage_path TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    RETURN QUERY
    WITH candidates AS (
        SELECT artifact.id
        FROM public.eve_replay_artifacts artifact
        WHERE artifact.status IN ('upload_pending', 'available', 'delete_pending')
          AND artifact.expires_at <= NOW()
          AND (artifact.deletion_started_at IS NULL
            OR artifact.deletion_started_at <= NOW() - INTERVAL '15 minutes')
          AND NOT EXISTS (
              SELECT 1 FROM public.eve_retention_holds hold
              WHERE hold.tenant_id = artifact.tenant_id AND hold.status = 'active'
                AND ((hold.scope_type = 'artifact' AND hold.target_id = artifact.id::TEXT)
                  OR (hold.scope_type = 'category' AND hold.target_id = artifact.category))
          )
        ORDER BY artifact.expires_at
        FOR UPDATE SKIP LOCKED
        LIMIT LEAST(GREATEST(p_limit, 1), 500)
    ), claimed AS (
        UPDATE public.eve_replay_artifacts artifact SET
            status = 'delete_pending',
            deletion_started_at = NULL,
            storage_deleted_at = NULL,
            updated_at = NOW()
        FROM candidates WHERE artifact.id = candidates.id
        RETURNING artifact.id, artifact.tenant_id, artifact.owner_profile_id,
            artifact.storage_bucket, artifact.storage_path, artifact.status
    ), events AS (
        INSERT INTO public.eve_retention_lifecycle_events (
            tenant_id, actor_profile_id, action, target_type, target_id, detail
        ) SELECT claimed.tenant_id, claimed.owner_profile_id,
            'artifact.expiry_claimed', 'artifact', claimed.id::TEXT,
            jsonb_build_object('status', claimed.status) FROM claimed
    )
    SELECT claimed.id, claimed.storage_bucket, claimed.storage_path
    FROM claimed;
END;
$$;

CREATE OR REPLACE FUNCTION public.begin_eve_replay_artifact_deletion(p_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE artifact_row public.eve_replay_artifacts%ROWTYPE;
BEGIN
    SELECT * INTO artifact_row FROM public.eve_replay_artifacts
    WHERE id = p_id AND status = 'delete_pending'
    FOR UPDATE;
    IF NOT FOUND THEN RETURN FALSE; END IF;
    IF artifact_row.deletion_started_at > NOW() - INTERVAL '15 minutes' THEN
        RETURN FALSE;
    END IF;
    IF EXISTS (
        SELECT 1 FROM public.eve_retention_holds hold
        WHERE hold.tenant_id = artifact_row.tenant_id AND hold.status = 'active'
          AND ((hold.scope_type = 'artifact' AND hold.target_id = artifact_row.id::TEXT)
            OR (hold.scope_type = 'category' AND hold.target_id = artifact_row.category))
    ) THEN
        UPDATE public.eve_replay_artifacts SET
            deletion_started_at = NULL, updated_at = NOW()
        WHERE id = p_id;
        RETURN FALSE;
    END IF;
    UPDATE public.eve_replay_artifacts SET
        deletion_started_at = NOW(), updated_at = NOW()
    WHERE id = p_id;
    RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION public.release_eve_replay_artifact_deletion(p_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    UPDATE public.eve_replay_artifacts SET
        deletion_started_at = NULL, updated_at = NOW()
    WHERE id = p_id AND status = 'delete_pending';
END;
$$;

CREATE OR REPLACE FUNCTION public.finalize_eve_replay_artifact_expiry(p_ids UUID[])
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE affected INTEGER;
BEGIN
    WITH finalized AS (
        UPDATE public.eve_replay_artifacts SET
            status = 'expired', deletion_started_at = NULL,
            storage_deleted_at = NOW(), updated_at = NOW()
        WHERE id = ANY(p_ids) AND status = 'delete_pending'
          AND deletion_started_at IS NOT NULL
          AND NOT EXISTS (
              SELECT 1 FROM public.eve_retention_holds hold
              WHERE hold.tenant_id = eve_replay_artifacts.tenant_id
                AND hold.status = 'active'
                AND ((hold.scope_type = 'artifact'
                      AND hold.target_id = eve_replay_artifacts.id::TEXT)
                  OR (hold.scope_type = 'category'
                      AND hold.target_id = eve_replay_artifacts.category))
          )
        RETURNING id, tenant_id, owner_profile_id
    ), events AS (
        INSERT INTO public.eve_retention_lifecycle_events (
            tenant_id, actor_profile_id, action, target_type, target_id
        ) SELECT tenant_id, owner_profile_id, 'artifact.expired', 'artifact', id::TEXT
        FROM finalized
    ) SELECT count(*)::INTEGER INTO affected FROM finalized;
    RETURN affected;
END;
$$;

CREATE OR REPLACE FUNCTION public.expire_eve_retention_records(p_limit INTEGER DEFAULT 500)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE audit_count INTEGER := 0; run_count INTEGER := 0;
BEGIN
    WITH expired AS (
        DELETE FROM public.eve_audit_events event
        WHERE event.id IN (
            SELECT candidate.id FROM public.eve_audit_events candidate
            WHERE candidate.expires_at <= NOW() AND NOT EXISTS (
                SELECT 1 FROM public.eve_retention_holds hold
                WHERE hold.status = 'active'
                  AND hold.tenant_id = candidate.tenant_id
                  AND ((hold.scope_type = 'audit_event' AND hold.target_id = candidate.id::TEXT)
                    OR (hold.scope_type = 'category' AND hold.target_id = candidate.retention_category))
            ) ORDER BY candidate.expires_at LIMIT LEAST(GREATEST(p_limit, 1), 2000)
        ) RETURNING 1
    ) SELECT count(*)::INTEGER INTO audit_count FROM expired;
    WITH expired AS (
        DELETE FROM public.eve_run_summaries summary
        WHERE summary.id IN (
            SELECT candidate.id FROM public.eve_run_summaries candidate
            LEFT JOIN public.profiles initiator
                ON initiator.id = candidate.initiated_by_profile_id
            WHERE candidate.expires_at <= NOW() AND NOT EXISTS (
                SELECT 1 FROM public.eve_retention_holds hold
                WHERE hold.status = 'active'
                  AND hold.tenant_id = initiator.tenant_id
                  AND ((hold.scope_type = 'run_summary' AND hold.target_id = candidate.id::TEXT)
                    OR (hold.scope_type = 'category' AND hold.target_id = candidate.retention_category))
            ) ORDER BY candidate.expires_at LIMIT LEAST(GREATEST(p_limit, 1), 2000)
        ) RETURNING 1
    ) SELECT count(*)::INTEGER INTO run_count FROM expired;
    INSERT INTO public.eve_retention_lifecycle_events (
        action, target_type, target_id, detail
    ) VALUES (
        'records.expired', 'retention_batch', gen_random_uuid()::TEXT,
        jsonb_build_object('auditRecords', audit_count, 'runSummaries', run_count)
    );
    RETURN jsonb_build_object('auditRecords', audit_count, 'runSummaries', run_count);
END;
$$;

REVOKE ALL ON FUNCTION public.assert_eve_retention_actor(UUID, UUID, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.prepare_eve_replay_artifact(UUID, UUID, UUID, TEXT, UUID, TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.complete_eve_replay_artifact(UUID, UUID, UUID, TEXT, TEXT, BIGINT, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_eve_retention_hold(UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.clear_eve_retention_hold(UUID, UUID, UUID, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.claim_eve_replay_artifact_expiry(INTEGER) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.begin_eve_replay_artifact_deletion(UUID) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.release_eve_replay_artifact_deletion(UUID) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.finalize_eve_replay_artifact_expiry(UUID[]) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.expire_eve_retention_records(INTEGER) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.prepare_eve_replay_artifact(UUID, UUID, UUID, TEXT, UUID, TEXT, TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.complete_eve_replay_artifact(UUID, UUID, UUID, TEXT, TEXT, BIGINT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.set_eve_retention_hold(UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.clear_eve_retention_hold(UUID, UUID, UUID, TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.claim_eve_replay_artifact_expiry(INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION public.begin_eve_replay_artifact_deletion(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.release_eve_replay_artifact_deletion(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.finalize_eve_replay_artifact_expiry(UUID[]) TO service_role;
GRANT EXECUTE ON FUNCTION public.expire_eve_retention_records(INTEGER) TO service_role;

COMMENT ON TABLE public.eve_replay_artifacts IS
    'Queryable redacted metadata for private replay/debug bodies held in Supabase Storage; artifact content never belongs in Postgres.';
COMMENT ON TABLE public.eve_retention_holds IS
    'Human-set incident/legal lifecycle holds; these do not pause or widen Eve automation.';
