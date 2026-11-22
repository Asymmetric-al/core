-- Give every fund and missionary a legal entity and retain it once any of
-- the five money tables names that target. This includes pledges, staging
-- and the saga outbox: even abandoned money was directed to that entity.
-- Moving future activity to another entity requires a new target, and a
-- target that a lock names cannot be deleted (fix check K9, 21 November).
-- Deviation from plan line 910 ("once a gift names it"), accepted by the
-- coordinator on 21 November 2026: a row on any of the five tables fixes the
-- entity for good, also when that row is later rejected, abandoned or removed,
-- because money in flight was sent toward the entity the target had then.
-- Check first, on preview and then production: the read-only operator query
-- scripts/sql/giving-target-preflight.sql must return no rows (a fund or
-- missionary with no tenant; a tenant whose name is blank, which its legal
-- entity could not copy; a money row naming another tenant's fund or
-- missionary). The preflight below repeats that test under the table locks
-- and, if it finds any, stops with the counts before anything is changed.
-- Apply in a quiet window: the opening lock excludes writers on eight tables
-- (tenants, funds, missionaries and the five money tables) before the
-- preflight, so no name or target changes between the test and the copy; ALTER
-- TABLE upgrades locks to ACCESS EXCLUSIVE and holds them through COMMIT,
-- including backfill, index builds and validation of all ten references.
-- Deploy order (plan 7.4): dropping donations_missionary_id_fkey and leaving
-- only the composite (tenant_id, missionary_id) key breaks any running app
-- whose DONATION_WITH_PARTIES_SELECT embeds `missionaries!missionary_id`. Safe
-- for a running release that carries the unhinted embed (expand PR #TBD,
-- `fix/AL-2674-health-probe-embed-expand`, released and promoted on all three
-- apps first by the coordinator) and NOT for an older one, whose GET donations,
-- donor GraphQL donation queries and gift POST read-backs fail from this
-- migration's COMMIT (and stay down if the release stops after db push). A
-- release that carries this part must build all three apps.
-- Forward only: dropping the locks could reassign historical money. Rebuild
-- a disposable database from source, or repair forward preserving history.
BEGIN;
SET LOCAL lock_timeout='5s';
LOCK TABLE public.tenants, public.funds, public.missionaries, public.donations, public.donor_pledges,
  public.staged_gifts, public.staged_gift_allocations, public.donation_saga_outbox IN SHARE ROW EXCLUSIVE MODE;
DO $$
DECLARE
  source_table text;
  null_funds bigint;
  null_missionaries bigint;
  wrong_funds bigint := 0;
  wrong_missionaries bigint := 0;
  fund_count bigint;
  missionary_count bigint;
  blank_names bigint;
  blank_ids text;
BEGIN
  SELECT count(*), string_agg(id::text, ', ' ORDER BY id) INTO blank_names, blank_ids
    FROM public.tenants WHERE btrim(name) = '';
  SELECT count(*) INTO null_funds FROM public.funds WHERE tenant_id IS NULL;
  SELECT count(*) INTO null_missionaries FROM public.missionaries WHERE tenant_id IS NULL;
  FOREACH source_table IN ARRAY ARRAY['donations','donor_pledges','staged_gifts','staged_gift_allocations','donation_saga_outbox'] LOOP
    EXECUTE format('SELECT count(*) FILTER (WHERE g.fund_id IS NOT NULL AND (g.tenant_id IS NULL OR g.tenant_id IS DISTINCT FROM f.tenant_id)),
                           count(*) FILTER (WHERE g.missionary_id IS NOT NULL AND (g.tenant_id IS NULL OR g.tenant_id IS DISTINCT FROM m.tenant_id))
                    FROM public.%I g LEFT JOIN public.funds f ON f.id=g.fund_id LEFT JOIN public.missionaries m ON m.id=g.missionary_id',source_table)
      INTO fund_count,missionary_count;
    wrong_funds := wrong_funds + fund_count;
    wrong_missionaries := wrong_missionaries + missionary_count;
  END LOOP;
  IF null_funds + null_missionaries + wrong_funds + wrong_missionaries + blank_names > 0 THEN
    RAISE EXCEPTION 'Giving-target preflight: tenantless funds=%, tenantless missionaries=%, wrong-tenant fund references=%, wrong-tenant missionary references=%, tenants with a blank name=%',null_funds,null_missionaries,wrong_funds,wrong_missionaries,blank_names
      USING DETAIL=CASE WHEN blank_names > 0 THEN 'Tenants with a blank name: '||blank_ids ELSE 'No tenant has a blank name.' END,
            HINT='Inspect the rows with scripts/sql/giving-target-preflight.sql; resolve their ownership or name before retrying.';
  END IF;
END $$;
CREATE TABLE public.legal_entities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES public.tenants ON DELETE RESTRICT,
  name text NOT NULL CHECK(length(btrim(name))>0), created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(tenant_id,id)
);
CREATE TABLE public.payment_account_bindings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES public.tenants ON DELETE RESTRICT,
  legal_entity_id uuid NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(tenant_id,id),
  FOREIGN KEY (tenant_id,legal_entity_id) REFERENCES public.legal_entities(tenant_id,id) ON DELETE RESTRICT
);
INSERT INTO public.legal_entities(tenant_id,name) SELECT id,name FROM public.tenants;
ALTER TABLE public.funds ADD COLUMN legal_entity_id uuid, ADD COLUMN system_purpose text CHECK(system_purpose='fee_cover');
ALTER TABLE public.missionaries ADD COLUMN legal_entity_id uuid;
UPDATE public.funds f SET legal_entity_id=e.id FROM public.legal_entities e WHERE e.tenant_id=f.tenant_id;
UPDATE public.missionaries m SET legal_entity_id=e.id FROM public.legal_entities e WHERE e.tenant_id=m.tenant_id;
ALTER TABLE public.funds ALTER tenant_id SET NOT NULL, ALTER legal_entity_id SET NOT NULL,
  ADD UNIQUE(tenant_id,id), ADD UNIQUE(tenant_id,id,legal_entity_id),
  ADD FOREIGN KEY (tenant_id,legal_entity_id) REFERENCES public.legal_entities(tenant_id,id) ON DELETE RESTRICT;
ALTER TABLE public.missionaries ALTER tenant_id SET NOT NULL, ALTER legal_entity_id SET NOT NULL,
  ADD UNIQUE(tenant_id,id), ADD UNIQUE(tenant_id,id,legal_entity_id),
  ADD FOREIGN KEY (tenant_id,legal_entity_id) REFERENCES public.legal_entities(tenant_id,id) ON DELETE RESTRICT;
CREATE UNIQUE INDEX funds_one_fee_cover_per_entity ON public.funds(legal_entity_id) WHERE system_purpose='fee_cover';
ALTER POLICY "tenant scoped read" ON public.funds USING (tenant_id=(SELECT authz.current_tenant_id()) AND (SELECT authz.assignment_is('staff'::authz.membership_role)) AND system_purpose IS NULL);

CREATE TABLE public.giving_target_entity_locks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants ON DELETE RESTRICT, legal_entity_id uuid NOT NULL,
  fund_id uuid UNIQUE, missionary_id uuid UNIQUE, CHECK(num_nonnulls(fund_id,missionary_id)=1),
  FOREIGN KEY (tenant_id,fund_id,legal_entity_id) REFERENCES public.funds(tenant_id,id,legal_entity_id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  FOREIGN KEY (tenant_id,missionary_id,legal_entity_id) REFERENCES public.missionaries(tenant_id,id,legal_entity_id) ON UPDATE RESTRICT ON DELETE RESTRICT
);
CREATE FUNCTION private.freeze_giving_target_entity() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
  IF NEW.fund_id IS NOT NULL THEN
    INSERT INTO public.giving_target_entity_locks(tenant_id,fund_id,legal_entity_id)
      SELECT tenant_id,id,legal_entity_id FROM public.funds WHERE (tenant_id,id)=(NEW.tenant_id,NEW.fund_id)
      FOR KEY SHARE ON CONFLICT (fund_id) DO NOTHING;
  END IF;
  IF NEW.missionary_id IS NOT NULL THEN
    INSERT INTO public.giving_target_entity_locks(tenant_id,missionary_id,legal_entity_id)
      SELECT tenant_id,id,legal_entity_id FROM public.missionaries WHERE (tenant_id,id)=(NEW.tenant_id,NEW.missionary_id)
      FOR KEY SHARE ON CONFLICT (missionary_id) DO NOTHING;
  END IF;
  RETURN NULL;
END;
$$;
REVOKE ALL ON FUNCTION private.freeze_giving_target_entity() FROM PUBLIC,anon,authenticated,service_role;
ALTER TABLE public.legal_entities ENABLE ROW LEVEL SECURITY, FORCE ROW LEVEL SECURITY;
REVOKE ALL ON public.legal_entities FROM PUBLIC,anon,authenticated,service_role;
ALTER TABLE public.payment_account_bindings ENABLE ROW LEVEL SECURITY, FORCE ROW LEVEL SECURITY;
REVOKE ALL ON public.payment_account_bindings FROM PUBLIC,anon,authenticated,service_role;
ALTER TABLE public.giving_target_entity_locks ENABLE ROW LEVEL SECURITY, FORCE ROW LEVEL SECURITY;
REVOKE ALL ON public.giving_target_entity_locks FROM PUBLIC,anon,authenticated,service_role;
ALTER TABLE public.donations ADD CONSTRAINT donations_target_requires_tenant CHECK (tenant_id IS NOT NULL OR (fund_id IS NULL AND missionary_id IS NULL));
ALTER TABLE public.donations ADD CONSTRAINT donations_fund_same_tenant_fk FOREIGN KEY (tenant_id,fund_id) REFERENCES public.funds(tenant_id,id) NOT VALID;
ALTER TABLE public.donations VALIDATE CONSTRAINT donations_fund_same_tenant_fk;
ALTER TABLE public.donations DROP CONSTRAINT donations_fund_id_fkey;
INSERT INTO public.giving_target_entity_locks(tenant_id,fund_id,legal_entity_id) SELECT DISTINCT target.tenant_id,target.id,target.legal_entity_id FROM public.donations gift JOIN public.funds target ON (gift.tenant_id,gift.fund_id)=(target.tenant_id,target.id) ON CONFLICT (fund_id) DO NOTHING;
ALTER TABLE public.donations ADD CONSTRAINT donations_missionary_same_tenant_fk FOREIGN KEY (tenant_id,missionary_id) REFERENCES public.missionaries(tenant_id,id) NOT VALID;
ALTER TABLE public.donations VALIDATE CONSTRAINT donations_missionary_same_tenant_fk;
ALTER TABLE public.donations DROP CONSTRAINT donations_missionary_id_fkey;
INSERT INTO public.giving_target_entity_locks(tenant_id,missionary_id,legal_entity_id) SELECT DISTINCT target.tenant_id,target.id,target.legal_entity_id FROM public.donations gift JOIN public.missionaries target ON (gift.tenant_id,gift.missionary_id)=(target.tenant_id,target.id) ON CONFLICT (missionary_id) DO NOTHING;
CREATE TRIGGER freeze_giving_target_entity AFTER INSERT OR UPDATE OF tenant_id,fund_id,missionary_id ON public.donations FOR EACH ROW EXECUTE FUNCTION private.freeze_giving_target_entity();
ALTER TABLE public.donor_pledges ADD CONSTRAINT donor_pledges_target_requires_tenant CHECK (tenant_id IS NOT NULL OR (fund_id IS NULL AND missionary_id IS NULL));
ALTER TABLE public.donor_pledges ADD CONSTRAINT donor_pledges_fund_same_tenant_fk FOREIGN KEY (tenant_id,fund_id) REFERENCES public.funds(tenant_id,id) ON DELETE SET NULL (fund_id) NOT VALID;
ALTER TABLE public.donor_pledges VALIDATE CONSTRAINT donor_pledges_fund_same_tenant_fk;
ALTER TABLE public.donor_pledges DROP CONSTRAINT donor_pledges_fund_id_fkey;
INSERT INTO public.giving_target_entity_locks(tenant_id,fund_id,legal_entity_id) SELECT DISTINCT target.tenant_id,target.id,target.legal_entity_id FROM public.donor_pledges gift JOIN public.funds target ON (gift.tenant_id,gift.fund_id)=(target.tenant_id,target.id) ON CONFLICT (fund_id) DO NOTHING;
ALTER TABLE public.donor_pledges ADD CONSTRAINT donor_pledges_missionary_same_tenant_fk FOREIGN KEY (tenant_id,missionary_id) REFERENCES public.missionaries(tenant_id,id) ON DELETE SET NULL (missionary_id) NOT VALID;
ALTER TABLE public.donor_pledges VALIDATE CONSTRAINT donor_pledges_missionary_same_tenant_fk;
ALTER TABLE public.donor_pledges DROP CONSTRAINT donor_pledges_missionary_id_fkey;
INSERT INTO public.giving_target_entity_locks(tenant_id,missionary_id,legal_entity_id) SELECT DISTINCT target.tenant_id,target.id,target.legal_entity_id FROM public.donor_pledges gift JOIN public.missionaries target ON (gift.tenant_id,gift.missionary_id)=(target.tenant_id,target.id) ON CONFLICT (missionary_id) DO NOTHING;
CREATE TRIGGER freeze_giving_target_entity AFTER INSERT OR UPDATE OF tenant_id,fund_id,missionary_id ON public.donor_pledges FOR EACH ROW EXECUTE FUNCTION private.freeze_giving_target_entity();
ALTER TABLE public.staged_gifts ADD CONSTRAINT staged_gifts_fund_same_tenant_fk FOREIGN KEY (tenant_id,fund_id) REFERENCES public.funds(tenant_id,id) ON DELETE SET NULL (fund_id) NOT VALID;
ALTER TABLE public.staged_gifts VALIDATE CONSTRAINT staged_gifts_fund_same_tenant_fk;
ALTER TABLE public.staged_gifts DROP CONSTRAINT staged_gifts_fund_id_fkey;
INSERT INTO public.giving_target_entity_locks(tenant_id,fund_id,legal_entity_id) SELECT DISTINCT target.tenant_id,target.id,target.legal_entity_id FROM public.staged_gifts gift JOIN public.funds target ON (gift.tenant_id,gift.fund_id)=(target.tenant_id,target.id) ON CONFLICT (fund_id) DO NOTHING;
ALTER TABLE public.staged_gifts ADD CONSTRAINT staged_gifts_missionary_same_tenant_fk FOREIGN KEY (tenant_id,missionary_id) REFERENCES public.missionaries(tenant_id,id) ON DELETE SET NULL (missionary_id) NOT VALID;
ALTER TABLE public.staged_gifts VALIDATE CONSTRAINT staged_gifts_missionary_same_tenant_fk;
ALTER TABLE public.staged_gifts DROP CONSTRAINT staged_gifts_missionary_id_fkey;
INSERT INTO public.giving_target_entity_locks(tenant_id,missionary_id,legal_entity_id) SELECT DISTINCT target.tenant_id,target.id,target.legal_entity_id FROM public.staged_gifts gift JOIN public.missionaries target ON (gift.tenant_id,gift.missionary_id)=(target.tenant_id,target.id) ON CONFLICT (missionary_id) DO NOTHING;
CREATE TRIGGER freeze_giving_target_entity AFTER INSERT OR UPDATE OF tenant_id,fund_id,missionary_id ON public.staged_gifts FOR EACH ROW EXECUTE FUNCTION private.freeze_giving_target_entity();
ALTER TABLE public.staged_gift_allocations ADD CONSTRAINT staged_gift_allocations_fund_same_tenant_fk FOREIGN KEY (tenant_id,fund_id) REFERENCES public.funds(tenant_id,id) ON DELETE SET NULL (fund_id) NOT VALID;
ALTER TABLE public.staged_gift_allocations VALIDATE CONSTRAINT staged_gift_allocations_fund_same_tenant_fk;
ALTER TABLE public.staged_gift_allocations DROP CONSTRAINT staged_gift_allocations_fund_id_fkey;
INSERT INTO public.giving_target_entity_locks(tenant_id,fund_id,legal_entity_id) SELECT DISTINCT target.tenant_id,target.id,target.legal_entity_id FROM public.staged_gift_allocations gift JOIN public.funds target ON (gift.tenant_id,gift.fund_id)=(target.tenant_id,target.id) ON CONFLICT (fund_id) DO NOTHING;
ALTER TABLE public.staged_gift_allocations ADD CONSTRAINT staged_gift_allocations_missionary_same_tenant_fk FOREIGN KEY (tenant_id,missionary_id) REFERENCES public.missionaries(tenant_id,id) ON DELETE SET NULL (missionary_id) NOT VALID;
ALTER TABLE public.staged_gift_allocations VALIDATE CONSTRAINT staged_gift_allocations_missionary_same_tenant_fk;
ALTER TABLE public.staged_gift_allocations DROP CONSTRAINT staged_gift_allocations_missionary_id_fkey;
INSERT INTO public.giving_target_entity_locks(tenant_id,missionary_id,legal_entity_id) SELECT DISTINCT target.tenant_id,target.id,target.legal_entity_id FROM public.staged_gift_allocations gift JOIN public.missionaries target ON (gift.tenant_id,gift.missionary_id)=(target.tenant_id,target.id) ON CONFLICT (missionary_id) DO NOTHING;
CREATE TRIGGER freeze_giving_target_entity AFTER INSERT OR UPDATE OF tenant_id,fund_id,missionary_id ON public.staged_gift_allocations FOR EACH ROW EXECUTE FUNCTION private.freeze_giving_target_entity();
ALTER TABLE public.donation_saga_outbox ADD CONSTRAINT donation_saga_outbox_fund_same_tenant_fk FOREIGN KEY (tenant_id,fund_id) REFERENCES public.funds(tenant_id,id) ON DELETE SET NULL (fund_id) NOT VALID;
ALTER TABLE public.donation_saga_outbox VALIDATE CONSTRAINT donation_saga_outbox_fund_same_tenant_fk;
ALTER TABLE public.donation_saga_outbox DROP CONSTRAINT donation_saga_outbox_fund_id_fkey;
INSERT INTO public.giving_target_entity_locks(tenant_id,fund_id,legal_entity_id) SELECT DISTINCT target.tenant_id,target.id,target.legal_entity_id FROM public.donation_saga_outbox gift JOIN public.funds target ON (gift.tenant_id,gift.fund_id)=(target.tenant_id,target.id) ON CONFLICT (fund_id) DO NOTHING;
ALTER TABLE public.donation_saga_outbox ADD CONSTRAINT donation_saga_outbox_missionary_same_tenant_fk FOREIGN KEY (tenant_id,missionary_id) REFERENCES public.missionaries(tenant_id,id) ON DELETE SET NULL (missionary_id) NOT VALID;
ALTER TABLE public.donation_saga_outbox VALIDATE CONSTRAINT donation_saga_outbox_missionary_same_tenant_fk;
ALTER TABLE public.donation_saga_outbox DROP CONSTRAINT donation_saga_outbox_missionary_id_fkey;
INSERT INTO public.giving_target_entity_locks(tenant_id,missionary_id,legal_entity_id) SELECT DISTINCT target.tenant_id,target.id,target.legal_entity_id FROM public.donation_saga_outbox gift JOIN public.missionaries target ON (gift.tenant_id,gift.missionary_id)=(target.tenant_id,target.id) ON CONFLICT (missionary_id) DO NOTHING;
CREATE TRIGGER freeze_giving_target_entity AFTER INSERT OR UPDATE OF tenant_id,fund_id,missionary_id ON public.donation_saga_outbox FOR EACH ROW EXECUTE FUNCTION private.freeze_giving_target_entity();
INSERT INTO public.field_policies(record_type,field_key,surface,visible,editable,exportable,sensitivity_category)
SELECT record_type,field_key,surface,surface='mission_control',false,false,category::public.field_sensitivity_category FROM (VALUES
('legal_entities','id','internal'),
('legal_entities','tenant_id','internal'),
('legal_entities','name','contact'),
('legal_entities','created_at','internal'),
('payment_account_bindings','id','internal'),
('payment_account_bindings','tenant_id','internal'),
('payment_account_bindings','legal_entity_id','financial'),
('payment_account_bindings','created_at','internal'),
('giving_target_entity_locks','tenant_id','internal'),
('giving_target_entity_locks','id','internal'),
('giving_target_entity_locks','legal_entity_id','financial'),
('giving_target_entity_locks','fund_id','internal'),
('giving_target_entity_locks','missionary_id','internal'),
('missionaries','legal_entity_id','financial')
) fields(record_type,field_key,category) CROSS JOIN unnest(ARRAY['mission_control','donor','missionary','public','export']) AS surface;
COMMIT;
