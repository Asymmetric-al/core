-- AL-2678 (WP5 part 1; plan section 12 WP5, lines 990 and 1002; section
-- 8.4, line 483). public.external_identifiers: an identifier another system
-- gave a record, resolving to one typed target in its own tenant only.
--
-- The target sits in exactly one of four typed columns, each with a
-- same-tenant key, so a cross-tenant or dangling target is refused for every
-- role, the service key included (foreign keys ignore row security and roles).
-- target_type and target_id repeat the one set column, checked. Staff of the
-- tenant read the table on their token; public.resolve_external_identifier
-- answers a (source, external_id) inside the request's tenant only. The
-- import (WP13) writes it with the service key; signed-in users hold no write.
--
-- Locks. The new table's keys take SHARE ROW EXCLUSIVE on tenants, parties,
-- donors, missionaries and funds, held to COMMIT; nothing is rewritten and
-- no row of those tables is read. lock_timeout stops a run rather than queue
-- it behind live traffic.
--
-- Recovery. Nothing here is written to run twice: a run lost between its
-- COMMIT and its ledger row stops on the next run at its first CREATE
-- (public.external_identifiers, 42P07). This file has committed when this
-- read-only check is true: SELECT to_regclass('public.external_identifiers')
-- IS NOT NULL. Then follow the steps of docs/ops/release-job.md, "If the
-- migration committed but its ledger row is missing", with this check and
-- this file's version, 20261125050200, in place of the section's own.

BEGIN;
SET LOCAL lock_timeout = '5s';

CREATE TABLE public.external_identifiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants (id) ON DELETE RESTRICT,
  source TEXT NOT NULL,
  external_id TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID NOT NULL,
  party_id UUID,
  donor_id UUID,
  missionary_id UUID,
  fund_id UUID,
  import_batch_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT pg_catalog.now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT pg_catalog.now(),
  CONSTRAINT external_identifiers_source_check CHECK (pg_catalog.btrim(source) <> ''),
  CONSTRAINT external_identifiers_external_id_check CHECK (pg_catalog.btrim(external_id) <> ''),
  CONSTRAINT external_identifiers_target_type_check
    CHECK (target_type IN ('party', 'donor', 'missionary', 'fund')),
  CONSTRAINT external_identifiers_one_target_check CHECK (
    pg_catalog.num_nonnulls(party_id, donor_id, missionary_id, fund_id) = 1
    AND target_id = COALESCE(party_id, donor_id, missionary_id, fund_id)
    AND CASE target_type
          WHEN 'party' THEN party_id IS NOT NULL
          WHEN 'donor' THEN donor_id IS NOT NULL
          WHEN 'missionary' THEN missionary_id IS NOT NULL
          WHEN 'fund' THEN fund_id IS NOT NULL
        END
  ),
  CONSTRAINT external_identifiers_tenant_source_external_key UNIQUE (tenant_id, source, external_id),
  CONSTRAINT external_identifiers_party_same_tenant_fk
    FOREIGN KEY (tenant_id, party_id) REFERENCES public.parties (tenant_id, id),
  CONSTRAINT external_identifiers_donor_same_tenant_fk
    FOREIGN KEY (tenant_id, donor_id) REFERENCES public.donors (tenant_id, id),
  CONSTRAINT external_identifiers_missionary_same_tenant_fk
    FOREIGN KEY (tenant_id, missionary_id) REFERENCES public.missionaries (tenant_id, id),
  CONSTRAINT external_identifiers_fund_same_tenant_fk
    FOREIGN KEY (tenant_id, fund_id) REFERENCES public.funds (tenant_id, id)
);
CREATE INDEX external_identifiers_tenant_target_idx ON public.external_identifiers (tenant_id, target_type, target_id);

COMMENT ON TABLE public.external_identifiers IS
  'An identifier another system gave a Party, donor, ministry assignment or fund, inside one tenant (AL-2678, plan 8.4).';

ALTER TABLE public.external_identifiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_identifiers FORCE ROW LEVEL SECURITY;

CREATE POLICY "external identifiers staff read" ON public.external_identifiers
  FOR SELECT TO authenticated
  USING (
    tenant_id = (SELECT authz.current_tenant_id())
    AND (SELECT authz.assignment_is('staff'))
  );

REVOKE ALL ON TABLE public.external_identifiers FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.external_identifiers TO authenticated;
GRANT ALL ON TABLE public.external_identifiers TO service_role;

CREATE FUNCTION public.resolve_external_identifier(p_source text, p_external_id text)
RETURNS TABLE (target_type text, target_id uuid)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT e.target_type, e.target_id
    FROM public.external_identifiers AS e
   WHERE e.tenant_id = authz.current_tenant_id()
     AND e.source = p_source
     AND e.external_id = p_external_id;
$$;
COMMENT ON FUNCTION public.resolve_external_identifier(text, text) IS
  'The typed target of an external identifier in the request''s tenant, on the caller''s token (AL-2678).';
ALTER FUNCTION public.resolve_external_identifier(text, text) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.resolve_external_identifier(text, text) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.resolve_external_identifier(text, text) TO authenticated;

INSERT INTO public.field_policies
  (record_type, field_key, surface, tenant_id, visible, editable, exportable, sensitivity_category)
SELECT 'external_identifiers', f.field_key, s.surface, NULL, s.surface = 'mission_control', false, false, 'internal'::public.field_sensitivity_category
  FROM (VALUES
    ('id'), ('tenant_id'), ('source'), ('external_id'), ('target_type'), ('target_id'),
    ('party_id'), ('donor_id'), ('missionary_id'), ('fund_id'), ('import_batch_id'),
    ('created_at'), ('updated_at')
  ) AS f (field_key)
  CROSS JOIN (VALUES ('mission_control'), ('donor'), ('missionary'), ('public'), ('export')) AS s (surface)
ON CONFLICT ON CONSTRAINT field_policies_lookup_key DO NOTHING;

COMMIT;

SELECT pg_notify('pgrst', 'reload schema');
