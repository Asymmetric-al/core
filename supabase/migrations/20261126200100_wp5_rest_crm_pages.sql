-- AL-2678 (WP5 rest, pull request 1, r6; brief stage5/wp5-rest.md section 3,
-- invariants 9 and 10; ruling WP5 part 2 Q11; record D-133). Mission
-- Control's CRM notes and relationships filter, count, sort and page in
-- Postgres, on the caller's token, under row security, with no bulk transfer.
--
-- 1. public.crm_notes_page(tenant, search, sort, descending, offset, limit):
--    one page of the tenant's notes and the exact total of the filtered set,
--    as {totalCount, rows}. SECURITY INVOKER: crm_notes_tenant_select admits
--    staff of the request's tenant only and a restricted note only to a
--    tenant administrator, so a restricted note is in neither the rows nor
--    the total of anyone else; the function repeats the restricted rule.
--    Search is extension-free (D-133): a case-insensitive substring of the
--    title, the body, the body with its whitespace runs made one space (the
--    list's preview), the author name ('Mission Control' when blank), and the
--    linked record's id, label and type. Sort by updatedAt (the default),
--    createdAt or title, either way, and always then by id, so the order is
--    total: offset pages over a result set that does not change between
--    them never drop or repeat a note, tied keys included. A note added or
--    removed between two page reads moves the later pages by one (offset
--    paging promises no more).
-- 2. public.crm_relationships_page(tenant, search, domains, sort, descending,
--    offset, limit, now): the relationships list the service built in Node
--    from four whole tables (donors as people, households, organizations
--    and churches; ministry assignments; pledges; member-care activity), as
--    {totalCount, rows, report}. SECURITY INVOKER on the caller's token. The
--    member-care branch reads public.member_care_activities only when the
--    caller's assignment holds care.access (authz.assignment_holds), on top
--    of that table's own policy (staff:member_care in the request's tenant),
--    so for any other caller no care row reaches a join, a count, a filter,
--    an order or a page boundary, and every care-derived number is 0
--    whether or not care activity exists. Sensitive care activity (pastoral
--    notes, care-plan updates, crisis interventions, and any type or title
--    naming care, private, counsel or pastoral, in any letter case) is never
--    listed; a care reader sees it counted in excludedCareActivityCount. The
--    report's monthly commitment per currency is the sum of each active
--    pledge's amount times its payments a year, divided by twelve once and
--    rounded half away from zero, so 12,006 a year is 1,001 a month, as the
--    removed TypeScript gave. The report covers
--    the whole authorized set; totalCount covers the domain and search
--    filter. Worker names come from public.tenant_member_directory, as the
--    service's did, 150 profiles a call. Sort by updatedAt or lastActivityAt
--    (the default), createdAt, displayName, domain, status or
--    commitmentAmountCents, either way, and always then by the row's unique
--    id ("<kind>:<record id>", byte order): pages over an unchanging result
--    set never drop or repeat a row; a row added between two page reads
--    moves the later pages by one.
--    In both functions a page's end is computed in bigint, so an offset up to
--    the top of the integer range answers an empty page with the exact total.
-- 3. Two tenant-first indexes on crm_notes for the created-at and title
--    orders (updated-at has one since 20260818000000).
--
-- Locks, all held to COMMIT: SHARE on crm_notes while its two indexes are
-- built (writes wait; reads do not); object locks on the new functions.
-- lock_timeout stops a run rather than queue it behind live traffic.
--
-- If the lock limit stops this file (a long write holding crm_notes), the
-- file rolls back whole and leaves nothing of itself; the release stops
-- here, with the release's earlier files committed (20261126200000 among
-- them). The running build keeps working on that state: it calls neither
-- function, and the indexes only speed reads. Run the release again once
-- the write has finished; this file then applies from its start.
--
-- Recovery. A run lost between its COMMIT and its ledger row stops on the
-- next run at its first CREATE (public.crm_notes_page, 42723), rolling back.
-- This file has committed when this read-only check is true: SELECT
-- to_regprocedure('public.crm_notes_page(uuid,text,text,boolean,integer,integer)')
-- IS NOT NULL. Then follow docs/ops/release-job.md, "If the migration
-- committed but its ledger row is missing", with this check and this file's
-- version, 20261126200100.
--
-- Down (only after the build that calls them is rolled back): DROP FUNCTION
-- public.crm_relationships_page(uuid,text,text[],text,boolean,integer,integer,timestamptz),
-- public.crm_notes_page(uuid,text,text,boolean,integer,integer); DROP INDEX
-- public.crm_notes_tenant_created_at_idx, public.crm_notes_tenant_title_idx.

BEGIN;
SET LOCAL lock_timeout = '5s';

-- 1. Notes.
CREATE FUNCTION public.crm_notes_page(
  p_tenant_id UUID,
  p_search TEXT,
  p_sort TEXT,
  p_descending BOOLEAN,
  p_offset INTEGER,
  p_limit INTEGER
)
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  WITH term AS (
    SELECT pg_catalog.lower(NULLIF(pg_catalog.btrim(p_search), '')) AS value
  ),
  filtered AS (
    SELECT n.*
      FROM public.crm_notes AS n, term AS t
     WHERE n.tenant_id = p_tenant_id
       AND (n.visibility <> 'restricted' OR (SELECT authz.assignment_is_tenant_admin()))
       AND (
         t.value IS NULL
         OR pg_catalog.strpos(pg_catalog.lower(n.title), t.value) > 0
         OR pg_catalog.strpos(pg_catalog.lower(n.body), t.value) > 0
         OR pg_catalog.strpos(pg_catalog.lower(pg_catalog.btrim(pg_catalog.regexp_replace(n.body, '[[:space:]]+', ' ', 'g'))), t.value) > 0
         OR pg_catalog.strpos(pg_catalog.lower(COALESCE(NULLIF(pg_catalog.btrim(n.author_name), ''), 'Mission Control')), t.value) > 0
         OR pg_catalog.strpos(pg_catalog.lower(COALESCE(n.linked_record_id, '')), t.value) > 0
         OR pg_catalog.strpos(pg_catalog.lower(COALESCE(n.linked_record_label, '')), t.value) > 0
         OR pg_catalog.strpos(pg_catalog.lower(COALESCE(n.linked_record_type, '')), t.value) > 0
       )
  ),
  ordered AS (
    SELECT f.*,
           pg_catalog.row_number() OVER (
             ORDER BY
               CASE WHEN p_sort = 'title' AND NOT p_descending THEN f.title END ASC,
               CASE WHEN p_sort = 'title' AND p_descending THEN f.title END DESC,
               CASE WHEN p_sort = 'createdAt' AND NOT p_descending THEN f.created_at END ASC,
               CASE WHEN p_sort = 'createdAt' AND p_descending THEN f.created_at END DESC,
               CASE WHEN COALESCE(p_sort, '') NOT IN ('title', 'createdAt') AND NOT p_descending THEN f.updated_at END ASC,
               CASE WHEN COALESCE(p_sort, '') NOT IN ('title', 'createdAt') AND p_descending THEN f.updated_at END DESC,
               f.id
           ) AS position
      FROM filtered AS f
  )
  SELECT pg_catalog.jsonb_build_object(
    'totalCount', (SELECT pg_catalog.count(*) FROM filtered),
    'rows', COALESCE(
      (SELECT pg_catalog.jsonb_agg(
                pg_catalog.jsonb_build_object(
                  'id', o.id,
                  'tenant_id', o.tenant_id,
                  'title', o.title,
                  'body', o.body,
                  'visibility', o.visibility,
                  'linked_record_id', o.linked_record_id,
                  'linked_record_type', o.linked_record_type,
                  'linked_record_label', o.linked_record_label,
                  'author_name', o.author_name,
                  'created_at', o.created_at,
                  'updated_at', o.updated_at
                )
                ORDER BY o.position)
         FROM ordered AS o
        WHERE o.position > GREATEST(COALESCE(p_offset, 0), 0)::BIGINT
          AND o.position <= GREATEST(COALESCE(p_offset, 0), 0)::BIGINT + LEAST(GREATEST(COALESCE(p_limit, 50), 1), 100)),
      '[]'::jsonb
    )
  );
$$;
COMMENT ON FUNCTION public.crm_notes_page(UUID, TEXT, TEXT, BOOLEAN, INTEGER, INTEGER) IS
  'One page of a tenant''s CRM notes and the exact total of the filtered set, on the caller''s token under row security (AL-2678, WP5 rest r6).';
ALTER FUNCTION public.crm_notes_page(UUID, TEXT, TEXT, BOOLEAN, INTEGER, INTEGER) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.crm_notes_page(UUID, TEXT, TEXT, BOOLEAN, INTEGER, INTEGER) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.crm_notes_page(UUID, TEXT, TEXT, BOOLEAN, INTEGER, INTEGER) TO authenticated;

-- 2. Relationships.
CREATE FUNCTION public.crm_relationships_page(
  p_tenant_id UUID,
  p_search TEXT,
  p_domains TEXT[],
  p_sort TEXT,
  p_descending BOOLEAN,
  p_offset INTEGER,
  p_limit INTEGER,
  p_now TIMESTAMPTZ
)
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  WITH donor_rows AS (
    SELECT d.id,
           COALESCE(NULLIF(pg_catalog.btrim(d.name), ''), NULLIF(pg_catalog.btrim(d.organization), ''), 'Donor') AS display_name,
           pg_catalog.lower(pg_catalog.btrim(COALESCE(d.type, ''))) AS type_key,
           NULLIF(pg_catalog.btrim(d.status), '') AS status,
           NULLIF(pg_catalog.btrim(d.location), '') AS location,
           NULLIF(pg_catalog.btrim(d.spouse), '') AS spouse,
           COALESCE(d.created_at, p_now) AS created_at,
           COALESCE(d.updated_at, d.created_at, p_now) AS updated_at
      FROM public.donors AS d
     WHERE d.tenant_id = p_tenant_id
  ),
  donor_kinds AS (
    SELECT r.*,
           CASE
             WHEN r.type_key = 'church' OR r.display_name ~* '(church|ministry)' THEN 'church'
             WHEN r.type_key IN ('organization', 'company', 'agency', 'org') THEN 'organization'
             ELSE 'person'
           END AS kind
      FROM donor_rows AS r
  ),
  workers AS (
    SELECT m.id, m.profile_id,
           NULLIF(pg_catalog.btrim(m.location), '') AS location,
           COALESCE(m.created_at, p_now) AS created_at,
           COALESCE(m.updated_at, m.created_at, p_now) AS updated_at
      FROM public.missionaries AS m
     WHERE m.tenant_id = p_tenant_id
  ),
  worker_profiles AS (
    SELECT p.profile_id, (pg_catalog.row_number() OVER (ORDER BY p.profile_id) - 1) / 150 AS chunk
      FROM (SELECT DISTINCT w.profile_id FROM workers AS w WHERE w.profile_id IS NOT NULL) AS p
  ),
  names AS (
    SELECT n.profile_id, n.display_name, n.email
      FROM (SELECT wp.chunk, pg_catalog.array_agg(wp.profile_id) AS ids FROM worker_profiles AS wp GROUP BY wp.chunk) AS c,
           LATERAL public.tenant_member_directory(p_tenant_id, c.ids) AS n
  ),
  pledge_rows AS (
    SELECT p.id, p.donor_id, COALESCE(p.amount, 0) AS amount,
           NULLIF(pg_catalog.btrim(p.frequency), '') AS frequency,
           COALESCE(NULLIF(pg_catalog.btrim(p.currency), ''), 'usd') AS currency,
           NULLIF(pg_catalog.btrim(p.status), '') AS status,
           COALESCE(p.created_at, p_now) AS created_at,
           p.start_date
      FROM public.donor_pledges AS p
     WHERE p.tenant_id = p_tenant_id
  ),
  care AS (
    SELECT a.id,
           NULLIF(pg_catalog.btrim(a.type), '') AS type,
           NULLIF(pg_catalog.btrim(a.title), '') AS title,
           NULLIF(pg_catalog.btrim(a.description), '') AS description,
           COALESCE(a.created_at, p_now) AS created_at,
           a.occurred_at,
           (
             pg_catalog.lower(COALESCE(pg_catalog.btrim(a.type), '')) IN ('pastoral_note', 'care_plan_update', 'crisis_intervention')
             OR COALESCE(a.type, '') ~* '(care|private|counsel|pastoral)'
             OR COALESCE(a.title, '') ~* '(care|private|counsel|pastoral)'
           ) AS sensitive
      FROM public.member_care_activities AS a
     WHERE (SELECT authz.assignment_holds('care.access'))
       AND a.tenant_id = p_tenant_id
  ),
  relationship_rows AS (
    SELECT d.kind AS record_kind, d.id::TEXT AS record_id, d.id AS donor_id,
           CASE d.kind WHEN 'church' THEN 'churches' WHEN 'organization' THEN 'organizations' ELSE 'people' END AS domain,
           d.display_name, d.kind AS relationship_kind, d.status,
           d.created_at AS created_sort, d.updated_at AS updated_sort,
           pg_catalog.to_jsonb(d.created_at) AS created_value, pg_catalog.to_jsonb(d.updated_at) AS updated_value,
           d.spouse AS primary_contact_name,
           CASE WHEN d.kind = 'person' THEN d.spouse END AS secondary_label,
           NULL::NUMERIC AS amount, NULL::TEXT AS currency, NULL::TEXT AS frequency,
           'Asym CRM' AS source_system, 'crm_relationship' AS authority_scope,
           d.location, NULL::INTEGER AS member_count,
           d.kind || ':' || pg_catalog.btrim(pg_catalog.regexp_replace(pg_catalog.lower(pg_catalog.btrim(d.display_name)), '[^a-z0-9]+', '-', 'g'), '-') AS dedupe_key
      FROM donor_kinds AS d
    UNION ALL
    SELECT 'household', d.id::TEXT, d.id, 'households',
           d.display_name || ' Household', 'household', d.status,
           d.created_at, d.updated_at,
           pg_catalog.to_jsonb(d.created_at), pg_catalog.to_jsonb(d.updated_at),
           d.spouse, d.spouse,
           NULL, NULL, NULL,
           'Asym CRM', 'crm_relationship',
           d.location, 2,
           'household:' || pg_catalog.btrim(pg_catalog.regexp_replace(pg_catalog.lower(pg_catalog.btrim(d.display_name || ' Household')), '[^a-z0-9]+', '-', 'g'), '-')
      FROM donor_kinds AS d
     WHERE d.spouse IS NOT NULL
    UNION ALL
    SELECT 'missionary', w.id::TEXT, NULL::UUID, 'people',
           l.display_name, 'missionary', NULL,
           w.created_at, w.updated_at,
           pg_catalog.to_jsonb(w.created_at), pg_catalog.to_jsonb(w.updated_at),
           NULL, 'Missionary',
           NULL, NULL, NULL,
           'Asym CRM', 'crm_relationship',
           w.location, NULL,
           'person:' || pg_catalog.btrim(pg_catalog.regexp_replace(pg_catalog.lower(pg_catalog.btrim(l.display_name)), '[^a-z0-9]+', '-', 'g'), '-')
      FROM workers AS w
      LEFT JOIN names AS n ON n.profile_id = w.profile_id
      CROSS JOIN LATERAL (
        SELECT CASE
                 WHEN w.profile_id IS NULL THEN 'Missionary'
                 WHEN n.profile_id IS NULL THEN 'Former member'
                 ELSE COALESCE(NULLIF(pg_catalog.btrim(n.display_name), ''), NULLIF(pg_catalog.btrim(n.email), ''), 'Member')
               END AS display_name
      ) AS l
    UNION ALL
    SELECT 'commitment', p.id::TEXT, d.id, 'pledges',
           COALESCE(d.display_name || ' pledge', 'Pledge'), COALESCE(p.frequency, 'pledge'), p.status,
           p.created_at, COALESCE(p.start_date::TIMESTAMPTZ, p.created_at),
           pg_catalog.to_jsonb(p.created_at), COALESCE(pg_catalog.to_jsonb(p.start_date), pg_catalog.to_jsonb(p.created_at)),
           d.display_name, p.frequency,
           p.amount::NUMERIC, p.currency, p.frequency,
           'Asym finance summary', 'finance_summary',
           NULL, NULL,
           'commitment:' || p.id::TEXT
      FROM pledge_rows AS p
      LEFT JOIN donor_kinds AS d ON d.id = p.donor_id
    UNION ALL
    SELECT 'activity', c.id::TEXT, NULL::UUID, 'activity',
           COALESCE(c.title, c.type, 'Activity'), COALESCE(c.type, 'activity'), NULL,
           c.created_at, COALESCE(c.occurred_at, c.created_at),
           pg_catalog.to_jsonb(c.created_at), COALESCE(pg_catalog.to_jsonb(c.occurred_at), pg_catalog.to_jsonb(c.created_at)),
           NULL, c.description,
           NULL, NULL, NULL,
           'Asym member care', 'member_care',
           NULL, NULL,
           'activity:' || c.id::TEXT
      FROM care AS c
     WHERE NOT c.sensitive
  ),
  term AS (
    SELECT pg_catalog.lower(NULLIF(pg_catalog.btrim(p_search), '')) AS value
  ),
  visible AS (
    SELECT r.*
      FROM relationship_rows AS r, term AS t
     WHERE (COALESCE(pg_catalog.cardinality(p_domains), 0) = 0 OR r.domain = ANY (p_domains))
       AND (
         t.value IS NULL
         OR pg_catalog.strpos(
              pg_catalog.lower(pg_catalog.concat_ws(' ',
                NULLIF(r.display_name, ''), NULLIF(r.primary_contact_name, ''), r.record_kind,
                NULLIF(r.relationship_kind, ''), NULLIF(r.status, ''), r.source_system, NULLIF(r.secondary_label, ''))),
              t.value) > 0
       )
  ),
  ordered AS (
    SELECT v.*,
           pg_catalog.row_number() OVER (
             ORDER BY
               CASE WHEN p_sort = 'displayName' AND NOT p_descending THEN v.display_name END ASC,
               CASE WHEN p_sort = 'displayName' AND p_descending THEN v.display_name END DESC,
               CASE WHEN p_sort = 'domain' AND NOT p_descending THEN v.domain END ASC,
               CASE WHEN p_sort = 'domain' AND p_descending THEN v.domain END DESC,
               CASE WHEN p_sort = 'status' AND NOT p_descending THEN COALESCE(v.status, '') END ASC,
               CASE WHEN p_sort = 'status' AND p_descending THEN COALESCE(v.status, '') END DESC,
               CASE WHEN p_sort = 'commitmentAmountCents' AND NOT p_descending THEN COALESCE(v.amount, 0) END ASC,
               CASE WHEN p_sort = 'commitmentAmountCents' AND p_descending THEN COALESCE(v.amount, 0) END DESC,
               CASE WHEN p_sort = 'createdAt' AND NOT p_descending THEN v.created_sort END ASC,
               CASE WHEN p_sort = 'createdAt' AND p_descending THEN v.created_sort END DESC,
               CASE WHEN COALESCE(p_sort, '') NOT IN ('displayName', 'domain', 'status', 'commitmentAmountCents', 'createdAt') AND NOT p_descending THEN v.updated_sort END ASC,
               CASE WHEN COALESCE(p_sort, '') NOT IN ('displayName', 'domain', 'status', 'commitmentAmountCents', 'createdAt') AND p_descending THEN v.updated_sort END DESC,
               (v.record_kind || ':' || v.record_id) COLLATE "C"
           ) AS position
      FROM visible AS v
  ),
  frequencies (key, per_year) AS (
    VALUES
      ('annual', 1::NUMERIC), ('annually', 1::NUMERIC), ('biweekly', 26::NUMERIC),
      ('month', 12::NUMERIC), ('monthly', 12::NUMERIC), ('quarter', 4::NUMERIC), ('quarterly', 4::NUMERIC),
      ('semi_annual', 2::NUMERIC), ('semi_annually', 2::NUMERIC), ('semiannual', 2::NUMERIC),
      ('semiannually', 2::NUMERIC), ('semimonthly', 24::NUMERIC), ('week', 52::NUMERIC),
      ('weekly', 52::NUMERIC), ('year', 1::NUMERIC), ('yearly', 1::NUMERIC)
  ),
  active_pledges AS (
    SELECT pg_catalog.upper(r.currency) AS currency, r.amount, f.per_year
      FROM relationship_rows AS r
      LEFT JOIN frequencies AS f
        ON f.key = pg_catalog.regexp_replace(pg_catalog.regexp_replace(pg_catalog.lower(COALESCE(r.frequency, '')), '^[[:space:]_-]+|[[:space:]_-]+$', '', 'g'), '[[:space:]_-]+', '_', 'g')
     WHERE r.domain = 'pledges'
       AND pg_catalog.regexp_replace(pg_catalog.regexp_replace(pg_catalog.lower(COALESCE(r.status, '')), '^[[:space:]_-]+|[[:space:]_-]+$', '', 'g'), '[[:space:]_-]+', '_', 'g') = 'active'
  ),
  report AS (
    SELECT pg_catalog.jsonb_build_object(
      'domainCounts', pg_catalog.jsonb_build_object(
        'people', pg_catalog.count(*) FILTER (WHERE r.domain = 'people'),
        'households', pg_catalog.count(*) FILTER (WHERE r.domain = 'households'),
        'organizations', pg_catalog.count(*) FILTER (WHERE r.domain = 'organizations'),
        'churches', pg_catalog.count(*) FILTER (WHERE r.domain = 'churches'),
        'pledges', pg_catalog.count(*) FILTER (WHERE r.domain = 'pledges'),
        'activity', pg_catalog.count(*) FILTER (WHERE r.domain = 'activity')
      ),
      'duplicateCompanyCandidates', (
        SELECT COALESCE(pg_catalog.sum(g.n - 1), 0)
          FROM (SELECT pg_catalog.count(*) AS n FROM relationship_rows AS x WHERE x.record_kind IN ('organization', 'church') GROUP BY x.dedupe_key) AS g
      ),
      'duplicatePersonCandidates', (
        SELECT COALESCE(pg_catalog.sum(g.n - 1), 0)
          FROM (SELECT pg_catalog.count(*) AS n FROM relationship_rows AS x WHERE x.record_kind IN ('person', 'missionary') GROUP BY x.dedupe_key) AS g
      ),
      'excludedCareActivityCount', (SELECT pg_catalog.count(*) FROM care AS c WHERE c.sensitive),
      'householdCount', pg_catalog.count(*) FILTER (WHERE r.domain = 'households'),
      'activeCommitments', pg_catalog.jsonb_build_object(
        'monthlyByCurrency', COALESCE((
          SELECT pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
                   'currency', m.currency, 'monthlyCents', m.cents, 'pledgeCount', m.n)
                   ORDER BY m.currency)
            FROM (
              SELECT a.currency, pg_catalog.round(pg_catalog.sum(a.amount * a.per_year) / 12)::BIGINT AS cents, pg_catalog.count(*) AS n
                FROM active_pledges AS a
               WHERE a.per_year IS NOT NULL
               GROUP BY a.currency
            ) AS m
        ), '[]'::jsonb),
        'pledgeCount', (SELECT pg_catalog.count(*) FROM active_pledges),
        'unknownFrequencyCount', (SELECT pg_catalog.count(*) FROM active_pledges AS a WHERE a.per_year IS NULL)
      ),
      'recentActivityCount', pg_catalog.count(*) FILTER (WHERE r.domain = 'activity'),
      'totalRows', pg_catalog.count(*)
    ) AS value
      FROM relationship_rows AS r
  )
  SELECT pg_catalog.jsonb_build_object(
    'totalCount', (SELECT pg_catalog.count(*) FROM visible),
    'rows', COALESCE(
      (SELECT pg_catalog.jsonb_agg(
                pg_catalog.jsonb_build_object(
                  'authorityLabel', CASE o.authority_scope WHEN 'finance_summary' THEN 'Asym finance summary' WHEN 'member_care' THEN 'Asym member care' ELSE 'Asym CRM' END,
                  'authorityScope', o.authority_scope,
                  'commitmentAmountCents', o.amount,
                  'commitmentCurrency', o.currency,
                  'commitmentFrequency', o.frequency,
                  'createdAt', o.created_value,
                  'dedupeKey', o.dedupe_key,
                  'displayName', o.display_name,
                  'donorId', o.donor_id,
                  'domain', o.domain,
                  'id', o.record_kind || ':' || o.record_id,
                  'lastActivityAt', o.updated_value,
                  'location', o.location,
                  'memberCount', o.member_count,
                  'primaryContactName', o.primary_contact_name,
                  'recordId', o.record_id,
                  'recordKind', o.record_kind,
                  'relationshipKind', o.relationship_kind,
                  'secondaryLabel', o.secondary_label,
                  'sourceSystem', o.source_system,
                  'status', o.status,
                  'tenantId', p_tenant_id,
                  'updatedAt', o.updated_value
                )
                ORDER BY o.position)
         FROM ordered AS o
        WHERE o.position > GREATEST(COALESCE(p_offset, 0), 0)::BIGINT
          AND o.position <= GREATEST(COALESCE(p_offset, 0), 0)::BIGINT + LEAST(GREATEST(COALESCE(p_limit, 50), 1), 100)),
      '[]'::jsonb
    ),
    'report', (SELECT r.value FROM report AS r)
  );
$$;
COMMENT ON FUNCTION public.crm_relationships_page(UUID, TEXT, TEXT[], TEXT, BOOLEAN, INTEGER, INTEGER, TIMESTAMPTZ) IS
  'One page of a tenant''s CRM relationships, the exact total of the filtered set and the report over the whole authorized set, on the caller''s token under row security; member-care rows only for a caller holding care.access (AL-2678, WP5 rest r6).';
ALTER FUNCTION public.crm_relationships_page(UUID, TEXT, TEXT[], TEXT, BOOLEAN, INTEGER, INTEGER, TIMESTAMPTZ) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.crm_relationships_page(UUID, TEXT, TEXT[], TEXT, BOOLEAN, INTEGER, INTEGER, TIMESTAMPTZ) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.crm_relationships_page(UUID, TEXT, TEXT[], TEXT, BOOLEAN, INTEGER, INTEGER, TIMESTAMPTZ) TO authenticated;

-- 3. The notes' other two orders.
CREATE INDEX crm_notes_tenant_created_at_idx ON public.crm_notes (tenant_id, created_at DESC, id);
CREATE INDEX crm_notes_tenant_title_idx ON public.crm_notes (tenant_id, title, id);

COMMIT;

SELECT pg_notify('pgrst', 'reload schema');
