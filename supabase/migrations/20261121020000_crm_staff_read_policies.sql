-- Mission Control CRM reads use the active staff assignment. Existing false
-- policies on staging tables remain in force for writes. The own-missionary
-- policy still limits a missionary assignment to that person's row.
BEGIN;
SET LOCAL lock_timeout = '5s';

GRANT SELECT (tenant_id, location, created_at, updated_at)
  ON public.missionaries TO authenticated;

GRANT SELECT (tenant_id, id, existing_donor_id, incoming_donor_id, status)
  ON public.donor_merge_candidates TO authenticated;

GRANT SELECT (tenant_id, ownership_mode, suppressed_gates, stronger_approval_categories)
  ON public.contribution_approval_policies TO authenticated;

GRANT SELECT (tenant_id, donation_id, status)
  ON public.contribution_corrections TO authenticated;

GRANT SELECT (tenant_id, donation_id, status)
  ON public.contribution_correction_requests TO authenticated;

GRANT SELECT (tenant_id, id, donation_id, status, effective_values, created_at)
  ON public.contribution_adjustments TO authenticated;

GRANT SELECT (tenant_id, profile_id, table_id, pinned_action_id, schema_version, settings)
  ON public.crm_table_user_preferences TO authenticated;

GRANT SELECT (tenant_id, table_id, pinned_action_id, schema_version, settings)
  ON public.crm_table_tenant_defaults TO authenticated;

GRANT SELECT (tenant_id, profile_id, table_id, id, name, is_default, schema_version, pinned_action_id, settings)
  ON public.crm_table_named_views TO authenticated;

REVOKE SELECT ON public.staged_gifts, public.staged_gift_allocations, public.donation_crm_links FROM authenticated;

GRANT SELECT (id, tenant_id, donation_id, fund_id, missionary_id, receipt_status, crm_post_status, status, twenty_record_id, posted_at, created_at)
  ON public.staged_gifts TO authenticated;

GRANT SELECT (id, tenant_id, staged_gift_id, amount, fund_id, missionary_id, memo, created_at)
  ON public.staged_gift_allocations TO authenticated;

GRANT SELECT (id, tenant_id, donation_id, staged_gift_id, scope, link_status, twenty_record_id, updated_at)
  ON public.donation_crm_links TO authenticated;

CREATE POLICY "crm staff read" ON public.missionaries
  FOR SELECT TO authenticated
  USING (
    tenant_id = (SELECT authz.current_tenant_id())
    AND (SELECT authz.assignment_is('staff'))
  );

CREATE POLICY "crm staff read" ON public.donor_merge_candidates
  FOR SELECT TO authenticated
  USING (
    tenant_id = (SELECT authz.current_tenant_id())
    AND (SELECT authz.assignment_is('staff'))
  );

CREATE POLICY "crm staff read" ON public.contribution_approval_policies
  FOR SELECT TO authenticated
  USING (
    tenant_id = (SELECT authz.current_tenant_id())
    AND (SELECT authz.assignment_is('staff'))
  );

CREATE POLICY "crm staff read" ON public.contribution_corrections
  FOR SELECT TO authenticated
  USING (
    tenant_id = (SELECT authz.current_tenant_id())
    AND (SELECT authz.assignment_is('staff'))
  );

CREATE POLICY "crm staff read" ON public.contribution_correction_requests
  FOR SELECT TO authenticated
  USING (
    tenant_id = (SELECT authz.current_tenant_id())
    AND (SELECT authz.assignment_is('staff'))
  );

CREATE POLICY "crm staff read" ON public.contribution_adjustments
  FOR SELECT TO authenticated
  USING (
    tenant_id = (SELECT authz.current_tenant_id())
    AND (SELECT authz.assignment_is('staff'))
  );

CREATE POLICY "crm staff read" ON public.crm_table_user_preferences
  FOR SELECT TO authenticated
  USING (
    tenant_id = (SELECT authz.current_tenant_id())
    AND (SELECT authz.assignment_is('staff'))
    AND profile_id IN (SELECT authz.caller_profile_ids())
  );

CREATE POLICY "crm staff read" ON public.crm_table_tenant_defaults
  FOR SELECT TO authenticated
  USING (
    tenant_id = (SELECT authz.current_tenant_id())
    AND (SELECT authz.assignment_is('staff'))
  );

CREATE POLICY "crm staff read" ON public.crm_table_named_views
  FOR SELECT TO authenticated
  USING (
    tenant_id = (SELECT authz.current_tenant_id())
    AND (SELECT authz.assignment_is('staff'))
    AND profile_id IN (SELECT authz.caller_profile_ids())
  );

CREATE POLICY "crm staff read" ON public.staged_gifts
  FOR SELECT TO authenticated
  USING (
    tenant_id = (SELECT authz.current_tenant_id())
    AND (SELECT authz.assignment_is('staff'))
  );

CREATE POLICY "crm staff read" ON public.staged_gift_allocations
  FOR SELECT TO authenticated
  USING (
    tenant_id = (SELECT authz.current_tenant_id())
    AND (SELECT authz.assignment_is('staff'))
  );

CREATE POLICY "crm staff read" ON public.donation_crm_links
  FOR SELECT TO authenticated
  USING (
    tenant_id = (SELECT authz.current_tenant_id())
    AND (SELECT authz.assignment_is('staff'))
  );

NOTIFY pgrst, 'reload schema';
COMMIT;
