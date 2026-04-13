CREATE OR REPLACE FUNCTION public.admin_contributions_summary(p_tenant_id UUID)
RETURNS TABLE (
    total_received BIGINT,
    successful_count BIGINT,
    pending_amount BIGINT,
    pending_count BIGINT,
    average_gift NUMERIC,
    recurring_count BIGINT
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    COALESCE(SUM(amount) FILTER (WHERE status IN ('completed', 'succeeded', 'success')), 0)::BIGINT AS total_received,
    COUNT(*) FILTER (WHERE status IN ('completed', 'succeeded', 'success'))::BIGINT AS successful_count,
    COALESCE(SUM(amount) FILTER (WHERE status IN ('pending', 'processing')), 0)::BIGINT AS pending_amount,
    COUNT(*) FILTER (WHERE status IN ('pending', 'processing'))::BIGINT AS pending_count,
    COALESCE(AVG(amount) FILTER (WHERE status IN ('completed', 'succeeded', 'success')), 0)::NUMERIC AS average_gift,
    COUNT(*) FILTER (WHERE COALESCE(is_recurring, FALSE) OR donation_type = 'recurring')::BIGINT AS recurring_count
  FROM public.donations
  WHERE tenant_id = p_tenant_id;
$$;

CREATE INDEX IF NOT EXISTS idx_donations_tenant_amount_id
    ON public.donations (tenant_id, amount DESC, id DESC);
