SELECT 'funds' AS source, id FROM public.funds WHERE tenant_id IS NULL
UNION ALL SELECT 'missionaries', id FROM public.missionaries WHERE tenant_id IS NULL
UNION ALL SELECT 'tenants with a blank name', id FROM public.tenants WHERE btrim(name) = '';

WITH gifts(source,id,tenant_id,fund_id,missionary_id) AS (
  SELECT 'donations',id,tenant_id,fund_id,missionary_id FROM public.donations
  UNION ALL SELECT 'donor_pledges',id,tenant_id,fund_id,missionary_id FROM public.donor_pledges
  UNION ALL SELECT 'staged_gifts',id,tenant_id,fund_id,missionary_id FROM public.staged_gifts
  UNION ALL SELECT 'staged_gift_allocations',id,tenant_id,fund_id,missionary_id FROM public.staged_gift_allocations
  UNION ALL SELECT 'donation_saga_outbox',id,tenant_id,fund_id,missionary_id FROM public.donation_saga_outbox
)
SELECT g.*, f.tenant_id AS fund_tenant, m.tenant_id AS missionary_tenant
FROM gifts g LEFT JOIN public.funds f ON f.id=g.fund_id LEFT JOIN public.missionaries m ON m.id=g.missionary_id
WHERE (g.fund_id IS NOT NULL AND (g.tenant_id IS NULL OR g.tenant_id IS DISTINCT FROM f.tenant_id))
   OR (g.missionary_id IS NOT NULL AND (g.tenant_id IS NULL OR g.tenant_id IS DISTINCT FROM m.tenant_id));
