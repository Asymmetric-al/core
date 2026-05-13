-- Add explicit authenticated-role deny policies for Phase 3 finance tables.
--
-- The server-side admin client uses the service-role JWT through Supabase REST,
-- so the relations must be part of PostgREST's exposed schema cache. Browser
-- sessions still cannot read or mutate these rows: RLS remains enabled and
-- these policies always evaluate false for the authenticated role.

DROP POLICY IF EXISTS "phase3 stripe raw events deny authenticated" ON public.stripe_raw_events;
CREATE POLICY "phase3 stripe raw events deny authenticated"
  ON public.stripe_raw_events
  FOR ALL
  TO authenticated
  USING (false)
  WITH CHECK (false);

DROP POLICY IF EXISTS "phase3 staged gifts deny authenticated" ON public.staged_gifts;
CREATE POLICY "phase3 staged gifts deny authenticated"
  ON public.staged_gifts
  FOR ALL
  TO authenticated
  USING (false)
  WITH CHECK (false);

DROP POLICY IF EXISTS "phase3 staged gift allocations deny authenticated" ON public.staged_gift_allocations;
CREATE POLICY "phase3 staged gift allocations deny authenticated"
  ON public.staged_gift_allocations
  FOR ALL
  TO authenticated
  USING (false)
  WITH CHECK (false);

DROP POLICY IF EXISTS "phase3 staged gift audit events deny authenticated" ON public.staged_gift_audit_events;
CREATE POLICY "phase3 staged gift audit events deny authenticated"
  ON public.staged_gift_audit_events
  FOR ALL
  TO authenticated
  USING (false)
  WITH CHECK (false);

DROP POLICY IF EXISTS "phase3 donation crm links deny authenticated" ON public.donation_crm_links;
CREATE POLICY "phase3 donation crm links deny authenticated"
  ON public.donation_crm_links
  FOR ALL
  TO authenticated
  USING (false)
  WITH CHECK (false);

DROP POLICY IF EXISTS "phase3 giving reconciliation runs deny authenticated" ON public.giving_reconciliation_runs;
CREATE POLICY "phase3 giving reconciliation runs deny authenticated"
  ON public.giving_reconciliation_runs
  FOR ALL
  TO authenticated
  USING (false)
  WITH CHECK (false);

SELECT pg_notify('pgrst', 'reload schema');
