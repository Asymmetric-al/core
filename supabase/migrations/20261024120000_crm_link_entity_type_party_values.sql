-- #2257: add the Phase 9 party values to public.crm_link_entity_type.
--
-- Additive only. The household and organization parties (#570) carry
-- provider links through crm_record_links, so the link enum gains exactly
-- those two labels, appended after the original 15. Every existing label
-- keeps its name and position, and no table, trigger or link-write path uses
-- the new labels yet. The ADR-0001 amendment of 2026-10-24 records the Phase 9
-- re-confirm.
--
-- CrmIdentityConceptId and CRM_IDENTITY_CONCEPTS in
-- packages/api/src/crm/identity/concepts.ts must change in lockstep;
-- tests/unit/packages/api/crm-identity-parity.test.ts fails the build when
-- the migration chain and the TypeScript side differ.

ALTER TYPE public.crm_link_entity_type ADD VALUE IF NOT EXISTS 'household';
ALTER TYPE public.crm_link_entity_type ADD VALUE IF NOT EXISTS 'organization';

-- New enum labels cannot be used as values in the transaction that adds them,
-- so the assertion compares text labels from pg_enum only.
DO $$
DECLARE
  actual_labels TEXT[];
  expected_labels CONSTANT TEXT[] := ARRAY[
    'supabase_auth_user',
    'asym_profile',
    'tenant_membership',
    'crm_person',
    'donor_profile',
    'missionary_profile',
    'cms_public_entity',
    'stripe_customer',
    'fund_or_project',
    'pledge_or_relationship_commitment',
    'payment_record',
    'receipt_record',
    'refund_record',
    'statement_record',
    'reconciliation_record',
    'household',
    'organization'
  ];
BEGIN
  SELECT pg_catalog.array_agg(e.enumlabel::text ORDER BY e.enumsortorder)
  INTO actual_labels
  FROM pg_catalog.pg_enum AS e
  WHERE e.enumtypid = 'public.crm_link_entity_type'::regtype;

  IF actual_labels IS DISTINCT FROM expected_labels THEN
    RAISE EXCEPTION
      'public.crm_link_entity_type labels drifted: expected %, found %',
      expected_labels,
      actual_labels;
  END IF;
END
$$;
