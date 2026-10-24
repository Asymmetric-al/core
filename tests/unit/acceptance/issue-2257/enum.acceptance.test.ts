/** #2257 done criteria 1-3, 6, 7, 9 (spec r2). Owned by Acceptance. */
import { execFileSync } from "node:child_process";

import { describe, expect, it } from "vitest";

import {
  CONCEPTS,
  EXPECTED,
  FORBIDDEN,
  MIG,
  enumFromChain,
  migrations,
  read,
} from "./harness";
import * as concepts from "../../../../packages/api/src/crm/identity/concepts";

const NEW = "_crm_link_entity_type_party_values.sql";
const get = (id: string) =>
  concepts.getCrmIdentityConcept(id as concepts.CrmIdentityConceptId);
const ids = () => concepts.CRM_IDENTITY_CONCEPTS.map((c) => c.id as string);
const core = (c: concepts.CrmIdentityConcept) => [
  c.id,
  c.label,
  c.owner,
  c.linkPolicy,
];

describe("#2257 criteria 1, 7: party-values migration", () => {
  it("is a forward migration: 2x ADD VALUE IF NOT EXISTS, then a pg_enum text DO assertion of the 17", () => {
    const found = migrations().filter((f) => f.endsWith(NEW));
    expect(found, `exactly one *${NEW}`).toHaveLength(1);
    expect(found[0]! > "20261021064500", "newer than develop's newest").toBe(
      true,
    );
    const sql = read(`${MIG}/${found[0]}`);
    const adds = [
      ...sql.matchAll(
        /ALTER TYPE public\.crm_link_entity_type ADD VALUE IF NOT EXISTS '(\w+)'/g,
      ),
    ];
    expect(adds.map((m) => m[1])).toEqual(["household", "organization"]);
    expect(sql.match(/ADD VALUE/g)).toHaveLength(2);
    expect(sql).not.toMatch(/RENAME|DROP|BEFORE '|AFTER '/i);
    const block = sql
      .slice(sql.lastIndexOf("ADD VALUE"))
      .replace(/^[\s\S]*?(?=\bDO\s+\$)/, "");
    expect(block, "DO block after the ADD VALUEs").toMatch(/^DO\s+\$/);
    for (const re of [
      /pg_enum/,
      /ORDER BY[^;]*enumsortorder/i,
      /RAISE EXCEPTION/i,
    ])
      expect(block).toMatch(re);
    expect(block).toMatch(
      /enumlabel\s*::\s*text|CAST\([^)]*enumlabel\s+AS\s+text/i,
    );
    const labels = [...block.matchAll(/'(\w+)'/g)].map((m) => m[1]!);
    expect(
      labels.filter((q) => EXPECTED.includes(q) || FORBIDDEN.includes(q)),
    ).toEqual(EXPECTED);
  });
});

describe("#2257 criteria 2, 6: lockstep 15 -> 17", () => {
  it("migration-chain enum is the 15 originals then household, organization", () => {
    expect(enumFromChain()).toEqual({ labels: EXPECTED, other: [] });
  });
  it("CRM_IDENTITY_CONCEPTS ids are that same ordered list of 17", () => {
    expect(ids()).toEqual(EXPECTED);
  });
  it("no synonym or dropped value on either side", () => {
    const both = [...ids(), ...enumFromChain().labels];
    expect(FORBIDDEN.filter((v) => both.includes(v))).toEqual([]);
  });
  it.each([
    [
      "household",
      ["crm_person", "organization", "donor_profile"],
      /households\.id = parties\.id[\s\S]*party_kind = 'household'/,
    ],
    [
      "organization",
      ["crm_person", "household", "donor_profile", "stripe_customer"],
      /party_kind = 'org'[\s\S]*org_type/,
    ],
  ])(
    "getCrmIdentityConcept(%s) has the approved metadata",
    (id, notSameAs, desc) => {
      const c = get(id);
      expect(core(c)).toEqual([
        id,
        `${id[0]!.toUpperCase()}${id.slice(1)} (party)`,
        "asym",
        "direct_link",
      ]);
      expect([...c.notSameAs].sort()).toEqual([...notSameAs].sort());
      expect(c.description).toMatch(desc);
    },
  );
});

describe("#2257 criterion 3: crm_person is the person party", () => {
  it("keeps id/label/owner/linkPolicy, appends household + organization, names persons.id = parties.id", () => {
    const c = get("crm_person");
    expect(core(c)).toEqual([
      "crm_person",
      "CRM person",
      "asym",
      "direct_link",
    ]);
    const prior = [
      "supabase_auth_user",
      "asym_profile",
      "donor_profile",
      "missionary_profile",
      "stripe_customer",
    ];
    expect(c.notSameAs).toEqual([...prior, "household", "organization"]);
    expect(c.description).toContain("persons.id = parties.id");
  });
});

describe("#2257 criterion 9: widening is inert", () => {
  it("no other enum-typed migration or package/app code references the new values", () => {
    const pattern =
      "crm_link_entity_type|CrmIdentityConceptId|CRM_IDENTITY_CONCEPTS|_entity_type|crm_record_links";
    const files = execFileSync(
      "git",
      ["grep", "-lE", pattern, "--", MIG, "packages", "apps"],
      { encoding: "utf8" },
    )
      .split("\n")
      .filter((f) => f && f !== CONCEPTS && !f.endsWith(NEW));
    expect(
      files.filter((f) => /["'](household|organization)["']/.test(read(f))),
    ).toEqual([]);
  });
});
