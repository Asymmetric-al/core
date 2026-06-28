-- Email Studio donor correction notification support for contribution operations.

CREATE TABLE IF NOT EXISTS public.email_template_system_bindings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES public.email_templates(id) ON DELETE CASCADE,
    family_key TEXT NOT NULL,
    variant_key TEXT NOT NULL,
    required_merge_tags TEXT[] NOT NULL DEFAULT '{}'::text[],
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, family_key, variant_key)
);

CREATE TABLE IF NOT EXISTS public.contribution_notification_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL,
    mode TEXT NOT NULL DEFAULT 'staff_chooses'
        CHECK (mode IN ('auto_notify', 'always_ask', 'staff_chooses')),
    suppression_reason_required BOOLEAN NOT NULL DEFAULT FALSE,
    task_assignment_mode TEXT NOT NULL DEFAULT 'actor_and_queue'
        CHECK (task_assignment_mode IN ('actor_only', 'queue_only', 'actor_and_queue')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    UNIQUE (tenant_id, action_type)
);

CREATE TABLE IF NOT EXISTS public.contribution_notification_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    idempotency_key TEXT NOT NULL,
    operation_audit_event_id UUID REFERENCES public.contribution_operation_audit_events(id) ON DELETE SET NULL,
    correction_id UUID REFERENCES public.contribution_corrections(id) ON DELETE SET NULL,
    action_type TEXT NOT NULL,
    template_id UUID REFERENCES public.email_templates(id) ON DELETE SET NULL,
    template_version_id UUID REFERENCES public.email_template_versions(id) ON DELETE SET NULL,
    template_family TEXT,
    template_variant TEXT,
    template_version INTEGER,
    decision TEXT NOT NULL
        CHECK (decision IN ('sent', 'suppressed', 'blocked', 'failed', 'not_required')),
    policy_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    suppression_reason TEXT,
    personal_note_present BOOLEAN NOT NULL DEFAULT FALSE,
    recipient_donor_id UUID REFERENCES public.donors(id) ON DELETE SET NULL,
    recipient_email TEXT,
    email_send_log_id UUID REFERENCES public.email_send_logs(id) ON DELETE SET NULL,
    provider_status TEXT,
    provider_message_id TEXT,
    error_code TEXT,
    error_message TEXT,
    task_ids UUID[] NOT NULL DEFAULT '{}'::uuid[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sent_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_email_template_system_bindings_tenant_family
    ON public.email_template_system_bindings (tenant_id, family_key, variant_key);

CREATE INDEX IF NOT EXISTS idx_contribution_notification_settings_tenant_action
    ON public.contribution_notification_settings (tenant_id, action_type);

CREATE INDEX IF NOT EXISTS idx_contribution_notification_events_tenant_audit
    ON public.contribution_notification_events (tenant_id, operation_audit_event_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contribution_notification_events_recipient
    ON public.contribution_notification_events (tenant_id, recipient_donor_id, created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_contribution_notification_events_idempotency
    ON public.contribution_notification_events (tenant_id, idempotency_key);

CREATE OR REPLACE FUNCTION public.enforce_contribution_notification_tenant_refs()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $function$
DECLARE
    row_data JSONB;
    row_tenant_id UUID;
    ref_id UUID;
    ref_tenant_id UUID;
BEGIN
    row_data := to_jsonb(NEW);
    row_tenant_id := (row_data ->> 'tenant_id')::uuid;

    IF row_tenant_id IS NULL THEN
        RAISE EXCEPTION 'contribution notification tenant is required'
            USING ERRCODE = '23502';
    END IF;

    IF
        row_data ? 'updated_by'
        AND (row_data ->> 'updated_by') IS NOT NULL
    THEN
        ref_id := (row_data ->> 'updated_by')::uuid;
        SELECT p.tenant_id
        INTO ref_tenant_id
        FROM public.profiles AS p
        WHERE p.id = ref_id;

        IF FOUND AND ref_tenant_id IS DISTINCT FROM row_tenant_id THEN
            RAISE EXCEPTION 'contribution notification updater profile tenant mismatch'
                USING ERRCODE = '23514';
        END IF;
    END IF;

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

DROP TRIGGER IF EXISTS enforce_email_template_system_bindings_tenant_refs
    ON public.email_template_system_bindings;

CREATE TRIGGER enforce_email_template_system_bindings_tenant_refs
    BEFORE INSERT OR UPDATE OF
        tenant_id,
        template_id
    ON public.email_template_system_bindings
    FOR EACH ROW
    EXECUTE FUNCTION public.enforce_contribution_notification_tenant_refs();

DROP TRIGGER IF EXISTS enforce_contribution_notification_settings_tenant_refs
    ON public.contribution_notification_settings;

CREATE TRIGGER enforce_contribution_notification_settings_tenant_refs
    BEFORE INSERT OR UPDATE OF
        tenant_id,
        updated_by
    ON public.contribution_notification_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.enforce_contribution_notification_tenant_refs();

DROP TRIGGER IF EXISTS enforce_contribution_notification_events_tenant_refs
    ON public.contribution_notification_events;

CREATE TRIGGER enforce_contribution_notification_events_tenant_refs
    BEFORE INSERT OR UPDATE OF
        tenant_id,
        operation_audit_event_id,
        correction_id,
        template_id,
        template_version_id,
        recipient_donor_id
    ON public.contribution_notification_events
    FOR EACH ROW
    EXECUTE FUNCTION public.enforce_contribution_notification_tenant_refs();

ALTER TABLE public.email_template_system_bindings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contribution_notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contribution_notification_events ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.email_template_system_bindings FROM anon, authenticated;
REVOKE ALL ON TABLE public.contribution_notification_settings FROM anon, authenticated;
REVOKE ALL ON TABLE public.contribution_notification_events FROM anon, authenticated;

GRANT ALL ON TABLE public.email_template_system_bindings TO service_role;
GRANT ALL ON TABLE public.contribution_notification_settings TO service_role;
GRANT ALL ON TABLE public.contribution_notification_events TO service_role;
