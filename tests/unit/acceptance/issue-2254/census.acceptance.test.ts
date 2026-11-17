/**
 * #2254 criterion 9 (spec r1 In 3/In 4): the field-policy gate against the
 * spec's oracle database (171 live + v1 column + the 10 In 4 rows + #2256's
 * 10 v3 person_id rows), then mutation-proven: one flag, the v2 classification
 * removed and edited migration bytes each fail; v1's source binding still bites.
 *
 * Rewritten by AL-2674 (WP1, plan 7.1; audit NR-19). The census's dated
 * capture of the hosted schema is replaced by the classification manifest
 * docs/security/field-policies/manifest.json, so the census script and its
 * supplement chain no longer exist to run. The oracle is unchanged and still
 * independent of the gate: it is built from the approved AL-491 census, the v1
 * supplement, the In 4 table and #2256's rows. Each mutation maps to its
 * manifest equivalent: the v2 artifact's flag becomes the manifest entry's
 * flag, a dropped v2 supplement becomes the v2 entries removed, and edited
 * migration bytes fail the manifest's pinned-source check. The gate's
 * functions are driven directly (no fake psql), on a temp copy of the files
 * it reads; the real-stack suites run the script itself.
 */
import {
  appendFileSync,
  cpSync,
  mkdtempSync,
  readFileSync,
  rmSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { FP, MIGRATIONS, NEW_ROWS, ROOT, migrationFile } from "./harness";
import { NEW_ROWS as V3_ROWS } from "../issue-2256/harness";

type Row = Record<string, unknown>;
type Manifest = {
  record_types: Record<string, Record<string, Record<string, unknown>>>;
};
type Catalog = {
  relations: string[];
  columns: Row[];
  reserved_present: string[];
  rows: Row[];
};
type Gate = {
  loadManifest(root?: string): Manifest;
  manifestProblems(m: Manifest, options?: { root?: string }): string[];
  catalogProblems(m: Manifest, c: Catalog): string[];
};

const temps: string[] = [];
let gate: Gate;
beforeAll(async () => {
  gate = (await import(
    pathToFileURL(path.join(ROOT, "scripts/verify/field-policy-census.mjs"))
      .href
  )) as Gate;
});
afterAll(() =>
  temps.forEach((d) => rmSync(d, { recursive: true, force: true })),
);
const json = (file: string) => JSON.parse(readFileSync(file, "utf8"));

/** Oracle DB: live columns + v1 column + In 4 rows + #2256 v3 rows, with the spec's column shapes. */
function oracle(): Catalog {
  const census = json(path.join(ROOT, FP, "census-v1.json"));
  const v1 = json(path.join(ROOT, FP, "repository-supplement-v1.json")).column;
  const live = census.relations
    .filter((r: { disposition: string }) => r.disposition === "present")
    .flatMap((r: { record_type: string; columns: Row[] }) =>
      r.columns.map((c) => ({ recordType: r.record_type, ...c })),
    );
  const rows = [
    ...[...live, v1].flatMap((c: Row) =>
      census.surfaces.map((surface: string) => ({
        record_type: c.recordType,
        field_key: c.name,
        surface,
        tenant_id: null,
        ...(c.policies as Record<string, Row>)[surface],
        sensitivity_category: c.category,
      })),
    ),
    ...[...NEW_ROWS, ...V3_ROWS].map((r) => ({ ...r })),
  ];
  const column = (
    record_type: string,
    field_key: string,
    type: string,
    nullable: boolean,
    generated: string | null = null,
    defaultValue: string | null = null,
  ) => ({
    record_type,
    field_key,
    type,
    nullable,
    generated,
    default: defaultValue,
  });
  const columns = [
    ...live.map((c: Row) =>
      column(
        String(c.recordType),
        String(c.name),
        String(c.type),
        Boolean(c.nullable),
      ),
    ),
    column(
      "donations",
      "stripe_refund_ids",
      "text[]",
      false,
      null,
      "'{}'::text[]",
    ),
    // In 1: the generated normalized email and the nullable verification time.
    column(
      "donors",
      "email_normalized",
      "text",
      true,
      "normalize_email(email)",
    ),
    column("donors", "email_verified_at", "timestamp with time zone", true),
    // #2256: the two inert person_id seams.
    column("missionaries", "person_id", "uuid", true),
    column("profiles", "person_id", "uuid", true),
  ];
  return {
    relations: [...new Set(columns.map((c) => c.record_type))].sort(),
    columns,
    reserved_present: [],
    rows,
  };
}

type Mutate = (dir: string, m: Manifest, db: Catalog) => void;
/** Runs the gate's checks on a temp copy of the files it reads. */
function runGate(mutate: Mutate = () => {}) {
  const dir = mkdtempSync(path.join(os.tmpdir(), "acc-2254-gate-"));
  temps.push(dir);
  for (const rel of [FP, MIGRATIONS])
    cpSync(path.join(ROOT, rel), path.join(dir, rel), { recursive: true });
  const manifest = structuredClone(gate.loadManifest(ROOT));
  const db = oracle();
  mutate(dir, manifest, db);
  return [
    ...gate.manifestProblems(manifest, { root: dir }),
    ...gate.catalogProblems(manifest, db),
  ];
}

describe("#2254 criterion 9: field-policy gate", () => {
  it("passes on the In 4 oracle: 176 columns and 880 rows", () => {
    const db = oracle();
    expect(db.columns).toHaveLength(176);
    expect(db.rows).toHaveLength(880);
    expect(runGate()).toEqual([]);
  });

  it.each<[string, Mutate, string]>([
    [
      "one database flag flipped",
      (_d, _m, db) => {
        db.rows.find(
          (r) =>
            r.field_key === "email_verified_at" && r.surface === "missionary",
        )!.visible = true;
      },
      "ROW_DRIFT donors|email_verified_at|missionary|",
    ],
    [
      "one v2 manifest flag flipped",
      (_d, m) => {
        m.record_types.donors!.email_normalized!.mission_control = "v-x";
      },
      "ROW_DRIFT donors|email_normalized|mission_control|",
    ],
    [
      "the v2 classification removed from the manifest",
      (_d, m) => {
        delete m.record_types.donors!.email_normalized;
        delete m.record_types.donors!.email_verified_at;
      },
      "UNCLASSIFIED donors.email_normalized",
    ],
    [
      "new migration bytes edited (hash mismatch)",
      (dir) =>
        appendFileSync(
          path.join(dir, MIGRATIONS, migrationFile()),
          "\n-- edited\n",
        ),
      `PINNED ${MIGRATIONS}/${migrationFile()} changed`,
    ],
    [
      "v1 source bytes edited (v1 check kept)",
      (dir) =>
        appendFileSync(
          path.join(
            dir,
            MIGRATIONS,
            "20260702090000_donation_stripe_refund_ids.sql",
          ),
          "\n-- edited\n",
        ),
      `PINNED ${MIGRATIONS}/20260702090000_donation_stripe_refund_ids.sql changed`,
    ],
    [
      "an extra uncensused donors column",
      (_d, _m, db) => {
        db.columns.push({
          record_type: "donors",
          field_key: "uncensused_2254",
          type: "text",
          nullable: true,
          generated: null,
          default: null,
        });
      },
      "UNCLASSIFIED donors.uncensused_2254",
    ],
  ])("fails when %s", (_name, mutate, expected) => {
    expect(runGate(), "clean baseline must pass first").toEqual([]);
    const problems = runGate(mutate);
    expect(
      problems.some((p) => p.startsWith(expected)),
      problems.join("\n"),
    ).toBe(true);
  });
});
