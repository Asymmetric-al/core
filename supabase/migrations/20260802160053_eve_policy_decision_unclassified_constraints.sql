-- Unknown actions are denied, but their decision history must remain truthful.
-- Install the replacement constraints without scanning existing rows so this
-- migration holds only the short metadata locks needed for the catalog change.
ALTER TABLE public.eve_policy_decisions
    DROP CONSTRAINT IF EXISTS eve_policy_decisions_trust_zone_check;
ALTER TABLE public.eve_policy_decisions
    ADD CONSTRAINT eve_policy_decisions_trust_zone_check
    CHECK (
        trust_zone IN (
            'engineering', 'product_admin', 'memory', 'unclassified'
        )
    ) NOT VALID;

ALTER TABLE public.eve_policy_decisions
    DROP CONSTRAINT IF EXISTS eve_policy_decisions_write_class_check;
ALTER TABLE public.eve_policy_decisions
    ADD CONSTRAINT eve_policy_decisions_write_class_check
    CHECK (
        write_class IN ('operational', 'business_data', 'unclassified')
    ) NOT VALID;
