-- Validate existing decision history separately from installing the constraints
-- and the RPC that writes the new unclassified sentinel values.
ALTER TABLE public.eve_policy_decisions
    VALIDATE CONSTRAINT eve_policy_decisions_trust_zone_check;

ALTER TABLE public.eve_policy_decisions
    VALIDATE CONSTRAINT eve_policy_decisions_write_class_check;
