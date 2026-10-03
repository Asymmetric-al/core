-- Local disposable database probes; seeded baseline required. All writes roll back.
BEGIN;
INSERT INTO public.staged_gifts(tenant_id, donation_id, amount)
SELECT tenant_id, id, amount FROM public.donations ORDER BY id LIMIT 1;
DO $$
DECLARE t text; n integer;
BEGIN
  SELECT count(*) INTO n FROM public.currency_metadata;
  IF n <> 165 THEN RAISE EXCEPTION 'metadata count %', n; END IF;
  IF (SELECT exponent FROM public.currency_metadata WHERE code='jpy')<>0 OR
     (SELECT exponent FROM public.currency_metadata WHERE code='usd')<>2 OR
     (SELECT exponent FROM public.currency_metadata WHERE code='bhd')<>3 THEN
    RAISE EXCEPTION 'literal exponent mismatch'; END IF;
  FOREACH t IN ARRAY ARRAY['campaigns','donations','staged_gifts','donor_pledges','pledge_charge_attempts','funds'] LOOP
    EXECUTE format('UPDATE public.%I SET currency = %L WHERE id=(SELECT id FROM public.%I LIMIT 1)',t,'  JPY  ',t);
    GET DIAGNOSTICS n = ROW_COUNT;
    IF n <> 1 THEN RAISE EXCEPTION 'no seeded row in %',t; END IF;
    EXECUTE format('SELECT count(*) FROM public.%I WHERE currency=%L',t,'jpy') INTO n;
    IF n<1 THEN RAISE EXCEPTION 'normalization failed %',t; END IF;
    BEGIN
      EXECUTE format('UPDATE public.%I SET currency=%L',t,'ZZZ');
      RAISE EXCEPTION 'unknown ISO accepted by %',t;
    EXCEPTION WHEN foreign_key_violation THEN NULL;
    END;
    RAISE NOTICE 'ISO validation/normalization passed %',t;
  END LOOP;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='campaigns' AND column_name='currency'
    AND is_nullable='NO' AND data_type='text' AND column_default=quote_literal('usd') || '::text') THEN
    RAISE EXCEPTION 'campaign currency default/type/nullability mismatch'; END IF;
  BEGIN
    UPDATE public.campaigns SET currency=NULL;
    RAISE EXCEPTION 'campaign null currency accepted';
  EXCEPTION WHEN not_null_violation THEN NULL; END;
  IF EXISTS(SELECT 1 FROM public.currency_rate_snapshots) THEN RAISE EXCEPTION 'snapshots not empty'; END IF;
  FOREACH t IN ARRAY ARRAY['anon','authenticated','service_role'] LOOP
    IF has_table_privilege(t,'public.currency_metadata','INSERT,UPDATE,DELETE') THEN RAISE EXCEPTION 'metadata writer %',t; END IF;
    IF has_table_privilege(t,'public.currency_rate_snapshots','SELECT,INSERT,UPDATE,DELETE') THEN RAISE EXCEPTION 'snapshot access %',t; END IF;
  END LOOP;
END;
$$;
SET LOCAL ROLE anon;
DO $$ BEGIN
  BEGIN UPDATE public.currency_metadata SET exponent=3 WHERE code='usd';
    RAISE EXCEPTION 'anon metadata write permitted';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN PERFORM * FROM public.currency_rate_snapshots;
    RAISE EXCEPTION 'anon snapshots visible';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
SELECT count(*) AS metadata_anon_visible FROM public.currency_metadata;
RESET ROLE;
SET LOCAL ROLE authenticated;
DO $$ BEGIN
  BEGIN INSERT INTO public.currency_metadata VALUES ('zzz',2,2,2,1,1);
    RAISE EXCEPTION 'authenticated metadata write permitted';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN PERFORM * FROM public.currency_rate_snapshots;
    RAISE EXCEPTION 'authenticated snapshots visible';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
SELECT count(*) AS metadata_authenticated_visible FROM public.currency_metadata;
RESET ROLE;
ROLLBACK;
