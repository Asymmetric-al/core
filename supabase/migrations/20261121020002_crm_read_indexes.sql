-- Each list order ends in the donor ID so a keyset page has a stable tie
-- breaker. Both directions place nulls last except ascending last gift,
-- which is the backward scan of its descending index.
BEGIN;
SET LOCAL lock_timeout = '5s';

CREATE INDEX crm_donors_tenant_updated_at_desc_idx
  ON public.donors (tenant_id, updated_at DESC NULLS LAST, id DESC);
CREATE INDEX crm_donors_tenant_updated_at_asc_idx
  ON public.donors (tenant_id, updated_at, id);

CREATE INDEX crm_donors_tenant_created_at_desc_idx
  ON public.donors (tenant_id, created_at DESC NULLS LAST, id DESC);
CREATE INDEX crm_donors_tenant_created_at_asc_idx
  ON public.donors (tenant_id, created_at, id);

CREATE INDEX crm_donors_tenant_name_desc_idx
  ON public.donors (tenant_id, name DESC NULLS LAST, id DESC)
  WHERE GREATEST(octet_length(name), octet_length(type), octet_length(status), 0) <= 1536;
CREATE INDEX crm_donors_tenant_name_asc_idx
  ON public.donors (tenant_id, name, id)
  WHERE GREATEST(octet_length(name), octet_length(type), octet_length(status), 0) <= 1536;

CREATE INDEX crm_donors_tenant_type_desc_idx
  ON public.donors (tenant_id, type DESC NULLS LAST, id DESC)
  WHERE GREATEST(octet_length(name), octet_length(type), octet_length(status), 0) <= 1536;
CREATE INDEX crm_donors_tenant_type_asc_idx
  ON public.donors (tenant_id, type, id)
  WHERE GREATEST(octet_length(name), octet_length(type), octet_length(status), 0) <= 1536;

CREATE INDEX crm_donors_tenant_status_desc_idx
  ON public.donors (tenant_id, status DESC NULLS LAST, id DESC)
  WHERE GREATEST(octet_length(name), octet_length(type), octet_length(status), 0) <= 1536;
CREATE INDEX crm_donors_tenant_status_asc_idx
  ON public.donors (tenant_id, status, id)
  WHERE GREATEST(octet_length(name), octet_length(type), octet_length(status), 0) <= 1536;

CREATE INDEX crm_donors_tenant_total_given_desc_idx
  ON public.donors (tenant_id, total_given DESC NULLS LAST, id DESC);
CREATE INDEX crm_donors_tenant_total_given_asc_idx
  ON public.donors (tenant_id, total_given, id);

CREATE INDEX crm_donors_tenant_last_gift_date_desc_idx
  ON public.donors (tenant_id, last_gift_date DESC NULLS LAST, id DESC);

-- Free-text keys can exceed a B-tree tuple. Keep the ordinary sorted indexes
-- bounded and locate longer records by tenant without indexing their text.
CREATE INDEX crm_donors_long_sort_keys_idx ON public.donors(tenant_id, id)
  WHERE GREATEST(octet_length(name), octet_length(type), octet_length(status), 0) > 1536;

CREATE FUNCTION public.crm_donors_for_text_order(p_tenant_id uuid)
RETURNS SETOF public.donors
LANGUAGE sql STABLE PARALLEL SAFE SECURITY INVOKER
BEGIN ATOMIC
  WITH scoped AS NOT MATERIALIZED (
    SELECT d.* FROM public.donors d WHERE d.tenant_id = p_tenant_id
      AND d.tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.assignment_is('staff'))
  )
  SELECT * FROM scoped WHERE GREATEST(octet_length(name), octet_length(type), octet_length(status), 0) <= 1536
  UNION ALL
  SELECT * FROM scoped WHERE GREATEST(octet_length(name), octet_length(type), octet_length(status), 0) > 1536;
END;
REVOKE ALL ON FUNCTION public.crm_donors_for_text_order(uuid) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.crm_donors_for_text_order(uuid) TO authenticated;

CREATE INDEX crm_donations_tenant_created_idx
  ON public.donations (tenant_id, created_at DESC, id DESC);
CREATE INDEX crm_donations_tenant_donor_created_idx
  ON public.donations (tenant_id, donor_id, created_at DESC);
CREATE INDEX crm_donor_activities_donor_date_idx
  ON public.donor_activities (donor_id, date DESC);
CREATE INDEX crm_candidates_open_existing_idx
  ON public.donor_merge_candidates (tenant_id, existing_donor_id, id) WHERE status = 'open';
CREATE INDEX crm_candidates_open_incoming_idx
  ON public.donor_merge_candidates (tenant_id, incoming_donor_id, id) WHERE status = 'open';
CREATE INDEX crm_links_pending_parent_idx
  ON public.donation_crm_links (tenant_id, link_status) WHERE scope = 'parent' AND link_status IN ('queued','failed');
COMMIT;
