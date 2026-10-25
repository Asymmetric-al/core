/**
 * #2255 shared fixtures (spec r2 = issue comment 6392691588, "Spec r2
 * (consolidated)", approved by Samson Oct 24, 2026, 7:55 PM PT). Owned by
 * Acceptance; implementers must not edit.
 */
import { existsSync, readFileSync } from "node:fs";

import { expect } from "vitest";

/**
 * Spec §2 In 1: the one forward migration this issue adds, by exact name. The
 * version is a reservation (§7); if Samson renumbers it, change only this line.
 */
export const MIGRATION =
  "supabase/migrations/20261025090000_account_claim_and_invitation_tables.sql";
/** Spec §2 In 5: the rollback is `rollback_` + the migration's file name. */
export const ROLLBACK = MIGRATION.replace(/([^/]+)$/, "rollback_$1");
/** Spec §2 In 6. */
export const DOC = "docs/security/identity-claim-tables.md";
/** Samson's CI-step ruling: #2255's own migrate step, exactly this; order is pinned only relative to AFTER_STEPS. */
export const CI_STEP = {
  name: "Verify claim tables (real stack)",
  env: { TENANT_GUARD_IT_ADMIN_DATABASE_URL: "${{ env.DATABASE_URL }}" },
  run: "bun x vitest run tests/unit/acceptance/issue-2255/claim-tables.realstack.acceptance.test.ts",
};
/** #2250's and #2270's real-stack steps; no order is pinned against #2251's or #2252's. */
export const AFTER_STEPS = [
  "Verify tenant isolation (real stack)",
  "Verify authz EXECUTE grants (real stack)",
];
export const CLAIMS = "account_claim_requests";
export const INVITES = "legacy_account_invitations";
export const TABLES = [CLAIMS, INVITES] as const;
/** Spec §1 access contract: [table, policy], all FOR SELECT TO authenticated. */
export const POLICIES: [string, string][] = [
  [CLAIMS, "account_claim_requests_requester_select"],
  [CLAIMS, "account_claim_requests_staff_select"],
  [INVITES, "legacy_account_invitations_staff_select"],
];
export const CLAIM_STATUSES = [
  "pending",
  "verified",
  "approved",
  "denied",
  "expired",
];
export const INVITE_STATUSES = ["sent", "accepted", "expired", "revoked"];

/** Spec §1 column contract: name, type, NOT NULL, default (pg_get_expr), generated expr. */
type Col = [string, string, boolean, string | null, string | null];
const TS = "timestamp with time zone";
const common = (head: Col[], tail: Col[]): Col[] => [
  ["tenant_id", "uuid", true, null, null],
  ["id", "uuid", true, "gen_random_uuid()", null],
  ...head,
  ["email", "text", true, null, null],
  ["email_normalized", "text", false, null, "normalize_email(email)"],
  ...tail,
  ["created_at", TS, true, "now()", null],
  ["updated_at", TS, true, "now()", null],
];
export const COLUMNS: Record<string, Col[]> = {
  [CLAIMS]: common(
    [["donor_id", "uuid", false, null, null]],
    [
      ["requested_by", "uuid", false, null, null],
      ["status", "text", true, "'pending'::text", null],
      ["match_type", "text", false, null, null],
      ["match_confidence", "text", false, null, null],
      ["reason", "text", false, null, null],
      ["resolved_by", "uuid", false, null, null],
      ["resolved_at", TS, false, null, null],
    ],
  ),
  [INVITES]: common(
    [["donor_id", "uuid", true, null, null]],
    [
      ["invited_by", "uuid", false, null, null],
      ["link_token_sha256", "bytea", false, null, null],
      ["link_token_expires_at", TS, false, null, null],
      ["status", "text", true, "'sent'::text", null],
      ["expires_at", TS, true, "(now() + '7 days'::interval)", null],
      ["revoked_at", TS, false, null, null],
      ["accepted_at", TS, false, null, null],
    ],
  ),
};
/** Spec §1 indexes, as `pg_get_indexdef` text after the index name. */
export const INDEXES: Record<string, string[]> = {
  [CLAIMS]: [
    "INDEX ON public.account_claim_requests USING btree (requested_by) WHERE (requested_by IS NOT NULL)",
    "INDEX ON public.account_claim_requests USING btree (tenant_id, donor_id) WHERE (donor_id IS NOT NULL)",
    "INDEX ON public.account_claim_requests USING btree (tenant_id, email_normalized)",
    "INDEX ON public.account_claim_requests USING btree (tenant_id, status)",
    "UNIQUE INDEX ON public.account_claim_requests USING btree (tenant_id, id)",
  ],
  [INVITES]: [
    "INDEX ON public.legacy_account_invitations USING btree (tenant_id, donor_id)",
    "INDEX ON public.legacy_account_invitations USING btree (tenant_id, email_normalized)",
    "INDEX ON public.legacy_account_invitations USING btree (tenant_id, status)",
    "UNIQUE INDEX ON public.legacy_account_invitations USING btree (link_token_sha256) WHERE (link_token_sha256 IS NOT NULL)",
    "UNIQUE INDEX ON public.legacy_account_invitations USING btree (tenant_id, id)",
  ],
};

export const read = (p: string) =>
  existsSync(p) ? readFileSync(p, "utf8") : "";
/** SQL with `--` line comments removed. */
export const code = (sql: string) => sql.replace(/--[^\n]*/g, "");
/** Reads a pinned file after asserting it exists, so no scan passes on a missing file. */
export function sqlFile(p: string): string {
  expect(existsSync(p), `${p} must exist`).toBe(true);
  return read(p);
}
/** The statements between the file's `BEGIN;` and `COMMIT;` lines, for re-application inside a test transaction. */
export function body(p: string): string {
  const lines = sqlFile(p).split("\n");
  const trimmed = lines.map((l) => l.trim());
  const b = trimmed.indexOf("BEGIN;");
  const c = trimmed.lastIndexOf("COMMIT;");
  expect(b >= 0 && c > b, `${p}: BEGIN; ... COMMIT; lines`).toBe(true);
  return lines.slice(b + 1, c).join("\n");
}
