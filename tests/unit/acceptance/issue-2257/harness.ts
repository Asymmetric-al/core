/** #2257 shared fixtures (spec r2, issue comment 6384597629). Owned by Acceptance. */
import { existsSync, readdirSync, readFileSync } from "node:fs";

export const MIG = "supabase/migrations";
export const CONCEPTS = "packages/api/src/crm/identity/concepts.ts";
export const PARITY = "tests/unit/packages/api/crm-identity-parity.test.ts";
export const read = (f: string) =>
  existsSync(f) ? readFileSync(f, "utf8") : "";
export const EXPECTED = (
  "supabase_auth_user asym_profile tenant_membership crm_person donor_profile " +
  "missionary_profile cms_public_entity stripe_customer fund_or_project " +
  "pledge_or_relationship_commitment payment_record receipt_record refund_record " +
  "statement_record reconciliation_record household organization"
).split(" ");
export const FORBIDDEN =
  "individual org daf soft_credit receipt receipt_snapshot person daf_sponsor gift_credit".split(
    " ",
  );
export const migrations = () =>
  readdirSync(MIG)
    .filter((f) => /^\d{14}_.+\.sql$/.test(f))
    .sort();

/** Independent derivation of public.crm_link_entity_type from the migration chain. */
export function enumFromChain() {
  const labels: string[] = [];
  const other: string[] = [];
  const quoted = (s: string) => [...s.matchAll(/'([^']+)'/g)].map((m) => m[1]!);
  for (const f of migrations()) {
    const sql = read(`${MIG}/${f}`);
    const create =
      /CREATE TYPE public\.crm_link_entity_type AS ENUM \(([^)]*)\)/.exec(sql);
    if (create) labels.push(...quoted(create[1]!));
    for (const m of sql.matchAll(
      /ALTER TYPE (?:public\.)?crm_link_entity_type\s+([^;]*);/gi,
    )) {
      const add = /^ADD VALUE (?:IF NOT EXISTS )?('[^']+')$/i.exec(
        m[1]!.trim(),
      );
      if (add) labels.push(...quoted(add[1]!));
      else other.push(`${f}: ${m[0]}`);
    }
  }
  return { labels, other };
}
