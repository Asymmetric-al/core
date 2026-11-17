-- AL-2672 (WP0; council round 2 on stage 1, item B5): the legacy staged-gift
-- edit (PATCH in packages/api/src/admin/contributions/staged-gifts.ts)
-- replaces a gift's allocation split through
-- public.replace_staged_gift_allocations. The function locked the gift and
-- checked its tenant but not its status, so a refund, a posting or an
-- approval that landed between the handler's check and the call still got
-- the new split.
--
-- The function now takes the status the caller checked, p_expected_status,
-- and reads the gift's status in the locking read it already makes. When the
-- status is a different one it refuses with SQLSTATE 40001 ("Staged gift
-- changed since it was checked"), which the handler answers with 409, and
-- changes nothing. Under READ COMMITTED that read waits for a concurrent
-- writer of the gift and then sees its committed status. A call that names no
-- status is refused with 22023.
--
-- One function and no overload: the three-argument version is dropped and the
-- four-argument one created in this transaction. Its owner (the migration
-- runner, postgres), SECURITY INVOKER, `SET search_path TO public` and its
-- grants (EXECUTE for service_role only; PUBLIC, anon and authenticated
-- revoked by name) are as before. The edit handler is its only caller and
-- passes the new argument in the same change.
--
-- Down (run by hand, in one transaction): drop
-- public.replace_staged_gift_allocations(UUID, UUID, JSONB, TEXT), then run
-- the body and grants of 20260707220134_atomic_staged_gift_allocation_replace.sql
-- again, together with a revert of the handler.

DROP FUNCTION IF EXISTS public.replace_staged_gift_allocations(UUID, UUID, JSONB);

CREATE FUNCTION public.replace_staged_gift_allocations(
  p_tenant_id UUID,
  p_staged_gift_id UUID,
  p_allocations JSONB,
  p_expected_status TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SET search_path TO public
AS $function$
DECLARE
  v_status TEXT;
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

  IF p_expected_status IS NULL THEN
    RAISE EXCEPTION 'The staged gift status the caller checked is required'
      USING ERRCODE = '22023';
  END IF;

  SELECT sg.status
    INTO v_status
  FROM public.staged_gifts sg
  WHERE sg.id = p_staged_gift_id
    AND sg.tenant_id = p_tenant_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Staged gift not found'
      USING ERRCODE = 'P0002';
  END IF;

  IF v_status <> p_expected_status THEN
    RAISE EXCEPTION 'Staged gift changed since it was checked'
      USING ERRCODE = '40001';
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

REVOKE EXECUTE ON FUNCTION public.replace_staged_gift_allocations(UUID, UUID, JSONB, TEXT)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.replace_staged_gift_allocations(UUID, UUID, JSONB, TEXT)
  TO service_role;
