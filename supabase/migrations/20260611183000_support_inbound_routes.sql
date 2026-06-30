-- Tenant-owned inbound routing review and saved routes (Inngest durable
-- workflow executor). Additive only. Saved routes let known recipients,
-- aliases, and explicitly confirmed tenant-domain defaults route
-- automatically; unknown or ambiguous safe routes hold for lightweight
-- tenant staff review. Route changes never silently move already routed
-- messages. See openspec/changes/add-inngest-durable-workflow-executor.

CREATE TABLE IF NOT EXISTS public.support_inbound_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  scope TEXT NOT NULL CHECK (scope IN ('recipient', 'alias', 'domain_default')),
  match_value TEXT NOT NULL CHECK (char_length(match_value) BETWEEN 1 AND 320),
  inbox_id TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by_profile_id UUID,
  disabled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.support_inbound_routes IS
  'Tenant-scoped saved inbound email routes. Exact recipient or alias is the default scope; domain_default requires explicit staff confirmation. Deleting a route removes the future active rule only - audit history lives in support_audit_log.';

CREATE UNIQUE INDEX IF NOT EXISTS idx_support_inbound_routes_active_match
  ON public.support_inbound_routes (tenant_id, scope, match_value)
  WHERE is_active;

CREATE INDEX IF NOT EXISTS idx_support_inbound_routes_tenant
  ON public.support_inbound_routes (tenant_id, is_active);

CREATE TABLE IF NOT EXISTS public.support_inbound_routing_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  inbound_email_id UUID NOT NULL REFERENCES public.email_inbound_messages(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'resolved', 'dismissed')
  ),
  reason TEXT NOT NULL CHECK (reason IN ('no_route', 'ambiguous')),
  candidate_inbox_ids TEXT[] NOT NULL DEFAULT '{}',
  resolved_by_profile_id UUID,
  resolved_route_id UUID REFERENCES public.support_inbound_routes(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.support_inbound_routing_reviews IS
  'Lightweight tenant staff review for tenant-owned inbound email that does not match a known safe route (or matches multiple). Review exists to choose and save the correct route, not to inspect routine support mail.';

CREATE UNIQUE INDEX IF NOT EXISTS idx_support_inbound_routing_reviews_pending
  ON public.support_inbound_routing_reviews (tenant_id, inbound_email_id)
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_support_inbound_routing_reviews_tenant_status
  ON public.support_inbound_routing_reviews (tenant_id, status, created_at DESC);

DO $$
BEGIN
  EXECUTE 'DROP TRIGGER IF EXISTS set_support_inbound_routes_updated_at ON public.support_inbound_routes';
  EXECUTE 'CREATE TRIGGER set_support_inbound_routes_updated_at BEFORE UPDATE ON public.support_inbound_routes FOR EACH ROW EXECUTE FUNCTION public.set_workflow_dispatch_updated_at()';
  EXECUTE 'DROP TRIGGER IF EXISTS set_support_inbound_routing_reviews_updated_at ON public.support_inbound_routing_reviews';
  EXECUTE 'CREATE TRIGGER set_support_inbound_routing_reviews_updated_at BEFORE UPDATE ON public.support_inbound_routing_reviews FOR EACH ROW EXECUTE FUNCTION public.set_workflow_dispatch_updated_at()';
END $$;

ALTER TABLE public.support_inbound_routes ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.support_inbound_routes FROM anon;
REVOKE ALL ON TABLE public.support_inbound_routes FROM authenticated;
GRANT ALL ON TABLE public.support_inbound_routes TO service_role;

ALTER TABLE public.support_inbound_routing_reviews ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.support_inbound_routing_reviews FROM anon;
REVOKE ALL ON TABLE public.support_inbound_routing_reviews FROM authenticated;
GRANT ALL ON TABLE public.support_inbound_routing_reviews TO service_role;
