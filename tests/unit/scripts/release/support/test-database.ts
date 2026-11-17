// Disposable databases for the release job's real-stack tests. Set
// RELEASE_IT_ADMIN_DATABASE_URL to a superuser connection of a disposable
// Postgres (CI's service container, or the local shared test server); every
// database these tests create starts with `wp13r_`.
import { randomBytes } from "node:crypto";
import { spawnSync } from "node:child_process";

export const adminDatabaseUrl =
  process.env.RELEASE_IT_ADMIN_DATABASE_URL?.trim() || "";

export function psql(databaseUrl: string, sql: string) {
  const result = spawnSync(
    "psql",
    [databaseUrl, "-X", "-q", "-A", "-t", "-v", "ON_ERROR_STOP=1", "-f", "-"],
    { input: sql, encoding: "utf8", shell: false },
  );
  if (result.status !== 0) {
    throw new Error(`psql failed: ${result.stderr}`);
  }
  return result.stdout.trim();
}

export function databaseUrlFor(name: string) {
  const url = new URL(adminDatabaseUrl);
  url.pathname = `/${name}`;
  return url.toString();
}

export function uniqueName(label: string) {
  return `wp13r_${label}_${randomBytes(4).toString("hex")}`;
}

export function createDatabase(label: string) {
  const name = uniqueName(label);
  psql(adminDatabaseUrl, `CREATE DATABASE ${name};`);
  return { name, url: databaseUrlFor(name) };
}

export function dropDatabase(name: string) {
  if (!name.startsWith("wp13r_")) throw new Error("refusing to drop " + name);
  psql(adminDatabaseUrl, `DROP DATABASE IF EXISTS ${name} WITH (FORCE);`);
}

/** The ledgers Supabase and Payload keep, as the CI bootstrap shapes them. */
export const LEDGER_SQL = `
CREATE SCHEMA IF NOT EXISTS supabase_migrations;
CREATE TABLE IF NOT EXISTS supabase_migrations.schema_migrations (
  version text PRIMARY KEY, statements text[], name text);
CREATE SCHEMA IF NOT EXISTS cms;
CREATE TABLE IF NOT EXISTS cms.payload_migrations (
  id serial PRIMARY KEY, name varchar, batch numeric,
  updated_at timestamptz DEFAULT now(), created_at timestamptz DEFAULT now());
`;

/**
 * A stand-in for the SQL that WP1.1 delivers, shaped as its migration
 * `platform_schema_marker_and_health` defines it and as the contract in
 * packages/api/src/health/release-contract.mjs names it. Tests run against
 * this stub; the real migration replaces it at integration.
 */
export const CONTRACT_STUB_SQL = `
CREATE SCHEMA IF NOT EXISTS platform;
CREATE TABLE platform.environment (
  singleton boolean PRIMARY KEY DEFAULT true CHECK (singleton),
  kind text NOT NULL CHECK (kind IN ('disposable', 'shared', 'production')));
CREATE FUNCTION platform.guard_environment_marker() RETURNS trigger
LANGUAGE plpgsql SET search_path = '' AS $$
DECLARE v_rank CONSTANT jsonb := '{"disposable": 0, "shared": 1, "production": 2}';
BEGIN
  IF TG_OP = 'UPDATE' AND (v_rank ->> NEW.kind)::int < (v_rank ->> OLD.kind)::int THEN
    RAISE EXCEPTION 'platform: the environment marker moves forward only';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER environment_marker_forward_only BEFORE UPDATE ON platform.environment
  FOR EACH ROW EXECUTE FUNCTION platform.guard_environment_marker();
CREATE FUNCTION platform.environment_kind() RETURNS text
LANGUAGE sql STABLE SET search_path = '' AS $$ SELECT e.kind FROM platform.environment AS e; $$;
CREATE FUNCTION platform.advance_environment(p_kind text) RETURNS text
LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  IF p_kind IS NULL OR p_kind NOT IN ('shared', 'production') THEN
    RAISE EXCEPTION 'platform: the environment marker can only be advanced to shared or production';
  END IF;
  INSERT INTO platform.environment (singleton, kind) VALUES (true, p_kind)
  ON CONFLICT (singleton) DO UPDATE SET kind = EXCLUDED.kind;
  RETURN platform.environment_kind();
END $$;
CREATE TABLE platform.migration_heads (
  ledger text PRIMARY KEY CHECK (ledger IN ('supabase', 'payload')),
  head text NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT now());
CREATE FUNCTION platform.record_migration_head(p_ledger text, p_head text) RETURNS void
LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  INSERT INTO platform.migration_heads AS h (ledger, head) VALUES (p_ledger, p_head)
  ON CONFLICT (ledger) DO UPDATE SET head = EXCLUDED.head, recorded_at = now()
    WHERE h.head <= EXCLUDED.head;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'platform: the % migration head moves forward only', p_ledger;
  END IF;
END $$;
CREATE FUNCTION platform.health() RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  RETURN jsonb_build_object(
    'environment', platform.environment_kind(),
    'expected_heads', coalesce(
      (SELECT jsonb_object_agg(h.ledger, h.head) FROM platform.migration_heads AS h),
      '{}'::jsonb),
    'applied_heads', jsonb_build_object('supabase', NULL),
    'checked_at', now());
END $$;
CREATE FUNCTION public.platform_health() RETURNS jsonb
LANGUAGE sql STABLE SET search_path = '' AS $$ SELECT platform.health(); $$;
`;

export const MARK_DISPOSABLE_SQL = `
INSERT INTO platform.environment (singleton, kind) VALUES (true, 'disposable');`;
