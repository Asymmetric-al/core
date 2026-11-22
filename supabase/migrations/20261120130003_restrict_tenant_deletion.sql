-- Replace every non-RESTRICT FK to tenants, skipping already restrictive keys.
-- Schedule a write-free window: each validated replacement scans its child.
-- The seeded develop upgrade holds 147 ACCESS EXCLUSIVE table locks until COMMIT:
-- 146 referencing tables plus public.tenants. The lock timeout aborts rather
-- than waiting indefinitely. Review the original actions in
-- docs/security/tenant-fk-actions-before-wp3a.csv and inspect pg_blocking_pids.
-- Forward only: restoring blanket cascades could erase tenant history. Use a
-- reviewed forward fix, or rebuild a disposable database from the prior source.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL search_path = pg_catalog;
DO $$
DECLARE
  edge record;
  definition text;
BEGIN
  FOR edge IN SELECT conname,conrelid::regclass AS child,pg_get_constraintdef(oid) AS original
    FROM pg_constraint WHERE contype='f' AND confrelid='public.tenants'::regclass AND confdeltype<>'r'
    ORDER BY conrelid,conname
  LOOP
    IF edge.original !~ '^FOREIGN KEY \(tenant_id\) REFERENCES public\.tenants\(id\)( ON DELETE (CASCADE|SET NULL))?$' THEN
      RAISE EXCEPTION 'Unreviewed tenant constraint %.%: %',edge.child,edge.conname,edge.original;
    END IF;
    definition := regexp_replace(edge.original,'( ON DELETE (CASCADE|SET NULL))?$',' ON DELETE RESTRICT');
    EXECUTE format('ALTER TABLE %s DROP CONSTRAINT %I, ADD CONSTRAINT %I %s',edge.child,edge.conname,edge.conname,definition);
  END LOOP;
END;
$$;
COMMIT;
