/**
 * #2252 shared fixtures (spec r2 = issue comment "Spec r2 (consolidated)",
 * approved by Samson Oct 24, 2026). Owned by Acceptance.
 */
import { existsSync, readFileSync } from "node:fs";

/**
 * Spec §2 In 1: the one migration this issue adds, by exact name. The version
 * is a reservation (§7); if Samson renumbers it, change only this line.
 */
export const MIGRATION =
  "supabase/migrations/20261025040000_donations_composite_donor_fk.sql";
/** Spec §2 In 2: the rollback is `rollback_` + the migration's file name. */
export const ROLLBACK = MIGRATION.replace(/([^/]+)$/, "rollback_$1");
export const DOC = "docs/security/tenant-guard.md";
export const SECTION = "## Composite tenant FKs";
export const NEW_FK = "donations_donor_same_tenant_fk";
export const NEW_CHECK = "donations_donor_requires_tenant";
export const OLD_FK = "donations_donor_id_fkey";
export const CHECK_DEF =
  "CHECK (((donor_id IS NULL) OR (tenant_id IS NOT NULL)))";

/** Spec §1 / OQ1: the 7 donor-spine FKs as [table, constraint]. */
export const SPINE: [string, string][] = [
  ["donations", NEW_FK],
  [
    "donor_merge_candidates",
    "donor_merge_candidates_existing_donor_same_tenant_fk",
  ],
  [
    "donor_merge_candidates",
    "donor_merge_candidates_incoming_donor_same_tenant_fk",
  ],
  [
    "donor_merge_redirects",
    "donor_merge_redirects_merged_donor_same_tenant_fk",
  ],
  [
    "donor_merge_redirects",
    "donor_merge_redirects_surviving_donor_same_tenant_fk",
  ],
  ["donor_merge_audit", "donor_merge_audit_surviving_donor_same_tenant_fk"],
  ["donor_merge_audit", "donor_merge_audit_merged_donor_same_tenant_fk"],
];
/** Spec §3 / OQ4: the frozen, shrink-only follow-up list of 14. */
export const FOLLOW_UPS = `campaigns_creator_donor_id_fkey
  contribution_notification_events_recipient_donor_id_fkey
  contribution_operation_audit_events_donor_id_fkey
  donation_saga_outbox_donor_id_fkey donor_activities_donor_id_fkey
  donor_feed_preferences_donor_id_fkey donor_pledges_donor_id_fkey
  follower_requests_donor_id_fkey follows_donor_id_fkey
  missionary_tasks_donor_id_fkey notification_queue_donor_id_fkey
  notification_queue_recipient_donor_id_fkey
  pledge_charge_attempts_donor_id_fkey staged_gifts_donor_id_fkey`
  .split(/\s+/)
  .filter(Boolean);

/** Spec §2 In 3, verbatim: the read-only operator preflight query. */
export const PREFLIGHT_QUERY = `SELECT d.id AS donation_id, d.tenant_id AS donation_tenant_id, d.donor_id,
       dn.tenant_id AS donor_tenant_id,
       CASE WHEN d.tenant_id IS NULL THEN 'null_tenant' ELSE 'cross_tenant' END AS problem
FROM public.donations d
JOIN public.donors dn ON dn.id = d.donor_id
WHERE d.tenant_id IS NULL OR dn.tenant_id IS DISTINCT FROM d.tenant_id
ORDER BY d.id;`;
/** Spec §2 In 1.2: the preflight's exact message for n cross-tenant, m null-tenant rows. */
export const preflightMessage = (n: number, m: number) =>
  `donations composite donor FK preflight failed: ${n} cross-tenant, ${m} null-tenant donation rows; run the preflight query in docs/security/tenant-guard.md`;

export const read = (f: string) =>
  existsSync(f) ? readFileSync(f, "utf8") : "";
/** SQL with comments removed (executable text only). */
export const code = (sql: string) =>
  sql.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/--[^\n]*/g, " ");
const TX_LINE = (w: string) => new RegExp(`^\\s*${w}\\s*;\\s*$`, "gim");

/**
 * Criterion 4.1: the statements between the file's single `BEGIN;` and
 * `COMMIT;` lines; throws unless each appears exactly once.
 */
export function body(file: string) {
  const src = read(file);
  if (!src) throw new Error(`${file} must exist (spec §2)`);
  for (const w of ["BEGIN", "COMMIT"]) {
    const n = (code(src).match(TX_LINE(w)) ?? []).length;
    if (n !== 1) throw new Error(`${file}: ${w}; appears ${n} times, want 1`);
  }
  const m = /^\s*BEGIN\s*;\s*$([\s\S]*)^\s*COMMIT\s*;\s*$/im.exec(src);
  return m![1]!;
}

/** One catalog row per FK into donors (or named like a spine FK). */
export type FkRow = {
  name: string;
  table: string;
  validated: boolean;
  cols: string[];
  refTable: string;
  refCols: string[];
  tenantNotNull: boolean;
  /** Definitions of the table's validated CHECK constraints. */
  checks: string[];
};
export const CATALOG_SQL = `
select c.conname as name, (select relname::text from pg_class where oid = c.conrelid) as "table", c.convalidated as validated,
  array(select a.attname::text from unnest(c.conkey) with ordinality k(n, i)
        join pg_attribute a on a.attrelid = c.conrelid and a.attnum = k.n order by k.i) as cols,
  (select relname::text from pg_class where oid = c.confrelid) as "refTable",
  array(select a.attname::text from unnest(c.confkey) with ordinality k(n, i)
        join pg_attribute a on a.attrelid = c.confrelid and a.attnum = k.n order by k.i) as "refCols",
  coalesce((select a.attnotnull from pg_attribute a
            where a.attrelid = c.conrelid and a.attname = 'tenant_id' and not a.attisdropped), false) as "tenantNotNull",
  array(select pg_get_constraintdef(x.oid) from pg_constraint x
        where x.conrelid = c.conrelid and x.contype = 'c' and x.convalidated order by 1) as checks
from pg_constraint c
where c.contype = 'f' and c.connamespace = 'public'::regnamespace
  and (c.confrelid = 'public.donors'::regclass or c.conname = any($1::text[]))
order by 1, 2`;

const isComposite = (r: FkRow) =>
  r.cols.length === 2 &&
  r.cols[0] === "tenant_id" &&
  r.refTable === "donors" &&
  r.refCols.join() === "tenant_id,id";

/**
 * Pure evaluator (criteria 5, 6, 12.2): every problem names its FK; an empty
 * list means the donor spine, the ratchet and the one-FK rule all hold.
 */
export function evaluate(rows: FkRow[]): string[] {
  const out: string[] = [];
  for (const [table, name] of SPINE) {
    const r = rows.find((x) => x.name === name && x.table === table);
    if (!r) {
      out.push(`${name}: missing`);
      continue;
    }
    if (!r.validated) out.push(`${name}: NOT VALID`);
    if (r.cols.length !== 2 || r.cols[0] !== "tenant_id")
      out.push(`${name}: not composite on (tenant_id, x)`);
    if (r.refTable !== "donors" || r.refCols.join() !== "tenant_id,id")
      out.push(`${name}: does not reference donors(tenant_id, id)`);
    const col = r.cols[1] ?? "?";
    const rule = `CHECK (((${col} IS NULL) OR (tenant_id IS NOT NULL)))`;
    if (!r.tenantNotNull && !r.checks.includes(rule))
      out.push(`${name}: not tenant-complete (tenant_id nullable, no ${rule})`);
  }
  const spine = new Set(SPINE.map(([, n]) => n));
  const intoDonors = rows.filter((r) => r.refTable === "donors");
  for (const r of intoDonors) {
    if (spine.has(r.name)) continue;
    const listed = FOLLOW_UPS.includes(r.name);
    if (isComposite(r) && listed)
      out.push(`${r.name}: stale entry: remove it from the follow-up list`);
    else if (!isComposite(r) && !listed)
      out.push(`${r.name}: new single-column donor reference`);
  }
  for (const f of FOLLOW_UPS)
    if (!intoDonors.some((r) => r.name === f))
      out.push(`${f}: stale entry: remove it from the follow-up list`);
  const dd = intoDonors.filter((r) => r.table === "donations");
  if (dd.length !== 1)
    out.push(
      `donations has ${dd.length} FKs to donors (${dd.map((r) => r.name).join(", ")}): ambiguous embed (PGRST201)`,
    );
  return out;
}
