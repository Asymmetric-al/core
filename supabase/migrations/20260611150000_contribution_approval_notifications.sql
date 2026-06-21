-- Approval tasks, notifications, and SLA tracking for correction requests
-- (ADR-CD-026 / ADR-CD-027 / ADR-CD-028).

CREATE TABLE IF NOT EXISTS public.contribution_approval_notification_settings (
    tenant_id UUID PRIMARY KEY REFERENCES public.tenants(id) ON DELETE CASCADE,
    create_approval_task BOOLEAN NOT NULL DEFAULT TRUE,
    in_app_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    email_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.contribution_approval_notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    in_app_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    email_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, profile_id)
);

-- Idempotent, deduplicated delivery records for approval workflow
-- notifications (approval requested, reminders, escalations, outcomes).
CREATE TABLE IF NOT EXISTS public.contribution_approval_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    correction_request_id UUID NOT NULL REFERENCES public.contribution_correction_requests(id) ON DELETE CASCADE,
    recipient_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    channel TEXT NOT NULL CHECK (channel IN ('in_app', 'email')),
    kind TEXT NOT NULL
        CHECK (kind IN ('approval_requested', 'reminder', 'escalation', 'outcome')),
    dedupe_key TEXT NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, dedupe_key)
);

CREATE INDEX IF NOT EXISTS idx_contribution_approval_notifications_request
    ON public.contribution_approval_notifications (tenant_id, correction_request_id, created_at DESC);

DO $$
BEGIN
    ALTER TABLE public.contribution_correction_requests
        ADD CONSTRAINT contribution_correction_requests_approval_task_id_fkey
        FOREIGN KEY (approval_task_id)
        REFERENCES public.mission_control_tasks(id)
        ON DELETE SET NULL;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END;
$$;

DO $$
BEGIN
    ALTER TABLE public.contribution_correction_requests
        ADD CONSTRAINT contribution_correction_requests_follow_up_task_id_fkey
        FOREIGN KEY (follow_up_task_id)
        REFERENCES public.mission_control_tasks(id)
        ON DELETE SET NULL;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.enforce_contribution_operation_tenant_refs()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
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
BEGIN
    row_data := to_jsonb(NEW);
    row_tenant_id := (row_data ->> 'tenant_id')::uuid;

    IF row_data ? 'profile_id' AND (row_data ->> 'profile_id') IS NOT NULL THEN
        ref_id := (row_data ->> 'profile_id')::uuid;
        SELECT p.tenant_id
        INTO ref_tenant_id
        FROM public.profiles AS p
        WHERE p.id = ref_id;

        IF FOUND AND ref_tenant_id IS DISTINCT FROM row_tenant_id THEN
            RAISE EXCEPTION 'contribution operation profile tenant mismatch'
                USING ERRCODE = '23514';
        END IF;
    END IF;

    IF
        row_data ? 'recipient_profile_id'
        AND (row_data ->> 'recipient_profile_id') IS NOT NULL
    THEN
        ref_id := (row_data ->> 'recipient_profile_id')::uuid;
        SELECT p.tenant_id
        INTO ref_tenant_id
        FROM public.profiles AS p
        WHERE p.id = ref_id;

        IF FOUND AND ref_tenant_id IS DISTINCT FROM row_tenant_id THEN
            RAISE EXCEPTION 'contribution operation recipient profile tenant mismatch'
                USING ERRCODE = '23514';
        END IF;
    END IF;

    IF row_data ? 'updated_by' AND (row_data ->> 'updated_by') IS NOT NULL THEN
        ref_id := (row_data ->> 'updated_by')::uuid;
        SELECT p.tenant_id
        INTO ref_tenant_id
        FROM public.profiles AS p
        WHERE p.id = ref_id;

        IF FOUND AND ref_tenant_id IS DISTINCT FROM row_tenant_id THEN
            RAISE EXCEPTION 'contribution operation updater profile tenant mismatch'
                USING ERRCODE = '23514';
        END IF;
    END IF;

    IF
        row_data ? 'requested_by_profile_id'
        AND (row_data ->> 'requested_by_profile_id') IS NOT NULL
    THEN
        ref_id := (row_data ->> 'requested_by_profile_id')::uuid;
        SELECT p.tenant_id
        INTO ref_tenant_id
        FROM public.profiles AS p
        WHERE p.id = ref_id;

        IF FOUND AND ref_tenant_id IS DISTINCT FROM row_tenant_id THEN
            RAISE EXCEPTION 'contribution operation requester profile tenant mismatch'
                USING ERRCODE = '23514';
        END IF;
    END IF;

    IF
        row_data ? 'decided_by_profile_id'
        AND (row_data ->> 'decided_by_profile_id') IS NOT NULL
    THEN
        ref_id := (row_data ->> 'decided_by_profile_id')::uuid;
        SELECT p.tenant_id
        INTO ref_tenant_id
        FROM public.profiles AS p
        WHERE p.id = ref_id;

        IF FOUND AND ref_tenant_id IS DISTINCT FROM row_tenant_id THEN
            RAISE EXCEPTION 'contribution operation decider profile tenant mismatch'
                USING ERRCODE = '23514';
        END IF;
    END IF;

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

DROP TRIGGER IF EXISTS enforce_contribution_correction_requests_tenant_refs
    ON public.contribution_correction_requests;

CREATE TRIGGER enforce_contribution_correction_requests_tenant_refs
    BEFORE INSERT OR UPDATE OF
        tenant_id,
        donation_id,
        requested_by_profile_id,
        decided_by_profile_id,
        applied_adjustment_id,
        approval_task_id,
        follow_up_task_id
    ON public.contribution_correction_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.enforce_contribution_operation_tenant_refs();

DROP TRIGGER IF EXISTS enforce_contribution_approval_settings_tenant_refs
    ON public.contribution_approval_notification_settings;

CREATE TRIGGER enforce_contribution_approval_settings_tenant_refs
    BEFORE INSERT OR UPDATE OF
        tenant_id,
        updated_by
    ON public.contribution_approval_notification_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.enforce_contribution_operation_tenant_refs();

DROP TRIGGER IF EXISTS enforce_contribution_approval_preferences_tenant_refs
    ON public.contribution_approval_notification_preferences;

CREATE TRIGGER enforce_contribution_approval_preferences_tenant_refs
    BEFORE INSERT OR UPDATE OF
        tenant_id,
        profile_id
    ON public.contribution_approval_notification_preferences
    FOR EACH ROW
    EXECUTE FUNCTION public.enforce_contribution_operation_tenant_refs();

DROP TRIGGER IF EXISTS enforce_contribution_approval_notifications_tenant_refs
    ON public.contribution_approval_notifications;

CREATE TRIGGER enforce_contribution_approval_notifications_tenant_refs
    BEFORE INSERT OR UPDATE OF
        tenant_id,
        correction_request_id,
        recipient_profile_id
    ON public.contribution_approval_notifications
    FOR EACH ROW
    EXECUTE FUNCTION public.enforce_contribution_operation_tenant_refs();

ALTER TABLE public.contribution_correction_requests
    ADD COLUMN IF NOT EXISTS last_reminder_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS escalated_at TIMESTAMPTZ;

ALTER TABLE public.contribution_approval_notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contribution_approval_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contribution_approval_notifications ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.contribution_approval_notification_settings FROM anon, authenticated;
REVOKE ALL ON TABLE public.contribution_approval_notification_preferences FROM anon, authenticated;
REVOKE ALL ON TABLE public.contribution_approval_notifications FROM anon, authenticated;

GRANT ALL ON TABLE public.contribution_approval_notification_settings TO service_role;
GRANT ALL ON TABLE public.contribution_approval_notification_preferences TO service_role;
GRANT ALL ON TABLE public.contribution_approval_notifications TO service_role;
