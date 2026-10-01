-- Keep HTTP fee replay checks inside the claim transaction and freeze fee
-- parameters before any provider attempt, including the absence on legacy rows.
-- Existing claim and recovery RPC callers keep their original signatures.
-- Rollback (requires pausing donation processors first):
--   DROP TRIGGER IF EXISTS donation_saga_fee_extras_immutable ON public.donation_saga_outbox;
--   DROP FUNCTION IF EXISTS public.preserve_donation_saga_fee_extras();
--   DROP FUNCTION IF EXISTS public.claim_donation_saga_event_with_fee_quote(UUID, UUID, JSONB);

CREATE OR REPLACE FUNCTION public.preserve_donation_saga_fee_extras()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog
AS $function$
DECLARE
  v_key TEXT;
BEGIN
  IF NEW.fee_extras IS NOT DISTINCT FROM OLD.fee_extras THEN
    RETURN NEW;
  END IF;

  -- A stale ID-only writer must not hydrate a row after it has been claimed,
  -- nor may a status/attempt reset in the same UPDATE evade the frozen state.
  IF OLD.attempt_count > 0 OR NEW.attempt_count > 0
     OR OLD.status <> 'pending' OR NEW.status <> 'pending' THEN
    RAISE EXCEPTION 'Donation saga fee extras are immutable after processing begins'
      USING ERRCODE = '23514';
  END IF;

  -- Before claim, permit the initial legacy write but never replace an
  -- existing quote. Match the TypeScript parser's five-field projection;
  -- unrelated keys do not define fee identity.
  IF OLD.fee_extras <> '{}'::jsonb THEN
    FOREACH v_key IN ARRAY ARRAY[
      'gift_amount_cents', 'cover_fees', 'payment_method',
      'cover_amount_cents', 'estimated_fee_cents'
    ] LOOP
      IF OLD.fee_extras->v_key IS DISTINCT FROM NEW.fee_extras->v_key THEN
        RAISE EXCEPTION 'Donation saga fee quote cannot be replaced'
          USING ERRCODE = '23514';
      END IF;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.preserve_donation_saga_fee_extras()
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.preserve_donation_saga_fee_extras()
  TO service_role;

CREATE TRIGGER donation_saga_fee_extras_immutable
BEFORE UPDATE OF fee_extras ON public.donation_saga_outbox
FOR EACH ROW EXECUTE FUNCTION public.preserve_donation_saga_fee_extras();

CREATE OR REPLACE FUNCTION public.claim_donation_saga_event_with_fee_quote(
  p_outbox_id UUID,
  p_lock_id UUID,
  p_expected_fee_extras JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog
AS $function$
DECLARE
  v_row public.donation_saga_outbox%ROWTYPE;
  v_key TEXT;
BEGIN
  SELECT * INTO v_row
  FROM public.donation_saga_outbox
  WHERE id = p_outbox_id
  FOR UPDATE;

  -- Compare before the existing claim increments attempts or acquires a
  -- processor lock. Empty legacy extras stay absent and match any caller
  -- quote; no fee metadata is ever persisted by this replay RPC.
  IF FOUND AND v_row.fee_extras <> '{}'::jsonb THEN
    FOREACH v_key IN ARRAY ARRAY[
      'gift_amount_cents', 'cover_fees', 'payment_method',
      'cover_amount_cents', 'estimated_fee_cents'
    ] LOOP
      IF v_row.fee_extras->v_key IS DISTINCT FROM p_expected_fee_extras->v_key THEN
        RETURN jsonb_build_object('claimed', FALSE, 'fee_quote_conflict', TRUE);
      END IF;
    END LOOP;
  END IF;

  RETURN public.claim_donation_saga_event(p_outbox_id, p_lock_id);
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.claim_donation_saga_event_with_fee_quote(UUID, UUID, JSONB)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_donation_saga_event_with_fee_quote(UUID, UUID, JSONB)
  TO service_role;
