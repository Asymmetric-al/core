-- Read-only catalogue preflight for the provider-supported PostgreSQL 17.11 upgrade.
-- No application rows, keys or encrypted values are read. Empty function candidates
-- cannot exclude PGP data written by external clients; reconcile owner provenance.
SELECT jsonb_build_object(
  'serverVersion', current_setting('server_version'),
  'serverVersionNumber', current_setting('server_version_num'),
  'extensions', (SELECT jsonb_agg(jsonb_build_object('name', extname, 'version', extversion) ORDER BY extname) FROM pg_extension),
  'ltreeIndexes', (SELECT coalesce(jsonb_agg(DISTINCT n.nspname || '.' || ic.relname), '[]') FROM pg_index idx JOIN pg_class ic ON idx.indexrelid=ic.oid JOIN pg_namespace n ON ic.relnamespace=n.oid JOIN LATERAL unnest(idx.indclass::oid[]) WITH ORDINALITY AS k(opclass,pos) ON true JOIN pg_opclass oc ON oc.oid=k.opclass JOIN pg_type ty ON ty.oid=oc.opcintype WHERE k.pos<=idx.indnkeyatts AND ty.typname IN ('ltree','_ltree')),
  'floatGistIndexes', (SELECT coalesce(jsonb_agg(DISTINCT n.nspname || '.' || ic.relname), '[]') FROM pg_index idx JOIN pg_class ic ON idx.indexrelid=ic.oid JOIN pg_class cls ON idx.indrelid=cls.oid JOIN pg_namespace n ON ic.relnamespace=n.oid JOIN pg_am am ON ic.relam=am.oid JOIN LATERAL unnest(idx.indclass::oid[]) WITH ORDINALITY AS k(opclass,pos) ON true JOIN pg_opclass oc ON oc.oid=k.opclass JOIN pg_type ty ON ty.oid=oc.opcintype WHERE am.amname='gist' AND k.pos<=idx.indnkeyatts AND ty.typname IN ('float4','float8')),
  'customEstimatorOperators', (SELECT coalesce(jsonb_agg(jsonb_build_object('schema',n.nspname,'operator',o.oprname)),'[]') FROM pg_operator o JOIN pg_namespace n ON n.oid=o.oprnamespace WHERE n.nspname NOT IN ('pg_catalog','information_schema') AND ((o.oprrest<>0 AND o.oprrest::oid>=10000) OR (o.oprjoin<>0 AND o.oprjoin::oid>=10000)) AND NOT EXISTS (SELECT 1 FROM pg_depend d WHERE d.classid='pg_operator'::regclass AND d.objid=o.oid AND d.deptype='e')),
  'storedPgpFunctionCandidates', (SELECT coalesce(jsonb_agg(n.nspname || '.' || p.proname),'[]') FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname NOT IN ('pg_catalog','information_schema') AND p.prosrc ~* '(pgp_(sym|pub)_(en|de)crypt|cipher-algo)' AND NOT EXISTS (SELECT 1 FROM pg_depend d WHERE d.classid='pg_proc'::regclass AND d.objid=p.oid AND d.deptype='e'))
) AS modernization_postgres_readiness;
