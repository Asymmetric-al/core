-- Keep Phase 3 finance tables server-only while making them visible to the
-- Supabase REST schema cache used by the service-role admin client.
--
-- Supabase/PostgREST only exposes relations that have API-role privileges in
-- the schema cache. These grants do not expose rows to browser sessions because
-- RLS stays enabled and no anon/authenticated policies are created for these
-- tables.

GRANT SELECT, INSERT, UPDATE ON TABLE public.stripe_raw_events TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.staged_gifts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.staged_gift_allocations TO authenticated;
GRANT SELECT, INSERT ON TABLE public.staged_gift_audit_events TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.donation_crm_links TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.giving_reconciliation_runs TO authenticated;
