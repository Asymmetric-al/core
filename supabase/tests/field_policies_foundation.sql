-- AL-491 acceptance-v2: disposable local database only; every write rolls back.
-- Execute with psql -v ON_ERROR_STOP=1 after applying candidate migrations.
--
-- AL-2674 (plan 7.1, audit NR-19): this file no longer carries a literal copy
-- of the AL-491 capture (171 live columns plus the reviewed supplements) or
-- requires the schema and the seed to equal it. That copy let no classified
-- column be added or dropped. Column-by-column parity between the schema, the
-- classification and public.field_policies is now owned by the manifest gate,
-- scripts/verify/field-policy-census.mjs over
-- docs/security/field-policies/manifest.json, which runs before this file in
-- CI. The checks here are the ones that hold whatever columns are classified.
BEGIN;
DO $$
DECLARE category_type oid; categories text[]; bad text;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE oid='public.field_policies'::regclass AND relrowsecurity) THEN
    RAISE EXCEPTION 'C1: field_policies must enable RLS'; END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='field_policies'
    AND column_name IN ('record_type','field_key','surface') AND data_type<>'text') THEN
    RAISE EXCEPTION 'C1: lookup dimensions must be text'; END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='field_policies'
    AND column_name='tenant_id' AND data_type='uuid' AND is_nullable='YES') THEN
    RAISE EXCEPTION 'C1: tenant_id must remain nullable UUID'; END IF;
  IF (SELECT count(*) FROM information_schema.columns WHERE table_schema='public' AND table_name='field_policies'
    AND column_name IN ('visible','editable','exportable') AND data_type='boolean' AND is_nullable='NO')<>3 THEN
    RAISE EXCEPTION 'C1: visible/editable/exportable must be required booleans'; END IF;
  SELECT atttypid INTO category_type FROM pg_attribute WHERE attrelid='public.field_policies'::regclass
    AND attname='sensitivity_category';
  SELECT array_agg(enumlabel::text ORDER BY enumsortorder) INTO categories FROM pg_enum WHERE enumtypid=category_type;
  IF categories IS DISTINCT FROM ARRAY['public','contact','internal','financial','care','security'] THEN
    RAISE EXCEPTION 'C1: six-category enum mismatch %', categories; END IF;
  IF EXISTS (SELECT 1 FROM pg_constraint c JOIN pg_attribute a ON a.attrelid=c.conrelid AND a.attnum=ANY(c.conkey)
    WHERE c.conrelid='public.field_policies'::regclass AND c.contype='f' AND a.attname='field_key') THEN
    RAISE EXCEPTION 'C1: field_key must not have a foreign key'; END IF;
  RAISE NOTICE 'C1: table, category enum, text dimensions, nullable tenant and RLS catalog checks passed';

  IF EXISTS (SELECT 1 FROM public.field_policies WHERE tenant_id IS NOT NULL) THEN
    RAISE EXCEPTION 'C4: seed must keep tenant overrides dormant'; END IF;
  -- Supplement column shapes, checked while each column is still classified.
  IF EXISTS (SELECT 1 FROM public.field_policies WHERE record_type='donations' AND field_key='stripe_refund_ids')
    AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public'
    AND table_name='donations' AND column_name='stripe_refund_ids' AND data_type='ARRAY'
    AND udt_name='_text' AND is_nullable='NO' AND column_default=quote_literal('{}')||'::text[]') THEN
    RAISE EXCEPTION 'C4: exact repository supplement must be required TEXT[] with empty-array default'; END IF;
  IF EXISTS (SELECT 1 FROM public.field_policies WHERE record_type='donors' AND field_key='email_normalized')
    AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='donors'
    AND column_name='email_normalized' AND data_type='text' AND is_generated='ALWAYS' AND is_nullable='YES') THEN
    RAISE EXCEPTION 'C4: identity supplement must be generated TEXT email_normalized'; END IF;
  IF EXISTS (SELECT 1 FROM public.field_policies WHERE record_type='donors' AND field_key='email_verified_at')
    AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='donors'
    AND column_name='email_verified_at' AND data_type='timestamp with time zone' AND column_default IS NULL
    AND is_nullable='YES') THEN
    RAISE EXCEPTION 'C4: identity supplement must be nullable TIMESTAMPTZ email_verified_at'; END IF;
  -- AL-2678 (WP5 part 1): the person anchor is dropped and parties replaces
  -- it, so persons, both person_id columns and their rows must be absent, and
  -- the Party keys present.
  SELECT string_agg(c.table_name, ', ') INTO bad FROM information_schema.columns c
    WHERE c.table_schema='public' AND c.column_name='person_id';
  IF bad IS NOT NULL OR to_regclass('public.persons') IS NOT NULL
    OR EXISTS (SELECT 1 FROM public.field_policies WHERE field_key='person_id') THEN
    RAISE EXCEPTION 'C4: the dropped person anchor must leave no table, column or row: %', bad; END IF;
  SELECT string_agg(k, ', ') INTO bad FROM unnest(array['donors.party_id','missionaries.party_id','parties.security_level']) k
    WHERE NOT EXISTS (SELECT 1 FROM public.field_policies f WHERE f.record_type||'.'||f.field_key=k AND f.tenant_id IS NULL);
  IF bad IS NOT NULL THEN
    RAISE EXCEPTION 'C4: the Party keys must be classified: %', bad; END IF;
  -- AL-2677: only the reviewed report output fields have no physical column.
  -- Both physical and derived fields retain all five surface and category checks.
  SELECT string_agg(DISTINCT p.record_type||'.'||p.field_key, ', ') INTO bad
    FROM public.field_policies p
    WHERE NOT (p.record_type='crm_report_groups' AND p.field_key IN
      ('id','tenant_id','label','net_amount_cents','gift_count','donor_count','last_gift_at','report_complete','report_gift_limit'))
      AND NOT EXISTS (SELECT 1 FROM information_schema.columns c WHERE c.table_schema='public'
      AND c.table_name=p.record_type AND c.column_name=p.field_key);
  IF bad IS NOT NULL THEN RAISE EXCEPTION 'C4: baseline rows name missing columns: %',bad; END IF;
  SELECT string_agg(record_type||'.'||field_key, ', ') INTO bad FROM (
    SELECT record_type, field_key FROM public.field_policies WHERE tenant_id IS NULL
    GROUP BY record_type, field_key
    HAVING count(*)<>5 OR count(DISTINCT surface)<>5
      OR bool_or(surface NOT IN ('mission_control','donor','missionary','public','export'))) odd;
  IF bad IS NOT NULL THEN RAISE EXCEPTION 'C4: classified columns without exactly five surface rows: %',bad; END IF;
  IF EXISTS (SELECT 1 FROM public.field_policies WHERE field_key LIKE '%.%') THEN
    RAISE EXCEPTION 'C4: seed contains fabricated columns, record types or dotted fields'; END IF;
  IF EXISTS (SELECT 1 FROM public.field_policies GROUP BY record_type,field_key HAVING count(DISTINCT sensitivity_category)>1) THEN
    RAISE EXCEPTION 'C4: one whole column has conflicting category classifications'; END IF;
  IF EXISTS (SELECT 1 FROM public.field_policies WHERE sensitivity_category IS NULL) THEN
    RAISE EXCEPTION 'C4: every seeded column requires a category'; END IF;
  -- D-18, plan 5.4, council 2026-11-21: C4 mirrors the census's sole
  -- same-name override for the anonymous host projection. C6 is unchanged.
  IF EXISTS (SELECT 1 FROM public.field_policies WHERE field_key='tenant_id'
    AND sensitivity_category::text <> CASE WHEN record_type='site_domains' THEN 'public' ELSE 'internal' END)
    OR EXISTS (SELECT 1 FROM public.field_policies WHERE field_key<>'tenant_id'
    GROUP BY field_key HAVING count(DISTINCT sensitivity_category)>1) THEN
    RAISE EXCEPTION 'C4: identical column names disagree by highest applicable category'; END IF;
  IF EXISTS (SELECT 1 FROM public.field_policies WHERE field_key IN ('title','status','type','notes')
    AND sensitivity_category<>'care') THEN
    RAISE EXCEPTION 'C4: title/status/type/notes must retain the highest applicable care category'; END IF;
  IF EXISTS (SELECT 1 FROM public.field_policies WHERE field_key='email' AND sensitivity_category<>'contact') THEN
    RAISE EXCEPTION 'C4: email must be contact-sensitive across record types'; END IF;
  IF EXISTS (SELECT 1 FROM public.field_policies WHERE record_type='missionaries' AND field_key='health_signals' AND sensitivity_category<>'care') THEN
    RAISE EXCEPTION 'C4: whole health_signals column must be care-sensitive'; END IF;
  IF EXISTS (SELECT 1 FROM public.field_policies WHERE record_type='donations'
    AND field_key='stripe_refund_ids' AND sensitivity_category<>'financial') THEN
    RAISE EXCEPTION 'C4: entire refund-identifier array must be financial'; END IF;
  RAISE NOTICE 'C4: physical columns are live; physical and derived fields have five baseline rows and keep their category floors (exact parity: manifest gate)';

  -- Canonical receipts remain absent. Existing repository prototype tables are
  -- not canonical authority and must stay unseeded/denied; their existence is
  -- not a reason to fabricate census rows or drop unrelated base tables.
  -- Base migrations: 20260704120000_gift_receipt_records.sql and
  -- 20260611140000_contribution_receipt_delivery.sql.
  IF to_regclass('public.receipts') IS NOT NULL THEN
    RAISE EXCEPTION 'C5: absent/reserved canonical receipt premise contradicts candidate schema'; END IF;
  IF EXISTS (SELECT 1 FROM public.field_policies WHERE record_type IN ('receipts','gift_receipt_records','contribution_receipt_snapshots')) THEN
    RAISE EXCEPTION 'C5: absent receipts and prototype aliases must have no seed rows'; END IF;
  RAISE NOTICE 'C5: no fabricated receipt source or positive receipt census rows';

  IF EXISTS (SELECT 1 FROM public.field_policies WHERE field_key IN (
    'stripe_charge_id','stripe_customer_id','stripe_subscription_id',
    'stripe_payment_intent_id','stripe_payment_method_id','stripe_refund_ids')
    AND ((surface<>'mission_control' AND (visible OR editable OR exportable)) OR exportable)) THEN
    RAISE EXCEPTION 'C6: processor identifier disclosed outside mission_control static ceiling'; END IF;
  IF EXISTS (SELECT 1 FROM public.field_policies WHERE field_key='stripe_refund_ids' AND editable) THEN
    RAISE EXCEPTION 'C6: refund identifier array must not be policy-editable on any surface'; END IF;
  IF EXISTS (SELECT 1 FROM public.field_policies WHERE surface IN ('donor','missionary','public','export')
    AND sensitivity_category IN ('internal','care','security') AND (visible OR exportable)) THEN
    RAISE EXCEPTION 'C6: internal/care/security column disclosed externally'; END IF;
  RAISE NOTICE 'C6: seeded processor identifiers and restricted categories retain disclosure locks';
END $$;

DO $$
BEGIN
  BEGIN
    INSERT INTO public.field_policies(record_type,field_key,surface,tenant_id,visible,editable,exportable,sensitivity_category)
    SELECT record_type,field_key,surface,tenant_id,visible,editable,exportable,sensitivity_category
    FROM public.field_policies WHERE record_type='donors' AND field_key='email' AND surface='mission_control' AND tenant_id IS NULL;
    RAISE EXCEPTION 'C2: duplicate NULL baseline accepted';
  EXCEPTION WHEN unique_violation THEN NULL; END;
  RAISE NOTICE 'C2: actual duplicate NULL baseline insert rejected';
END $$;
ROLLBACK;
