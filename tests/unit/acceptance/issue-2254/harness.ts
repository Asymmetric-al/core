/**
 * #2254 acceptance harness: paths, the spec r1 oracles (parity fixture and
 * the In 4 field-policy table) and a psql runner. Owned by Acceptance; do not edit.
 * Spec: https://github.com/Asymmetric-al/core/issues/2254#issuecomment-6384526694
 * Approval + CI clarification: #issuecomment-6384580680
 */
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

import { expect } from "vitest";

export const ROOT = process.cwd();
export const MIGRATIONS = "supabase/migrations";
/** Last forward migration on develop @ c541b84b; anything after it is "new". */
export const LAST_DEVELOP_MIGRATION =
  "20261021064500_document_cutover_reader.sql";
export const NEW_SUFFIX = "_identity_email_normalizer_and_donor_keys.sql";
export const DOC = "docs/security/identity-email-normalization.md";
export const FP = "docs/security/field-policies";
export const V2 = "repository-supplement-v2-donor-identity.json";
export const read = (rel: string) =>
  existsSync(path.join(ROOT, rel))
    ? readFileSync(path.join(ROOT, rel), "utf8")
    : "";
export const sha256 = (data: string | Buffer) =>
  createHash("sha256").update(data).digest("hex");
export const forwardMigrations = () =>
  readdirSync(path.join(ROOT, MIGRATIONS))
    .filter((f) => /^\d{14}_.+\.sql$/.test(f))
    .sort();
export const newMigrations = () =>
  forwardMigrations().filter((f) => f > LAST_DEVELOP_MIGRATION);
export function migrationFile(): string {
  const file = forwardMigrations().find((f) => f.endsWith(NEW_SUFFIX));
  expect(
    file,
    `${MIGRATIONS}/<ts>${NEW_SUFFIX} must exist (In 1)`,
  ).toBeDefined();
  return file!;
}
/** The new migration with SQL line comments removed. */
export const migrationSql = () =>
  read(`${MIGRATIONS}/${migrationFile()}`).replace(/--[^\n]*/g, "");

/** Q9 parity fixture: [SQL literal, expected]; expectations follow the rule. */
export const FIXTURE: [string, string | null][] = [
  ["' Foo@Bar.COM '", "foo@bar.com"],
  ["'ＦＯＯ@ＢＡＲ.ＣＯＭ'", "foo@bar.com"],
  ["U&'\\00A0a@x.com\\3000'", "a@x.com"],
  ["U&'jos\\00E9@x.com'", "jos\u00e9@x.com"],
  ["U&'jose\\0301@x.com'", "jos\u00e9@x.com"],
  ["'ﬁ@x.com'", "fi@x.com"],
  ["'A+Tag@X.com'", "a+tag@x.com"],
  ["'A.B@Gmail.com'", "a.b@gmail.com"],
  ["'   '", null],
  ["NULL::text", null],
];

export const SURFACES = [
  "mission_control",
  "donor",
  "missionary",
  "public",
  "export",
] as const;
const VISIBLE: Record<string, string[]> = {
  email_normalized: ["mission_control", "donor", "missionary"],
  email_verified_at: ["mission_control", "donor"],
};
/** In 4: the 10 new `field_policies` rows, exactly. */
export const NEW_ROWS = Object.entries(VISIBLE).flatMap(([field_key, on]) =>
  SURFACES.map((surface) => ({
    record_type: "donors",
    field_key,
    surface,
    tenant_id: null,
    visible: on.includes(surface),
    editable: false,
    exportable: false,
    sensitivity_category: "contact",
  })),
);

export const PSQL = process.env.PSQL_BIN || "psql";
/** Runs SQL (stdin) or a file through psql; `sqlstate` from the first ERROR. */
export function psql(url: string, sql: string, file?: string) {
  const args = [url, "-X", "-q", "-At", "-v", "ON_ERROR_STOP=1"];
  const r = spawnSync(
    PSQL,
    file
      ? [...args, "-v", "VERBOSITY=verbose", "-f", file]
      : [...args, "-v", "VERBOSITY=verbose"],
    { cwd: ROOT, encoding: "utf8", input: file ? undefined : sql },
  );
  const sqlstate = /ERROR:\s+([0-9A-Z]{5}):/.exec(r.stderr ?? "")?.[1];
  return {
    status: r.status,
    stdout: (r.stdout ?? "").trim(),
    stderr: r.stderr ?? "",
    sqlstate,
  };
}
