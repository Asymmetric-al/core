-- #436: safe, durable, off-by-default email and Discord operator notifications.

INSERT INTO public.eve_action_policy_catalog (
  action_id, trust_zone, write_class, governance_domain,
  budget_scope_type, budget_scope_id, request_cost, usd_micros_cost,
  input_token_cost, output_token_cost, is_active
) VALUES (
  'engineering.notification.deliver', 'engineering', 'operational', 'production_writes',
  'expensive_feature', 'operator-notifications', 1, 100, 0, 0, TRUE
) ON CONFLICT (action_id) DO UPDATE SET
  trust_zone = EXCLUDED.trust_zone,
  write_class = EXCLUDED.write_class,
  governance_domain = EXCLUDED.governance_domain,
  budget_scope_type = EXCLUDED.budget_scope_type,
  budget_scope_id = EXCLUDED.budget_scope_id,
  request_cost = EXCLUDED.request_cost,
  usd_micros_cost = EXCLUDED.usd_micros_cost,
  input_token_cost = EXCLUDED.input_token_cost,
  output_token_cost = EXCLUDED.output_token_cost,
  is_active = EXCLUDED.is_active;

INSERT INTO public.eve_operational_budgets (
  scope_type, scope_id, window_seconds, max_requests, max_usd_micros,
  max_input_tokens, max_output_tokens
) VALUES (
  'expensive_feature', 'operator-notifications', 3600, 120, 12000, 0, 0
) ON CONFLICT (scope_type, scope_id) DO UPDATE SET
  window_seconds = EXCLUDED.window_seconds,
  max_requests = EXCLUDED.max_requests,
  max_usd_micros = EXCLUDED.max_usd_micros,
  max_input_tokens = EXCLUDED.max_input_tokens,
  max_output_tokens = EXCLUDED.max_output_tokens,
  updated_at = NOW();

INSERT INTO public.eve_retention_categories (
  category, retention_days, metadata_only, description
) VALUES (
  'notification_record', 180, TRUE,
  'Redacted operator notification envelope and provider outcome metadata.'
) ON CONFLICT (category) DO UPDATE SET
  retention_days = EXCLUDED.retention_days,
  description = EXCLUDED.description,
  metadata_only = EXCLUDED.metadata_only,
  updated_at = NOW();

CREATE TABLE public.eve_notification_channel_configs (
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('email', 'discord')),
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  paused BOOLEAN NOT NULL DEFAULT TRUE,
  minimum_severity TEXT NOT NULL CHECK (minimum_severity IN ('low', 'medium', 'high', 'critical')),
  rich_detail_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  destination_key TEXT NOT NULL CHECK (
    (channel = 'email' AND destination_key = 'platform-owners') OR
    (channel = 'discord' AND destination_key = 'discord:ops-primary')
  ),
  dedupe_window_seconds INTEGER NOT NULL CHECK (dedupe_window_seconds BETWEEN 60 AND 2592000),
  max_attempts INTEGER NOT NULL CHECK (max_attempts BETWEEN 1 AND 10),
  retry_base_seconds INTEGER NOT NULL CHECK (retry_base_seconds BETWEEN 10 AND 3600),
  policy_version BIGINT NOT NULL CHECK (policy_version > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, channel)
);

CREATE TABLE public.eve_notification_recipient_configs (
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  opted_out BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, profile_id)
);

CREATE OR REPLACE FUNCTION public.validate_eve_notification_recipient()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = NEW.profile_id AND tenant_id = NEW.tenant_id
      AND role = 'super_admin' AND email IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'eve_notification_platform_owner_required';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER eve_notification_recipient_guard
BEFORE INSERT OR UPDATE ON public.eve_notification_recipient_configs
FOR EACH ROW EXECUTE FUNCTION public.validate_eve_notification_recipient();

CREATE TABLE public.eve_notification_records (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('email', 'discord')),
  destination_class TEXT NOT NULL CHECK (length(destination_class) BETWEEN 1 AND 300),
  recipient_profile_id UUID REFERENCES public.profiles(id) ON DELETE RESTRICT,
  safe_envelope JSONB NOT NULL CHECK (
    jsonb_typeof(safe_envelope) = 'object'
    AND safe_envelope ->> 'version' = 'eve-notification-v1'
    AND safe_envelope ->> 'sourceKind' = 'engineering_monitor'
    AND safe_envelope ->> 'redactionVersion' = 'eve-notification-redaction-v1'
    AND octet_length(safe_envelope::TEXT) <= 16384
    AND lower(safe_envelope::TEXT) !~ '(secret|password|token|donor|payment|prompt|reasoning|rawlog|replay)'
  ),
  dedupe_key TEXT NOT NULL CHECK (dedupe_key ~ '^[0-9a-f]{64}$'),
  idempotency_key TEXT NOT NULL CHECK (length(idempotency_key) BETWEEN 1 AND 200),
  status TEXT NOT NULL CHECK (status IN (
    'pending', 'suppressed', 'sending', 'delivered', 'retryable_failed',
    'terminal_failed', 'cancelled'
  )),
  attempt_count INTEGER NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
  next_attempt_at TIMESTAMPTZ NOT NULL,
  delivery_expires_at TIMESTAMPTZ NOT NULL,
  provider_message_id TEXT CHECK (provider_message_id IS NULL OR length(provider_message_id) <= 300),
  provider_response_class TEXT CHECK (provider_response_class IS NULL OR length(provider_response_class) <= 100),
  last_error_code TEXT CHECK (last_error_code IS NULL OR length(last_error_code) <= 100),
  lease_token UUID,
  lease_expires_at TIMESTAMPTZ,
  retention_category TEXT NOT NULL REFERENCES public.eve_retention_categories(category),
  retention_expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, dedupe_key),
  UNIQUE (tenant_id, idempotency_key),
  CHECK ((lease_token IS NULL) = (lease_expires_at IS NULL)),
  CHECK ((channel = 'email' AND recipient_profile_id IS NOT NULL) OR
         (channel = 'discord' AND recipient_profile_id IS NULL)),
  CHECK (delivery_expires_at > created_at),
  CHECK (retention_expires_at > created_at)
);

CREATE INDEX eve_notification_records_due_idx
  ON public.eve_notification_records (tenant_id, next_attempt_at)
  WHERE status IN ('pending', 'retryable_failed', 'sending');

CREATE TABLE public.eve_notification_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  notification_id UUID NOT NULL REFERENCES public.eve_notification_records(id) ON DELETE CASCADE,
  attempt_number INTEGER NOT NULL CHECK (attempt_number > 0),
  status TEXT NOT NULL CHECK (status IN ('suppressed', 'delivered', 'retryable_failed', 'terminal_failed', 'cancelled')),
  provider_response_class TEXT NOT NULL CHECK (length(provider_response_class) BETWEEN 1 AND 100),
  error_code TEXT CHECK (error_code IS NULL OR length(error_code) <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (notification_id, attempt_number)
);

ALTER TABLE public.eve_notification_channel_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eve_notification_recipient_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eve_notification_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eve_notification_attempts ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.eve_notification_channel_configs FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.eve_notification_recipient_configs FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.eve_notification_records FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.eve_notification_attempts FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.eve_notification_channel_configs TO service_role;
GRANT SELECT, INSERT, UPDATE ON TABLE public.eve_notification_recipient_configs TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.eve_notification_records TO service_role;
GRANT SELECT, INSERT ON TABLE public.eve_notification_attempts TO service_role;

CREATE OR REPLACE FUNCTION public.claim_due_eve_notification_records(
  p_tenant_id UUID, p_now TIMESTAMPTZ, p_limit INTEGER, p_lease_seconds INTEGER
) RETURNS SETOF public.eve_notification_records
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  claimed_id UUID;
  next_lease UUID;
BEGIN
  IF auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'eve_notification_service_role_required';
  END IF;
  IF p_limit NOT BETWEEN 1 AND 100 OR p_lease_seconds NOT BETWEEN 30 AND 900 THEN
    RAISE EXCEPTION 'invalid_eve_notification_lease';
  END IF;
  FOR claimed_id IN
    SELECT record.id
    FROM public.eve_notification_records AS record
    JOIN public.eve_notification_channel_configs AS config
      ON config.tenant_id = record.tenant_id AND config.channel = record.channel
    WHERE record.tenant_id = p_tenant_id
      AND config.enabled AND NOT config.paused
      AND record.next_attempt_at <= p_now AND record.delivery_expires_at > p_now
      AND (
        record.status IN ('pending', 'retryable_failed') OR
        (record.status = 'sending' AND record.lease_expires_at <= p_now)
      )
    ORDER BY record.next_attempt_at, record.created_at
    LIMIT p_limit FOR UPDATE OF record SKIP LOCKED
  LOOP
    next_lease := gen_random_uuid();
    UPDATE public.eve_notification_records SET
      status = 'sending', lease_token = next_lease,
      lease_expires_at = p_now + make_interval(secs => p_lease_seconds),
      updated_at = NOW()
    WHERE id = claimed_id AND tenant_id = p_tenant_id;
    RETURN QUERY SELECT * FROM public.eve_notification_records
      WHERE id = claimed_id AND tenant_id = p_tenant_id AND lease_token = next_lease;
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION public.complete_eve_notification_attempt(
  p_tenant_id UUID, p_notification_id UUID, p_lease_token UUID, p_status TEXT,
  p_provider_message_id TEXT, p_provider_response_class TEXT,
  p_error_code TEXT, p_next_attempt_at TIMESTAMPTZ
) RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  next_attempt INTEGER;
BEGIN
  IF auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'eve_notification_service_role_required';
  END IF;
  IF p_status NOT IN ('suppressed', 'delivered', 'retryable_failed', 'terminal_failed', 'cancelled') THEN
    RAISE EXCEPTION 'invalid_eve_notification_status';
  END IF;
  UPDATE public.eve_notification_records SET
    status = p_status, attempt_count = attempt_count + 1,
    next_attempt_at = COALESCE(p_next_attempt_at, next_attempt_at),
    provider_message_id = left(p_provider_message_id, 300),
    provider_response_class = left(p_provider_response_class, 100),
    last_error_code = left(p_error_code, 100), lease_token = NULL,
    lease_expires_at = NULL, updated_at = NOW()
  WHERE tenant_id = p_tenant_id AND id = p_notification_id
    AND status = 'sending' AND lease_token = p_lease_token
  RETURNING attempt_count INTO next_attempt;
  IF NOT FOUND THEN RAISE EXCEPTION 'stale_eve_notification_lease'; END IF;
  INSERT INTO public.eve_notification_attempts (
    tenant_id, notification_id, attempt_number, status,
    provider_response_class, error_code
  ) VALUES (
    p_tenant_id, p_notification_id, next_attempt, p_status,
    left(p_provider_response_class, 100), left(p_error_code, 100)
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.expire_eve_notification_records(
  p_limit INTEGER DEFAULT 500
) RETURNS INTEGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  IF auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'eve_notification_service_role_required';
  END IF;
  WITH expired AS (
    DELETE FROM public.eve_notification_records AS candidate
    WHERE candidate.id IN (
      SELECT record.id FROM public.eve_notification_records AS record
      WHERE record.retention_expires_at <= NOW()
        AND NOT EXISTS (
          SELECT 1 FROM public.eve_retention_holds AS hold
          WHERE hold.tenant_id = record.tenant_id AND hold.status = 'active'
            AND hold.scope_type = 'category'
            AND hold.target_id = record.retention_category
        )
      ORDER BY record.retention_expires_at
      LIMIT LEAST(GREATEST(p_limit, 1), 2000)
      FOR UPDATE SKIP LOCKED
    ) RETURNING tenant_id
  ) SELECT count(*)::INTEGER INTO expired_count FROM expired;
  IF expired_count > 0 THEN
    INSERT INTO public.eve_retention_lifecycle_events (
      tenant_id, action, target_type, target_id, detail
    ) SELECT
      NULL, 'records.expired', 'retention_batch', gen_random_uuid()::TEXT,
      jsonb_build_object('notificationRecords', expired_count);
  END IF;
  RETURN expired_count;
END;
$$;

REVOKE ALL ON FUNCTION public.validate_eve_notification_recipient() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.claim_due_eve_notification_records(UUID, TIMESTAMPTZ, INTEGER, INTEGER)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.complete_eve_notification_attempt(UUID, UUID, UUID, TEXT, TEXT, TEXT, TEXT, TIMESTAMPTZ)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.expire_eve_notification_records(INTEGER)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_due_eve_notification_records(UUID, TIMESTAMPTZ, INTEGER, INTEGER)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.complete_eve_notification_attempt(UUID, UUID, UUID, TEXT, TEXT, TEXT, TEXT, TIMESTAMPTZ)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.expire_eve_notification_records(INTEGER)
  TO service_role;

COMMENT ON TABLE public.eve_notification_records IS
  'Durable, deduplicated, redacted operator notifications. Webhook URLs and provider secrets are never persisted.';
