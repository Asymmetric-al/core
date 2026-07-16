CREATE OR REPLACE FUNCTION public.replace_staged_gift_allocations(
  p_tenant_id UUID,
  p_staged_gift_id UUID,
  p_allocations JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SET search_path TO public
AS $function$
BEGIN
  IF p_allocations IS NULL
     OR jsonb_typeof(p_allocations) <> 'array' THEN
    RAISE EXCEPTION 'At least one staged gift allocation is required'
      USING ERRCODE = '22023';
  END IF;

  IF jsonb_array_length(p_allocations) = 0 THEN
    RAISE EXCEPTION 'At least one staged gift allocation is required'
      USING ERRCODE = '22023';
  END IF;

  PERFORM 1
  FROM public.staged_gifts sg
  WHERE sg.id = p_staged_gift_id
    AND sg.tenant_id = p_tenant_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Staged gift not found'
      USING ERRCODE = 'P0002';
  END IF;

  DELETE FROM public.staged_gift_allocations
  WHERE staged_gift_id = p_staged_gift_id
    AND tenant_id = p_tenant_id;

  INSERT INTO public.staged_gift_allocations (
    tenant_id,
    staged_gift_id,
    fund_id,
    missionary_id,
    amount,
    memo
  )
  SELECT
    p_tenant_id,
    p_staged_gift_id,
    allocation.fund_id,
    allocation.missionary_id,
    allocation.amount,
    allocation.memo
  FROM jsonb_to_recordset(p_allocations) AS allocation(
    fund_id UUID,
    missionary_id UUID,
    amount BIGINT,
    memo TEXT
  );
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.replace_staged_gift_allocations(UUID, UUID, JSONB)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.replace_staged_gift_allocations(UUID, UUID, JSONB)
  TO service_role;
