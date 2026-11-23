-- AL-2681 (WP8a part 1; rulings W8-R1 and W8-R35; plan 15.1, D-07, TP2 section 6):
-- 1. Preflight, before any mutation: stop with counts only (no identifiers)
--    when an issuer is not a demonstration issuer identified by its own
--    identity, or when any payment-account binding row exists.
--    A demonstration issuer is the one row that 20261120130004 (line 75) or the
--    seed created for one of the two demonstration tenants: it is that tenant's
--    only issuer, it carries the tenant's name (the value 20261120130004
--    copied), and either it has the seed's id md5(tenant_id || ':legal') or it
--    shares the one created_at of the rows a single statement inserted.
-- 2. Add country_code, currency, legal_name and nullable tax_id to
--    public.legal_entities; backfill the identified rows as US / usd with their
--    own name as legal name; no column defaults; UNIQUE (tenant_id, id, currency).
-- 3. Column grants: a staff member reads every column but tax_id through the
--    table; tax_id is reachable only through the payments.manage_account read
--    command of 20261123030200.
-- 4. field_policies rows for the four new legal_entities columns and for every
--    column of public.funds.

BEGIN;

SET LOCAL lock_timeout = '5s';

LOCK TABLE public.legal_entities IN SHARE ROW EXCLUSIVE MODE;
LOCK TABLE public.payment_account_bindings IN SHARE ROW EXCLUSIVE MODE;

DO $$
DECLARE
  v_outside BIGINT;
  v_instants BIGINT;
  v_unidentified BIGINT;
  v_bindings BIGINT;
BEGIN
  SELECT pg_catalog.count(*)
    INTO v_outside
    FROM public.legal_entities AS le
   WHERE le.tenant_id NOT IN (
     '00000000-0000-0000-0000-000000000001'::uuid,
     '00000000-0000-0000-0000-000000000002'::uuid
   );

  SELECT pg_catalog.count(DISTINCT le.created_at)
    INTO v_instants
    FROM public.legal_entities AS le
   WHERE le.tenant_id IN (
     '00000000-0000-0000-0000-000000000001'::uuid,
     '00000000-0000-0000-0000-000000000002'::uuid
   )
     AND le.id <> pg_catalog.md5(le.tenant_id::text || ':legal')::uuid;

  SELECT pg_catalog.count(*)
    INTO v_unidentified
    FROM public.legal_entities AS le
    LEFT JOIN public.tenants AS t ON t.id = le.tenant_id
   WHERE le.tenant_id IN (
     '00000000-0000-0000-0000-000000000001'::uuid,
     '00000000-0000-0000-0000-000000000002'::uuid
   )
     AND (
       le.name IS NOT DISTINCT FROM t.name
       AND (SELECT pg_catalog.count(*) FROM public.legal_entities AS o WHERE o.tenant_id = le.tenant_id) = 1
       AND (
         le.id = pg_catalog.md5(le.tenant_id::text || ':legal')::uuid
         OR v_instants = 1
       )
     ) IS NOT TRUE;

  SELECT pg_catalog.count(*)
    INTO v_bindings
    FROM public.payment_account_bindings;

  IF v_outside > 0 OR v_unidentified > 0 OR v_bindings > 0 THEN
    RAISE EXCEPTION 'WP8a issuer preflight: issuers outside the demonstration tenants=%, demonstration-tenant issuers not identified as the demonstration rows=%, payment account bindings=%',
      v_outside, v_unidentified, v_bindings
      USING ERRCODE = '22023',
            HINT = 'Nothing was changed. Run the read-only counts in the WP8a part 1 handoff, give each issuer explicit country, currency and legal name, then release again.';
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
       legal_name = name;

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

REVOKE ALL ON TABLE public.legal_entities FROM PUBLIC, anon, authenticated;
GRANT SELECT (id, tenant_id, name, created_at, country_code, currency, legal_name)
  ON TABLE public.legal_entities TO authenticated;
GRANT SELECT ON TABLE public.legal_entities TO service_role, tenant_guard;

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
