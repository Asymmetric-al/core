/**
 * AL-2674 (WP1, slice 1.1b; plan 7.1, audit NR-19): the field-policy census is
 * a classification manifest kept in the repository. These checks need no
 * database: they drive the gate's own functions with the committed manifest
 * and with a catalog built from it, and mutate one thing at a time.
 *
 * The fidelity check proves the conversion: every column the AL-491 census and
 * its three reviewed supplements classified keeps its category and its flags
 * on all five surfaces, or is gone from the manifest, which the gate holds
 * equal to the migrated schema (so it is gone from the schema too). A later
 * package may add or drop columns freely and touches no test here; a change
 * to an existing column's classification is a reviewed decision and is
 * recorded by updating that expectation here. Council round 1 (F1) replaced
 * the pinned totals (nine record types, 176 columns, 880 rows) with that
 * subset check and counts derived from the manifest.
 */
import {
  cpSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  appendFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import * as H from "./privileges-harness";

type Manifest = {
  surfaces: string[];
  categories: string[];
  processor_identifiers: string[];
  reserved_record_types: Record<string, { physically_absent: boolean }>;
  pinned_sources: { path: string; sha256: string }[];
  record_types: Record<string, Record<string, Record<string, unknown>>>;
};
type Catalog = {
  relations: string[];
  columns: Record<string, unknown>[];
  reserved_present: string[];
  rows: Record<string, unknown>[];
};
type Gate = {
  SURFACES: string[];
  loadManifest(root?: string): Manifest;
  manifestColumns(
    m: Manifest,
    physicalOnly?: boolean,
  ): ({ recordType: string; name: string } & Record<string, unknown>)[];
  expectedFieldPolicyRows(m: Manifest): Record<string, unknown>[];
  manifestProblems(m: Manifest, options?: { root?: string }): string[];
  catalogProblems(m: Manifest, c: Catalog): string[];
  catalogSql(m: Manifest): string;
  isLocalDatabaseUrl(url: string): boolean;
};

let gate: Gate;
const temps: string[] = [];
beforeAll(async () => {
  gate = (await import(pathToFileURL(path.join(H.ROOT, H.GATE)).href)) as Gate;
});
afterAll(() =>
  temps.forEach((d) => rmSync(d, { recursive: true, force: true })),
);

const manifest = (): Manifest => structuredClone(gate.loadManifest());

it("classifies derived CRM report fields for bulk Mission Control export, not as a public table", () => {
  // D-18: projection-only report fields must increase policy coverage without blessing a physical relation.
  const m = manifest();
  const reportRows = gate
    .expectedFieldPolicyRows(m)
    .filter((row) => row.record_type === "crm_report_groups");
  expect(
    reportRows
      .filter((row) => row.surface === "mission_control" && row.exportable)
      .map((row) => row.field_key)
      .sort(),
  ).toEqual([
    "donor_count",
    "gift_count",
    "label",
    "last_gift_at",
    "net_amount_cents",
    "report_complete",
    "report_gift_limit",
  ]);
  expect(
    reportRows.filter(
      (row) =>
        row.surface !== "mission_control" && (row.visible || row.exportable),
    ),
  ).toEqual([]);
  expect(m.record_types).not.toHaveProperty("crm_report_groups");
  expect(gate.catalogProblems(m, catalogOf(m))).toEqual([]);
  expect(
    gate.catalogProblems(m, {
      ...catalogOf(m),
      reserved_present: ["crm_report_groups"],
    }),
  ).toContainEqual(
    expect.stringMatching(/^RESERVED public\.crm_report_groups/),
  );
  m.record_types.crm_report_groups = {};
  expect(gate.manifestProblems(m)).toContain(
    "DERIVED crm_report_groups is also a physical record type",
  );
});
/** The catalog a database migrated from this tree would return. */
function catalogOf(m: Manifest): Catalog {
  return {
    relations: Object.keys(m.record_types).sort(),
    columns: gate.manifestColumns(m, true).map((c) => ({
      record_type: c.recordType,
      field_key: c.name,
      type: c.type,
      nullable: c.nullable,
      generated: c.generated ?? null,
      default: "default" in c ? c.default : null,
    })),
    reserved_present: [],
    rows: gate.expectedFieldPolicyRows(m),
  };
}
const codes = (problems: string[]) =>
  problems.map((p) => p.split(" ").slice(0, 2).join(" "));
/**
 * The donors column the drop cases remove: any classified column will do, so
 * the last one that no other case names and that is no processor identifier.
 * Council round 1 (F1): a package that drops a column touches no test here.
 */
function droppable(m: Manifest) {
  const named = new Set(["email", "email_normalized", "email_verified_at"]);
  const column = Object.keys(m.record_types.donors ?? {})
    .reverse()
    .find((n) => !named.has(n) && !m.processor_identifiers.includes(n));
  if (!column) throw new Error("the manifest classifies no donors column");
  return column;
}

describe("AL-2674 manifest: the committed file", () => {
  it("passes every manifest check and matches a catalog built from itself", () => {
    const m = manifest();
    expect(gate.manifestProblems(m)).toEqual([]);
    expect(gate.catalogProblems(m, catalogOf(m))).toEqual([]);
  });

  it("still classifies every record type the AL-491 census classified, with five rows per column", () => {
    const m = manifest();
    const census = JSON.parse(H.read(`${H.FP}/census-v1.json`));
    const classified = census.relations
      .filter((r: { disposition: string }) => r.disposition === "present")
      .map((r: { record_type: string }) => r.record_type);
    expect(classified).toEqual([
      "donations",
      "donor_pledges",
      "donors",
      "member_care_activities",
      "member_care_goals",
      "member_care_private_notes",
      "member_care_requirements",
      "missionaries",
      "profiles",
    ]);
    // A package that drops a whole classified table updates this list
    // (docs/security/field-policies/README.md, "Dropping a column").
    expect(Object.keys(m.record_types)).toEqual(
      expect.arrayContaining(classified),
    );
    expect(gate.manifestColumns(m).length).toBeGreaterThan(0);
    expect(gate.expectedFieldPolicyRows(m)).toHaveLength(
      gate.manifestColumns(m).length * gate.SURFACES.length,
    );
    expect(m.surfaces).toEqual(gate.SURFACES);
  });

  it("keeps every AL-491 census and supplement classification exactly (fidelity of the conversion) (D-18, AL-2678: profiles.user_id became NOT NULL under W5-R3, as missionaries.tenant_id did before)", () => {
    const census = JSON.parse(H.read(`${H.FP}/census-v1.json`));
    const supplements = census.repository_supplements.map(
      (ref: { artifact: string }) =>
        JSON.parse(H.read(`${H.FP}/${ref.artifact}`)),
    );
    const prior = [
      ...census.relations
        .filter((r: { disposition: string }) => r.disposition === "present")
        .flatMap(
          (r: { record_type: string; columns: Record<string, unknown>[] }) =>
            r.columns.map((c) => ({ recordType: r.record_type, ...c })),
        ),
      supplements[0].column,
      ...supplements[1].columns,
      ...supplements[2].columns,
    ] as {
      recordType: string;
      name: string;
      type: string;
      nullable: boolean;
      category: string;
      semantic_category: string;
      processor_identifier: boolean;
      policies: Record<
        string,
        { visible: boolean; editable: boolean; exportable: boolean }
      >;
    }[];
    expect(prior).toHaveLength(176);
    const now = manifest().record_types;
    const mismatches: string[] = [];
    for (const c of prior) {
      const entry = now[c.recordType]?.[c.name];
      // Dropped later, with its rows: the gate then holds it absent from the
      // migrated schema too (an unclassified column fails UNCLASSIFIED).
      if (!entry) continue;
      const flags = Object.fromEntries(
        census.surfaces.map((s: string) => {
          const p = c.policies[s]!;
          return [
            s,
            `${p.visible ? "v" : "-"}${p.editable ? "e" : "-"}${p.exportable ? "x" : "-"}`,
          ];
        }),
      );
      const want = {
        type: c.type,
        nullable:
          (c.recordType === "missionaries" && c.name === "tenant_id") ||
          (c.recordType === "profiles" && c.name === "user_id")
            ? false
            : c.nullable,
        category: c.category,
        semantic_category: c.semantic_category,
        processor_identifier: c.processor_identifier,
        ...flags,
      };
      const got = {
        type: entry.type,
        nullable: entry.nullable,
        category: entry.category,
        semantic_category: entry.semantic_category ?? entry.category,
        processor_identifier: entry.processor_identifier === true,
        ...Object.fromEntries(
          census.surfaces.map((s: string) => [s, entry[s]]),
        ),
      };
      if (JSON.stringify(want) !== JSON.stringify(got))
        mismatches.push(`${c.recordType}.${c.name}`);
    }
    expect(mismatches).toEqual([]);
  });
});

describe("AL-2674 manifest: the gate fails on each kind of drift", () => {
  const schemaCases: [string, (m: Manifest, c: Catalog) => void, string][] = [
    [
      "a column with no manifest entry",
      (_m, c) =>
        c.columns.push({
          record_type: "donors",
          field_key: "new_col",
          type: "text",
          nullable: true,
          generated: null,
          default: null,
        }),
      "UNCLASSIFIED donors.new_col",
    ],
    [
      "a manifest entry with no column",
      (m, c) => {
        const column = droppable(m);
        c.columns = c.columns.filter(
          (x) => !(x.record_type === "donors" && x.field_key === column),
        );
        c.rows = c.rows.filter(
          (x) => !(x.record_type === "donors" && x.field_key === column),
        );
      },
      "STALE donors.",
    ],
    [
      "a changed column type",
      (_m, c) => {
        c.columns.find(
          (x) =>
            x.field_key === "title" && x.record_type === "member_care_goals",
        )!.type = "character varying(200)";
      },
      "SHAPE member_care_goals.title:",
    ],
    [
      "a changed nullability",
      (_m, c) => {
        c.columns.find(
          (x) => x.field_key === "email" && x.record_type === "donors",
        )!.nullable = false;
      },
      "SHAPE donors.email:",
    ],
    [
      "a generated column that is no longer generated",
      (_m, c) => {
        c.columns.find((x) => x.field_key === "email_normalized")!.generated =
          null;
      },
      "SHAPE donors.email_normalized:",
    ],
    [
      "a pinned default that changed",
      (_m, c) => {
        c.columns.find((x) => x.field_key === "stripe_refund_ids")!.default =
          null;
      },
      "SHAPE donations.stripe_refund_ids:",
    ],
    [
      "a classified table that is gone",
      (_m, c) => {
        c.relations = c.relations.filter((r) => r !== "member_care_goals");
        c.columns = c.columns.filter(
          (x) => x.record_type !== "member_care_goals",
        );
      },
      "MISSING_TABLE member_care_goals:",
    ],
    [
      "canonical receipts present",
      (_m, c) => c.reserved_present.push("receipts"),
      "RESERVED public.receipts",
    ],
    [
      "a flag drifted in the database",
      (_m, c) => {
        c.rows.find(
          (x) =>
            x.field_key === "email_verified_at" && x.surface === "missionary",
        )!.visible = true;
      },
      "ROW_DRIFT donors|email_verified_at|missionary|",
    ],
    [
      "a category drifted in the database (D-18, AL-2678: on party_id, as person_id is dropped)",
      (_m, c) => {
        c.rows.find(
          (x) => x.field_key === "party_id" && x.surface === "export",
        )!.sensitivity_category = "security";
      },
      "ROW_DRIFT",
    ],
    [
      "a missing seed row (D-18, AL-2678: of donors.party_id, as person_id is dropped)",
      (_m, c) => {
        c.rows = c.rows.filter(
          (x) =>
            !(
              x.field_key === "party_id" &&
              x.record_type === "donors" &&
              x.surface === "export"
            ),
        );
      },
      "ROW_MISSING donors|party_id|export|",
    ],
    [
      "a tenant override row",
      (_m, c) =>
        c.rows.push({
          ...c.rows[0]!,
          tenant_id: "00000000-0000-0000-0000-000000000001",
        }),
      "ROW_UNEXPECTED",
    ],
    [
      "rows for a reserved receipt record type",
      (_m, c) =>
        c.rows.push({
          record_type: "receipts",
          field_key: "id",
          surface: "mission_control",
          tenant_id: null,
          visible: true,
          editable: false,
          exportable: false,
          sensitivity_category: "internal",
        }),
      "ROW_UNEXPECTED receipts|id|mission_control|",
    ],
  ];
  it.each(schemaCases)(
    "against the database: %s",
    (_name, mutate, expected) => {
      const m = manifest();
      const c = catalogOf(m);
      mutate(m, c);
      const problems = gate.catalogProblems(m, c);
      expect(
        problems.some((p) => p.startsWith(expected)),
        problems.join("\n"),
      ).toBe(true);
    },
  );

  it("dropping a column passes once its entry and its rows are both removed", () => {
    const m = manifest();
    const c = catalogOf(m);
    const column = droppable(m);
    c.columns = c.columns.filter(
      (x) => !(x.record_type === "donors" && x.field_key === column),
    );
    c.rows = c.rows.filter(
      (x) => !(x.record_type === "donors" && x.field_key === column),
    );
    // The entry still names the column and still expects its five rows.
    expect(codes(gate.catalogProblems(m, c))).toEqual([
      `STALE donors.${column}:`,
      ...gate.SURFACES.map((s) => `ROW_MISSING donors|${column}|${s}|`),
    ]);
    delete m.record_types.donors![column];
    expect(gate.catalogProblems(m, c)).toEqual([]);
  });

  const manifestCases: [string, (m: Manifest) => void, string][] = [
    [
      "a surface renamed",
      (m) =>
        (m.surfaces = [
          "mission_control",
          "donor",
          "missionary",
          "public",
          "exports",
        ]),
      "SURFACES",
    ],
    ["a category list changed", (m) => m.categories.pop(), "CATEGORIES"],
    [
      "an unknown category",
      (m) => (m.record_types.donors!.email!.category = "secret"),
      "CATEGORY donors.email",
    ],
    [
      "a malformed flag",
      (m) => (m.record_types.donors!.email!.donor = "vx-"),
      "FLAGS donors.email donor",
    ],
    [
      "a missing surface",
      (m) => delete m.record_types.donors!.email!.export,
      "FLAGS donors.email export",
    ],
    [
      "a misspelled key",
      (m) => (m.record_types.donors!.email!.mision_control = "v--"),
      "FIELD donors.email",
    ],
    [
      "a same-name category split",
      (m) => (m.record_types.profiles!.email!.category = "internal"),
      "FLOOR profiles.email",
    ],
    [
      "a processor field not flagged",
      (m) =>
        delete m.record_types.donors!.stripe_customer_id!.processor_identifier,
      "PROCESSOR donors.stripe_customer_id",
    ],
    [
      "a processor field made exportable",
      (m) =>
        (m.record_types.donations!.stripe_charge_id!.mission_control = "vex"),
      "PROCESSOR donations.stripe_charge_id",
    ],
    [
      "a processor field visible to donors",
      (m) =>
        (m.record_types.donor_pledges!.stripe_subscription_id!.donor = "v--"),
      "PROCESSOR donor_pledges.stripe_subscription_id",
    ],
    [
      "a non-processor field flagged",
      (m) => (m.record_types.donors!.email!.processor_identifier = true),
      "PROCESSOR donors.email",
    ],
    [
      "receipts classified",
      (m) =>
        (m.record_types.receipts = { id: { ...m.record_types.donors!.id! } }),
      "RESERVED receipts",
    ],
    [
      "receipts no longer reserved",
      (m) => delete m.reserved_record_types.receipts,
      "RESERVED receipts",
    ],
    [
      "a pinned source with the wrong digest",
      (m) => (m.pinned_sources[0]!.sha256 = "0".repeat(64)),
      "PINNED supabase/migrations/",
    ],
  ];
  it.each(manifestCases)("in the manifest: %s", (_name, mutate, expected) => {
    const m = manifest();
    mutate(m);
    const problems = gate.manifestProblems(m);
    expect(
      problems.some((p) => p.startsWith(expected)),
      problems.join("\n"),
    ).toBe(true);
  });

  it("an edited pinned migration fails the manifest check", () => {
    const root = mkdtempSync(path.join(os.tmpdir(), "acc-2674-pin-"));
    temps.push(root);
    for (const rel of [H.FP, H.MIG])
      cpSync(path.join(H.ROOT, rel), path.join(root, rel), { recursive: true });
    const m = manifest();
    expect(gate.manifestProblems(m, { root })).toEqual([]);
    appendFileSync(path.join(root, m.pinned_sources[2]!.path), "\n-- edited\n");
    expect(codes(gate.manifestProblems(m, { root }))).toEqual([
      `PINNED ${m.pinned_sources[2]!.path}`,
    ]);
  });

  it("reads one catalog snapshot, marked, naming the classified tables", () => {
    const sql = gate.catalogSql(manifest());
    expect(sql.startsWith("-- field-policy-manifest-gate:v1")).toBe(true);
    expect(sql).toContain("'donors'");
    expect(sql).toContain("'receipts'");
    expect(sql).toContain("from public.field_policies p");
  });

  it("refuses a database that is not local", () => {
    for (const url of [
      "postgresql://u@127.0.0.1:5432/d",
      "postgresql://u@localhost/d",
      "postgresql://u@[::1]:5432/d",
    ])
      expect(gate.isLocalDatabaseUrl(url), url).toBe(true);
    for (const url of [
      "postgresql://u@db.example.supabase.co/d",
      "not a url",
      "",
    ])
      expect(gate.isLocalDatabaseUrl(url), url).toBe(false);
  });
});

describe("AL-2674 manifest: documentation", () => {
  it("the README describes the manifest as the classification of record and how to add and drop a column", () => {
    const readme = readFileSync(path.join(H.ROOT, H.FP, "README.md"), "utf8");
    for (const term of [
      "manifest.json",
      "Adding a column",
      "Dropping a column",
      "field_policies",
      "UNCLASSIFIED",
      "STALE",
      "historical",
    ])
      expect(readme, term).toContain(term);
  });
});
