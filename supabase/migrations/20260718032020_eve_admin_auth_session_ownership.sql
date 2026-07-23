-- Eve admin auth and session ownership (issue #426, ADR-0027).
--
-- Eve owns durable conversation state. This table stores only the app-owned
-- authorization binding needed to decide who may create, continue, cancel,
-- or stream a durable session. Browser roles receive no table access.

CREATE TABLE public.eve_session_ownership (
    session_id TEXT PRIMARY KEY CHECK (
        char_length(btrim(session_id)) BETWEEN 1 AND 200
    ),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    owner_actor_id TEXT NOT NULL CHECK (
        char_length(btrim(owner_actor_id)) BETWEEN 1 AND 200
    ),
    owner_profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    identity_mode TEXT NOT NULL CHECK (
        identity_mode IN ('admin', 'service')
    ),
    actor_role TEXT,
    initiator_type TEXT NOT NULL CHECK (
        initiator_type IN (
            'authenticated_admin',
            'admin',
            'schedule',
            'system'
        )
    ),
    initiator_id TEXT NOT NULL CHECK (
        char_length(btrim(initiator_id)) BETWEEN 1 AND 200
    ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (
        (
            identity_mode = 'admin'
            AND owner_profile_id IS NOT NULL
            AND initiator_type = 'authenticated_admin'
            AND initiator_id = owner_actor_id
        )
        OR (
            identity_mode = 'service'
            AND owner_profile_id IS NULL
            AND initiator_type IN ('admin', 'schedule', 'system')
        )
    )
);

CREATE INDEX eve_session_ownership_tenant_owner_idx
    ON public.eve_session_ownership (
        tenant_id,
        identity_mode,
        owner_actor_id,
        owner_profile_id
    );

ALTER TABLE public.eve_session_ownership ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.eve_session_ownership
    FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.eve_session_ownership
    TO service_role;
