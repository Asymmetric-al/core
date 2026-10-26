/**
 * #2312 shared fixtures (spec r2 = issue comment 6390700741, plus pins
 * addendum 1 = 6419302687, approved in 6419379494).
 * Owned by Acceptance. Implementers must not edit this file to satisfy their PR.
 */
import { existsSync, readFileSync } from "node:fs";

export const MIG = "supabase/migrations";
/**
 * Addendum 1 item 1 (OQ5): the one migration this issue adds, by EXACT file
 * name (never a glob or date prefix). The version is a reservation; if Samson
 * renumbers it at handback, change only this line.
 */
export const MIGRATION_NAME =
  "20261025120500_close_public_reads_tenant_scope.sql";
export const MIGRATION = `${MIG}/${MIGRATION_NAME}`;
/** Newest forward migration on develop 88eefbd9 (addendum 1 header). */
export const DEVELOP_LATEST = "20261025120000";
/** §1.1: the five tables, in spec order. */
export const TABLES = [
  "missionaries",
  "funds",
  "follows",
  "assets",
  "campaigns",
] as const;
export type Table = (typeof TABLES)[number];
/** §1.1: the four tenant-floor tables and the follows policy name. */
export const FLOOR_TABLES = ["missionaries", "funds", "assets", "campaigns"];
export const FLOOR_POLICY = "tenant scoped read";
export const FOLLOWS_POLICY = "tenant scoped own or staff read";
export const policyName = (t: string) =>
  t === "follows" ? FOLLOWS_POLICY : FLOOR_POLICY;
/** §2 In 1.1: the only legacy names the pre-assert accepts. */
export const LEGACY = ["public read", "tanstack browser read"] as const;
/** §1.1 USING clauses, verbatim (normative; compared through pg's deparser). */
export const FLOOR_QUAL =
  "tenant_id IS NOT NULL AND tenant_id = (SELECT authz.current_tenant_id())";
export const FOLLOWS_QUAL = `${FLOOR_QUAL} AND (EXISTS (SELECT 1 FROM public.donors d JOIN public.profiles p ON p.id = d.profile_id WHERE d.id = follows.donor_id AND d.tenant_id = follows.tenant_id AND (p.user_id = (SELECT auth.uid()) OR p.id = (SELECT auth.uid()))) OR (SELECT authz.has_staff_membership(follows.tenant_id, NULL::authz.staff_role[])))`;
export const qualFor = (t: string) =>
  t === "follows" ? FOLLOWS_QUAL : FLOOR_QUAL;

export const SMOKE = "scripts/supabase-env-smoke.mjs";
export const SMOKE_TEST = "tests/unit/scripts/supabase-env-smoke.test.ts";
export const DOC = "docs/security/tenant-read-floor.md";
export const ALLOWLIST = "docs/security/service-role-client-allowlist.json";
export const LEGACY_MIGRATIONS = {
  "20260216153000_demo_readonly_rls.sql":
    "68eededec09559595c03b0db23f1af9bf87ee1ef4ee36ce98f2de1c40da94e73",
  "20260625002117_canonical_tanstack_db_realtime_rls.sql":
    "836eecd9ae2190d04f648f104f73e8fc89b7a1602439975ab7c726f3d9918c16",
} as const;
export const REALSTACK =
  "tests/unit/acceptance/issue-2312/public-reads.realstack.acceptance.test.ts";

export const read = (f: string) =>
  existsSync(f) ? readFileSync(f, "utf8") : "";
/** SQL with comments removed (executable text only). */
export const code = (sql: string) =>
  sql.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/--[^\n]*/g, " ");
/** The migration as a batch that runs inside a caller's transaction (top-level BEGIN;/COMMIT; dropped). */
export const migrationBatch = () =>
  read(MIGRATION).replace(/^\s*(BEGIN|COMMIT)\s*;\s*$/gim, "");
