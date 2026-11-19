// Reads the two migration ledgers of a target database: Supabase's
// supabase_migrations.schema_migrations and Payload's cms.payload_migrations.
// A missing ledger reads as empty.
import { queryJson } from "./postgres.mjs";

const EXISTENCE_SQL = `
SELECT json_build_object(
  'supabase', to_regclass('supabase_migrations.schema_migrations') IS NOT NULL,
  'payload', to_regclass('cms.payload_migrations') IS NOT NULL
)::text;`;

const SUPABASE_SQL = `
SELECT coalesce(json_agg(version ORDER BY version), '[]'::json)::text
FROM supabase_migrations.schema_migrations;`;

// Batch -1 named 'dev' is the marker Payload writes after a schema push.
const PAYLOAD_SQL = `
SELECT json_build_object(
  'names', coalesce(
    (SELECT json_agg(name ORDER BY name) FROM cms.payload_migrations
      WHERE NOT (batch = -1 AND name = 'dev')),
    '[]'::json),
  'devMarker', EXISTS (
    SELECT 1 FROM cms.payload_migrations WHERE batch = -1 AND name = 'dev')
)::text;`;

export function readAppliedMigrations({ databaseUrl, query = queryJson }) {
  const exists = query({
    databaseUrl,
    sql: EXISTENCE_SQL,
    label: "read migration ledgers",
  });
  const supabase = exists.supabase
    ? query({ databaseUrl, sql: SUPABASE_SQL, label: "read Supabase ledger" })
    : [];
  const payload = exists.payload
    ? query({ databaseUrl, sql: PAYLOAD_SQL, label: "read Payload ledger" })
    : { names: [], devMarker: false };
  return {
    supabase,
    payload: payload.names,
    payloadDevMarker: payload.devMarker === true,
  };
}
