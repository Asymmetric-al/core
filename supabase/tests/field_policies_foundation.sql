-- AL-491 acceptance-v2: disposable local database only; every write rolls back.
-- Live capture: pnmlrbgjiqzzsthsoikm, 2026-10-05 04:51:45.072671+00,
-- schema migration 20261001061717, repository ffa812656b0ff920b3fe014a31d2d57ee8679288.
-- Capture SHA256: 0ab1165501bf059ba12c71898cb9597725282be458ab0c71e6280c1064e4736a.
-- Execute with psql -v ON_ERROR_STOP=1 after applying candidate migrations.
BEGIN;
CREATE TEMP TABLE expected_field_policy_columns(record_type text, field_key text, PRIMARY KEY(record_type,field_key));
INSERT INTO expected_field_policy_columns VALUES
  ('donations','id'),
  ('donations','tenant_id'),
  ('donations','donor_id'),
  ('donations','missionary_id'),
  ('donations','fund_id'),
  ('donations','amount'),
  ('donations','currency'),
  ('donations','status'),
  ('donations','donation_type'),
  ('donations','payment_method'),
  ('donations','is_recurring'),
  ('donations','recurring_interval'),
  ('donations','notes'),
  ('donations','stripe_payment_intent_id'),
  ('donations','created_at'),
  ('donations','updated_at'),
  ('donations','gift_date'),
  ('donations','campaign_id'),
  ('donations','pledge_id'),
  ('donations','processed_at'),
  ('donations','completed_at'),
  ('donations','failed_at'),
  ('donations','error_code'),
  ('donations','error_message'),
  ('donations','stripe_charge_id'),
  ('donations','refunded_at'),
  ('donations','refund_amount'),
  ('donations','source'),
  ('donor_pledges','id'),
  ('donor_pledges','donor_id'),
  ('donor_pledges','amount'),
  ('donor_pledges','frequency'),
  ('donor_pledges','status'),
  ('donor_pledges','start_date'),
  ('donor_pledges','end_date'),
  ('donor_pledges','next_payment_date'),
  ('donor_pledges','total_paid'),
  ('donor_pledges','total_expected'),
  ('donor_pledges','payments_completed'),
  ('donor_pledges','payments_remaining'),
  ('donor_pledges','payment_method'),
  ('donor_pledges','created_at'),
  ('donor_pledges','updated_at'),
  ('donor_pledges','tenant_id'),
  ('donor_pledges','missionary_id'),
  ('donor_pledges','fund_id'),
  ('donor_pledges','currency'),
  ('donor_pledges','stripe_subscription_id'),
  ('donor_pledges','retry_count'),
  ('donor_pledges','last_charge_at'),
  ('donor_pledges','next_charge_at'),
  ('donor_pledges','billing_day_of_month'),
  ('donor_pledges','billing_timezone'),
  ('donor_pledges','stripe_payment_method_id'),
  ('donor_pledges','last_charge_attempt'),
  ('donor_pledges','failed_charge_count'),
  ('donor_pledges','pause_reason'),
  ('donor_pledges','paused_at'),
  ('donors','id'),
  ('donors','tenant_id'),
  ('donors','profile_id'),
  ('donors','missionary_id'),
  ('donors','name'),
  ('donors','email'),
  ('donors','phone'),
  ('donors','mobile'),
  ('donors','work_phone'),
  ('donors','preferred_contact'),
  ('donors','avatar_url'),
  ('donors','location'),
  ('donors','type'),
  ('donors','status'),
  ('donors','giving_preferences'),
  ('donors','total_given'),
  ('donors','last_gift_date'),
  ('donors','last_gift_amount'),
  ('donors','frequency'),
  ('donors','joined_date'),
  ('donors','tags'),
  ('donors','score'),
  ('donors','address'),
  ('donors','work_address'),
  ('donors','website'),
  ('donors','organization'),
  ('donors','title'),
  ('donors','birthday'),
  ('donors','anniversary'),
  ('donors','spouse'),
  ('donors','notes'),
  ('donors','has_active_pledge'),
  ('donors','stripe_customer_id'),
  ('donors','created_at'),
  ('donors','updated_at'),
  ('donors','first_gift_date'),
  ('donors','gift_count'),
  ('donors','do_not_contact'),
  ('donors','do_not_email'),
  ('donors','receipt_email_frequency'),
  ('donors','default_update_frequency'),
  ('donors','preferred_language'),
  ('member_care_activities','id'),
  ('member_care_activities','tenant_id'),
  ('member_care_activities','missionary_id'),
  ('member_care_activities','author_user_id'),
  ('member_care_activities','author_name_snapshot'),
  ('member_care_activities','type'),
  ('member_care_activities','title'),
  ('member_care_activities','description'),
  ('member_care_activities','occurred_at'),
  ('member_care_activities','created_at'),
  ('member_care_activities','updated_at'),
  ('member_care_goals','id'),
  ('member_care_goals','tenant_id'),
  ('member_care_goals','missionary_id'),
  ('member_care_goals','title'),
  ('member_care_goals','status'),
  ('member_care_goals','target_date'),
  ('member_care_goals','updated_by'),
  ('member_care_goals','created_at'),
  ('member_care_goals','updated_at'),
  ('member_care_private_notes','id'),
  ('member_care_private_notes','tenant_id'),
  ('member_care_private_notes','missionary_id'),
  ('member_care_private_notes','author_user_id'),
  ('member_care_private_notes','author_name_snapshot'),
  ('member_care_private_notes','content'),
  ('member_care_private_notes','created_at'),
  ('member_care_private_notes','updated_at'),
  ('member_care_requirements','id'),
  ('member_care_requirements','tenant_id'),
  ('member_care_requirements','missionary_id'),
  ('member_care_requirements','activity_type'),
  ('member_care_requirements','interval_days'),
  ('member_care_requirements','notes'),
  ('member_care_requirements','updated_by'),
  ('member_care_requirements','created_at'),
  ('member_care_requirements','updated_at'),
  ('missionaries','id'),
  ('missionaries','tenant_id'),
  ('missionaries','profile_id'),
  ('missionaries','bio'),
  ('missionaries','mission_field'),
  ('missionaries','funding_goal'),
  ('missionaries','current_funding'),
  ('missionaries','tagline'),
  ('missionaries','location'),
  ('missionaries','phone'),
  ('missionaries','cover_url'),
  ('missionaries','social_links'),
  ('missionaries','created_at'),
  ('missionaries','updated_at'),
  ('missionaries','timezone'),
  ('missionaries','region'),
  ('missionaries','health_status'),
  ('missionaries','last_check_in'),
  ('missionaries','manual_attention'),
  ('missionaries','health_signals'),
  ('missionaries','birth_date'),
  ('profiles','id'),
  ('profiles','user_id'),
  ('profiles','email'),
  ('profiles','first_name'),
  ('profiles','last_name'),
  ('profiles','full_name'),
  ('profiles','display_name'),
  ('profiles','phone'),
  ('profiles','avatar_url'),
  ('profiles','role'),
  ('profiles','tenant_id'),
  ('profiles','created_at'),
  ('profiles','updated_at');

-- Exact repository-source/local-catalog supplement, not a live capture amendment.
-- The 171 rows above remain the original immutable live metadata inventory.
-- Base repository ffa812656b0ff920b3fe014a31d2d57ee8679288 contains this
-- additive migration. The column is absent from the hosted live capture.
CREATE TEMP TABLE expected_field_policy_supplement(
  record_type text, field_key text, source_path text, source_sha256 text,
  repository_base_sha text, PRIMARY KEY(record_type,field_key));
INSERT INTO expected_field_policy_supplement VALUES
  ('donations','stripe_refund_ids',
   'supabase/migrations/20260702090000_donation_stripe_refund_ids.sql',
   '2fd5fe0c396d9662e5595b1f24879c4b3dc5404b9ab24b7c0ff60c144d1b9bda',
   'ffa812656b0ff920b3fe014a31d2d57ee8679288');
INSERT INTO expected_field_policy_columns(record_type,field_key)
  SELECT record_type,field_key FROM expected_field_policy_supplement;

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
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public'
    AND table_name='donations' AND column_name='stripe_refund_ids' AND data_type='ARRAY'
    AND udt_name='_text' AND is_nullable='NO' AND column_default=quote_literal('{}')||'::text[]') THEN
    RAISE EXCEPTION 'C4: exact repository supplement must be required TEXT[] with empty-array default'; END IF;
  SELECT string_agg(record_type||'.'||field_key, ', ') INTO bad FROM (
    SELECT record_type,field_key FROM expected_field_policy_columns
    EXCEPT SELECT c.table_name,c.column_name FROM information_schema.columns c WHERE c.table_schema='public'
  ) missing;
  IF bad IS NOT NULL THEN RAISE EXCEPTION 'C4: captured columns missing in candidate schema: %',bad; END IF;
  SELECT string_agg(table_name||'.'||column_name, ', ') INTO bad FROM (
    SELECT c.table_name,c.column_name FROM information_schema.columns c WHERE c.table_schema='public'
      AND c.table_name IN (SELECT DISTINCT record_type FROM expected_field_policy_columns)
    EXCEPT SELECT record_type,field_key FROM expected_field_policy_columns
  ) extra;
  IF bad IS NOT NULL THEN RAISE EXCEPTION 'C4: candidate schema has uncensused columns: %',bad; END IF;
  SELECT string_agg(e.record_type||'.'||e.field_key||'@'||s.surface, ', ') INTO bad
    FROM expected_field_policy_columns e CROSS JOIN (VALUES ('mission_control'),('donor'),('missionary'),('public'),('export')) s(surface)
    LEFT JOIN public.field_policies p ON p.record_type=e.record_type AND p.field_key=e.field_key AND p.surface=s.surface AND p.tenant_id IS NULL
    WHERE p.field_key IS NULL;
  IF bad IS NOT NULL THEN RAISE EXCEPTION 'C4: missing baseline policy rows: %',bad; END IF;
  IF (SELECT count(*) FROM expected_field_policy_columns)<>172 OR
    (SELECT count(*) FROM public.field_policies)<>860 THEN
    RAISE EXCEPTION 'C4: expected exactly 171 live columns + one source supplement and 860 baseline rows'; END IF;
  IF EXISTS (SELECT 1 FROM public.field_policies p LEFT JOIN expected_field_policy_columns e USING(record_type,field_key)
    WHERE e.field_key IS NULL OR p.field_key LIKE '%.%') THEN
    RAISE EXCEPTION 'C4: seed contains fabricated columns, record types or dotted fields'; END IF;
  IF EXISTS (SELECT 1 FROM public.field_policies GROUP BY record_type,field_key HAVING count(DISTINCT sensitivity_category)>1) THEN
    RAISE EXCEPTION 'C4: one whole column has conflicting category classifications'; END IF;
  IF EXISTS (SELECT 1 FROM public.field_policies WHERE sensitivity_category IS NULL) THEN
    RAISE EXCEPTION 'C4: every seeded column requires a category'; END IF;
  IF EXISTS (SELECT 1 FROM public.field_policies
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
  RAISE NOTICE 'C4: 171 immutable live columns + exact one-column repository supplement have 860 baseline rows';

  -- Canonical receipts remain absent. Existing repository prototype tables are
  -- not canonical authority and must stay unseeded/denied; their existence is
  -- not a reason to fabricate census rows or drop unrelated base tables.
  -- Base migrations: 20260704120000_gift_receipt_records.sql and
  -- 20260611140000_contribution_receipt_delivery.sql, at the base SHA above.
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
