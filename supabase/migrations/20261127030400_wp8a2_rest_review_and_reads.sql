-- AL-2681 (WP8a part 2 rest, PR 1, M5; plan lines 1147, 1161, 1162 and
-- 1175; rulings W8-R14 (Q11), W8-R28 and ADR 0008): review of a paid
-- line-based gift and the read of its lines. A legacy gift's review is
-- unchanged byte for byte in effect.
--
-- 1. public.replace_staged_gift_allocations(uuid, uuid, jsonb, text): its
--    text from 20261117153112, and on a line-based gift, after the same lock
--    and expected-status check, the donor lines are replaced and the fee line
--    kept: each element is {fund_id, missionary_id, amount, memo[,
--    line_number]}; the entity is the gift's; the fee flag is the target
--    fund's is_reserved_fee_cover; a donor line keeps the number given, else
--    the number of the existing donor line with the same target, else the
--    next number after every one in use; the fee line, when the gift has
--    one, must come back with its number, fund and amount, and no other
--    element may name a fee-cover fund (23514 staged_gift_fee_line_fixed).
--    The balance trigger of 20261126170200 still holds the sum at commit.
-- 2. public.replace_staged_gift_allocations(uuid, uuid, jsonb): its text from
--    20260707220134, and on a line-based gift, under the same lock, the
--    four-argument writer with the status it read, so it cannot bypass
--    the fee rule. Owner, SECURITY INVOKER, search path and grants of both
--    unchanged.
-- 3. public.line_based_gift_lines(tenant, intakes[]): a postgres-owned
--    STABLE definer, EXECUTE for service_role only: the lines of the
--    tenant's line-based intakes named, with the fund's name and the
--    worker's public name (private.worker_public_name_for, which never
--    returns a restricted worker's Party name, ADR 0008).
-- 4. public.actor_gifts_without_donor(tenant, login) (fix round F2): a
--    postgres-owned STABLE definer, EXECUTE for service_role only: the ids
--    of the tenant's counted line-based intakes the login made (its
--    contact row's actor_user_id) that have no donor yet, newest first, at
--    most 251. The donor portal shows a person their own donor's gifts and
--    these; a gift attributed or moved to another donor is no longer one.
--    It answers ids only, so service_role still reads nothing of the
--    contact row.
-- 5. public.admin_contributions_summary(tenant) replaced (fix round F5): as
--    20260408224500 wrote it, with its search path emptied, and counting no
--    line-based intake that is pending or abandoned (the rows
--    packages/api/src/shared/line-based-gifts.ts counts everywhere else).
--
-- Locks: none at migration time (functions only). At run time each overload
-- locks the gift FOR UPDATE first, as before.
--
-- Recovery. Every statement is CREATE OR REPLACE or a grant and runs again
-- unchanged. This file has committed when this read-only check is true:
--   SELECT to_regprocedure('public.line_based_gift_lines(uuid,uuid[])') IS NOT NULL
-- Then follow docs/ops/release-job.md, "If the migration committed but its
-- ledger row is missing", with this check and this file's version,
-- 20261127030400.
--
-- Down, an operator's last resort, in one transaction: re-run, verbatim,
-- 20261117153112's CREATE FUNCTION as CREATE OR REPLACE and
-- 20260707220134's CREATE OR REPLACE FUNCTION with their grants, and
-- 20260408224500's CREATE OR REPLACE FUNCTION; DROP FUNCTION
-- public.line_based_gift_lines(uuid, uuid[]),
-- public.actor_gifts_without_donor(uuid, uuid).

BEGIN;
SET LOCAL lock_timeout = '5s';

CREATE OR REPLACE FUNCTION public.replace_staged_gift_allocations(
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
  v_format TEXT;
  v_entity UUID;
  v_fee RECORD;
  v_has_fee BOOLEAN;
  v_rows JSONB;
  v_fee_elements BIGINT;
  v_bad BIGINT;
  v_next INTEGER;
  v_element RECORD;
  v_number INTEGER;
  v_taken INTEGER[];
  v_plan JSONB;
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

  SELECT sg.status, sg.intake_format, sg.legal_entity_id
    INTO v_status, v_format, v_entity
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

  IF v_format = 'line_based' THEN
    SELECT a.line_number, a.fund_id, a.amount, a.memo
      INTO v_fee
      FROM public.staged_gift_allocations AS a
     WHERE a.tenant_id = p_tenant_id
       AND a.staged_gift_id = p_staged_gift_id
       AND a.is_fee_cover;
    v_has_fee := FOUND;

    WITH elements AS (
      SELECT e.ordinality AS position,
             e.value AS element,
             (e.value ->> 'fund_id')::UUID AS fund_id,
             (e.value ->> 'missionary_id')::UUID AS missionary_id,
             (e.value ->> 'amount')::BIGINT AS amount,
             e.value ->> 'memo' AS memo,
             (e.value ->> 'line_number')::INTEGER AS line_number
        FROM pg_catalog.jsonb_array_elements(p_allocations) WITH ORDINALITY AS e(value, ordinality)
    )
    SELECT COALESCE(pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
             'position', el.position,
             'fund_id', el.fund_id,
             'missionary_id', el.missionary_id,
             'amount', el.amount,
             'memo', el.memo,
             'line_number', el.line_number,
             'fee', COALESCE(f.is_reserved_fee_cover, false)
           ) ORDER BY el.position), '[]'::JSONB)
      INTO v_rows
      FROM elements AS el
      LEFT JOIN public.funds AS f
        ON f.tenant_id = p_tenant_id
       AND f.id = el.fund_id;

    SELECT pg_catalog.count(*) FILTER (WHERE (r.value ->> 'fee')::BOOLEAN)
      INTO v_fee_elements
      FROM pg_catalog.jsonb_array_elements(v_rows) AS r(value);

    IF v_has_fee THEN
      SELECT pg_catalog.count(*)
        INTO v_bad
        FROM pg_catalog.jsonb_array_elements(v_rows) AS r(value)
       WHERE (r.value ->> 'fee')::BOOLEAN
         AND ((r.value ->> 'fund_id')::UUID IS DISTINCT FROM v_fee.fund_id
              OR (r.value ->> 'amount')::BIGINT IS DISTINCT FROM v_fee.amount
              OR (r.value ->> 'missionary_id') IS NOT NULL
              OR ((r.value ->> 'line_number') IS NOT NULL
                  AND (r.value ->> 'line_number')::INTEGER IS DISTINCT FROM v_fee.line_number));
      IF v_fee_elements <> 1 OR v_bad <> 0 THEN
        RAISE EXCEPTION 'staged_gift_fee_line_fixed'
          USING ERRCODE = '23514',
                DETAIL = 'A review keeps the fee-cover line as it was: its number, fund and amount.';
      END IF;
    ELSIF v_fee_elements <> 0 THEN
      RAISE EXCEPTION 'staged_gift_fee_line_fixed'
        USING ERRCODE = '23514',
              DETAIL = 'A review adds no fee-cover line.';
    END IF;

    SELECT pg_catalog.count(*)
      INTO v_bad
      FROM pg_catalog.jsonb_array_elements(v_rows) AS r(value)
     WHERE NOT (r.value ->> 'fee')::BOOLEAN
       AND v_has_fee
       AND (r.value ->> 'line_number')::INTEGER = v_fee.line_number;
    IF v_bad <> 0 THEN
      RAISE EXCEPTION 'staged_gift_fee_line_fixed'
        USING ERRCODE = '23514',
              DETAIL = 'A donor line never takes the fee-cover line''s number.';
    END IF;

    SELECT COALESCE(pg_catalog.max(n), 0)
      INTO v_next
      FROM (
        SELECT a.line_number AS n
          FROM public.staged_gift_allocations AS a
         WHERE a.tenant_id = p_tenant_id
           AND a.staged_gift_id = p_staged_gift_id
        UNION ALL
        SELECT (r.value ->> 'line_number')::INTEGER
          FROM pg_catalog.jsonb_array_elements(v_rows) AS r(value)
      ) AS numbers;

    v_plan := '[]'::JSONB;

    v_taken := ARRAY(
      SELECT (r.value ->> 'line_number')::INTEGER
        FROM pg_catalog.jsonb_array_elements(v_rows) AS r(value)
       WHERE (r.value ->> 'line_number') IS NOT NULL
    );
    IF v_has_fee THEN
      v_taken := v_taken || v_fee.line_number;
    END IF;

    FOR v_element IN
      SELECT (r.value ->> 'fund_id')::UUID AS fund_id,
             (r.value ->> 'missionary_id')::UUID AS missionary_id,
             (r.value ->> 'amount')::BIGINT AS amount,
             r.value ->> 'memo' AS memo,
             (r.value ->> 'line_number')::INTEGER AS line_number,
             (r.value ->> 'fee')::BOOLEAN AS fee
        FROM pg_catalog.jsonb_array_elements(v_rows) AS r(value)
       ORDER BY (r.value ->> 'position')::BIGINT
    LOOP
      IF v_element.fee THEN
        v_number := v_fee.line_number;
      ELSIF v_element.line_number IS NOT NULL THEN
        v_number := v_element.line_number;
      ELSE
        SELECT a.line_number
          INTO v_number
          FROM public.staged_gift_allocations AS a
         WHERE a.tenant_id = p_tenant_id
           AND a.staged_gift_id = p_staged_gift_id
           AND NOT a.is_fee_cover
           AND a.fund_id IS NOT DISTINCT FROM v_element.fund_id
           AND a.missionary_id IS NOT DISTINCT FROM v_element.missionary_id
           AND (a.line_number = ANY (v_taken)) IS NOT TRUE
         ORDER BY a.line_number
         LIMIT 1;
        IF NOT FOUND THEN
          v_next := v_next + 1;
          v_number := v_next;
        END IF;
        v_taken := v_taken || v_number;
      END IF;

      v_plan := v_plan || pg_catalog.jsonb_build_array(pg_catalog.jsonb_build_object(
        'line_number', v_number,
        'fund_id', v_element.fund_id,
        'missionary_id', v_element.missionary_id,
        'amount', v_element.amount,
        'memo', v_element.memo,
        'is_fee_cover', v_element.fee));
    END LOOP;

    DELETE FROM public.staged_gift_allocations
     WHERE tenant_id = p_tenant_id
       AND staged_gift_id = p_staged_gift_id;

    INSERT INTO public.staged_gift_allocations (
      tenant_id,
      staged_gift_id,
      legal_entity_id,
      line_number,
      fund_id,
      missionary_id,
      is_fee_cover,
      amount,
      memo
    )
    SELECT p_tenant_id,
           p_staged_gift_id,
           v_entity,
           plan.line_number,
           plan.fund_id,
           plan.missionary_id,
           plan.is_fee_cover,
           plan.amount,
           plan.memo
      FROM pg_catalog.jsonb_to_recordset(v_plan) AS plan(
             line_number INTEGER,
             fund_id UUID,
             missionary_id UUID,
             amount BIGINT,
             memo TEXT,
             is_fee_cover BOOLEAN)
     ORDER BY plan.line_number;
    RETURN;
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

CREATE OR REPLACE FUNCTION public.replace_staged_gift_allocations(
  p_tenant_id UUID,
  p_staged_gift_id UUID,
  p_allocations JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SET search_path TO public
AS $function$
DECLARE
  v_status TEXT;
  v_format TEXT;
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

  SELECT sg.status, sg.intake_format
    INTO v_status, v_format
  FROM public.staged_gifts sg
  WHERE sg.id = p_staged_gift_id
    AND sg.tenant_id = p_tenant_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Staged gift not found'
      USING ERRCODE = 'P0002';
  END IF;

  IF v_format = 'line_based' THEN
    PERFORM public.replace_staged_gift_allocations(p_tenant_id, p_staged_gift_id, p_allocations, v_status);
    RETURN;
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

CREATE OR REPLACE FUNCTION public.line_based_gift_lines(
  p_tenant_id UUID,
  p_donation_ids UUID[]
)
RETURNS TABLE (
  donation_id UUID,
  line_number INTEGER,
  fund_id UUID,
  fund_name TEXT,
  missionary_id UUID,
  worker_public_name TEXT,
  is_fee_cover BOOLEAN,
  amount BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $fn$
  SELECT l.donation_id,
         l.line_number,
         l.fund_id,
         f.name,
         l.missionary_id,
         CASE WHEN l.missionary_id IS NOT NULL
              THEN private.worker_public_name_for(l.tenant_id, l.missionary_id) END,
         l.is_fee_cover,
         l.amount
    FROM public.donation_intake_lines AS l
    LEFT JOIN public.funds AS f
      ON f.tenant_id = l.tenant_id
     AND f.id = l.fund_id
   WHERE l.tenant_id = p_tenant_id
     AND l.donation_id = ANY (p_donation_ids)
   ORDER BY l.donation_id, l.line_number;
$fn$;

ALTER FUNCTION public.line_based_gift_lines(UUID, UUID[]) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.line_based_gift_lines(UUID, UUID[])
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.line_based_gift_lines(UUID, UUID[]) TO service_role;

CREATE OR REPLACE FUNCTION public.actor_gifts_without_donor(
  p_tenant_id UUID,
  p_user_id UUID
)
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $fn$
  SELECT c.donation_id
    FROM public.donation_intake_contacts AS c
    JOIN public.donations AS d
      ON d.tenant_id = c.tenant_id
     AND d.id = c.donation_id
   WHERE c.tenant_id = p_tenant_id
     AND c.actor_user_id = p_user_id
     AND d.donor_id IS NULL
     AND d.intake_format = 'line_based'
     AND d.status IN ('processing', 'completed', 'failed', 'refunded')
   ORDER BY d.created_at DESC, c.donation_id
   LIMIT 251;
$fn$;

ALTER FUNCTION public.actor_gifts_without_donor(UUID, UUID) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.actor_gifts_without_donor(UUID, UUID)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.actor_gifts_without_donor(UUID, UUID) TO service_role;

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
SET search_path = ''
AS $$
  SELECT
    COALESCE(SUM(amount) FILTER (WHERE status IN ('completed', 'succeeded', 'success')), 0)::BIGINT AS total_received,
    COUNT(*) FILTER (WHERE status IN ('completed', 'succeeded', 'success'))::BIGINT AS successful_count,
    COALESCE(SUM(amount) FILTER (WHERE status IN ('pending', 'processing')), 0)::BIGINT AS pending_amount,
    COUNT(*) FILTER (WHERE status IN ('pending', 'processing'))::BIGINT AS pending_count,
    COALESCE(AVG(amount) FILTER (WHERE status IN ('completed', 'succeeded', 'success')), 0)::NUMERIC AS average_gift,
    COUNT(*) FILTER (WHERE COALESCE(is_recurring, FALSE) OR donation_type = 'recurring')::BIGINT AS recurring_count
  FROM public.donations
  WHERE tenant_id = p_tenant_id
    AND (intake_format <> 'line_based'
         OR status IN ('processing', 'completed', 'failed', 'refunded'));
$$;

COMMIT;

SELECT pg_notify('pgrst', 'reload schema');
