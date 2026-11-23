-- AL-2677 (WP4a, part 2b; record section 9, "drop crm_merge_candidates",
-- and D-14; the coordinator's ruling on Q12): drop the Twenty-era
-- `public.crm_merge_candidates`.
--
-- The plan's "Data: none" for WP4 is superseded for this one table by
-- decision D-14 of the implementation record: WP4a moves CRM detail's read to
-- `donor_merge_candidates` and drops this table. Part 2a made that move
-- (20261121020000_crm_staff_read_policies.sql grants the read; CRM detail
-- reads `donor_merge_candidates`), and no code reads this table since. Expand,
-- then contract (plan 7.4): this migration ships in a release after part 2a's,
-- so no running release still reads it. Its pull request is merged only after
-- part 2a's.
--
-- Before it drops, it refuses while any function, view or policy other than
-- the table's own policies still names the table, because a function body
-- records no dependency and the drop would leave it broken. It reports, as a
-- notice, the number of rows it removes. No CASCADE: an unexpected dependent
-- object fails the migration instead of being dropped with it.
--
-- Its types `crm_merge_candidate_status` and `crm_duplicate_confidence` and
-- `crm_link_entity_type`, which `crm_record_links` also uses, are left as they
-- are.
--
-- Rollback: forward-fix only. The table held review candidates for the
-- retired Twenty sync and nothing has written it since that sync was
-- retired; its definition is in 20260508000413_crm_identity_mapping.sql.

BEGIN;

SET LOCAL lock_timeout = '5s';

DO $$
DECLARE
  v_names TEXT;
  v_rows BIGINT;
BEGIN
  SELECT pg_catalog.string_agg(n.name, ', ' ORDER BY n.name)
    INTO v_names
    FROM (
      SELECT 'function ' || pn.nspname || '.' || p.proname
             || '(' || pg_catalog.pg_get_function_identity_arguments(p.oid) || ')' AS name
        FROM pg_catalog.pg_proc AS p
        JOIN pg_catalog.pg_namespace AS pn ON pn.oid = p.pronamespace
       WHERE (p.prosrc || COALESCE(pg_catalog.pg_get_function_sqlbody(p.oid), ''))
             ~* '\mcrm_merge_candidates\M'
      UNION ALL
      SELECT 'view ' || cn.nspname || '.' || c.relname
        FROM pg_catalog.pg_class AS c
        JOIN pg_catalog.pg_namespace AS cn ON cn.oid = c.relnamespace
       WHERE c.relkind IN ('v', 'm')
         AND pg_catalog.pg_get_viewdef(c.oid) ~* '\mcrm_merge_candidates\M'
      UNION ALL
      SELECT 'policy ' || pol.polname || ' on ' || tn.nspname || '.' || t.relname
        FROM pg_catalog.pg_policy AS pol
        JOIN pg_catalog.pg_class AS t ON t.oid = pol.polrelid
        JOIN pg_catalog.pg_namespace AS tn ON tn.oid = t.relnamespace
       WHERE pol.polrelid IS DISTINCT FROM pg_catalog.to_regclass('public.crm_merge_candidates')
         AND (COALESCE(pg_catalog.pg_get_expr(pol.polqual, pol.polrelid), '')
              || ' ' || COALESCE(pg_catalog.pg_get_expr(pol.polwithcheck, pol.polrelid), ''))
             ~* '\mcrm_merge_candidates\M'
    ) AS n;

  IF v_names IS NOT NULL THEN
    RAISE EXCEPTION 'crm_merge_candidates is still named by %', v_names
      USING ERRCODE = '2BP01';
  END IF;

  SELECT pg_catalog.count(*) INTO v_rows FROM public.crm_merge_candidates;

  RAISE NOTICE 'crm_merge_candidates: dropping % row(s)', v_rows;
END;
$$;

DROP TABLE public.crm_merge_candidates;

COMMIT;
