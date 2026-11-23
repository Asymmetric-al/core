-- AL-2681 (WP8a part 1; ruling W8-R1, plan 15.1, D-07, TP2 section 6):
-- 1. Add country_code, currency, legal_name, and nullable tax_id to
--    public.legal_entities, with preflight refusing any row outside the two
--    known seeded demonstration tenants (count only, no IDs), explicit backfill
--    of those demonstration rows (including rows created by 20261120130004 on
--    an unseeded migrated-in-place database), no column defaults afterward, and
--    UNIQUE (tenant_id, id, currency).
-- 2. Grant caller-token staff SELECT and tenant_guard SELECT behind RLS on
--    public.legal_entities so Mission Control reads legal entities without
--    service_role.
-- 3. Seed field_policies rows for the four new legal_entities columns and for
--    every column of public.funds (including legal_entity_id and system_purpose).

BEGIN;

SET LOCAL lock_timeout = '5s';

LOCK TABLE public.legal_entities IN SHARE ROW EXCLUSIVE MODE;

DO $$
DECLARE
  v_unknown_count BIGINT;
BEGIN
  SELECT pg_catalog.count(*)
    INTO v_unknown_count
    FROM public.legal_entities
   WHERE tenant_id NOT IN (
     '00000000-0000-0000-0000-000000000001'::uuid,
     '00000000-0000-0000-0000-000000000002'::uuid
   );

  IF v_unknown_count > 0 THEN
    RAISE EXCEPTION 'WP8a legal_entities preflight: % row(s) outside known demonstration tenants lack explicit country_code, currency, and legal_name',
      v_unknown_count
      USING ERRCODE = '22023';
  END IF;
END $$;

ALTER TABLE public.legal_entities
  ADD COLUMN country_code TEXT,
  ADD COLUMN currency TEXT,
  ADD COLUMN legal_name TEXT,
  ADD COLUMN tax_id TEXT;

UPDATE public.legal_entities
   SET country_code = 'US',
       currency = 'usd',
       legal_name = name
 WHERE tenant_id IN (
   '00000000-0000-0000-0000-000000000001'::uuid,
   '00000000-0000-0000-0000-000000000002'::uuid
 );

ALTER TABLE public.legal_entities
  ALTER COLUMN country_code SET NOT NULL,
  ALTER COLUMN currency SET NOT NULL,
  ALTER COLUMN legal_name SET NOT NULL,
  ADD CONSTRAINT legal_entities_country_code_check
    CHECK (country_code ~ '^[A-Z]{2}$' AND country_code = 'US'),
  ADD CONSTRAINT legal_entities_currency_check
    CHECK (currency ~ '^[a-z]{3}$' AND currency = 'usd'),
  ADD CONSTRAINT legal_entities_currency_iso_fkey
    FOREIGN KEY (currency) REFERENCES public.currency_metadata(code),
  ADD CONSTRAINT legal_entities_legal_name_check
    CHECK (pg_catalog.length(pg_catalog.btrim(legal_name)) > 0),
  ADD CONSTRAINT legal_entities_tax_id_check
    CHECK (tax_id IS NULL OR pg_catalog.length(pg_catalog.btrim(tax_id)) > 0),
  ADD CONSTRAINT legal_entities_tenant_id_id_currency_key
    UNIQUE (tenant_id, id, currency);

GRANT SELECT ON TABLE public.legal_entities TO authenticated, service_role, tenant_guard;

DROP POLICY IF EXISTS "legal entities staff tenant select" ON public.legal_entities;
CREATE POLICY "legal entities staff tenant select"
  ON public.legal_entities
  FOR SELECT
  TO authenticated
  USING (
    tenant_id = (SELECT authz.current_tenant_id())
    AND (SELECT authz.assignment_is('staff'::authz.membership_role))
  );

DROP POLICY IF EXISTS tenant_guard_isolation ON public.legal_entities;
CREATE POLICY tenant_guard_isolation
  ON public.legal_entities
  FOR ALL
  TO tenant_guard
  USING (tenant_id = (SELECT tenant_guard.current_tenant_id()))
  WITH CHECK (tenant_id = (SELECT tenant_guard.current_tenant_id()));

INSERT INTO public.field_policies (
  record_type,
  field_key,
  surface,
  visible,
  editable,
  exportable,
  sensitivity_category
)
SELECT
  v.record_type,
  v.field_key,
  s.surface,
  CASE WHEN s.surface = 'mission_control' THEN true ELSE false END,
  CASE WHEN s.surface = 'mission_control' THEN v.mc_editable ELSE false END,
  false,
  v.category::public.field_sensitivity_category
FROM (
  VALUES
    ('legal_entities', 'country_code', 'financial', false),
    ('legal_entities', 'currency', 'financial', false),
    ('legal_entities', 'legal_name', 'contact', false),
    ('legal_entities', 'tax_id', 'financial', true),
    ('funds', 'id', 'internal', false),
    ('funds', 'tenant_id', 'internal', false),
    ('funds', 'name', 'contact', true),
    ('funds', 'description', 'care', true),
    ('funds', 'target_amount', 'financial', true),
    ('funds', 'goal_amount', 'financial', true),
    ('funds', 'current_amount', 'financial', false),
    ('funds', 'currency', 'financial', true),
    ('funds', 'missionary_id', 'internal', false),
    ('funds', 'is_active', 'internal', true),
    ('funds', 'start_date', 'financial', true),
    ('funds', 'end_date', 'financial', true),
    ('funds', 'created_at', 'internal', false),
    ('funds', 'updated_at', 'internal', false),
    ('funds', 'legal_entity_id', 'financial', false),
    ('funds', 'system_purpose', 'internal', false)
) AS v(record_type, field_key, category, mc_editable)
CROSS JOIN unnest(
  ARRAY['mission_control', 'donor', 'missionary', 'public', 'export']
) AS s(surface);

COMMIT;
