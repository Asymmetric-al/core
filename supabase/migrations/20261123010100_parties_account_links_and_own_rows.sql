-- AL-2678 (WP5 part 1; plan section 12 WP5, lines 979-985 and 994; record
-- section 9, line 589, D-76; coordinator rulings W5-R2, W5-R3 and W5-R6).
--
-- 1. public.parties: one row per person or organisation in a tenant, with the
--    Phase 10 fields that cannot be retrofitted (security level, its source
--    marker, public alias, do-not-publish) and a nullable import batch.
--    Signed-in users read a tenant's Parties as staff, or their own linked
--    Party; they hold no insert or update privilege on any column. The safety
--    commands of the worker safety room write the Phase 10 fields.
-- 2. donors.party_id (nullable until part 2), missionaries.party_id (NOT NULL,
--    unique per tenant), same-tenant keys to parties, and nullable
--    import_batch_id on donors, missionaries and funds. funds.import_batch_id
--    stays unclassified here (W5-R6).
-- 3. Backfill from evidence only, never by name or email: a donor and a
--    missionary that name the same (tenant, profile) share one Party; every
--    other donor and missionary gets its own. The display name is the
--    profile's display name, else its full name, else the donor's name or
--    email, else the missionary's tagline or field, else a fixed label.
-- 4. public.account_links, backfilled from every donor and missionary profile
--    in its tenant, before the own-row policies move onto it.
-- 5. profiles: the login is the row (D-76, W5-R3). A row whose user_id names
--    another login than its id is refused, not rewritten; a NULL user_id is
--    filled from id; a BEFORE INSERT trigger fills it for any writer that
--    omits it; then NOT NULL and CHECK (user_id = id). The own-profile
--    exception matches by user_id only. authz.caller_profile_ids() stays as
--    AL-2675 wrote it (crm_notes_tenant_insert reads it, and WP4a owns
--    crm_notes); under the CHECK its id branch names the same rows.
-- 6. A temporary AFTER INSERT trigger on donors (W5-R2, amended) gives each
--    inserted donor with a tenant and no Party its own Party. It fires only
--    for a row actually inserted, so an ON CONFLICT DO NOTHING that discards
--    a row creates nothing, and it never writes an account link (ADR-0215).
--    Part 2 retires it when every writer names the Party itself.
-- 7. The seven own-row policies match the caller through account_links and
--    party_id, each branch keeping its class condition, its tenant term and
--    the super-admin branch where it had one. The missionary branches of
--    donations and donor_pledges call authz.caller_missionary_ids(), a
--    definer that answers for the request's tenant only, because signed-in
--    users may not select missionaries.tenant_id or party_id.
-- 8. Field-policy rows for every new column of a classified table (7.1).

BEGIN;
SET LOCAL lock_timeout = '5s';

DO $$
-- preflight: identity-keys
DECLARE
  v_divergent BIGINT;
  v_missionary_pairs BIGINT;
BEGIN
  SELECT pg_catalog.count(*) INTO v_divergent
    FROM public.profiles AS p
   WHERE p.user_id IS NOT NULL
     AND p.user_id <> p.id;
  IF v_divergent > 0 THEN
    RAISE EXCEPTION 'preflight failed: % profiles name another login in user_id than their id; nothing was changed', v_divergent
      USING ERRCODE = '23514';
  END IF;

  SELECT pg_catalog.count(*) INTO v_missionary_pairs
    FROM (
      SELECT m.tenant_id, m.profile_id
        FROM public.missionaries AS m
       WHERE m.profile_id IS NOT NULL
       GROUP BY m.tenant_id, m.profile_id
      HAVING pg_catalog.count(*) > 1
    ) AS pairs;
  IF v_missionary_pairs > 0 THEN
    RAISE EXCEPTION 'preflight failed: % (tenant, profile) pairs name more than one missionary row; nothing was changed', v_missionary_pairs
      USING ERRCODE = '23505';
  END IF;
END
$$;

-- 1. Parties.
CREATE TABLE public.parties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants (id) ON DELETE RESTRICT,
  display_name TEXT NOT NULL,
  security_level TEXT NOT NULL DEFAULT 'standard',
  security_level_source TEXT NOT NULL DEFAULT 'unreviewed_default',
  public_alias TEXT,
  do_not_publish BOOLEAN NOT NULL DEFAULT false,
  import_batch_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT pg_catalog.now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT pg_catalog.now(),
  CONSTRAINT parties_tenant_id_id_key UNIQUE (tenant_id, id),
  CONSTRAINT parties_security_level_check
    CHECK (security_level IN ('standard', 'sensitive', 'restricted', 'high_risk')),
  CONSTRAINT parties_security_level_source_check
    CHECK (security_level_source IN ('manual', 'country_default', 'unreviewed_default'))
);

COMMENT ON TABLE public.parties IS
  'A person or organisation in one tenant (AL-2678, plan WP5). Donors and ministry assignments point at it; account_links join logins to it.';
COMMENT ON COLUMN public.parties.security_level_source IS
  'Where the level came from: manual, country_default (WP14) or unreviewed_default, which raises the unreviewed signal (W5-R7).';

ALTER TABLE public.parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parties FORCE ROW LEVEL SECURITY;

-- 2. Party keys on donors and missionaries, and import batches.
ALTER TABLE public.donors
  ADD COLUMN party_id UUID,
  ADD COLUMN import_batch_id UUID;
ALTER TABLE public.missionaries
  ADD COLUMN party_id UUID,
  ADD COLUMN import_batch_id UUID;
ALTER TABLE public.funds
  ADD COLUMN import_batch_id UUID;

-- 3. Backfill, from evidence.
CREATE TEMPORARY TABLE wp5_party_rows ON COMMIT DROP AS
SELECT 'donor'::TEXT AS kind, d.id AS row_id, d.tenant_id, d.profile_id,
       COALESCE(NULLIF(pg_catalog.btrim(d.name), ''), NULLIF(pg_catalog.btrim(d.email), '')) AS own_name
  FROM public.donors AS d
 WHERE d.tenant_id IS NOT NULL
UNION ALL
SELECT 'missionary', m.id, m.tenant_id, m.profile_id,
       COALESCE(NULLIF(pg_catalog.btrim(m.tagline), ''), NULLIF(pg_catalog.btrim(m.mission_field), ''))
  FROM public.missionaries AS m;

CREATE TEMPORARY TABLE wp5_party_keys ON COMMIT DROP AS
SELECT gen_random_uuid() AS party_id, k.tenant_id, k.profile_id, k.kind, k.row_id
  FROM (
    SELECT DISTINCT r.tenant_id, r.profile_id, NULL::TEXT AS kind, NULL::UUID AS row_id
      FROM wp5_party_rows AS r
     WHERE r.profile_id IS NOT NULL
    UNION ALL
    SELECT r.tenant_id, NULL, r.kind, r.row_id
      FROM wp5_party_rows AS r
     WHERE r.profile_id IS NULL
  ) AS k;

INSERT INTO public.parties (id, tenant_id, display_name)
SELECT k.party_id,
       k.tenant_id,
       COALESCE(
         NULLIF(pg_catalog.btrim(p.display_name), ''),
         NULLIF(pg_catalog.btrim(p.full_name), ''),
         (SELECT r.own_name
            FROM wp5_party_rows AS r
           WHERE r.own_name IS NOT NULL
             AND ((k.profile_id IS NOT NULL AND r.tenant_id = k.tenant_id AND r.profile_id = k.profile_id)
                  OR (k.profile_id IS NULL AND r.kind = k.kind AND r.row_id = k.row_id))
           ORDER BY r.kind
           LIMIT 1),
         CASE k.kind WHEN 'missionary' THEN 'Unnamed worker' ELSE 'Unnamed supporter' END
       )
  FROM wp5_party_keys AS k
  LEFT JOIN public.profiles AS p ON p.id = k.profile_id;

UPDATE public.donors AS d
   SET party_id = k.party_id
  FROM wp5_party_keys AS k
 WHERE k.tenant_id = d.tenant_id
   AND ((k.profile_id IS NOT NULL AND k.profile_id = d.profile_id)
        OR (k.profile_id IS NULL AND k.kind = 'donor' AND k.row_id = d.id));

UPDATE public.missionaries AS m
   SET party_id = k.party_id
  FROM wp5_party_keys AS k
 WHERE k.tenant_id = m.tenant_id
   AND ((k.profile_id IS NOT NULL AND k.profile_id = m.profile_id)
        OR (k.profile_id IS NULL AND k.kind = 'missionary' AND k.row_id = m.id));

ALTER TABLE public.donors
  ADD CONSTRAINT donors_party_requires_tenant CHECK (party_id IS NULL OR tenant_id IS NOT NULL),
  ADD CONSTRAINT donors_party_same_tenant_fk
    FOREIGN KEY (tenant_id, party_id) REFERENCES public.parties (tenant_id, id);
ALTER TABLE public.missionaries
  ALTER COLUMN party_id SET NOT NULL,
  ADD CONSTRAINT missionaries_tenant_party_key UNIQUE (tenant_id, party_id),
  ADD CONSTRAINT missionaries_party_same_tenant_fk
    FOREIGN KEY (tenant_id, party_id) REFERENCES public.parties (tenant_id, id);
CREATE INDEX donors_tenant_party_idx ON public.donors (tenant_id, party_id) WHERE party_id IS NOT NULL;

-- 5. profiles: one login per row.
UPDATE public.profiles SET user_id = id WHERE user_id IS NULL;

CREATE FUNCTION public.profiles_fill_user_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  IF NEW.user_id IS NULL THEN
    NEW.user_id := NEW.id;
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.profiles_fill_user_id() FROM PUBLIC, anon, authenticated, service_role;

CREATE TRIGGER profiles_fill_user_id
  BEFORE INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.profiles_fill_user_id();

ALTER TABLE public.profiles
  ALTER COLUMN user_id SET NOT NULL,
  ADD CONSTRAINT profiles_user_id_matches_id CHECK (user_id = id);

ALTER POLICY "profiles select own authenticated" ON public.profiles
  USING (user_id = (SELECT auth.uid()));

-- 4. Account links.
CREATE TABLE public.account_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants (id) ON DELETE RESTRICT,
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE RESTRICT,
  party_id UUID NOT NULL,
  linked_via TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT pg_catalog.now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT pg_catalog.now(),
  CONSTRAINT account_links_tenant_user_key UNIQUE (tenant_id, user_id),
  CONSTRAINT account_links_tenant_party_user_key UNIQUE (tenant_id, party_id, user_id),
  CONSTRAINT account_links_party_same_tenant_fk
    FOREIGN KEY (tenant_id, party_id) REFERENCES public.parties (tenant_id, id),
  CONSTRAINT account_links_linked_via_check
    CHECK (linked_via IN ('profile_backfill', 'account_claim', 'invitation'))
);
CREATE INDEX account_links_tenant_party_idx ON public.account_links (tenant_id, party_id);
CREATE INDEX account_links_user_idx ON public.account_links (user_id);

COMMENT ON TABLE public.account_links IS
  'A login joined to its Party in one tenant (AL-2678). Written by the migration backfill, the account-claim command and, from part 3, invitation acceptance; never by a gift (ADR-0215).';

ALTER TABLE public.account_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_links FORCE ROW LEVEL SECURITY;

INSERT INTO public.account_links (tenant_id, user_id, party_id, linked_via)
SELECT DISTINCT k.tenant_id, p.user_id, k.party_id, 'profile_backfill'
  FROM wp5_party_keys AS k
  JOIN public.profiles AS p ON p.id = k.profile_id
 WHERE k.profile_id IS NOT NULL;

CREATE FUNCTION authz.caller_missionary_ids()
RETURNS SETOF UUID
LANGUAGE sql
STABLE
PARALLEL SAFE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT m.id
    FROM public.missionaries AS m
    JOIN public.account_links AS al
      ON al.tenant_id = m.tenant_id
     AND al.party_id = m.party_id
   WHERE m.tenant_id = authz.current_tenant_id()
     AND al.user_id = auth.uid();
$$;
COMMENT ON FUNCTION authz.caller_missionary_ids() IS
  'The ministry assignments the signed-in caller is linked to in the request''s tenant, for the missionary own-row branches (AL-2678).';
ALTER FUNCTION authz.caller_missionary_ids() OWNER TO postgres;
REVOKE ALL ON FUNCTION authz.caller_missionary_ids() FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION authz.caller_missionary_ids() TO authenticated, service_role;

-- Policies and grants of the two new tables.
CREATE POLICY "parties staff or own read" ON public.parties
  FOR SELECT TO authenticated
  USING (
    tenant_id = (SELECT authz.current_tenant_id())
    AND (
      (SELECT authz.assignment_is('staff'))
      OR id IN (SELECT al.party_id FROM public.account_links AS al WHERE al.tenant_id = (SELECT authz.current_tenant_id()) AND al.user_id = (SELECT authz.current_user_id()))
    )
  );

CREATE POLICY "account links own or staff read" ON public.account_links
  FOR SELECT TO authenticated
  USING (
    tenant_id = (SELECT authz.current_tenant_id())
    AND (
      user_id = (SELECT authz.current_user_id())
      OR (SELECT authz.assignment_is('staff'))
    )
  );

REVOKE ALL ON TABLE public.parties FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.account_links FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.parties TO authenticated;
GRANT SELECT ON TABLE public.account_links TO authenticated;
GRANT ALL ON TABLE public.parties TO service_role;
GRANT ALL ON TABLE public.account_links TO service_role;

-- 6. The temporary donor trigger (W5-R2, amended).
CREATE FUNCTION public.donors_fill_party_after_insert_temp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_party_id UUID;
  v_name TEXT;
BEGIN
  IF NEW.party_id IS NOT NULL OR NEW.tenant_id IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT COALESCE(
           NULLIF(pg_catalog.btrim(NEW.name), ''),
           NULLIF(pg_catalog.btrim(p.display_name), ''),
           NULLIF(pg_catalog.btrim(p.full_name), ''),
           NULLIF(pg_catalog.btrim(NEW.email), ''),
           'Unnamed supporter'
         )
    INTO v_name
    FROM (SELECT 1) AS one
    LEFT JOIN public.profiles AS p ON p.id = NEW.profile_id;

  INSERT INTO public.parties (tenant_id, display_name)
  VALUES (NEW.tenant_id, v_name)
  RETURNING id INTO v_party_id;

  UPDATE public.donors
     SET party_id = v_party_id
   WHERE id = NEW.id
     AND tenant_id = NEW.tenant_id
     AND party_id IS NULL;

  RETURN NULL;
END;
$$;
COMMENT ON FUNCTION public.donors_fill_party_after_insert_temp() IS
  'Temporary (AL-2678, W5-R2): gives an inserted donor with a tenant and no Party its own Party. Never links an account. Part 2 retires it with donors.party_id NOT NULL.';
ALTER FUNCTION public.donors_fill_party_after_insert_temp() OWNER TO postgres;
REVOKE ALL ON FUNCTION public.donors_fill_party_after_insert_temp() FROM PUBLIC, anon, authenticated, service_role;

CREATE TRIGGER donors_fill_party_after_insert_temp
  AFTER INSERT ON public.donors
  FOR EACH ROW EXECUTE FUNCTION public.donors_fill_party_after_insert_temp();

-- 7. The own-row policies, through account_links.
ALTER POLICY "donors owner or staff select" ON public.donors
  USING (
    (SELECT authz.is_super_admin())
    OR (
      tenant_id = (SELECT authz.current_tenant_id())
      AND (
        (SELECT authz.assignment_is('staff'))
        OR ((SELECT authz.assignment_is('donor')) AND party_id IN (SELECT al.party_id FROM public.account_links AS al WHERE al.tenant_id = (SELECT authz.current_tenant_id()) AND al.user_id = (SELECT authz.current_user_id())))
      )
    )
  );

ALTER POLICY "donations owner or staff select" ON public.donations
  USING (
    (SELECT authz.is_super_admin())
    OR (
      tenant_id = (SELECT authz.current_tenant_id())
      AND (
        (SELECT authz.assignment_is('staff'))
        OR ((SELECT authz.assignment_is('donor')) AND donor_id IN (SELECT d.id FROM public.donors AS d WHERE d.tenant_id = (SELECT authz.current_tenant_id()) AND d.party_id IN (SELECT al.party_id FROM public.account_links AS al WHERE al.tenant_id = (SELECT authz.current_tenant_id()) AND al.user_id = (SELECT authz.current_user_id()))))
        OR ((SELECT authz.assignment_is('missionary')) AND missionary_id IN (SELECT authz.caller_missionary_ids()))
      )
    )
  );

ALTER POLICY "donor pledges owner or staff select" ON public.donor_pledges
  USING (
    (SELECT authz.is_super_admin())
    OR (
      tenant_id = (SELECT authz.current_tenant_id())
      AND (
        (SELECT authz.assignment_is('staff'))
        OR ((SELECT authz.assignment_is('donor')) AND donor_id IN (SELECT d.id FROM public.donors AS d WHERE d.tenant_id = (SELECT authz.current_tenant_id()) AND d.party_id IN (SELECT al.party_id FROM public.account_links AS al WHERE al.tenant_id = (SELECT authz.current_tenant_id()) AND al.user_id = (SELECT authz.current_user_id()))))
        OR ((SELECT authz.assignment_is('missionary')) AND missionary_id IN (SELECT authz.caller_missionary_ids()))
      )
    )
  );

ALTER POLICY "donor activities owner or staff select" ON public.donor_activities
  USING (
    (SELECT authz.is_super_admin())
    OR (
      tenant_id = (SELECT authz.current_tenant_id())
      AND (
        (SELECT authz.assignment_is('staff'))
        OR ((SELECT authz.assignment_is('donor')) AND donor_id IN (SELECT d.id FROM public.donors AS d WHERE d.tenant_id = (SELECT authz.current_tenant_id()) AND d.party_id IN (SELECT al.party_id FROM public.account_links AS al WHERE al.tenant_id = (SELECT authz.current_tenant_id()) AND al.user_id = (SELECT authz.current_user_id()))))
      )
    )
  );

ALTER POLICY "missionaries own row key read" ON public.missionaries
  USING (
    tenant_id = (SELECT authz.current_tenant_id())
    AND (SELECT authz.assignment_is('missionary'))
    AND party_id IN (SELECT al.party_id FROM public.account_links AS al WHERE al.tenant_id = (SELECT authz.current_tenant_id()) AND al.user_id = (SELECT authz.current_user_id()))
  );

ALTER POLICY "tenant scoped own or staff read" ON public.follows
  USING (
    tenant_id = (SELECT authz.current_tenant_id())
    AND (
      (SELECT authz.assignment_is('staff'))
      OR ((SELECT authz.assignment_is('donor')) AND donor_id IN (SELECT d.id FROM public.donors AS d WHERE d.tenant_id = (SELECT authz.current_tenant_id()) AND d.party_id IN (SELECT al.party_id FROM public.account_links AS al WHERE al.tenant_id = (SELECT authz.current_tenant_id()) AND al.user_id = (SELECT authz.current_user_id()))))
    )
  );

ALTER POLICY "donor_feed_preferences_own_select" ON public.donor_feed_preferences
  USING (
    tenant_id = (SELECT authz.current_tenant_id())
    AND (SELECT authz.assignment_is('donor'))
    AND donor_id IN (SELECT d.id FROM public.donors AS d WHERE d.tenant_id = (SELECT authz.current_tenant_id()) AND d.party_id IN (SELECT al.party_id FROM public.account_links AS al WHERE al.tenant_id = (SELECT authz.current_tenant_id()) AND al.user_id = (SELECT authz.current_user_id())))
  );
ALTER POLICY "donor_feed_preferences_own_insert" ON public.donor_feed_preferences
  WITH CHECK (
    tenant_id = (SELECT authz.current_tenant_id())
    AND (SELECT authz.assignment_is('donor'))
    AND donor_id IN (SELECT d.id FROM public.donors AS d WHERE d.tenant_id = (SELECT authz.current_tenant_id()) AND d.party_id IN (SELECT al.party_id FROM public.account_links AS al WHERE al.tenant_id = (SELECT authz.current_tenant_id()) AND al.user_id = (SELECT authz.current_user_id())))
  );
ALTER POLICY "donor_feed_preferences_own_update" ON public.donor_feed_preferences
  USING (
    tenant_id = (SELECT authz.current_tenant_id())
    AND (SELECT authz.assignment_is('donor'))
    AND donor_id IN (SELECT d.id FROM public.donors AS d WHERE d.tenant_id = (SELECT authz.current_tenant_id()) AND d.party_id IN (SELECT al.party_id FROM public.account_links AS al WHERE al.tenant_id = (SELECT authz.current_tenant_id()) AND al.user_id = (SELECT authz.current_user_id())))
  )
  WITH CHECK (
    tenant_id = (SELECT authz.current_tenant_id())
    AND (SELECT authz.assignment_is('donor'))
    AND donor_id IN (SELECT d.id FROM public.donors AS d WHERE d.tenant_id = (SELECT authz.current_tenant_id()) AND d.party_id IN (SELECT al.party_id FROM public.account_links AS al WHERE al.tenant_id = (SELECT authz.current_tenant_id()) AND al.user_id = (SELECT authz.current_user_id())))
  );

-- 8. Field-policy rows (plan 7.1): visible in Mission Control only.
INSERT INTO public.field_policies
  (record_type, field_key, surface, tenant_id, visible, editable, exportable, sensitivity_category)
SELECT f.record_type, f.field_key, s.surface, NULL, s.surface = 'mission_control', false, false, f.category::public.field_sensitivity_category
  FROM (VALUES
    ('parties', 'id', 'internal'),
    ('parties', 'tenant_id', 'internal'),
    ('parties', 'display_name', 'contact'),
    ('parties', 'security_level', 'security'),
    ('parties', 'security_level_source', 'security'),
    ('parties', 'public_alias', 'security'),
    ('parties', 'do_not_publish', 'security'),
    ('parties', 'import_batch_id', 'internal'),
    ('parties', 'created_at', 'internal'),
    ('parties', 'updated_at', 'internal'),
    ('account_links', 'id', 'internal'),
    ('account_links', 'tenant_id', 'internal'),
    ('account_links', 'user_id', 'security'),
    ('account_links', 'party_id', 'internal'),
    ('account_links', 'linked_via', 'internal'),
    ('account_links', 'created_at', 'internal'),
    ('account_links', 'updated_at', 'internal'),
    ('donors', 'party_id', 'internal'),
    ('donors', 'import_batch_id', 'internal'),
    ('missionaries', 'party_id', 'internal'),
    ('missionaries', 'import_batch_id', 'internal')
  ) AS f (record_type, field_key, category)
  CROSS JOIN (VALUES ('mission_control'), ('donor'), ('missionary'), ('public'), ('export')) AS s (surface)
ON CONFLICT ON CONSTRAINT field_policies_lookup_key DO NOTHING;

COMMIT;

SELECT pg_notify('pgrst', 'reload schema');
