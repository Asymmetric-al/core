-- AL-2681 (WP8a part 2, R1b; ruling Q1 (a), which amends binding section 3.5
-- of the rebase index; record :1062): a repair case is created open, on a
-- provider request only, and the guard may name only the four columns its one
-- inserter, tenant_guard.money_park_operation, names.
--
-- 1. private.payment_repair_cases_rules() gains a first branch for INSERT:
--    every resolution column (resolution, resolution_reason, resolved_by,
--    resolved_assignment_id, resolved_at, resolution_details) NULL, else 23514
--    payment_repair_case_created_resolved; and a row of
--    public.donation_saga_outbox with id = NEW.operation_id and kind =
--    'provider_request', else 23514 payment_repair_case_not_provider_request.
--    It looks the row up by id and kind only, never by tenant, so the key's
--    own 23503 still answers the owner's case that names another tenant's
--    request; as an invoker function it reads as the inserting role, so the
--    guard sees only its entered tenant's provider requests. The branch ends
--    with RETURN NEW. The UPDATE and DELETE branches are R1a's, unchanged.
-- 2. Trigger payment_repair_cases_rules fires BEFORE INSERT OR UPDATE OR
--    DELETE (R1a's fired BEFORE UPDATE OR DELETE).
-- 3. tenant_guard loses table INSERT on public.payment_repair_cases and holds
--    INSERT of (tenant_id, kind, operation_id, donation_id) only; its SELECT
--    and its tenant_guard_isolation policy are unchanged.
-- No CHECK, outbox trigger rule, state-machine transition, grant on
-- public.donations or public.donation_saga_outbox, or wire contract changes.
--
-- Locks: SHARE ROW EXCLUSIVE on public.payment_repair_cases, taken first and
-- held to COMMIT (CREATE OR REPLACE TRIGGER takes the same); lock_timeout
-- stops a run rather than queue it behind live traffic. No live statement
-- touches the table.
--
-- Recovery. Every statement here is safe to run twice, and a second run
-- changes nothing: the function and the trigger are created or replaced, the
-- REVOKE also removes the four column grants and the GRANT puts them back
-- (observed on a second run of the applied file). The check below answers
-- false, never an error, where the role, the table or its column is absent.
-- This file has committed when this read-only check is true:
--   SELECT EXISTS (
--     SELECT 1
--       FROM pg_catalog.pg_roles AS r
--       JOIN pg_catalog.pg_class AS c ON c.oid = to_regclass('public.payment_repair_cases')
--       JOIN pg_catalog.pg_attribute AS a ON a.attrelid = c.oid AND a.attname = 'kind' AND NOT a.attisdropped
--      WHERE r.rolname = 'tenant_guard'
--        AND NOT has_table_privilege(r.oid, c.oid, 'INSERT')
--        AND has_column_privilege(r.oid, c.oid, a.attnum, 'INSERT')
--   )
-- Then follow docs/ops/release-job.md, "If the migration committed but its
-- ledger row is missing", with this check and this file's version. It has no
-- preflight or post-assert of its own.
--
-- Down, an operator's last resort, in one transaction. It gives back R1a's
-- rules function, its trigger and the guard's table INSERT; the REVOKE comes
-- first because it removes the four column grants, which a table GRANT alone
-- would leave in place:
--   BEGIN;
--   SET LOCAL lock_timeout = '5s';
--   LOCK TABLE public.payment_repair_cases IN SHARE ROW EXCLUSIVE MODE;
--   CREATE OR REPLACE FUNCTION private.payment_repair_cases_rules()
--   RETURNS TRIGGER
--   LANGUAGE plpgsql
--   SECURITY INVOKER
--   SET search_path = ''
--   AS $$
--   BEGIN
--     IF TG_OP = 'DELETE' THEN
--       RAISE EXCEPTION 'payment_repair_case_sealed'
--         USING ERRCODE = '23514',
--               DETAIL = 'A repair case is evidence and is never deleted.';
--     END IF;
--
--     IF (NEW.id IS NOT DISTINCT FROM OLD.id
--         AND NEW.tenant_id IS NOT DISTINCT FROM OLD.tenant_id
--         AND NEW.kind IS NOT DISTINCT FROM OLD.kind
--         AND NEW.operation_id IS NOT DISTINCT FROM OLD.operation_id
--         AND NEW.donation_id IS NOT DISTINCT FROM OLD.donation_id
--         AND NEW.created_at IS NOT DISTINCT FROM OLD.created_at) IS NOT TRUE THEN
--       RAISE EXCEPTION 'payment_repair_case_anchor_fixed'
--         USING ERRCODE = '23514',
--               DETAIL = 'A repair case keeps its tenant, kind, request, intake and creation time.';
--     END IF;
--
--     IF OLD.resolved_at IS NOT NULL AND (NEW IS NOT DISTINCT FROM OLD) IS NOT TRUE THEN
--       RAISE EXCEPTION 'payment_repair_case_resolved'
--         USING ERRCODE = '23514',
--               DETAIL = 'A resolved repair case never changes.';
--     END IF;
--
--     RETURN NEW;
--   END;
--   $$;
--   REVOKE ALL ON FUNCTION private.payment_repair_cases_rules()
--     FROM PUBLIC, anon, authenticated, service_role;
--   CREATE OR REPLACE TRIGGER payment_repair_cases_rules
--     BEFORE UPDATE OR DELETE ON public.payment_repair_cases
--     FOR EACH ROW
--     EXECUTE FUNCTION private.payment_repair_cases_rules();
--   REVOKE INSERT ON TABLE public.payment_repair_cases FROM tenant_guard;
--   GRANT INSERT ON TABLE public.payment_repair_cases TO tenant_guard;
--   COMMIT;

BEGIN;
SET LOCAL lock_timeout = '5s';

LOCK TABLE public.payment_repair_cases IN SHARE ROW EXCLUSIVE MODE;

CREATE OR REPLACE FUNCTION private.payment_repair_cases_rules()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF (NEW.resolution IS NULL
        AND NEW.resolution_reason IS NULL
        AND NEW.resolved_by IS NULL
        AND NEW.resolved_assignment_id IS NULL
        AND NEW.resolved_at IS NULL
        AND NEW.resolution_details IS NULL) IS NOT TRUE THEN
      RAISE EXCEPTION 'payment_repair_case_created_resolved'
        USING ERRCODE = '23514',
              DETAIL = 'A repair case is created open; only a person resolves it.';
    END IF;

    IF (EXISTS (
          SELECT 1
            FROM public.donation_saga_outbox AS o
           WHERE o.id = NEW.operation_id
             AND o.kind = 'provider_request'
        )) IS NOT TRUE THEN
      RAISE EXCEPTION 'payment_repair_case_not_provider_request'
        USING ERRCODE = '23514',
              DETAIL = 'A repair case is opened on a provider request only.';
    END IF;

    RETURN NEW;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'payment_repair_case_sealed'
      USING ERRCODE = '23514',
            DETAIL = 'A repair case is evidence and is never deleted.';
  END IF;

  IF (NEW.id IS NOT DISTINCT FROM OLD.id
      AND NEW.tenant_id IS NOT DISTINCT FROM OLD.tenant_id
      AND NEW.kind IS NOT DISTINCT FROM OLD.kind
      AND NEW.operation_id IS NOT DISTINCT FROM OLD.operation_id
      AND NEW.donation_id IS NOT DISTINCT FROM OLD.donation_id
      AND NEW.created_at IS NOT DISTINCT FROM OLD.created_at) IS NOT TRUE THEN
    RAISE EXCEPTION 'payment_repair_case_anchor_fixed'
      USING ERRCODE = '23514',
            DETAIL = 'A repair case keeps its tenant, kind, request, intake and creation time.';
  END IF;

  IF OLD.resolved_at IS NOT NULL AND (NEW IS NOT DISTINCT FROM OLD) IS NOT TRUE THEN
    RAISE EXCEPTION 'payment_repair_case_resolved'
      USING ERRCODE = '23514',
            DETAIL = 'A resolved repair case never changes.';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION private.payment_repair_cases_rules()
  FROM PUBLIC, anon, authenticated, service_role;

CREATE OR REPLACE TRIGGER payment_repair_cases_rules
  BEFORE INSERT OR UPDATE OR DELETE ON public.payment_repair_cases
  FOR EACH ROW
  EXECUTE FUNCTION private.payment_repair_cases_rules();

REVOKE INSERT ON TABLE public.payment_repair_cases FROM tenant_guard;
GRANT INSERT (tenant_id, kind, operation_id, donation_id)
  ON TABLE public.payment_repair_cases TO tenant_guard;

COMMIT;

SELECT pg_notify('pgrst', 'reload schema');
