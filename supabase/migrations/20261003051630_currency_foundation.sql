-- AL-480: packages/api/src/money/metadata.ts is the authority; this is its
-- complete SIX 2026-09-17 monetary seed mirror. Metadata is not payment launch.
BEGIN;

CREATE TABLE public.currency_metadata (
  code text PRIMARY KEY CHECK (code ~ '^[a-z]{3}$'),
  exponent smallint NOT NULL CHECK (exponent IN (0, 2, 3, 4)),
  stripe_charge_exponent smallint NOT NULL CHECK (stripe_charge_exponent IN (0, 2, 3, 4)),
  stripe_payout_exponent smallint NOT NULL CHECK (stripe_payout_exponent IN (0, 2, 3, 4)),
  stripe_charge_multiple integer NOT NULL CHECK (stripe_charge_multiple > 0),
  stripe_payout_multiple integer NOT NULL CHECK (stripe_payout_multiple > 0)
);
INSERT INTO public.currency_metadata
  (code, exponent, stripe_charge_exponent, stripe_payout_exponent, stripe_charge_multiple, stripe_payout_multiple)
VALUES
  ('aed', 2, 2, 2, 1, 1),
  ('afn', 2, 2, 2, 1, 1),
  ('all', 2, 2, 2, 1, 1),
  ('amd', 2, 2, 2, 1, 1),
  ('aoa', 2, 2, 2, 1, 1),
  ('ars', 2, 2, 2, 1, 1),
  ('aud', 2, 2, 2, 1, 1),
  ('awg', 2, 2, 2, 1, 1),
  ('azn', 2, 2, 2, 1, 1),
  ('bam', 2, 2, 2, 1, 1),
  ('bbd', 2, 2, 2, 1, 1),
  ('bdt', 2, 2, 2, 1, 1),
  ('bhd', 3, 3, 3, 10, 10),
  ('bif', 0, 0, 0, 1, 1),
  ('bmd', 2, 2, 2, 1, 1),
  ('bnd', 2, 2, 2, 1, 1),
  ('bob', 2, 2, 2, 1, 1),
  ('bov', 2, 2, 2, 1, 1),
  ('brl', 2, 2, 2, 1, 1),
  ('bsd', 2, 2, 2, 1, 1),
  ('btn', 2, 2, 2, 1, 1),
  ('bwp', 2, 2, 2, 1, 1),
  ('byn', 2, 2, 2, 1, 1),
  ('bzd', 2, 2, 2, 1, 1),
  ('cad', 2, 2, 2, 1, 1),
  ('cdf', 2, 2, 2, 1, 1),
  ('che', 2, 2, 2, 1, 1),
  ('chf', 2, 2, 2, 1, 1),
  ('chw', 2, 2, 2, 1, 1),
  ('clf', 4, 4, 4, 1, 1),
  ('clp', 0, 0, 0, 1, 1),
  ('cny', 2, 2, 2, 1, 1),
  ('cop', 2, 2, 2, 1, 1),
  ('cou', 2, 2, 2, 1, 1),
  ('crc', 2, 2, 2, 1, 1),
  ('cup', 2, 2, 2, 1, 1),
  ('cve', 2, 2, 2, 1, 1),
  ('czk', 2, 2, 2, 1, 1),
  ('djf', 0, 0, 0, 1, 1),
  ('dkk', 2, 2, 2, 1, 1),
  ('dop', 2, 2, 2, 1, 1),
  ('dzd', 2, 2, 2, 1, 1),
  ('egp', 2, 2, 2, 1, 1),
  ('ern', 2, 2, 2, 1, 1),
  ('etb', 2, 2, 2, 1, 1),
  ('eur', 2, 2, 2, 1, 1),
  ('fjd', 2, 2, 2, 1, 1),
  ('fkp', 2, 2, 2, 1, 1),
  ('gbp', 2, 2, 2, 1, 1),
  ('gel', 2, 2, 2, 1, 1),
  ('ghs', 2, 2, 2, 1, 1),
  ('gip', 2, 2, 2, 1, 1),
  ('gmd', 2, 2, 2, 1, 1),
  ('gnf', 0, 0, 0, 1, 1),
  ('gtq', 2, 2, 2, 1, 1),
  ('gyd', 2, 2, 2, 1, 1),
  ('hkd', 2, 2, 2, 1, 1),
  ('hnl', 2, 2, 2, 1, 1),
  ('htg', 2, 2, 2, 1, 1),
  ('huf', 2, 2, 2, 1, 100),
  ('idr', 2, 2, 2, 1, 1),
  ('ils', 2, 2, 2, 1, 1),
  ('inr', 2, 2, 2, 1, 1),
  ('iqd', 3, 3, 3, 10, 10),
  ('irr', 2, 2, 2, 1, 1),
  ('isk', 0, 2, 2, 100, 100),
  ('jmd', 2, 2, 2, 1, 1),
  ('jod', 3, 3, 3, 10, 10),
  ('jpy', 0, 0, 0, 1, 1),
  ('kes', 2, 2, 2, 1, 1),
  ('kgs', 2, 2, 2, 1, 1),
  ('khr', 2, 2, 2, 1, 1),
  ('kmf', 0, 0, 0, 1, 1),
  ('kpw', 2, 2, 2, 1, 1),
  ('krw', 0, 0, 0, 1, 1),
  ('kwd', 3, 3, 3, 10, 10),
  ('kyd', 2, 2, 2, 1, 1),
  ('kzt', 2, 2, 2, 1, 1),
  ('lak', 2, 2, 2, 1, 1),
  ('lbp', 2, 2, 2, 1, 1),
  ('lkr', 2, 2, 2, 1, 1),
  ('lrd', 2, 2, 2, 1, 1),
  ('lsl', 2, 2, 2, 1, 1),
  ('lyd', 3, 3, 3, 10, 10),
  ('mad', 2, 2, 2, 1, 1),
  ('mdl', 2, 2, 2, 1, 1),
  ('mga', 2, 0, 0, 1, 1),
  ('mkd', 2, 2, 2, 1, 1),
  ('mmk', 2, 2, 2, 1, 1),
  ('mnt', 2, 2, 2, 1, 1),
  ('mop', 2, 2, 2, 1, 1),
  ('mru', 2, 2, 2, 1, 1),
  ('mur', 2, 2, 2, 1, 1),
  ('mvr', 2, 2, 2, 1, 1),
  ('mwk', 2, 2, 2, 1, 1),
  ('mxn', 2, 2, 2, 1, 1),
  ('mxv', 2, 2, 2, 1, 1),
  ('myr', 2, 2, 2, 1, 1),
  ('mzn', 2, 2, 2, 1, 1),
  ('nad', 2, 2, 2, 1, 1),
  ('ngn', 2, 2, 2, 1, 1),
  ('nio', 2, 2, 2, 1, 1),
  ('nok', 2, 2, 2, 1, 1),
  ('npr', 2, 2, 2, 1, 1),
  ('nzd', 2, 2, 2, 1, 1),
  ('omr', 3, 3, 3, 10, 10),
  ('pab', 2, 2, 2, 1, 1),
  ('pen', 2, 2, 2, 1, 1),
  ('pgk', 2, 2, 2, 1, 1),
  ('php', 2, 2, 2, 1, 1),
  ('pkr', 2, 2, 2, 1, 1),
  ('pln', 2, 2, 2, 1, 1),
  ('pyg', 0, 0, 0, 1, 1),
  ('qar', 2, 2, 2, 1, 1),
  ('ron', 2, 2, 2, 1, 1),
  ('rsd', 2, 2, 2, 1, 1),
  ('rub', 2, 2, 2, 1, 1),
  ('rwf', 0, 0, 0, 1, 1),
  ('sar', 2, 2, 2, 1, 1),
  ('sbd', 2, 2, 2, 1, 1),
  ('scr', 2, 2, 2, 1, 1),
  ('sdg', 2, 2, 2, 1, 1),
  ('sek', 2, 2, 2, 1, 1),
  ('sgd', 2, 2, 2, 1, 1),
  ('shp', 2, 2, 2, 1, 1),
  ('sle', 2, 2, 2, 1, 1),
  ('sos', 2, 2, 2, 1, 1),
  ('srd', 2, 2, 2, 1, 1),
  ('ssp', 2, 2, 2, 1, 1),
  ('stn', 2, 2, 2, 1, 1),
  ('svc', 2, 2, 2, 1, 1),
  ('syp', 2, 2, 2, 1, 1),
  ('szl', 2, 2, 2, 1, 1),
  ('thb', 2, 2, 2, 1, 1),
  ('tjs', 2, 2, 2, 1, 1),
  ('tmt', 2, 2, 2, 1, 1),
  ('tnd', 3, 3, 3, 10, 10),
  ('top', 2, 2, 2, 1, 1),
  ('try', 2, 2, 2, 1, 1),
  ('ttd', 2, 2, 2, 1, 1),
  ('twd', 2, 2, 2, 1, 100),
  ('tzs', 2, 2, 2, 1, 1),
  ('uah', 2, 2, 2, 1, 1),
  ('ugx', 0, 2, 2, 100, 100),
  ('usd', 2, 2, 2, 1, 1),
  ('usn', 2, 2, 2, 1, 1),
  ('uyi', 0, 0, 0, 1, 1),
  ('uyu', 2, 2, 2, 1, 1),
  ('uyw', 4, 4, 4, 1, 1),
  ('uzs', 2, 2, 2, 1, 1),
  ('ved', 2, 2, 2, 1, 1),
  ('ves', 2, 2, 2, 1, 1),
  ('vnd', 0, 0, 0, 1, 1),
  ('vuv', 0, 0, 0, 1, 1),
  ('wst', 2, 2, 2, 1, 1),
  ('xad', 2, 2, 2, 1, 1),
  ('xaf', 0, 0, 0, 1, 1),
  ('xcd', 2, 2, 2, 1, 1),
  ('xcg', 2, 2, 2, 1, 1),
  ('xof', 0, 0, 0, 1, 1),
  ('xpf', 0, 0, 0, 1, 1),
  ('yer', 2, 2, 2, 1, 1),
  ('zar', 2, 2, 2, 1, 1),
  ('zmw', 2, 2, 2, 1, 1),
  ('zwg', 2, 2, 2, 1, 1);

ALTER TABLE public.currency_metadata ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.currency_metadata FROM PUBLIC, anon, authenticated, service_role;
GRANT SELECT ON public.currency_metadata TO anon, authenticated, service_role;
CREATE POLICY currency_metadata_read ON public.currency_metadata
  FOR SELECT TO anon, authenticated USING (true);
COMMENT ON TABLE public.currency_metadata IS
  'Read-only mirror of packages/api/src/money/metadata.ts; ISO monetary units do not authorize transactions.';

-- Match JS String.trim's whitespace and lower-case storage used by giving RPCs.
CREATE FUNCTION public.normalize_currency_code(value text) RETURNS text
LANGUAGE sql IMMUTABLE STRICT SECURITY INVOKER SET search_path = ''
AS $$ SELECT lower(btrim(value, E' \t\n\r\v\f' || chr(160) || chr(5760) ||
  chr(8192) || chr(8193) || chr(8194) || chr(8195) || chr(8196) || chr(8197) ||
  chr(8198) || chr(8199) || chr(8200) || chr(8201) || chr(8202) || chr(8232) ||
  chr(8233) || chr(8239) || chr(8287) || chr(12288) || chr(65279))) $$;
CREATE FUNCTION public.normalize_money_currency() RETURNS trigger
LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
BEGIN
  NEW.currency := public.normalize_currency_code(NEW.currency);
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.normalize_currency_code(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.normalize_money_currency() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.normalize_currency_code(text) TO service_role;

ALTER TABLE public.campaigns ADD COLUMN currency text NOT NULL DEFAULT 'usd';

UPDATE public.campaigns SET currency = public.normalize_currency_code(currency)
  WHERE currency IS DISTINCT FROM public.normalize_currency_code(currency);
ALTER TABLE public.campaigns ADD CONSTRAINT campaigns_currency_iso_fkey
  FOREIGN KEY (currency) REFERENCES public.currency_metadata(code);
CREATE TRIGGER campaigns_normalize_currency BEFORE INSERT OR UPDATE OF currency
  ON public.campaigns FOR EACH ROW EXECUTE FUNCTION public.normalize_money_currency();

UPDATE public.donations SET currency = public.normalize_currency_code(currency)
  WHERE currency IS DISTINCT FROM public.normalize_currency_code(currency);
ALTER TABLE public.donations ADD CONSTRAINT donations_currency_iso_fkey
  FOREIGN KEY (currency) REFERENCES public.currency_metadata(code);
CREATE TRIGGER donations_normalize_currency BEFORE INSERT OR UPDATE OF currency
  ON public.donations FOR EACH ROW EXECUTE FUNCTION public.normalize_money_currency();

UPDATE public.staged_gifts SET currency = public.normalize_currency_code(currency)
  WHERE currency IS DISTINCT FROM public.normalize_currency_code(currency);
ALTER TABLE public.staged_gifts ADD CONSTRAINT staged_gifts_currency_iso_fkey
  FOREIGN KEY (currency) REFERENCES public.currency_metadata(code);
CREATE TRIGGER staged_gifts_normalize_currency BEFORE INSERT OR UPDATE OF currency
  ON public.staged_gifts FOR EACH ROW EXECUTE FUNCTION public.normalize_money_currency();

UPDATE public.donor_pledges SET currency = public.normalize_currency_code(currency)
  WHERE currency IS DISTINCT FROM public.normalize_currency_code(currency);
ALTER TABLE public.donor_pledges ADD CONSTRAINT donor_pledges_currency_iso_fkey
  FOREIGN KEY (currency) REFERENCES public.currency_metadata(code);
CREATE TRIGGER donor_pledges_normalize_currency BEFORE INSERT OR UPDATE OF currency
  ON public.donor_pledges FOR EACH ROW EXECUTE FUNCTION public.normalize_money_currency();

UPDATE public.pledge_charge_attempts SET currency = public.normalize_currency_code(currency)
  WHERE currency IS DISTINCT FROM public.normalize_currency_code(currency);
ALTER TABLE public.pledge_charge_attempts ADD CONSTRAINT pledge_charge_attempts_currency_iso_fkey
  FOREIGN KEY (currency) REFERENCES public.currency_metadata(code);
CREATE TRIGGER pledge_charge_attempts_normalize_currency BEFORE INSERT OR UPDATE OF currency
  ON public.pledge_charge_attempts FOR EACH ROW EXECUTE FUNCTION public.normalize_money_currency();

UPDATE public.funds SET currency = public.normalize_currency_code(currency)
  WHERE currency IS DISTINCT FROM public.normalize_currency_code(currency);
ALTER TABLE public.funds ADD CONSTRAINT funds_currency_iso_fkey
  FOREIGN KEY (currency) REFERENCES public.currency_metadata(code);
CREATE TRIGGER funds_normalize_currency BEFORE INSERT OR UPDATE OF currency
  ON public.funds FOR EACH ROW EXECUTE FUNCTION public.normalize_money_currency();

-- Deferred nullable reference/projection of immutable Phase20 provider evidence.
-- No legacy giving contexts or references are added (amended Phase2 Data Model).
CREATE TABLE public.currency_rate_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id),
  provider_evidence_id uuid,
  provider_balance_transaction_id text,
  presentment_currency text REFERENCES public.currency_metadata(code),
  settlement_currency text REFERENCES public.currency_metadata(code),
  presentment_amount_minor bigint,
  settled_amount_minor bigint,
  fee_minor bigint,
  net_minor bigint,
  exchange_rate numeric,
  observed_at timestamptz
);
CREATE INDEX currency_rate_snapshots_tenant_idx ON public.currency_rate_snapshots(tenant_id);
ALTER TABLE public.currency_rate_snapshots ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.currency_rate_snapshots FROM PUBLIC, anon, authenticated, service_role;
COMMENT ON TABLE public.currency_rate_snapshots IS
  'Empty Phase2 reservation only. Future immutable Phase20 D9/D20 provider evidence projection; no editable FX authority or current writer.';
COMMENT ON COLUMN public.currency_rate_snapshots.provider_evidence_id IS
  'Nullable future Phase20 evidence reference; no FK until that owner defines its physical identity.';
COMMENT ON COLUMN public.currency_rate_snapshots.tenant_id IS
  'Deferred nullable owner context; no rows admitted in Phase2. Future activation must qualify exact financial owner and scope.';

COMMIT;
