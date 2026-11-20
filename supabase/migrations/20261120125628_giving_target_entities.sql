BEGIN;
SET LOCAL lock_timeout='5s';
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
  tenant_id uuid NOT NULL REFERENCES public.tenants ON DELETE RESTRICT, legal_entity_id uuid NOT NULL,
  fund_id uuid UNIQUE, missionary_id uuid UNIQUE, CHECK(num_nonnulls(fund_id,missionary_id)=1),
  FOREIGN KEY (tenant_id,fund_id,legal_entity_id) REFERENCES public.funds(tenant_id,id,legal_entity_id) ON UPDATE RESTRICT ON DELETE CASCADE,
  FOREIGN KEY (tenant_id,missionary_id,legal_entity_id) REFERENCES public.missionaries(tenant_id,id,legal_entity_id) ON UPDATE RESTRICT ON DELETE CASCADE
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
CREATE POLICY tenant_guard_isolation ON public.legal_entities FOR SELECT TO tenant_guard USING (tenant_id=tenant_guard.current_tenant_id());
ALTER TABLE public.payment_account_bindings ENABLE ROW LEVEL SECURITY, FORCE ROW LEVEL SECURITY;
REVOKE ALL ON public.payment_account_bindings FROM PUBLIC,anon,authenticated,service_role;
CREATE POLICY tenant_guard_isolation ON public.payment_account_bindings FOR SELECT TO tenant_guard USING (tenant_id=tenant_guard.current_tenant_id());
ALTER TABLE public.giving_target_entity_locks ENABLE ROW LEVEL SECURITY, FORCE ROW LEVEL SECURITY;
REVOKE ALL ON public.giving_target_entity_locks FROM PUBLIC,anon,authenticated,service_role;
CREATE POLICY tenant_guard_isolation ON public.giving_target_entity_locks FOR SELECT TO tenant_guard USING (tenant_id=tenant_guard.current_tenant_id());
ALTER TABLE public.donations ADD CHECK (tenant_id IS NOT NULL OR (fund_id IS NULL AND missionary_id IS NULL));
ALTER TABLE public.donations ADD CONSTRAINT donations_fund_same_tenant_fk FOREIGN KEY (tenant_id,fund_id) REFERENCES public.funds(tenant_id,id) NOT VALID;
ALTER TABLE public.donations VALIDATE CONSTRAINT donations_fund_same_tenant_fk;
ALTER TABLE public.donations DROP CONSTRAINT donations_fund_id_fkey;
INSERT INTO public.giving_target_entity_locks(tenant_id,fund_id,legal_entity_id) SELECT DISTINCT target.tenant_id,target.id,target.legal_entity_id FROM public.donations gift JOIN public.funds target ON (gift.tenant_id,gift.fund_id)=(target.tenant_id,target.id) ON CONFLICT (fund_id) DO NOTHING;
ALTER TABLE public.donations ADD CONSTRAINT donations_missionary_same_tenant_fk FOREIGN KEY (tenant_id,missionary_id) REFERENCES public.missionaries(tenant_id,id) NOT VALID;
ALTER TABLE public.donations VALIDATE CONSTRAINT donations_missionary_same_tenant_fk;
ALTER TABLE public.donations DROP CONSTRAINT donations_missionary_id_fkey;
INSERT INTO public.giving_target_entity_locks(tenant_id,missionary_id,legal_entity_id) SELECT DISTINCT target.tenant_id,target.id,target.legal_entity_id FROM public.donations gift JOIN public.missionaries target ON (gift.tenant_id,gift.missionary_id)=(target.tenant_id,target.id) ON CONFLICT (missionary_id) DO NOTHING;
CREATE TRIGGER freeze_giving_target_entity AFTER INSERT OR UPDATE OF tenant_id,fund_id,missionary_id ON public.donations FOR EACH ROW EXECUTE FUNCTION private.freeze_giving_target_entity();
ALTER TABLE public.donor_pledges ADD CHECK (tenant_id IS NOT NULL OR (fund_id IS NULL AND missionary_id IS NULL));
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
('giving_target_entity_locks','legal_entity_id','financial'),
('giving_target_entity_locks','fund_id','internal'),
('giving_target_entity_locks','missionary_id','internal'),
('missionaries','legal_entity_id','financial')
) fields(record_type,field_key,category) CROSS JOIN unnest(ARRAY['mission_control','donor','missionary','public','export']) AS surface;
COMMIT;
