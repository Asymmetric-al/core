-- Eve specialist delegation and shared run context (issue #433, ADR-0034).
-- Shared context is append-only governance metadata. Eve's workflow host still
-- owns durable session and subagent execution state.

INSERT INTO public.eve_action_policy_catalog (
    action_id, trust_zone, write_class, governance_domain,
    budget_scope_type, budget_scope_id, request_cost, usd_micros_cost,
    input_token_cost, output_token_cost
) VALUES
    (
        'engineering.subagent.delegate', 'engineering', 'operational',
        'production_writes', 'dynamic_workflow', 'specialist-delegation',
        1, 1000, 100, 50
    ),
    (
        'engineering.shared_context.write', 'engineering', 'operational',
        'production_writes', 'expensive_feature', 'shared-context-write',
        1, 100, 20, 20
    ),
    (
        'engineering.shared_context.resolve', 'engineering', 'operational',
        'production_writes', 'expensive_feature', 'shared-context-resolve',
        1, 100, 20, 20
    );

INSERT INTO public.eve_operational_budgets (
    scope_type, scope_id, max_requests, max_input_tokens,
    max_output_tokens, max_usd_micros, window_seconds
) VALUES
    ('dynamic_workflow', 'specialist-delegation', 60, 60000, 12000, 60000, 3600),
    ('expensive_feature', 'shared-context-write', 300, 6000, 6000, 30000, 3600),
    ('expensive_feature', 'shared-context-resolve', 30, 600, 600, 3000, 3600);

CREATE TABLE public.eve_shared_context_claims (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    root_session_id TEXT NOT NULL,
    session_id TEXT NOT NULL,
    accountable_run_id TEXT NOT NULL,
    writer_subagent_id TEXT NOT NULL,
    schema_version INTEGER NOT NULL CHECK (schema_version = 1),
    category TEXT NOT NULL CHECK (category IN (
        'pr_metadata', 'issue_scope', 'decision', 'eval_status', 'finding',
        'safe_page_context'
    )),
    field_path TEXT NOT NULL CHECK (field_path ~ '^[a-z][a-z0-9_.-]{0,199}$'),
    value JSONB NOT NULL,
    provenance JSONB NOT NULL,
    confidence_bps INTEGER NOT NULL CHECK (confidence_bps BETWEEN 0 AND 10000),
    risk TEXT NOT NULL CHECK (risk IN ('low', 'medium', 'high', 'protected')),
    evidence JSONB NOT NULL CHECK (jsonb_typeof(evidence) = 'array' AND jsonb_array_length(evidence) > 0),
    relationship TEXT NOT NULL CHECK (relationship IN ('independent', 'supports', 'contradicts', 'supersedes')),
    related_claim_ids UUID[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT eve_shared_context_claims_relationship_shape CHECK (
        (relationship = 'independent' AND cardinality(related_claim_ids) = 0)
        OR (relationship <> 'independent' AND cardinality(related_claim_ids) > 0)
    ),
    CONSTRAINT eve_shared_context_claims_attribution_nonempty CHECK (
        length(trim(root_session_id)) > 0 AND
        length(trim(session_id)) > 0 AND
        length(trim(accountable_run_id)) > 0 AND
        length(trim(writer_subagent_id)) > 0 AND
        jsonb_typeof(provenance) = 'object'
    )
);

CREATE TABLE public.eve_shared_context_conflicts (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    root_session_id TEXT NOT NULL,
    field_path TEXT NOT NULL,
    claim_ids UUID[] NOT NULL CHECK (cardinality(claim_ids) >= 2),
    risk TEXT NOT NULL CHECK (risk IN ('low', 'medium', 'high', 'protected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.eve_shared_context_resolutions (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    conflict_id UUID NOT NULL UNIQUE REFERENCES public.eve_shared_context_conflicts(id) ON DELETE RESTRICT,
    resolver_actor_id TEXT NOT NULL,
    policy_id TEXT NOT NULL,
    selected_claim_ids UUID[] NOT NULL CHECK (cardinality(selected_claim_ids) >= 1),
    evidence JSONB NOT NULL CHECK (jsonb_typeof(evidence) = 'array' AND jsonb_array_length(evidence) > 0),
    outcome TEXT NOT NULL CHECK (length(trim(outcome)) BETWEEN 1 AND 2000),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX eve_shared_context_claims_run_created_idx
    ON public.eve_shared_context_claims (tenant_id, root_session_id, created_at, id);
CREATE INDEX eve_shared_context_claims_field_idx
    ON public.eve_shared_context_claims (tenant_id, root_session_id, field_path, created_at);
CREATE INDEX eve_shared_context_conflicts_run_idx
    ON public.eve_shared_context_conflicts (tenant_id, root_session_id, created_at);

ALTER TABLE public.eve_shared_context_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eve_shared_context_conflicts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eve_shared_context_resolutions ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.eve_shared_context_claims FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.eve_shared_context_conflicts FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.eve_shared_context_resolutions FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT ON TABLE public.eve_shared_context_claims TO service_role;
GRANT SELECT, INSERT ON TABLE public.eve_shared_context_conflicts TO service_role;
GRANT SELECT, INSERT ON TABLE public.eve_shared_context_resolutions TO service_role;

CREATE OR REPLACE FUNCTION public.append_eve_shared_context_claim(
    p_claim JSONB,
    p_conflict JSONB DEFAULT NULL
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    claim_tenant UUID := (p_claim ->> 'tenant_id')::UUID;
    claim_id UUID := (p_claim ->> 'id')::UUID;
    claim_root TEXT := p_claim ->> 'root_session_id';
    related_claim_ids UUID[] := ARRAY(
        SELECT jsonb_array_elements_text(p_claim -> 'related_claim_ids')::UUID
    );
    conflict_id UUID;
    conflict_claim_ids UUID[];
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM public.eve_session_ownership ownership
        WHERE ownership.session_id = claim_root
          AND ownership.tenant_id = claim_tenant
    ) THEN
        RAISE EXCEPTION 'eve_shared_context_session_ownership_required';
    END IF;

    IF p_claim ->> 'relationship' <> 'independent'
       AND EXISTS (
           SELECT 1
           FROM unnest(related_claim_ids) related_id
           LEFT JOIN public.eve_shared_context_claims related
             ON related.id = related_id
            AND related.tenant_id = claim_tenant
            AND related.root_session_id = claim_root
            AND related.field_path = p_claim ->> 'field_path'
           WHERE related.id IS NULL
       )
    THEN
        RAISE EXCEPTION 'invalid_eve_shared_context_relationship';
    END IF;

    INSERT INTO public.eve_shared_context_claims (
        id, tenant_id, root_session_id, session_id, accountable_run_id,
        writer_subagent_id, schema_version, category, field_path, value,
        provenance, confidence_bps, risk, evidence, relationship,
        related_claim_ids, created_at
    ) VALUES (
        claim_id,
        claim_tenant,
        claim_root,
        p_claim ->> 'session_id',
        p_claim ->> 'accountable_run_id',
        p_claim ->> 'writer_subagent_id',
        (p_claim ->> 'schema_version')::INTEGER,
        p_claim ->> 'category',
        p_claim ->> 'field_path',
        p_claim -> 'value',
        p_claim -> 'provenance',
        (p_claim ->> 'confidence_bps')::INTEGER,
        p_claim ->> 'risk',
        p_claim -> 'evidence',
        p_claim ->> 'relationship',
        related_claim_ids,
        (p_claim ->> 'created_at')::TIMESTAMPTZ
    );

    IF p_conflict IS NULL THEN
        RETURN;
    END IF;

    conflict_id := (p_conflict ->> 'id')::UUID;
    conflict_claim_ids := ARRAY(
        SELECT jsonb_array_elements_text(p_conflict -> 'claim_ids')::UUID
    );
    IF (p_conflict ->> 'tenant_id')::UUID <> claim_tenant
       OR p_conflict ->> 'root_session_id' <> claim_root
       OR p_conflict ->> 'field_path' <> p_claim ->> 'field_path'
       OR NOT claim_id = ANY(conflict_claim_ids)
       OR EXISTS (
           SELECT 1
           FROM unnest(conflict_claim_ids) related_id
           LEFT JOIN public.eve_shared_context_claims related
             ON related.id = related_id
            AND related.tenant_id = claim_tenant
            AND related.root_session_id = claim_root
            AND related.field_path = p_claim ->> 'field_path'
           WHERE related.id IS NULL
       )
    THEN
        RAISE EXCEPTION 'invalid_eve_shared_context_conflict';
    END IF;

    INSERT INTO public.eve_shared_context_conflicts (
        id, tenant_id, root_session_id, field_path, claim_ids, risk, created_at
    ) VALUES (
        conflict_id,
        claim_tenant,
        claim_root,
        p_conflict ->> 'field_path',
        conflict_claim_ids,
        p_conflict ->> 'risk',
        (p_conflict ->> 'created_at')::TIMESTAMPTZ
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.resolve_eve_shared_context_conflict(
    p_resolution JSONB
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    resolution_tenant UUID := (p_resolution ->> 'tenant_id')::UUID;
    resolution_conflict UUID := (p_resolution ->> 'conflict_id')::UUID;
    selected_ids UUID[] := ARRAY(
        SELECT jsonb_array_elements_text(p_resolution -> 'selected_claim_ids')::UUID
    );
    conflict_claim_ids UUID[];
BEGIN
    SELECT claim_ids INTO conflict_claim_ids
    FROM public.eve_shared_context_conflicts
    WHERE id = resolution_conflict
      AND tenant_id = resolution_tenant
    FOR UPDATE;

    IF conflict_claim_ids IS NULL OR NOT selected_ids <@ conflict_claim_ids THEN
        RAISE EXCEPTION 'invalid_eve_shared_context_resolution';
    END IF;

    INSERT INTO public.eve_shared_context_resolutions (
        id, tenant_id, conflict_id, resolver_actor_id, policy_id,
        selected_claim_ids, evidence, outcome, created_at
    ) VALUES (
        (p_resolution ->> 'id')::UUID,
        resolution_tenant,
        resolution_conflict,
        p_resolution ->> 'resolver_actor_id',
        p_resolution ->> 'policy_id',
        selected_ids,
        p_resolution -> 'evidence',
        p_resolution ->> 'outcome',
        (p_resolution ->> 'created_at')::TIMESTAMPTZ
    );
END;
$$;

REVOKE ALL ON FUNCTION public.append_eve_shared_context_claim(JSONB, JSONB)
    FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.resolve_eve_shared_context_conflict(JSONB)
    FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.append_eve_shared_context_claim(JSONB, JSONB)
    TO service_role;
GRANT EXECUTE ON FUNCTION public.resolve_eve_shared_context_conflict(JSONB)
    TO service_role;
